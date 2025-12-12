import { CoralDevice } from "./base";
import {
  MotorDirection,
  MotorEndStateName,
  clampAcceleration,
  clampSpeed,
  directionToEnum,
  endStateToEnum
} from "./types";
import {
  MotorBits,
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
  createMotorStopCommand
} from "../protocol";

export class SingleMotorDevice extends CoralDevice {
  async setMotorSpeed(speed: number): Promise<void> {
    await this.connection.request(createMotorSetSpeedCommand(MotorBits.Left, clampSpeed(speed)));
  }

  async setMotorPower(power: number): Promise<void> {
    await this.connection.request(createMotorSetDutyCycleCommand(MotorBits.Left, clampSpeed(power)));
  }

  async startMotorAtPower(power: number): Promise<void> {
    await this.setMotorPower(power);
  }

  async startMotor(direction: MotorDirection = "Cw"): Promise<void> {
    await this.connection.request(createMotorRunCommand(MotorBits.Left, directionToEnum(direction)));
  }

  async runMotorForDegrees(degrees: number, direction: MotorDirection = "Cw"): Promise<void> {
    await this.connection.request(
      createMotorRunForDegreesCommand(MotorBits.Left, degrees, directionToEnum(direction))
    );
  }

  async runMotorForTime(timeMs: number, direction: MotorDirection = "Cw"): Promise<void> {
    await this.connection.request(
      createMotorRunForTimeCommand(MotorBits.Left, timeMs, directionToEnum(direction))
    );
  }

  async runMotorToAbsolutePosition(position: number, direction: MotorDirection = "Shortest"): Promise<void> {
    await this.connection.request(
      createMotorRunToAbsolutePositionCommand(MotorBits.Left, position, directionToEnum(direction))
    );
  }

  async runMotorToRelativePosition(offset: number): Promise<void> {
    await this.connection.request(createMotorRunToRelativePositionCommand(MotorBits.Left, offset));
  }

  async resetMotorRelativePosition(position: number = 0): Promise<void> {
    await this.connection.request(createMotorResetRelativePositionCommand(MotorBits.Left, position));
  }

  async setMotorRelativePosition(position: number = 0): Promise<void> {
    await this.resetMotorRelativePosition(position);
  }

  async stopMotor(): Promise<void> {
    await this.connection.request(createMotorStopCommand(MotorBits.Left));
  }

  async setMotorEndState(endState: MotorEndStateName): Promise<void> {
    await this.connection.request(createMotorSetEndStateCommand(MotorBits.Left, endStateToEnum(endState)));
  }

  async setMotorAcceleration(acceleration: number, deceleration: number = acceleration): Promise<void> {
    await this.connection.request(
      createMotorSetAccelerationCommand(MotorBits.Left, clampAcceleration(acceleration), clampAcceleration(deceleration))
    );
  }
}
