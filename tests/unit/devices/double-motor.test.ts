import test from "node:test";
import { DoubleMotorDevice } from "../../../src/devices";
import {
  MessageType,
  MotorBits,
  MotorMoveDirection,
  MovementDirection
} from "../../../src/protocol";
import type { CoralConnection } from "../../../src/connection";
import { DEVICE_INFO, MockConnection, assertBuffer } from "../helpers/mock-connection";

test("DoubleMotorDevice encodes per-method payloads", async (t) => {
  const mock = new MockConnection();
  const device = new DoubleMotorDevice(mock as unknown as CoralConnection, "DoubleMotor", DEVICE_INFO);

  await t.test("setMotorSpeed encodes selected port", async () => {
    mock.clearWrites();
    await device.setMotorSpeed("right", -17);
    assertBuffer(mock.popWrite(), 3, (buf) => {
      buf[0] = MessageType.MotorSetSpeedCommand;
      buf[1] = MotorBits.Right;
      buf.writeInt8(-17, 2);
    });
    mock.assertDrained();
  });

  await t.test("setMotorSpeeds emits two commands", async () => {
    mock.clearWrites();
    await device.setMotorSpeeds(10, -11);
    assertBuffer(mock.popWrite(), 3, (buf) => {
      buf[0] = MessageType.MotorSetSpeedCommand;
      buf[1] = MotorBits.Left;
      buf.writeInt8(10, 2);
    });
    assertBuffer(mock.popWrite(), 3, (buf) => {
      buf[0] = MessageType.MotorSetSpeedCommand;
      buf[1] = MotorBits.Right;
      buf.writeInt8(-11, 2);
    });
    mock.assertDrained();
  });

  await t.test("setMotorPower writes signed duty per port", async () => {
    mock.clearWrites();
    await device.setMotorPower("left", 75);
    assertBuffer(mock.popWrite(), 4, (buf) => {
      buf[0] = MessageType.MotorSetDutyCycleCommand;
      buf[1] = MotorBits.Left;
      buf.writeInt16LE(75, 2);
    });
    mock.assertDrained();
  });

  await t.test("startMotor encodes direction per port", async () => {
    mock.clearWrites();
    await device.startMotor("right", "Shortest");
    assertBuffer(mock.popWrite(), 3, (buf) => {
      buf[0] = MessageType.MotorRunCommand;
      buf[1] = MotorBits.Right;
      buf[2] = MotorMoveDirection.Shortest;
    });
    mock.assertDrained();
  });

  await t.test("runMotorForDegrees writes port, degrees, direction", async () => {
    mock.clearWrites();
    await device.runMotorForDegrees("left", 540, "Longest");
    assertBuffer(mock.popWrite(), 7, (buf) => {
      buf[0] = MessageType.MotorRunForDegreesCommand;
      buf[1] = MotorBits.Left;
      buf.writeInt32LE(540, 2);
      buf[6] = MotorMoveDirection.Longest;
    });
    mock.assertDrained();
  });

  await t.test("runMotorForTime uses ms + direction", async () => {
    mock.clearWrites();
    await device.runMotorForTime("both", 2_000, "Ccw");
    assertBuffer(mock.popWrite(), 7, (buf) => {
      buf[0] = MessageType.MotorRunForTimeCommand;
      buf[1] = MotorBits.Both;
      buf.writeUInt32LE(2_000, 2);
      buf[6] = MotorMoveDirection.Ccw;
    });
    mock.assertDrained();
  });

  await t.test("runMotorToAbsolutePosition writes uint16 position", async () => {
    mock.clearWrites();
    await device.runMotorToAbsolutePosition("right", 90, "Cw");
    assertBuffer(mock.popWrite(), 5, (buf) => {
      buf[0] = MessageType.MotorRunToAbsolutePositionCommand;
      buf[1] = MotorBits.Right;
      buf.writeUInt16LE(90, 2);
      buf[4] = MotorMoveDirection.Cw;
    });
    mock.assertDrained();
  });

  await t.test("runMotorToRelativePosition uses signed offset", async () => {
    mock.clearWrites();
    await device.runMotorToRelativePosition("both", -120);
    assertBuffer(mock.popWrite(), 6, (buf) => {
      buf[0] = MessageType.MotorRunToRelativePositionCommand;
      buf[1] = MotorBits.Both;
      buf.writeInt32LE(-120, 2);
    });
    mock.assertDrained();
  });

  await t.test("resetMotorRelativePosition and setter use mask + value", async () => {
    mock.clearWrites();
    await device.resetMotorRelativePosition("left", 12);
    assertBuffer(mock.popWrite(), 6, (buf) => {
      buf[0] = MessageType.MotorResetRelativePositionCommand;
      buf[1] = MotorBits.Left;
      buf.writeInt32LE(12, 2);
    });
    mock.assertDrained();

    mock.clearWrites();
    await device.setMotorRelativePosition("right", 24);
    assertBuffer(mock.popWrite(), 6, (buf) => {
      buf[0] = MessageType.MotorResetRelativePositionCommand;
      buf[1] = MotorBits.Right;
      buf.writeInt32LE(24, 2);
    });
    mock.assertDrained();
  });

  await t.test("stopMotor defaults to both ports", async () => {
    mock.clearWrites();
    await device.stopMotor();
    assertBuffer(mock.popWrite(), 2, (buf) => {
      buf[0] = MessageType.MotorStopCommand;
      buf[1] = MotorBits.Both;
    });
    mock.assertDrained();
  });

  await t.test("setMotorEndState encodes enum via helper", async () => {
    mock.clearWrites();
    await device.setMotorEndState("left", "SmartBrake");
    assertBuffer(mock.popWrite(), 3, (buf) => {
      buf[0] = MessageType.MotorSetEndStateCommand;
      buf[1] = MotorBits.Left;
      buf.writeInt8(5, 2);
    });
    mock.assertDrained();
  });

  await t.test("setMotorAcceleration clamps both values", async () => {
    mock.clearWrites();
    await device.setMotorAcceleration("right", 10, 999);
    assertBuffer(mock.popWrite(), 4, (buf) => {
      buf[0] = MessageType.MotorSetAccelerationCommand;
      buf[1] = MotorBits.Right;
      buf.writeUInt8(10, 2);
      buf.writeUInt8(255, 3);
    });
    mock.assertDrained();
  });

  await t.test("startMoving encodes direction enum", async () => {
    mock.clearWrites();
    await device.startMoving("Backward");
    assertBuffer(mock.popWrite(), 2, (buf) => {
      buf[0] = MessageType.MovementMoveCommand;
      buf[1] = MovementDirection.Backward;
    });
    mock.assertDrained();
  });

  await t.test("stopMoving sends stop opcode", async () => {
    mock.clearWrites();
    await device.stopMoving();
    assertBuffer(mock.popWrite(), 1, (buf) => {
      buf[0] = MessageType.MovementStopCommand;
    });
    mock.assertDrained();
  });

  await t.test("moveForTime encodes ms + direction", async () => {
    mock.clearWrites();
    await device.moveForTime(2_500, "Left");
    assertBuffer(mock.popWrite(), 6, (buf) => {
      buf[0] = MessageType.MovementMoveForTimeCommand;
      buf.writeUInt32LE(2_500, 1);
      buf[5] = MovementDirection.Left;
    });
    mock.assertDrained();
  });

  await t.test("moveForDegrees encodes signed degrees + direction", async () => {
    mock.clearWrites();
    await device.moveForDegrees(-360, "Right");
    assertBuffer(mock.popWrite(), 6, (buf) => {
      buf[0] = MessageType.MovementMoveForDegreesCommand;
      buf.writeInt32LE(-360, 1);
      buf[5] = MovementDirection.Right;
    });
    mock.assertDrained();
  });

  await t.test("moveForDistance proxies degrees helper", async () => {
    mock.clearWrites();
    await device.moveForDistance(123, "Forward");
    assertBuffer(mock.popWrite(), 6, (buf) => {
      buf[0] = MessageType.MovementMoveForDegreesCommand;
      buf.writeInt32LE(123, 1);
      buf[5] = MovementDirection.Forward;
    });
    mock.assertDrained();
  });

  await t.test("moveAtDualSpeed writes signed speeds", async () => {
    mock.clearWrites();
    await device.moveAtDualSpeed(50, -40);
    assertBuffer(mock.popWrite(), 3, (buf) => {
      buf[0] = MessageType.MovementMoveTankCommand;
      buf.writeInt8(50, 1);
      buf.writeInt8(-40, 2);
    });
    mock.assertDrained();
  });

  await t.test("moveAtDualSpeedForTime writes ms + speeds", async () => {
    mock.clearWrites();
    await device.moveAtDualSpeedForTime(-75, 80, 900);
    assertBuffer(mock.popWrite(), 7, (buf) => {
      buf[0] = MessageType.MovementMoveTankForTimeCommand;
      buf.writeUInt32LE(900, 1);
      buf.writeInt8(-75, 5);
      buf.writeInt8(80, 6);
    });
    mock.assertDrained();
  });

  await t.test("moveAtDualSpeedForDegrees writes signed degrees + speeds", async () => {
    mock.clearWrites();
    await device.moveAtDualSpeedForDegrees(15, -15, 720);
    assertBuffer(mock.popWrite(), 7, (buf) => {
      buf[0] = MessageType.MovementMoveTankForDegreesCommand;
      buf.writeInt32LE(720, 1);
      buf.writeInt8(15, 5);
      buf.writeInt8(-15, 6);
    });
    mock.assertDrained();
  });

  await t.test("setMovementSpeed clamps +/-100", async () => {
    mock.clearWrites();
    await device.setMovementSpeed(250);
    assertBuffer(mock.popWrite(), 2, (buf) => {
      buf[0] = MessageType.MovementSetSpeedCommand;
      buf.writeInt8(100, 1);
    });
    mock.assertDrained();

    mock.clearWrites();
    await device.setMovementSpeed(-250);
    assertBuffer(mock.popWrite(), 2, (buf) => {
      buf[0] = MessageType.MovementSetSpeedCommand;
      buf.writeInt8(-100, 1);
    });
    mock.assertDrained();
  });

  await t.test("setMovementEndState uses enum", async () => {
    mock.clearWrites();
    await device.setMovementEndState("Brake");
    assertBuffer(mock.popWrite(), 2, (buf) => {
      buf[0] = MessageType.MovementSetEndStateCommand;
      buf.writeInt8(1, 1);
    });
    mock.assertDrained();
  });

  await t.test("setMoveEndState proxies movement setter", async () => {
    mock.clearWrites();
    await device.setMoveEndState("Continue");
    assertBuffer(mock.popWrite(), 2, (buf) => {
      buf[0] = MessageType.MovementSetEndStateCommand;
      buf.writeInt8(3, 1);
    });
    mock.assertDrained();
  });

  await t.test("setMovementAcceleration encodes unsigned bytes", async () => {
    mock.clearWrites();
    await device.setMovementAcceleration(5, 6);
    assertBuffer(mock.popWrite(), 3, (buf) => {
      buf[0] = MessageType.MovementSetAccelerationCommand;
      buf.writeUInt8(5, 1);
      buf.writeUInt8(6, 2);
    });
    mock.assertDrained();
  });

  await t.test("setMoveAcceleration proxies movement acceleration", async () => {
    mock.clearWrites();
    await device.setMoveAcceleration(8, 9);
    assertBuffer(mock.popWrite(), 3, (buf) => {
      buf[0] = MessageType.MovementSetAccelerationCommand;
      buf.writeUInt8(8, 1);
      buf.writeUInt8(9, 2);
    });
    mock.assertDrained();
  });

  await t.test("setMovementSteering encodes signed speed value", async () => {
    mock.clearWrites();
    await device.setMovementSteering(-120);
    assertBuffer(mock.popWrite(), 2, (buf) => {
      buf[0] = MessageType.MovementSetTurnSteeringCommand;
      buf.writeInt8(-100, 1);
    });
    mock.assertDrained();
  });

  await t.test("turn delegates to moveForDegrees", async () => {
    mock.clearWrites();
    await device.turn(180, "Left");
    assertBuffer(mock.popWrite(), 6, (buf) => {
      buf[0] = MessageType.MovementMoveForDegreesCommand;
      buf.writeInt32LE(180, 1);
      buf[5] = MovementDirection.Left;
    });
    mock.assertDrained();
  });
});
