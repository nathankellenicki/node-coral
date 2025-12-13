import test from "node:test";
import assert from "node:assert/strict";
import { Coral } from "../../src/coral";
import { ControllerDevice } from "../../src/devices";
import { ButtonPayload, JoystickPayload, MotionSensorPayload } from "../../src/protocol";
import { scheduleProcessExit } from "../helpers/test-utils";

const SCAN_TIMEOUT_MS = Number(process.env.CORAL_TEST_SCAN_TIMEOUT ?? 45_000);
const EVENT_TIMEOUT_MS = Number(process.env.CORAL_TEST_EVENT_TIMEOUT ?? 10_000);
const LEFT_JOYSTICK_MIN_PERCENT = Number(process.env.CORAL_TEST_LEFT_JOYSTICK_MIN_PERCENT ?? 80);
const RIGHT_JOYSTICK_MAX_PERCENT = Number(process.env.CORAL_TEST_RIGHT_JOYSTICK_MAX_PERCENT ?? -80);

test(
  "controller emits joystick, button, and motion events",
  { concurrency: 1 },
  async (t) => {
    const coral = new Coral();
    logStep("Scanning for Coral controller...");
    logInstruction("Power on a Coral controller and keep it nearby.");
    const controllerPromise = waitForController(coral, SCAN_TIMEOUT_MS);
    await coral.scan();
    const controller = await controllerPromise;
    coral.stop();
    logStep(`Connected to ${controller.info.name ?? controller.info.uuid}`);

    t.after(() => {
      controller.disconnect();
      coral.stop();
    });

    await t.test("left joystick movement", async () => {
      logInstruction(`Move the left joystick above ${LEFT_JOYSTICK_MIN_PERCENT}%`);
      await expectJoystick(controller, "left joystick movement", (payload) => payload.leftPercent >= LEFT_JOYSTICK_MIN_PERCENT);
    });

    await t.test("right joystick movement", async () => {
      logInstruction(`Move the right joystick below ${RIGHT_JOYSTICK_MAX_PERCENT}%`);
      await expectJoystick(
        controller,
        "right joystick movement",
        (payload) => payload.rightPercent <= RIGHT_JOYSTICK_MAX_PERCENT
      );
    });

    // await t.test("button press", async () => {
    //   logInstruction("Press and release any controller button");
    //   await expectButton(controller, "button press/release");
    // });

    // await t.test("motion reading", async () => {
    //   logInstruction("Tilt or move the controller to produce motion readings");
    //   await expectMotion(controller, "motion reading");
    // });

    scheduleProcessExit();
  }
);

function waitForController(coral: Coral, timeoutMs: number): Promise<ControllerDevice> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error(`Timed out after ${timeoutMs}ms waiting for a Coral Controller`));
    }, timeoutMs);

    const handleDiscover = (device: unknown) => {
      if (device instanceof ControllerDevice) {
        cleanup();
        resolve(device);
      }
    };

    const cleanup = () => {
      clearTimeout(timer);
      coral.off("discover", handleDiscover as (device: ControllerDevice) => void);
    };

    coral.on("discover", handleDiscover as (device: ControllerDevice) => void);
  });
}

async function expectJoystick(
  device: ControllerDevice,
  label: string,
  predicate: (payload: JoystickPayload) => boolean
): Promise<JoystickPayload> {
  logStep(`Waiting for ${label}`);
  return waitForJoystick(device, EVENT_TIMEOUT_MS, label, predicate);
}

async function expectButton(device: ControllerDevice, label: string): Promise<ButtonPayload> {
  logStep(`Waiting for ${label}`);
  return waitForButton(device, EVENT_TIMEOUT_MS, label);
}

async function expectMotion(device: ControllerDevice, label: string): Promise<MotionSensorPayload> {
  logStep(`Waiting for ${label}`);
  return waitForMotion(device, EVENT_TIMEOUT_MS, label);
}

function waitForJoystick(
  device: ControllerDevice,
  timeoutMs: number,
  label: string,
  predicate: (payload: JoystickPayload) => boolean
): Promise<JoystickPayload> {
  return new Promise((resolve, reject) => {
    const handleJoystick = (payload: JoystickPayload) => {
      if (payload.kind === "joystick" && predicate(payload)) {
        logJoystick(label, payload);
        cleanup();
        resolve(payload);
      }
    };

    const cleanup = () => {
      clearTimeout(timer);
      device.off("joystick", handleJoystick as (payload: JoystickPayload) => void);
    };

    const timer = setTimeout(() => {
      cleanup();
      reject(new assert.AssertionError({ message: `Timed out waiting for ${label}` }));
    }, timeoutMs);

    device.on("joystick", handleJoystick as (payload: JoystickPayload) => void);
  });
}

function waitForButton(
  device: ControllerDevice,
  timeoutMs: number,
  label: string
): Promise<ButtonPayload> {
  return new Promise((resolve, reject) => {
    const handleButton = (payload: ButtonPayload) => {
      if (payload.kind === "button") {
        logButton(label, payload);
        cleanup();
        resolve(payload);
      }
    };

    const cleanup = () => {
      clearTimeout(timer);
      device.off("button", handleButton as (payload: ButtonPayload) => void);
    };

    const timer = setTimeout(() => {
      cleanup();
      reject(new assert.AssertionError({ message: `Timed out waiting for ${label}` }));
    }, timeoutMs);

    device.on("button", handleButton as (payload: ButtonPayload) => void);
  });
}

function waitForMotion(
  device: ControllerDevice,
  timeoutMs: number,
  label: string
): Promise<MotionSensorPayload> {
  return new Promise((resolve, reject) => {
    const handleMotion = (payload: MotionSensorPayload) => {
      if (payload.kind === "motion-sensor") {
        logMotion(label, payload);
        cleanup();
        resolve(payload);
      }
    };

    const cleanup = () => {
      clearTimeout(timer);
      device.off("motion", handleMotion as (payload: MotionSensorPayload) => void);
    };

    const timer = setTimeout(() => {
      cleanup();
      reject(new assert.AssertionError({ message: `Timed out waiting for ${label}` }));
    }, timeoutMs);

    device.on("motion", handleMotion as (payload: MotionSensorPayload) => void);
  });
}

function logJoystick(label: string, payload: JoystickPayload): void {
  logStep(
    `${label}: left=${payload.leftPercent}% (angle ${payload.leftAngle}) right=${payload.rightPercent}% (angle ${payload.rightAngle})`
  );
}

function logButton(label: string, payload: ButtonPayload): void {
  logStep(`${label}: pressed=${payload.pressed}`);
}

function logMotion(label: string, payload: MotionSensorPayload): void {
  logStep(
    `${label}: yaw=${payload.yaw} pitch=${payload.pitch} roll=${payload.roll} acc=(${payload.accelerometerX},${payload.accelerometerY},${payload.accelerometerZ})`
  );
}

function logStep(message: string): void {
  console.log(`[controller-test] ${message}`);
}

function logInstruction(message: string): void {
  console.log(`[controller-test] >>> ${message}`);
}
