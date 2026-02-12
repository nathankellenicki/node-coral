/**
 * A JavaScript/TypeScript library for controlling LEGO Education Science
 * ("Coral") Bluetooth Low Energy devices.
 *
 * @packageDocumentation
 */

export { Coral } from "./coral";
export { CoralDevice, SingleMotorDevice, DoubleMotorDevice, ControllerDevice, ColorSensorDevice } from "./devices";
export { LegoColor } from "./protocol";
export { MotorPort, MotorDirection, MotorEndState, MovementDirection } from "./devices";
export type { CoralDeviceInfo } from "./devices";
export { CoralDeviceKind } from "./constants";
export type {
  ButtonPayload,
  ColorSensorPayload,
  JoystickPayload,
  MotorNotificationPayload,
  MotorMoveDirection
} from "./protocol";
