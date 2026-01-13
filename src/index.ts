export { Coral } from "./coral";
export { CoralDevice, SingleMotorDevice, DoubleMotorDevice, ControllerDevice, ColorSensorDevice } from "./devices";
export { LegoColor } from "./protocol";
export type { CoralDeviceInfo, MotorPort, MotorDirection, MotorEndStateName, MovementDirectionName } from "./devices";
export { CoralDeviceKind } from "./constants";
export type {
  ButtonPayload,
  ColorSensorPayload,
  JoystickPayload,
  MotorNotificationPayload,
  MotorMoveDirection
} from "./protocol";
