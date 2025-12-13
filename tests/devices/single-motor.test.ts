import test from "node:test";
import assert from "node:assert/strict";
import { Coral } from "../../src/coral";
import { SingleMotorDevice } from "../../src/devices";
import { MotorNotificationPayload, MotorState } from "../../src/protocol";
import { scheduleProcessExit } from "../helpers/test-utils";

const SCAN_TIMEOUT_MS = Number(process.env.CORAL_TEST_SCAN_TIMEOUT ?? 45_000);
const MOTOR_EVENT_TIMEOUT_MS = Number(process.env.CORAL_TEST_EVENT_TIMEOUT ?? 10_000);
const AUTO_STOP_TIMEOUT_MS = Number(process.env.CORAL_TEST_AUTO_STOP_TIMEOUT ?? 12_000);
const SPEED_THRESHOLD = Number(process.env.CORAL_TEST_MIN_SPEED ?? 1);

test(
  "single motor commands run sequentially",
  { concurrency: 1 },
  async (t) => {
    const coral = new Coral();
    logStep("Scanning for Coral single motor...");
    logInstruction("Power on a Coral single motor and keep it nearby.");
    const motorPromise = waitForSingleMotor(coral, SCAN_TIMEOUT_MS);
    await coral.scan();
    const motor = await motorPromise;
    coral.stop();
    logStep(`Connected to ${motor.info.name ?? motor.info.uuid}`);

    t.after(() => {
      motor.disconnect();
      coral.stop();
    });

    await t.test("initial stop", async () => {
      await expectStop(motor, () => motor.stopMotor(), "initial stop");
    });

    await t.test("set speed and start", async () => {
      await motor.setMotorSpeed(30);
      await expectRotation(motor, () => motor.startMotor("Cw"), "startMotor");
      await expectStop(motor, () => motor.stopMotor(), "stop after startMotor");
    });

    await t.test("set motor power", async () => {
      await expectRotation(motor, () => motor.setMotorPower(20), "setMotorPower");
      await expectStop(motor, () => motor.stopMotor(), "stop after setMotorPower");
    });

    await t.test("start motor at power", async () => {
      await expectRotation(motor, () => motor.startMotorAtPower(25), "startMotorAtPower");
      await expectStop(motor, () => motor.stopMotor(), "stop after startMotorAtPower");
    });

    await t.test("run for degrees", async () => {
      await expectRotation(motor, () => motor.runMotorForDegrees(180, "Cw"), "runMotorForDegrees");
      await waitForStopEvent(motor, "runMotorForDegrees completion");
    });

    await t.test("run for time", async () => {
      await expectRotation(motor, () => motor.runMotorForTime(600, "Cw"), "runMotorForTime");
      await waitForStopEvent(motor, "runMotorForTime completion");
    });

    await t.test("run to absolute position", async () => {
      await motor.resetMotorRelativePosition(0);
      await expectRotation(
        motor,
        () => motor.runMotorToAbsolutePosition(90, "Shortest"),
        "runMotorToAbsolutePosition"
      );
      await waitForStopEvent(motor, "runMotorToAbsolutePosition completion");
    });

    await t.test("run to relative position", async () => {
      await motor.setMotorRelativePosition(0);
      await expectRotation(motor, () => motor.runMotorToRelativePosition(90), "runMotorToRelativePosition");
      await waitForStopEvent(motor, "runMotorToRelativePosition completion");
    });

    await t.test("set end state and acceleration", async () => {
      await motor.setMotorEndState("Brake");
      await motor.setMotorAcceleration(10, 12);
    });

    await t.test("final stop", async () => {
      await expectStop(motor, () => motor.stopMotor(), "final stop");
    });
    scheduleProcessExit();
  }
);

function waitForSingleMotor(coral: Coral, timeoutMs: number): Promise<SingleMotorDevice> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error(`Timed out after ${timeoutMs}ms waiting for a Coral SingleMotor`));
    }, timeoutMs);

    const handleDiscover = (device: unknown) => {
      if (device instanceof SingleMotorDevice) {
        cleanup();
        resolve(device);
      }
    };

    const cleanup = () => {
      clearTimeout(timer);
      coral.off("discover", handleDiscover as (device: SingleMotorDevice) => void);
    };

    coral.on("discover", handleDiscover as (device: SingleMotorDevice) => void);
  });
}

async function expectRotation(
  device: SingleMotorDevice,
  action: () => Promise<void>,
  label: string
): Promise<MotorNotificationPayload> {
  logStep(`Executing ${label}`);
  const rotationPromise = waitForMotorEvent(
    device,
    (payload) => Math.abs(payload.speed) >= SPEED_THRESHOLD,
    MOTOR_EVENT_TIMEOUT_MS,
    `${label} rotation`
  );
  await action();
  return rotationPromise;
}

async function expectStop(
  device: SingleMotorDevice,
  action: () => Promise<void>,
  label: string
): Promise<MotorNotificationPayload> {
  logStep(`Executing ${label}`);
  const stopPromise = waitForStopEvent(device, label);
  await action();
  return stopPromise;
}

function waitForStopEvent(device: SingleMotorDevice, label: string): Promise<MotorNotificationPayload> {
  return waitForMotorEvent(
    device,
    (payload) => Math.abs(payload.speed) <= SPEED_THRESHOLD && payload.state !== MotorState.Running,
    AUTO_STOP_TIMEOUT_MS,
    `${label} -> stop`
  );
}

function waitForMotorEvent(
  device: SingleMotorDevice,
  predicate: (payload: MotorNotificationPayload) => boolean,
  timeoutMs: number,
  label: string
): Promise<MotorNotificationPayload> {
  return new Promise((resolve, reject) => {
    const handleMotor = (payload: MotorNotificationPayload) => {
      if (payload.kind === "motor" && predicate(payload)) {
        logRotationData(label, payload);
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

function logRotationData(label: string, payload: MotorNotificationPayload): void {
  logStep(
    `${label}: state=${MotorState[payload.state]} speed=${payload.speed} power=${payload.power ?? "n/a"} position=${
      payload.position
    } absolute=${payload.absolutePosition}`
  );
}

function logStep(message: string): void {
  console.log(`[single-motor-test] ${message}`);
}

function logInstruction(message: string): void {
  console.log(`[single-motor-test] >>> ${message}`);
}
