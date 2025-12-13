import { CoralDevice } from "./base";
import {
  MotorDirection,
  MotorEndStateName,
  MotorPort,
  MovementDirectionName,
  clampAcceleration,
  clampSpeed,
  directionToEnum,
  endStateToEnum,
  movementDirectionToEnum,
  portToBits
} from "./types";
import {
  createMotorResetRelativePositionCommand,
  createMotorRunCommand,
  createMotorRunForDegreesCommand,
  createMotorRunForTimeCommand,
  createMotorRunToAbsolutePositionCommand,
  createMotorRunToRelativePositionCommand,
  createMotorSetAccelerationCommand,
  createMotorSetDutyCycleCommand,
  createMotorSetEndStateCommand,
  createMotorSetSpeedCommand,
  createMotorStopCommand,
  createMovementMoveCommand,
  createMovementMoveForDegreesCommand,
  createMovementMoveForTimeCommand,
  createMovementMoveTankCommand,
  createMovementMoveTankForDegreesCommand,
  createMovementMoveTankForTimeCommand,
  createMovementSetAccelerationCommand,
  createMovementSetEndStateCommand,
  createMovementSetSpeedCommand,
  createMovementSetTurnSteeringCommand,
  createMovementStopCommand
} from "../protocol";

export class DoubleMotorDevice extends CoralDevice {
  async setMotorSpeed(port: MotorPort, speed: number): Promise<void> {
    await this.connection.request(createMotorSetSpeedCommand(portToBits(port), clampSpeed(speed)));
  }

  async setMotorSpeeds(left: number, right: number): Promise<void> {
    await this.setMotorSpeed("left", left);
    await this.setMotorSpeed("right", right);
  }

  async setMotorPower(port: MotorPort, power: number): Promise<void> {
    await this.connection.request(createMotorSetDutyCycleCommand(portToBits(port), clampSpeed(power)));
  }

  async setMotorPowers(left: number, right: number): Promise<void> {
    await this.setMotorPower("left", left);
    await this.setMotorPower("right", right);
  }

  async startMotorAtPower(port: MotorPort, power: number): Promise<void> {
    await this.setMotorPower(port, power);
  }

  async startMotor(port: MotorPort, direction: MotorDirection = "Cw"): Promise<void> {
    await this.connection.request(createMotorRunCommand(portToBits(port), directionToEnum(direction)));
  }

  async runMotorForDegrees(
    port: MotorPort,
    degrees: number,
    direction: MotorDirection = "Cw"
  ): Promise<void> {
    await this.connection.request(
      createMotorRunForDegreesCommand(portToBits(port), degrees, directionToEnum(direction))
    );
  }

  async runMotorForTime(port: MotorPort, timeMs: number, direction: MotorDirection = "Cw"): Promise<void> {
    await this.connection.request(
      createMotorRunForTimeCommand(portToBits(port), timeMs, directionToEnum(direction))
    );
  }

  async runMotorToAbsolutePosition(
    port: MotorPort,
    position: number,
    direction: MotorDirection = "Shortest"
  ): Promise<void> {
    await this.connection.request(
      createMotorRunToAbsolutePositionCommand(portToBits(port), position, directionToEnum(direction))
    );
  }

  async runMotorToRelativePosition(port: MotorPort, offset: number): Promise<void> {
    await this.connection.request(createMotorRunToRelativePositionCommand(portToBits(port), offset));
  }

  async resetMotorRelativePosition(port: MotorPort, position: number = 0): Promise<void> {
    await this.connection.request(createMotorResetRelativePositionCommand(portToBits(port), position));
  }

  async setMotorRelativePosition(port: MotorPort, position: number = 0): Promise<void> {
    await this.resetMotorRelativePosition(port, position);
  }

  async stopMotor(port: MotorPort = "both"): Promise<void> {
    await this.connection.request(createMotorStopCommand(portToBits(port)));
  }

  async setMotorEndState(port: MotorPort, endState: MotorEndStateName): Promise<void> {
    await this.connection.request(createMotorSetEndStateCommand(portToBits(port), endStateToEnum(endState)));
  }

  async setMotorAcceleration(port: MotorPort, acceleration: number, deceleration: number = acceleration): Promise<void> {
    await this.connection.request(
      createMotorSetAccelerationCommand(
        portToBits(port),
        clampAcceleration(acceleration),
        clampAcceleration(deceleration)
      )
    );
  }

  async startMoving(direction: MovementDirectionName = "Forward"): Promise<void> {
    await this.connection.request(createMovementMoveCommand(movementDirectionToEnum(direction)));
  }

  async stopMoving(): Promise<void> {
    await this.connection.request(createMovementStopCommand());
  }

  async moveForTime(timeMs: number, direction: MovementDirectionName = "Forward"): Promise<void> {
    await this.connection.request(createMovementMoveForTimeCommand(timeMs, movementDirectionToEnum(direction)));
  }

  async moveForDegrees(degrees: number, direction: MovementDirectionName = "Forward"): Promise<void> {
    await this.connection.request(createMovementMoveForDegreesCommand(degrees, movementDirectionToEnum(direction)));
  }

  async moveForDistance(degrees: number, direction: MovementDirectionName = "Forward"): Promise<void> {
    await this.moveForDegrees(degrees, direction);
  }

  async moveAtDualSpeed(leftSpeed: number, rightSpeed: number): Promise<void> {
    await this.connection.request(createMovementMoveTankCommand(clampSpeed(leftSpeed), clampSpeed(rightSpeed)));
  }

  async moveAtDualSpeedForTime(leftSpeed: number, rightSpeed: number, timeMs: number): Promise<void> {
    await this.connection.request(
      createMovementMoveTankForTimeCommand(timeMs, clampSpeed(leftSpeed), clampSpeed(rightSpeed))
    );
  }

  async moveAtDualSpeedForDegrees(leftSpeed: number, rightSpeed: number, degrees: number): Promise<void> {
    await this.connection.request(
      createMovementMoveTankForDegreesCommand(degrees, clampSpeed(leftSpeed), clampSpeed(rightSpeed))
    );
  }

  async setMovementSpeed(speed: number): Promise<void> {
    await this.connection.request(createMovementSetSpeedCommand(clampSpeed(speed)));
  }

  async setMovementEndState(endState: MotorEndStateName): Promise<void> {
    await this.connection.request(createMovementSetEndStateCommand(endStateToEnum(endState)));
  }

  async setMoveEndState(endState: MotorEndStateName): Promise<void> {
    await this.setMovementEndState(endState);
  }

  async setMovementAcceleration(acceleration: number, deceleration: number = acceleration): Promise<void> {
    await this.connection.request(
      createMovementSetAccelerationCommand(clampAcceleration(acceleration), clampAcceleration(deceleration))
    );
  }

  async setMoveAcceleration(acceleration: number, deceleration: number = acceleration): Promise<void> {
    await this.setMovementAcceleration(acceleration, deceleration);
  }

  async setMovementSteering(value: number): Promise<void> {
    await this.connection.request(createMovementSetTurnSteeringCommand(clampSpeed(value)));
  }

  async turn(degrees: number, direction: MovementDirectionName): Promise<void> {
    await this.moveForDegrees(degrees, direction);
  }
}
