import test from "node:test";
import assert from "node:assert/strict";
import { Coral } from "../../src/coral";
import { ColorSensorDevice } from "../../src/devices";
import { ColorSensorPayload, LegoColor } from "../../src/protocol";
import { scheduleProcessExit } from "../helpers/test-utils";

const SCAN_TIMEOUT_MS = Number(process.env.CORAL_TEST_SCAN_TIMEOUT ?? 45_000);
const COLOR_EVENT_TIMEOUT_MS = Number(process.env.CORAL_TEST_EVENT_TIMEOUT ?? 10_000);
const TEAL_COLOR = Number(process.env.CORAL_TEST_COLOR_TEAL ?? LegoColor.Turquoise);
const RED_COLOR = Number(process.env.CORAL_TEST_COLOR_RED ?? LegoColor.Red);

test(
  "color sensor emits readings",
  { concurrency: 1 },
  async (t) => {
    const coral = new Coral();
    logStep("Scanning for Coral color sensor...");
    logInstruction("Power on a Coral color sensor and keep teal/red surfaces handy.");
    const sensorPromise = waitForColorSensor(coral, SCAN_TIMEOUT_MS);
    await coral.scan();
    const sensor = await sensorPromise;
    coral.stop();
    logStep(`Connected to ${sensor.info.name ?? sensor.info.uuid}`);

    t.after(() => {
      sensor.disconnect();
      coral.stop();
    });

    await t.test("initial reading", async () => {
      await expectColorReading(sensor, "initial reading");
    });
    await t.test("teal detection", async () => {
      logInstruction("Place a teal surface in front of the sensor.");
      await expectSpecificColor(sensor, TEAL_COLOR, "teal detection");
    });
    await t.test("red detection", async () => {
      logInstruction("Place a red surface in front of the sensor.");
      await expectSpecificColor(sensor, RED_COLOR, "red detection");
    });
    scheduleProcessExit();
  }
);

function waitForColorSensor(coral: Coral, timeoutMs: number): Promise<ColorSensorDevice> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error(`Timed out after ${timeoutMs}ms waiting for a Coral ColorSensor`));
    }, timeoutMs);

    const handleDiscover = (device: unknown) => {
      if (device instanceof ColorSensorDevice) {
        cleanup();
        resolve(device);
      }
    };

    const cleanup = () => {
      clearTimeout(timer);
      coral.off("discover", handleDiscover as (device: ColorSensorDevice) => void);
    };

    coral.on("discover", handleDiscover as (device: ColorSensorDevice) => void);
  });
}

async function expectColorReading(device: ColorSensorDevice, label: string): Promise<ColorSensorPayload> {
  logStep(`Waiting for ${label}`);
  return waitForColorEvent(device, COLOR_EVENT_TIMEOUT_MS, label);
}

async function expectSpecificColor(
  device: ColorSensorDevice,
  color: number,
  label: string
): Promise<ColorSensorPayload> {
  logStep(`Waiting for ${label} (${color})`);
  return waitForColorEvent(
    device,
    COLOR_EVENT_TIMEOUT_MS,
    label,
    (payload) => payload.color === color
  );
}

function waitForColorEvent(
  device: ColorSensorDevice,
  timeoutMs: number,
  label: string,
  predicate: (payload: ColorSensorPayload) => boolean = () => true
): Promise<ColorSensorPayload> {
  return new Promise((resolve, reject) => {
    const handleColor = (payload: ColorSensorPayload) => {
      if (payload.kind === "color" && predicate(payload)) {
        logColorData(label, payload);
        cleanup();
        try {
          assertColorPayload(payload);
          resolve(payload);
        } catch (error) {
          reject(error);
        }
      }
    };

    const cleanup = () => {
      clearTimeout(timer);
      device.off("color", handleColor as (payload: ColorSensorPayload) => void);
    };

    const timer = setTimeout(() => {
      cleanup();
      reject(new assert.AssertionError({ message: `Timed out waiting for ${label}` }));
    }, timeoutMs);

    device.on("color", handleColor as (payload: ColorSensorPayload) => void);
  });
}

function assertColorPayload(payload: ColorSensorPayload): void {
  assert.ok(Number.isFinite(payload.reflection), "reflection should be finite");
  assert.ok(Number.isFinite(payload.rawRed), "rawRed should be finite");
  assert.ok(Number.isFinite(payload.rawGreen), "rawGreen should be finite");
  assert.ok(Number.isFinite(payload.rawBlue), "rawBlue should be finite");
  assert.ok(Number.isFinite(payload.hue), "hue should be finite");
  assert.ok(Number.isFinite(payload.saturation), "saturation should be finite");
  assert.ok(Number.isFinite(payload.value), "value should be finite");
}

function logColorData(label: string, payload: ColorSensorPayload): void {
  logStep(
    `${label}: color=${payload.color} reflection=${payload.reflection} raw=(${payload.rawRed},${payload.rawGreen},${
      payload.rawBlue
    }) hsv=(${payload.hue},${payload.saturation},${payload.value})`
  );
}

function logStep(message: string): void {
  console.log(`[color-sensor-test] ${message}`);
}

function logInstruction(message: string): void {
  console.log(`[color-sensor-test] >>> ${message}`);
}
