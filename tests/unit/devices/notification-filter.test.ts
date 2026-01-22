import test from "node:test";
import assert from "node:assert/strict";
import type { CoralConnection } from "../../../src/connection";
import { ControllerDevice, DoubleMotorDevice } from "../../../src/devices";
import { CoralDeviceKind } from "../../../src/constants";
import { ProductGroupDevice } from "../../../src/protocol";
import { DEVICE_INFO, MockConnection } from "../helpers/mock-connection";

test("ControllerDevice only re-emits changed payloads", async () => {
  const mock = new MockConnection(ProductGroupDevice.CoralJoystick);
  const device = new ControllerDevice(mock as unknown as CoralConnection, CoralDeviceKind.Controller, DEVICE_INFO);
  await device.connect();

  let count = 0;
  device.on("joystick", () => {
    count += 1;
  });

  const payload = {
    kind: "joystick" as const,
    leftPercent: 10,
    rightPercent: -20,
    leftAngle: 90,
    rightAngle: -90
  };

  mock.emit("notification", [payload]);
  mock.emit("notification", [payload]);

  const changedPayload = { ...payload, leftPercent: 11 };
  mock.emit("notification", [changedPayload]);

  assert.strictEqual(count, 2, "should emit only when payload changes");
});

test("DoubleMotorDevice tracks payloads per motor bitmask", async () => {
  const mock = new MockConnection(ProductGroupDevice.CoralDualMotor);
  const device = new DoubleMotorDevice(mock as unknown as CoralConnection, CoralDeviceKind.DoubleMotor, DEVICE_INFO);
  await device.connect();

  let count = 0;
  device.on("motor", () => {
    count += 1;
  });

  const left = {
    kind: "motor" as const,
    motorBitMask: 1,
    state: 0,
    absolutePosition: 0,
    position: 0,
    speed: 10,
    power: 5
  };

  const right = { ...left, motorBitMask: 2 };

  mock.emit("notification", [left]);
  mock.emit("notification", [left]);
  mock.emit("notification", [right]);
  mock.emit("notification", [{ ...left, speed: 11 }]);

  assert.strictEqual(count, 3, "should track last payload per motor mask");
});
