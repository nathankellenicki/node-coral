export { Coral } from "./coral";
export { CoralDevice, SingleMotorDevice, DoubleMotorDevice, RemoteDevice, ColorSensorDevice } from "./devices";
export type { CoralDeviceInfo, MotorPort, MotorDirection, MotorEndStateName, MovementDirectionName } from "./devices";
export type { CoralDeviceKind } from "./constants";
export type {
  ButtonPayload,
  ColorSensorPayload,
  JoystickPayload,
  MotorNotificationPayload,
  MotorMoveDirection
} from "./protocol";
