/**
 * A JavaScript/TypeScript library for controlling LEGO Education Science
 * ("Coral") Bluetooth Low Energy devices.
 *
 * @packageDocumentation
 */

export { Coral } from "./coral";
export { CoralDevice, SingleMotorDevice, DoubleMotorDevice, ControllerDevice, ColorSensorDevice } from "./devices";
export { LegoColor, LightPattern, SoundPattern, MotorState, MotionGesture, MotorGesture } from "./protocol";
export { MotorPort, MotorDirection, MotorEndState, MovementDirection, TurnDirection } from "./devices";
export type { CoralDeviceInfo } from "./devices";
export { CoralDeviceKind } from "./constants";
export { DeviceTracker, WelfordStats } from "./metrics";
export type { SensorSnapshot } from "./metrics";
export type {
  ButtonPayload,
  ColorSensorPayload,
  JoystickPayload,
  MotorNotificationPayload,
  MotionGesturePayload,
  MotorGesturePayload,
  MotorMoveDirection
} from "./protocol";
