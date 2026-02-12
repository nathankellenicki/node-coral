import { MotorBits, MotorEndState as ProtocolEndState, MotorMoveDirection, MovementDirection as ProtocolMovementDirection } from "../protocol";

/** Which motor to target on a dual-motor device. */
export const MotorPort = {
  Left: "left",
  Right: "right",
  Both: "both",
} as const;
export type MotorPort = typeof MotorPort[keyof typeof MotorPort];

/** Rotation direction for motor commands. */
export const MotorDirection = {
  Clockwise: "clockwise",
  Counterclockwise: "counterclockwise",
  Shortest: "shortest",
  Longest: "longest",
} as const;
export type MotorDirection = typeof MotorDirection[keyof typeof MotorDirection];

/** Motor end-state behaviour names. */
export const MotorEndState = {
  Default: "default",
  Coast: "coast",
  Brake: "brake",
  Hold: "hold",
  Continue: "continue",
  SmartCoast: "smartCoast",
  SmartBrake: "smartBrake",
} as const;
export type MotorEndState = typeof MotorEndState[keyof typeof MotorEndState];

/** Movement direction names for dual-motor movement commands. */
export const MovementDirection = {
  Forward: "forward",
  Backward: "backward",
  Left: "left",
  Right: "right",
} as const;
export type MovementDirection = typeof MovementDirection[keyof typeof MovementDirection];

export function clampSpeed(speed: number): number {
  return Math.max(-100, Math.min(100, Math.round(speed)));
}

export function clampAcceleration(value: number): number {
  return Math.max(0, Math.min(255, Math.round(value)));
}

export function portToBits(port: MotorPort): MotorBits {
  switch (port) {
    case MotorPort.Left:
      return MotorBits.Left;
    case MotorPort.Right:
      return MotorBits.Right;
    case MotorPort.Both:
      return MotorBits.Both;
    default:
      return MotorBits.Left;
  }
}

export function directionToEnum(direction: MotorDirection): MotorMoveDirection {
  switch (direction) {
    case MotorDirection.Counterclockwise:
      return MotorMoveDirection.Ccw;
    case MotorDirection.Shortest:
      return MotorMoveDirection.Shortest;
    case MotorDirection.Longest:
      return MotorMoveDirection.Longest;
    case MotorDirection.Clockwise:
    default:
      return MotorMoveDirection.Cw;
  }
}

export function movementDirectionToEnum(direction: MovementDirection): ProtocolMovementDirection {
  switch (direction) {
    case MovementDirection.Backward:
      return ProtocolMovementDirection.Backward;
    case MovementDirection.Left:
      return ProtocolMovementDirection.Left;
    case MovementDirection.Right:
      return ProtocolMovementDirection.Right;
    case MovementDirection.Forward:
    default:
      return ProtocolMovementDirection.Forward;
  }
}

export function endStateToEnum(state: MotorEndState): ProtocolEndState {
  switch (state) {
    case MotorEndState.Coast:
      return ProtocolEndState.Coast;
    case MotorEndState.Brake:
      return ProtocolEndState.Brake;
    case MotorEndState.Hold:
      return ProtocolEndState.Hold;
    case MotorEndState.Continue:
      return ProtocolEndState.Continue;
    case MotorEndState.SmartCoast:
      return ProtocolEndState.SmartCoast;
    case MotorEndState.SmartBrake:
      return ProtocolEndState.SmartBrake;
    case MotorEndState.Default:
    default:
      return ProtocolEndState.Default;
  }
}
