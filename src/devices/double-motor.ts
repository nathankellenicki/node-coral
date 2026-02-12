import { CoralDevice } from "./base";
import {
  MotorDirection,
  MotorEndState,
  MotorPort,
  MovementDirection,
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

/**
 * A Coral device with two motors (left and right).
 *
 * Provides per-motor control as well as high-level movement commands
 * that coordinate both motors together (forward, backward, turning, tank
 * drive, etc.).
 */
export class DoubleMotorDevice extends CoralDevice {
  /**
   * Set the speed of a single motor.
   * @param port - Which motor (`MotorPort.Left`, `MotorPort.Right`, or `MotorPort.Both`).
   * @param speed - Speed value from -100 to 100.
   */
  async setMotorSpeed(port: MotorPort, speed: number): Promise<void> {
    await this.connection.request(createMotorSetSpeedCommand(portToBits(port), clampSpeed(speed)));
  }

  /**
   * Set the speed of both motors independently.
   * @param left - Left motor speed (-100 to 100).
   * @param right - Right motor speed (-100 to 100).
   */
  async setMotorSpeeds(left: number, right: number): Promise<void> {
    await this.setMotorSpeed(MotorPort.Left, left);
    await this.setMotorSpeed(MotorPort.Right, right);
  }

  /**
   * Set the power (duty cycle) of a single motor.
   * @param port - Which motor (`MotorPort.Left`, `MotorPort.Right`, or `MotorPort.Both`).
   * @param power - Power value from -100 to 100.
   */
  async setMotorPower(port: MotorPort, power: number): Promise<void> {
    await this.connection.request(createMotorSetDutyCycleCommand(portToBits(port), clampSpeed(power)));
  }

  /**
   * Set the power of both motors independently.
   * @param left - Left motor power (-100 to 100).
   * @param right - Right motor power (-100 to 100).
   */
  async setMotorPowers(left: number, right: number): Promise<void> {
    await this.setMotorPower(MotorPort.Left, left);
    await this.setMotorPower(MotorPort.Right, right);
  }

  /**
   * Start a motor at the given power level.
   * @param port - Which motor.
   * @param power - Power value from -100 to 100.
   */
  async startMotorAtPower(port: MotorPort, power: number): Promise<void> {
    await this.setMotorPower(port, power);
  }

  /**
   * Start a motor running continuously.
   * @param port - Which motor.
   * @param direction - Rotation direction (default `MotorDirection.Clockwise`).
   */
  async startMotor(port: MotorPort, direction: MotorDirection = MotorDirection.Clockwise): Promise<void> {
    await this.connection.request(createMotorRunCommand(portToBits(port), directionToEnum(direction)));
  }

  /**
   * Run a motor for the specified number of degrees.
   * @param port - Which motor.
   * @param degrees - Number of degrees to rotate.
   * @param direction - Rotation direction (default `MotorDirection.Clockwise`).
   */
  async runMotorForDegrees(
    port: MotorPort,
    degrees: number,
    direction: MotorDirection = MotorDirection.Clockwise
  ): Promise<void> {
    await this.connection.request(
      createMotorRunForDegreesCommand(portToBits(port), degrees, directionToEnum(direction))
    );
  }

  /**
   * Run a motor for the specified duration.
   * @param port - Which motor.
   * @param timeMs - Duration in milliseconds.
   * @param direction - Rotation direction (default `MotorDirection.Clockwise`).
   */
  async runMotorForTime(port: MotorPort, timeMs: number, direction: MotorDirection = MotorDirection.Clockwise): Promise<void> {
    await this.connection.request(
      createMotorRunForTimeCommand(portToBits(port), timeMs, directionToEnum(direction))
    );
  }

  /**
   * Run a motor to an absolute position.
   * @param port - Which motor.
   * @param position - Target position in degrees.
   * @param direction - Rotation direction (default `MotorDirection.Shortest`).
   */
  async runMotorToAbsolutePosition(
    port: MotorPort,
    position: number,
    direction: MotorDirection = MotorDirection.Shortest
  ): Promise<void> {
    await this.connection.request(
      createMotorRunToAbsolutePositionCommand(portToBits(port), position, directionToEnum(direction))
    );
  }

  /**
   * Run a motor to a position relative to the current one.
   * @param port - Which motor.
   * @param offset - Offset in degrees from the current position.
   */
  async runMotorToRelativePosition(port: MotorPort, offset: number): Promise<void> {
    await this.connection.request(createMotorRunToRelativePositionCommand(portToBits(port), offset));
  }

  /**
   * Reset a motor's relative position counter.
   * @param port - Which motor.
   * @param position - Value to set as the new zero point (default `0`).
   */
  async resetMotorRelativePosition(port: MotorPort, position: number = 0): Promise<void> {
    await this.connection.request(createMotorResetRelativePositionCommand(portToBits(port), position));
  }

  /**
   * Alias for {@link resetMotorRelativePosition}.
   * @param port - Which motor.
   * @param position - Value to set as the new zero point (default `0`).
   */
  async setMotorRelativePosition(port: MotorPort, position: number = 0): Promise<void> {
    await this.resetMotorRelativePosition(port, position);
  }

  /**
   * Stop one or both motors.
   * @param port - Which motor to stop (default `MotorPort.Both`).
   */
  async stopMotor(port: MotorPort = MotorPort.Both): Promise<void> {
    await this.connection.request(createMotorStopCommand(portToBits(port)));
  }

  /**
   * Set a motor's end-state behaviour.
   * @param port - Which motor.
   * @param endState - The desired end state (e.g. `MotorEndState.Brake`, `MotorEndState.Coast`, `MotorEndState.Hold`).
   */
  async setMotorEndState(port: MotorPort, endState: MotorEndState): Promise<void> {
    await this.connection.request(createMotorSetEndStateCommand(portToBits(port), endStateToEnum(endState)));
  }

  /**
   * Set a motor's acceleration and deceleration profiles.
   * @param port - Which motor.
   * @param acceleration - Acceleration value (0–255).
   * @param deceleration - Deceleration value (0–255, defaults to `acceleration`).
   */
  async setMotorAcceleration(port: MotorPort, acceleration: number, deceleration: number = acceleration): Promise<void> {
    await this.connection.request(
      createMotorSetAccelerationCommand(
        portToBits(port),
        clampAcceleration(acceleration),
        clampAcceleration(deceleration)
      )
    );
  }

  /**
   * Start moving both motors in the given direction.
   * @param direction - Movement direction (default `MovementDirection.Forward`).
   */
  async startMoving(direction: MovementDirection = MovementDirection.Forward): Promise<void> {
    await this.connection.request(createMovementMoveCommand(movementDirectionToEnum(direction)));
  }

  /** Stop both motors. */
  async stopMoving(): Promise<void> {
    await this.connection.request(createMovementStopCommand());
  }

  /**
   * Move for the specified duration.
   * @param timeMs - Duration in milliseconds.
   * @param direction - Movement direction (default `MovementDirection.Forward`).
   */
  async moveForTime(timeMs: number, direction: MovementDirection = MovementDirection.Forward): Promise<void> {
    await this.connection.request(createMovementMoveForTimeCommand(timeMs, movementDirectionToEnum(direction)));
  }

  /**
   * Move for the specified number of degrees.
   * @param degrees - Number of degrees to rotate.
   * @param direction - Movement direction (default `MovementDirection.Forward`).
   */
  async moveForDegrees(degrees: number, direction: MovementDirection = MovementDirection.Forward): Promise<void> {
    await this.connection.request(createMovementMoveForDegreesCommand(degrees, movementDirectionToEnum(direction)));
  }

  /**
   * Alias for {@link moveForDegrees}.
   * @param degrees - Number of degrees to rotate.
   * @param direction - Movement direction (default `MovementDirection.Forward`).
   */
  async moveForDistance(degrees: number, direction: MovementDirection = MovementDirection.Forward): Promise<void> {
    await this.moveForDegrees(degrees, direction);
  }

  /**
   * Start tank-drive movement with independent motor speeds.
   * @param leftSpeed - Left motor speed (-100 to 100).
   * @param rightSpeed - Right motor speed (-100 to 100).
   */
  async moveAtDualSpeed(leftSpeed: number, rightSpeed: number): Promise<void> {
    await this.connection.request(createMovementMoveTankCommand(clampSpeed(leftSpeed), clampSpeed(rightSpeed)));
  }

  /**
   * Tank-drive movement for a specified duration.
   * @param leftSpeed - Left motor speed (-100 to 100).
   * @param rightSpeed - Right motor speed (-100 to 100).
   * @param timeMs - Duration in milliseconds.
   */
  async moveAtDualSpeedForTime(leftSpeed: number, rightSpeed: number, timeMs: number): Promise<void> {
    await this.connection.request(
      createMovementMoveTankForTimeCommand(timeMs, clampSpeed(leftSpeed), clampSpeed(rightSpeed))
    );
  }

  /**
   * Tank-drive movement for a specified number of degrees.
   * @param leftSpeed - Left motor speed (-100 to 100).
   * @param rightSpeed - Right motor speed (-100 to 100).
   * @param degrees - Number of degrees to rotate.
   */
  async moveAtDualSpeedForDegrees(leftSpeed: number, rightSpeed: number, degrees: number): Promise<void> {
    await this.connection.request(
      createMovementMoveTankForDegreesCommand(degrees, clampSpeed(leftSpeed), clampSpeed(rightSpeed))
    );
  }

  /**
   * Set the default movement speed for both motors.
   * @param speed - Speed value from -100 to 100.
   */
  async setMovementSpeed(speed: number): Promise<void> {
    await this.connection.request(createMovementSetSpeedCommand(clampSpeed(speed)));
  }

  /**
   * Set the end-state behaviour for movement commands.
   * @param endState - The desired end state.
   */
  async setMovementEndState(endState: MotorEndState): Promise<void> {
    await this.connection.request(createMovementSetEndStateCommand(endStateToEnum(endState)));
  }

  /** Alias for {@link setMovementEndState}. */
  async setMoveEndState(endState: MotorEndState): Promise<void> {
    await this.setMovementEndState(endState);
  }

  /**
   * Set the acceleration and deceleration profiles for movement commands.
   * @param acceleration - Acceleration value (0–255).
   * @param deceleration - Deceleration value (0–255, defaults to `acceleration`).
   */
  async setMovementAcceleration(acceleration: number, deceleration: number = acceleration): Promise<void> {
    await this.connection.request(
      createMovementSetAccelerationCommand(clampAcceleration(acceleration), clampAcceleration(deceleration))
    );
  }

  /** Alias for {@link setMovementAcceleration}. */
  async setMoveAcceleration(acceleration: number, deceleration: number = acceleration): Promise<void> {
    await this.setMovementAcceleration(acceleration, deceleration);
  }

  /**
   * Set the turn steering value for movement commands.
   * @param value - Steering value from -100 (full left) to 100 (full right).
   */
  async setMovementSteering(value: number): Promise<void> {
    await this.connection.request(createMovementSetTurnSteeringCommand(clampSpeed(value)));
  }

  /**
   * Turn the robot by moving both motors for the given degrees.
   * @param degrees - Number of degrees to rotate.
   * @param direction - Turn direction (`MovementDirection.Left` or `MovementDirection.Right`).
   */
  async turn(degrees: number, direction: MovementDirection): Promise<void> {
    await this.moveForDegrees(degrees, direction);
  }
}
