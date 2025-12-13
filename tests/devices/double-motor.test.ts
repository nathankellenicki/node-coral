import test from "node:test";
import assert from "node:assert/strict";
import { Coral } from "../../src/coral";
import { DoubleMotorDevice } from "../../src/devices";
import { MotorNotificationPayload, MotorBits, MotorState } from "../../src/protocol";
import { scheduleProcessExit } from "../helpers/test-utils";

const SCAN_TIMEOUT_MS = Number(process.env.CORAL_TEST_SCAN_TIMEOUT ?? 45_000);
const MOTOR_EVENT_TIMEOUT_MS = Number(process.env.CORAL_TEST_EVENT_TIMEOUT ?? 10_000);
const AUTO_STOP_TIMEOUT_MS = Number(process.env.CORAL_TEST_AUTO_STOP_TIMEOUT ?? 12_000);
const SPEED_THRESHOLD = Number(process.env.CORAL_TEST_MIN_SPEED ?? 1);

type MotorPortName = "left" | "right" | "both";

const PORT_BITS: Record<MotorPortName, MotorBits> = {
  left: MotorBits.Left,
  right: MotorBits.Right,
  both: MotorBits.Both
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
      await expectStopForPort(motor, "both", () => motor.stopMotor("both"), "initial stop");
    });

    await t.test("set motor speeds", async () => {
      await motor.setMotorSpeeds(30, -30);
    });

    await t.test("start motor left", async () => {
      await expectRotationForPort(motor, "left", () => motor.startMotor("left", "Cw"), "startMotor left");
      await expectStopForPort(motor, "left", () => motor.stopMotor("left"), "stop left after start");
    });

    await t.test("start motor right", async () => {
      await expectRotationForPort(motor, "right", () => motor.startMotor("right", "Ccw"), "startMotor right");
      await expectStopForPort(motor, "right", () => motor.stopMotor("right"), "stop right after start");
    });

    await t.test("start motor both", async () => {
      await expectRotationForPort(motor, "both", () => motor.startMotor("both", "Cw"), "startMotor both");
      await expectStopForPort(motor, "both", () => motor.stopMotor("both"), "stop both after start");
    });

    await t.test("set motor power left", async () => {
      await expectRotationForPort(motor, "left", () => motor.setMotorPower("left", 25), "setMotorPower left");
      await expectStopForPort(motor, "left", () => motor.stopMotor("left"), "stop after power left");
    });

    await t.test("set motor power right", async () => {
      await expectRotationForPort(motor, "right", () => motor.setMotorPower("right", -25), "setMotorPower right");
      await expectStopForPort(motor, "right", () => motor.stopMotor("right"), "stop after power right");
    });

    await t.test("run motor for degrees left", async () => {
      await expectRotationForPort(motor, "left", () => motor.runMotorForDegrees("left", 180, "Cw"), "runMotorForDegrees left");
      await waitForStopEvent(motor, "left", "runMotorForDegrees left completion");
    });

    await t.test("run motor for time right", async () => {
      await expectRotationForPort(motor, "right", () => motor.runMotorForTime("right", 600, "Cw"), "runMotorForTime right");
      await waitForStopEvent(motor, "right", "runMotorForTime right completion");
    });

    await t.test("run to absolute position left", async () => {
      await motor.resetMotorRelativePosition("left", 0);
      await expectRotationForPort(
        motor,
        "left",
        () => motor.runMotorToAbsolutePosition("left", 90, "Shortest"),
        "runMotorToAbsolutePosition left"
      );
      await waitForStopEvent(motor, "left", "runMotorToAbsolutePosition left completion");
    });

    await t.test("run to relative position right", async () => {
      await motor.setMotorRelativePosition("right", 0);
      await expectRotationForPort(
        motor,
        "right",
        () => motor.runMotorToRelativePosition("right", 90),
        "runMotorToRelativePosition right"
      );
      await waitForStopEvent(motor, "right", "runMotorToRelativePosition right completion");
    });

    await t.test("set end state and acceleration", async () => {
      await motor.setMotorEndState("left", "Brake");
      await motor.setMotorAcceleration("right", 10, 12);
    });

    await t.test("final stop", async () => {
      await expectStopForPort(motor, "both", () => motor.stopMotor("both"), "final stop");
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
  port: MotorPortName,
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
  port: MotorPortName,
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
  port: MotorPortName,
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
  port: MotorPortName,
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

function logRotationData(label: string, port: MotorPortName, payload: MotorNotificationPayload): void {
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
