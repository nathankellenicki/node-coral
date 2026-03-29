import { CoralDevice } from "./base";
import {
  MotorDirection,
  MotorEndState,
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

/**
 * A Coral device with a single motor.
 *
 * Provides methods to control motor speed, power, position, and end-state
 * behaviour.
 */
export class SingleMotorDevice extends CoralDevice {
  /**
   * Set the motor speed.
   * @param speed - Speed value from -100 to 100.
   */
  async setMotorSpeed(speed: number): Promise<void> {
    await this.connection.send(createMotorSetSpeedCommand(MotorBits.Left, clampSpeed(speed)));
  }

  /**
   * Set the motor power (duty cycle).
   * @param power - Power value from -100 to 100.
   */
  async setMotorPower(power: number): Promise<void> {
    await this.connection.send(createMotorSetDutyCycleCommand(MotorBits.Left, clampSpeed(power)));
  }

  /**
   * Start the motor at the given power level.
   * @param power - Power value from -100 to 100.
   */
  async startMotorAtPower(power: number): Promise<void> {
    await this.setMotorPower(power);
  }

  /**
   * Start the motor running continuously.
   * @param direction - Rotation direction (default `MotorDirection.Clockwise`).
   */
  async startMotor(direction: MotorDirection = MotorDirection.Clockwise): Promise<void> {
    await this.connection.send(createMotorRunCommand(MotorBits.Left, directionToEnum(direction)));
  }

  /**
   * Run the motor for the specified number of degrees.
   * @param degrees - Number of degrees to rotate.
   * @param direction - Rotation direction (default `MotorDirection.Clockwise`).
   */
  async runMotorForDegrees(degrees: number, direction: MotorDirection = MotorDirection.Clockwise): Promise<void> {
    await this.connection.request(
      createMotorRunForDegreesCommand(MotorBits.Left, degrees, directionToEnum(direction))
    );
  }

  /**
   * Run the motor for the specified duration.
   * @param timeMs - Duration in milliseconds.
   * @param direction - Rotation direction (default `MotorDirection.Clockwise`).
   */
  async runMotorForTime(timeMs: number, direction: MotorDirection = MotorDirection.Clockwise): Promise<void> {
    await this.connection.request(
      createMotorRunForTimeCommand(MotorBits.Left, timeMs, directionToEnum(direction))
    );
  }

  /**
   * Run the motor to an absolute position.
   * @param position - Target position in degrees.
   * @param direction - Rotation direction (default `MotorDirection.Shortest`).
   */
  async runMotorToAbsolutePosition(position: number, direction: MotorDirection = MotorDirection.Shortest): Promise<void> {
    await this.connection.request(
      createMotorRunToAbsolutePositionCommand(MotorBits.Left, position, directionToEnum(direction))
    );
  }

  /**
   * Run the motor to a position relative to the current one.
   * @param offset - Offset in degrees from the current position.
   */
  async runMotorToRelativePosition(offset: number): Promise<void> {
    await this.connection.request(createMotorRunToRelativePositionCommand(MotorBits.Left, offset));
  }

  /**
   * Reset the motor's relative position counter.
   * @param position - Value to set as the new zero point (default `0`).
   */
  async resetMotorRelativePosition(position: number = 0): Promise<void> {
    await this.connection.send(createMotorResetRelativePositionCommand(MotorBits.Left, position));
  }

  /**
   * Alias for {@link resetMotorRelativePosition}.
   * @param position - Value to set as the new zero point (default `0`).
   */
  async setMotorRelativePosition(position: number = 0): Promise<void> {
    await this.resetMotorRelativePosition(position);
  }

  /** Stop the motor. */
  async stopMotor(): Promise<void> {
    await this.connection.send(createMotorStopCommand(MotorBits.Left));
  }

  /**
   * Set the motor's end-state behaviour (what happens when a command finishes).
   * @param endState - The desired end state (e.g. `MotorEndState.Brake`, `MotorEndState.Coast`, `MotorEndState.Hold`).
   */
  async setMotorEndState(endState: MotorEndState): Promise<void> {
    await this.connection.send(createMotorSetEndStateCommand(MotorBits.Left, endStateToEnum(endState)));
  }

  /**
   * Set the motor acceleration and deceleration profiles.
   * @param acceleration - Acceleration value (0–255).
   * @param deceleration - Deceleration value (0–255, defaults to `acceleration`).
   */
  async setMotorAcceleration(acceleration: number, deceleration: number = acceleration): Promise<void> {
    await this.connection.send(
      createMotorSetAccelerationCommand(MotorBits.Left, clampAcceleration(acceleration), clampAcceleration(deceleration))
    );
  }
}
