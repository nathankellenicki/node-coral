import test from "node:test";
import assert from "node:assert/strict";
import { Coral } from "../../../src/coral";
import { DoubleMotorDevice } from "../../../src/devices";
import { MotorDirection, MotorEndState, MotorPort } from "../../../src/devices";
import { MotorNotificationPayload, MotorBits, MotorState } from "../../../src/protocol";
import { scheduleProcessExit } from "../helpers/test-utils";

const SCAN_TIMEOUT_MS = Number(process.env.CORAL_TEST_SCAN_TIMEOUT ?? 45_000);
const MOTOR_EVENT_TIMEOUT_MS = Number(process.env.CORAL_TEST_EVENT_TIMEOUT ?? 10_000);
const AUTO_STOP_TIMEOUT_MS = Number(process.env.CORAL_TEST_AUTO_STOP_TIMEOUT ?? 12_000);
const SPEED_THRESHOLD = Number(process.env.CORAL_TEST_MIN_SPEED ?? 1);

const PORT_BITS: Record<MotorPort, MotorBits> = {
  [MotorPort.Left]: MotorBits.Left,
  [MotorPort.Right]: MotorBits.Right,
  [MotorPort.Both]: MotorBits.Both
};

test(
  "double motor commands run sequentially",
  { concurrency: 1 },
  async (t) => {
    const coral = new Coral();
    logStep("Scanning for Coral double motor...");
    logInstruction("Power on a Coral double motor and keep it nearby.");
    const devicePromise = waitForDoubleMotor(coral, SCAN_TIMEOUT_MS);
    await coral.scan();
    const motor = await devicePromise;
    coral.stop();
    logStep(`Connected to ${motor.info.name ?? motor.info.uuid}`);

    t.after(() => {
      motor.disconnect();
      coral.stop();
    });

    await t.test("initial stop", async () => {
      await expectStopForPort(motor, MotorPort.Both, () => motor.stopMotor(MotorPort.Both), "initial stop");
    });

    await t.test("set motor speeds", async () => {
      await motor.setMotorSpeeds(30, -30);
    });

    await t.test("start motor left", async () => {
      await expectRotationForPort(motor, MotorPort.Left, () => motor.startMotor(MotorPort.Left, MotorDirection.Clockwise), "startMotor left");
      await expectStopForPort(motor, MotorPort.Left, () => motor.stopMotor(MotorPort.Left), "stop left after start");
    });

    await t.test("start motor right", async () => {
      await expectRotationForPort(motor, MotorPort.Right, () => motor.startMotor(MotorPort.Right, MotorDirection.Counterclockwise), "startMotor right");
      await expectStopForPort(motor, MotorPort.Right, () => motor.stopMotor(MotorPort.Right), "stop right after start");
    });

    await t.test("start motor both", async () => {
      await expectRotationForPort(motor, MotorPort.Both, () => motor.startMotor(MotorPort.Both, MotorDirection.Clockwise), "startMotor both");
      await expectStopForPort(motor, MotorPort.Both, () => motor.stopMotor(MotorPort.Both), "stop both after start");
    });

    await t.test("set motor power left", async () => {
      await expectRotationForPort(motor, MotorPort.Left, () => motor.setMotorPower(MotorPort.Left, 25), "setMotorPower left");
      await expectStopForPort(motor, MotorPort.Left, () => motor.stopMotor(MotorPort.Left), "stop after power left");
    });

    await t.test("set motor power right", async () => {
      await expectRotationForPort(motor, MotorPort.Right, () => motor.setMotorPower(MotorPort.Right, -25), "setMotorPower right");
      await expectStopForPort(motor, MotorPort.Right, () => motor.stopMotor(MotorPort.Right), "stop after power right");
    });

    await t.test("run motor for degrees left", async () => {
      await expectRotationForPort(motor, MotorPort.Left, () => motor.runMotorForDegrees(MotorPort.Left, 180, MotorDirection.Clockwise), "runMotorForDegrees left");
      await waitForStopEvent(motor, MotorPort.Left, "runMotorForDegrees left completion");
    });

    await t.test("run motor for time right", async () => {
      await expectRotationForPort(motor, MotorPort.Right, () => motor.runMotorForTime(MotorPort.Right, 600, MotorDirection.Clockwise), "runMotorForTime right");
      await waitForStopEvent(motor, MotorPort.Right, "runMotorForTime right completion");
    });

    await t.test("run to absolute position left", async () => {
      await motor.resetMotorRelativePosition(MotorPort.Left, 0);
      await expectRotationForPort(
        motor,
        MotorPort.Left,
        () => motor.runMotorToAbsolutePosition(MotorPort.Left, 90, MotorDirection.Shortest),
        "runMotorToAbsolutePosition left"
      );
      await waitForStopEvent(motor, MotorPort.Left, "runMotorToAbsolutePosition left completion");
    });

    await t.test("run to relative position right", async () => {
      await motor.setMotorRelativePosition(MotorPort.Right, 0);
      await expectRotationForPort(
        motor,
        MotorPort.Right,
        () => motor.runMotorToRelativePosition(MotorPort.Right, 90),
        "runMotorToRelativePosition right"
      );
      await waitForStopEvent(motor, MotorPort.Right, "runMotorToRelativePosition right completion");
    });

    await t.test("set end state and acceleration", async () => {
      await motor.setMotorEndState(MotorPort.Left, MotorEndState.Brake);
      await motor.setMotorAcceleration(MotorPort.Right, 10, 12);
    });

    await t.test("final stop", async () => {
      await expectStopForPort(motor, MotorPort.Both, () => motor.stopMotor(MotorPort.Both), "final stop");
    });
    scheduleProcessExit();
  }
);

function waitForDoubleMotor(coral: Coral, timeoutMs: number): Promise<DoubleMotorDevice> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error(`Timed out after ${timeoutMs}ms waiting for a Coral DoubleMotor`));
    }, timeoutMs);

    const handleDiscover = (device: unknown) => {
      if (device instanceof DoubleMotorDevice) {
        cleanup();
        resolve(device);
      }
    };

    const cleanup = () => {
      clearTimeout(timer);
      coral.off("discover", handleDiscover as (device: DoubleMotorDevice) => void);
    };

    coral.on("discover", handleDiscover as (device: DoubleMotorDevice) => void);
  });
}

async function expectRotationForPort(
  device: DoubleMotorDevice,
  port: MotorPort,
  action: () => Promise<void>,
  label: string
): Promise<MotorNotificationPayload> {
  logStep(`Executing ${label}`);
  const rotationPromise = waitForMotorEventForPort(
    device,
    port,
    (payload) => Math.abs(payload.speed) >= SPEED_THRESHOLD,
    MOTOR_EVENT_TIMEOUT_MS,
    `${label} rotation`
  );
  await action();
  return rotationPromise;
}

async function expectStopForPort(
  device: DoubleMotorDevice,
  port: MotorPort,
  action: () => Promise<void>,
  label: string
): Promise<MotorNotificationPayload> {
  logStep(`Executing ${label}`);
  const stopPromise = waitForStopEvent(device, port, label);
  await action();
  return stopPromise;
}

function waitForStopEvent(
  device: DoubleMotorDevice,
  port: MotorPort,
  label: string
): Promise<MotorNotificationPayload> {
  return waitForMotorEventForPort(
    device,
    port,
    (payload) => Math.abs(payload.speed) <= SPEED_THRESHOLD && payload.state !== MotorState.Running,
    AUTO_STOP_TIMEOUT_MS,
    `${label} -> stop`
  );
}

function waitForMotorEventForPort(
  device: DoubleMotorDevice,
  port: MotorPort,
  predicate: (payload: MotorNotificationPayload) => boolean,
  timeoutMs: number,
  label: string
): Promise<MotorNotificationPayload> {
  const targetBits = PORT_BITS[port];
  return new Promise((resolve, reject) => {
    const handleMotor = (payload: MotorNotificationPayload) => {
      if (payload.kind === "motor" && (payload.motorBitMask & targetBits) === targetBits && predicate(payload)) {
        logRotationData(label, port, payload);
        cleanup();
        resolve(payload);
      }
    };

    const cleanup = () => {
      clearTimeout(timer);
      device.off("motor", handleMotor as (payload: MotorNotificationPayload) => void);
    };

    const timer = setTimeout(() => {
      cleanup();
      reject(new assert.AssertionError({ message: `Timed out waiting for ${label}` }));
    }, timeoutMs);

    device.on("motor", handleMotor as (payload: MotorNotificationPayload) => void);
  });
}

function logRotationData(label: string, port: MotorPort, payload: MotorNotificationPayload): void {
  logStep(
    `${label} [${port}]: state=${MotorState[payload.state]} speed=${payload.speed} power=${payload.power ?? "n/a"} position=${
      payload.position
    } absolute=${payload.absolutePosition}`
  );
}

function logStep(message: string): void {
  console.log(`[double-motor-test] ${message}`);
}

function logInstruction(message: string): void {
  console.log(`[double-motor-test] >>> ${message}`);
}
