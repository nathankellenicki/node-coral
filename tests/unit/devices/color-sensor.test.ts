import test from "node:test";
import assert from "node:assert/strict";
import type { CoralConnection } from "../../../src/connection";
import { ColorSensorDevice } from "../../../src/devices";
import { DEVICE_INFO, MockConnection } from "../helpers/mock-connection";

test("ColorSensorDevice re-emits color payloads", async () => {
  const mock = new MockConnection();
  const device = new ColorSensorDevice(mock as unknown as CoralConnection, "ColorSensor", DEVICE_INFO);

  await new Promise<void>((resolve) => {
    const payload = {
      kind: "color",
      color: 5,
      reflection: 10,
      rawRed: 1,
      rawGreen: 2,
      rawBlue: 3,
      hue: 50,
      saturation: 25,
      value: 75
    } as const;
    device.once("color", (event) => {
      assert.deepStrictEqual(event, payload);
      resolve();
    });
    mock.emit("notification", [payload]);
  });
});
