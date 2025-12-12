import { MotorBits, MotorEndState, MotorMoveDirection, MovementDirection } from "../protocol";

export type MotorPort = "left" | "right" | "both";
export type MotorDirection = "Cw" | "Ccw" | "Shortest" | "Longest";
export type MotorEndStateName = "Default" | "Coast" | "Brake" | "Hold" | "Continue" | "SmartCoast" | "SmartBrake";
export type MovementDirectionName = "Forward" | "Backward" | "Left" | "Right";

export function clampSpeed(speed: number): number {
  return Math.max(-100, Math.min(100, Math.round(speed)));
}

export function clampAcceleration(value: number): number {
  return Math.max(0, Math.min(255, Math.round(value)));
}

export function portToBits(port: MotorPort): MotorBits {
  switch (port) {
    case "left":
      return MotorBits.Left;
    case "right":
      return MotorBits.Right;
    case "both":
      return MotorBits.Both;
    default:
      return MotorBits.Left;
  }
}

export function directionToEnum(direction: MotorDirection): MotorMoveDirection {
  switch (direction) {
    case "Ccw":
      return MotorMoveDirection.Ccw;
    case "Shortest":
      return MotorMoveDirection.Shortest;
    case "Longest":
      return MotorMoveDirection.Longest;
    case "Cw":
    default:
      return MotorMoveDirection.Cw;
  }
}

export function movementDirectionToEnum(direction: MovementDirectionName): MovementDirection {
  switch (direction) {
    case "Backward":
      return MovementDirection.Backward;
    case "Left":
      return MovementDirection.Left;
    case "Right":
      return MovementDirection.Right;
    case "Forward":
    default:
      return MovementDirection.Forward;
  }
}

export function endStateToEnum(state: MotorEndStateName): MotorEndState {
  switch (state) {
    case "Coast":
      return MotorEndState.Coast;
    case "Brake":
      return MotorEndState.Brake;
    case "Hold":
      return MotorEndState.Hold;
    case "Continue":
      return MotorEndState.Continue;
    case "SmartCoast":
      return MotorEndState.SmartCoast;
    case "SmartBrake":
      return MotorEndState.SmartBrake;
    case "Default":
    default:
      return MotorEndState.Default;
  }
}
