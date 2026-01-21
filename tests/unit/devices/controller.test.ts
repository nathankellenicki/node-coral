import test from "node:test";
import assert from "node:assert/strict";
import type { CoralConnection } from "../../../src/connection";
import { ControllerDevice } from "../../../src/devices";
import { CoralDeviceKind } from "../../../src/constants";
import { ProductGroupDevice } from "../../../src/protocol";
import { DEVICE_INFO, MockConnection } from "../helpers/mock-connection";

test("ControllerDevice re-emits joystick payloads", async () => {
  const mock = new MockConnection(ProductGroupDevice.CoralJoystick);
  const device = new ControllerDevice(mock as unknown as CoralConnection, CoralDeviceKind.Controller, DEVICE_INFO);
  await device.connect();

  await new Promise<void>((resolve) => {
    const payload = {
      kind: "joystick",
      leftPercent: 10,
      rightPercent: -20,
      leftAngle: 90,
      rightAngle: -90
    } as const;
    device.once("joystick", (event) => {
      assert.deepStrictEqual(event, payload);
      resolve();
    });
    mock.emit("notification", [payload]);
  });
});
