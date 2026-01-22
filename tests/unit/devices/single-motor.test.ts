import test from "node:test";
import { SingleMotorDevice } from "../../../src/devices";
import { CoralDeviceKind } from "../../../src/constants";
import { MessageType, MotorBits, MotorMoveDirection } from "../../../src/protocol";
import type { CoralConnection } from "../../../src/connection";
import { DEVICE_INFO, MockConnection, assertBuffer } from "../helpers/mock-connection";

test("SingleMotorDevice encodes each command", async (t) => {
  const mock = new MockConnection();
  const device = new SingleMotorDevice(mock as unknown as CoralConnection, CoralDeviceKind.SingleMotor, DEVICE_INFO);

  await t.test("setMotorSpeed clamps to +/-100", async () => {
    mock.clearWrites();
    await device.setMotorSpeed(150.4);
    assertBuffer(mock.popWrite(), 3, (buf) => {
      buf[0] = MessageType.MotorSetSpeedCommand;
      buf[1] = MotorBits.Left;
      buf.writeInt8(100, 2);
    });
    mock.assertDrained();

    mock.clearWrites();
    await device.setMotorSpeed(-170);
    assertBuffer(mock.popWrite(), 3, (buf) => {
      buf[0] = MessageType.MotorSetSpeedCommand;
      buf[1] = MotorBits.Left;
      buf.writeInt8(-100, 2);
    });
    mock.assertDrained();
  });

  await t.test("setMotorPower encodes signed duty cycle", async () => {
    mock.clearWrites();
    await device.setMotorPower(-22.6);
    assertBuffer(mock.popWrite(), 4, (buf) => {
      buf[0] = MessageType.MotorSetDutyCycleCommand;
      buf[1] = MotorBits.Left;
      buf.writeInt16LE(-23, 2);
    });
    mock.assertDrained();
  });

  await t.test("startMotor encodes direction bits", async () => {
    mock.clearWrites();
    await device.startMotor("Ccw");
    assertBuffer(mock.popWrite(), 3, (buf) => {
      buf[0] = MessageType.MotorRunCommand;
      buf[1] = MotorBits.Left;
      buf[2] = MotorMoveDirection.Ccw;
    });
    mock.assertDrained();
  });

  await t.test("runMotorForDegrees emits degrees + direction", async () => {
    mock.clearWrites();
    await device.runMotorForDegrees(360, "Longest");
    assertBuffer(mock.popWrite(), 7, (buf) => {
      buf[0] = MessageType.MotorRunForDegreesCommand;
      buf[1] = MotorBits.Left;
      buf.writeInt32LE(360, 2);
      buf[6] = MotorMoveDirection.Longest;
    });
    mock.assertDrained();
  });

  await t.test("runMotorForTime emits unsigned ms", async () => {
    mock.clearWrites();
    await device.runMotorForTime(1_500, "Cw");
    assertBuffer(mock.popWrite(), 7, (buf) => {
      buf[0] = MessageType.MotorRunForTimeCommand;
      buf[1] = MotorBits.Left;
      buf.writeUInt32LE(1_500, 2);
      buf[6] = MotorMoveDirection.Cw;
    });
    mock.assertDrained();
  });

  await t.test("runMotorToAbsolutePosition encodes uint16 position", async () => {
    mock.clearWrites();
    await device.runMotorToAbsolutePosition(270, "Shortest");
    assertBuffer(mock.popWrite(), 5, (buf) => {
      buf[0] = MessageType.MotorRunToAbsolutePositionCommand;
      buf[1] = MotorBits.Left;
      buf.writeUInt16LE(270, 2);
      buf[4] = MotorMoveDirection.Shortest;
    });
    mock.assertDrained();
  });

  await t.test("runMotorToRelativePosition encodes signed offsets", async () => {
    mock.clearWrites();
    await device.runMotorToRelativePosition(-45);
    assertBuffer(mock.popWrite(), 6, (buf) => {
      buf[0] = MessageType.MotorRunToRelativePositionCommand;
      buf[1] = MotorBits.Left;
      buf.writeInt32LE(-45, 2);
    });
    mock.assertDrained();
  });

  await t.test("resetMotorRelativePosition emits signed position", async () => {
    mock.clearWrites();
    await device.resetMotorRelativePosition(1_024);
    assertBuffer(mock.popWrite(), 6, (buf) => {
      buf[0] = MessageType.MotorResetRelativePositionCommand;
      buf[1] = MotorBits.Left;
      buf.writeInt32LE(1_024, 2);
    });
    mock.assertDrained();
  });

  await t.test("setMotorRelativePosition delegates to reset", async () => {
    mock.clearWrites();
    await device.setMotorRelativePosition(77);
    assertBuffer(mock.popWrite(), 6, (buf) => {
      buf[0] = MessageType.MotorResetRelativePositionCommand;
      buf[1] = MotorBits.Left;
      buf.writeInt32LE(77, 2);
    });
    mock.assertDrained();
  });

  await t.test("stopMotor encodes mask only", async () => {
    mock.clearWrites();
    await device.stopMotor();
    assertBuffer(mock.popWrite(), 2, (buf) => {
      buf[0] = MessageType.MotorStopCommand;
      buf[1] = MotorBits.Left;
    });
    mock.assertDrained();
  });

  await t.test("setMotorEndState encodes enum", async () => {
    mock.clearWrites();
    await device.setMotorEndState("Hold");
    assertBuffer(mock.popWrite(), 3, (buf) => {
      buf[0] = MessageType.MotorSetEndStateCommand;
      buf[1] = MotorBits.Left;
      buf.writeInt8(2, 2);
    });
    mock.assertDrained();
  });

  await t.test("setMotorAcceleration clamps 0-255", async () => {
    mock.clearWrites();
    await device.setMotorAcceleration(301, -5);
    assertBuffer(mock.popWrite(), 4, (buf) => {
      buf[0] = MessageType.MotorSetAccelerationCommand;
      buf[1] = MotorBits.Left;
      buf.writeUInt8(255, 2);
      buf.writeUInt8(0, 3);
    });
    mock.assertDrained();
  });

  await t.test("startMotorAtPower reuses duty cycle command", async () => {
    mock.clearWrites();
    await device.startMotorAtPower(33);
    assertBuffer(mock.popWrite(), 4, (buf) => {
      buf[0] = MessageType.MotorSetDutyCycleCommand;
      buf[1] = MotorBits.Left;
      buf.writeInt16LE(33, 2);
    });
    mock.assertDrained();
  });
});
