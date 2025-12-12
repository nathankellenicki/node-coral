import { CoralDeviceKind } from "./constants";

export enum MessageType {
  InfoRequest = 0,
  InfoResponse = 1,
  ErrorReportRequest = 2,
  ErrorReportResponse = 3,
  BeginFirmwareUpdateRequest = 20,
  BeginFirmwareUpdateResponse = 21,
  DeviceUuidRequest = 26,
  DeviceUuidResponse = 27,
  ProgramFlowNotification = 32,
  DeviceNotificationRequest = 40,
  DeviceNotificationResponse = 41,
  DeviceNotification = 60,
  LightColorCommand = 110,
  LightColorResult = 111,
  BeepCommand = 112,
  BeepResult = 113,
  StopSoundCommand = 114,
  StopSoundResult = 115,
  MotorResetRelativePositionCommand = 120,
  MotorResetRelativePositionResult = 121,
  MotorRunCommand = 122,
  MotorRunResult = 123,
  MotorRunForDegreesCommand = 124,
  MotorRunForDegreesResult = 125,
  MotorRunForTimeCommand = 126,
  MotorRunForTimeResult = 127,
  MotorRunToAbsolutePositionCommand = 128,
  MotorRunToAbsolutePositionResult = 129,
  MotorRunToRelativePositionCommand = 130,
  MotorRunToRelativePositionResult = 131,
  MotorSetDutyCycleCommand = 132,
  MotorSetDutyCycleResult = 133,
  MotorStopCommand = 138,
  MotorStopResult = 139,
  MotorSetSpeedCommand = 140,
  MotorSetSpeedResult = 141,
  MotorSetEndStateCommand = 142,
  MotorSetEndStateResult = 143,
  MotorSetAccelerationCommand = 144,
  MotorSetAccelerationResult = 145,
  MovementMoveCommand = 150,
  MovementMoveResult = 151,
  MovementMoveForTimeCommand = 152,
  MovementMoveForTimeResult = 153,
  MovementMoveForDegreesCommand = 154,
  MovementMoveForDegreesResult = 155,
  MovementMoveTankCommand = 156,
  MovementMoveTankResult = 157,
  MovementMoveTankForTimeCommand = 158,
  MovementMoveTankForTimeResult = 159,
  MovementMoveTankForDegreesCommand = 160,
  MovementMoveTankForDegreesResult = 161,
  MovementStopCommand = 168,
  MovementStopResult = 169,
  MovementSetSpeedCommand = 170,
  MovementSetSpeedResult = 171,
  MovementSetEndStateCommand = 172,
  MovementSetEndStateResult = 173,
  MovementSetAccelerationCommand = 174,
  MovementSetAccelerationResult = 175,
  MovementSetTurnSteeringCommand = 176,
  MovementSetTurnSteeringResult = 177,
  ImuSetYawFaceCommand = 190,
  ImuSetYawFaceResult = 191,
  ImuResetYawAxisCommand = 192,
  ImuResetYawAxisResult = 193
}

export enum DeviceMessageType {
  InfoHubNotification = 0,
  ImuHubNotification = 1,
  TagHubNotification = 3,
  MotorNotification = 10,
  ColorSensorNotification = 12,
  JoystickNotification = 15,
  ImuGestureNotification = 16,
  MotorGestureNotification = 17,
  ButtonStateNotification = 4
}

export enum MotorBits {
  Left = 1,
  Right = 2,
  Both = 3
}

export enum ButtonState {
  Released = 0,
  Pressed = 1
}

export enum MotorMoveDirection {
  Cw = 0,
  Ccw = 1,
  Shortest = 2,
  Longest = 3
}

export enum MotorEndState {
  Default = -1,
  Coast = 0,
  Brake = 1,
  Hold = 2,
  Continue = 3,
  SmartCoast = 4,
  SmartBrake = 5
}

export enum MovementDirection {
  Forward = 0,
  Backward = 1,
  Left = 2,
  Right = 3
}

export enum LightPattern {
  Solid = 0,
  Breathe = 1,
  Pulse = 2
}

export enum ProgramAction {
  Start = 0,
  Stop = 1
}

export enum HubFace {
  Top = 0,
  Front = 1,
  Right = 2,
  Bottom = 3,
  Back = 4,
  Left = 5
}

export enum LegoColor {
  None = -1,
  Black = 0,
  Magenta = 1,
  Purple = 2,
  Blue = 3,
  Azure = 4,
  Turquoise = 5,
  Green = 6,
  Yellow = 7,
  Orange = 8,
  Red = 9,
  White = 10
}

export enum CommandStatus {
  Completed = 0,
  Interrupted = 1,
  Nack = 2
}

export enum ResponseStatus {
  Ack = 0,
  Nack = 1
}

export enum MotorState {
  Ready = 0,
  Running = 1,
  Stalled = 2,
  Holding = 6
}

export enum UsbPowerState {
  NotConnected = 0,
  Connected = 1
}

export enum ProductGroupDevice {
  SpikePrime = 0,
  SpikeEssential = 1,
  SpikePrimeH5 = 2,
  CoralSingleMotor = 512,
  CoralDualMotor = 513,
  CoralColorSensor = 514,
  CoralJoystick = 515
}

export interface InfoRequest {
  id: MessageType.InfoRequest;
}

export interface InfoResponse {
  id: MessageType.InfoResponse;
  rpcMajor: number;
  rpcMinor: number;
  rpcBuild: number;
  firmwareMajor: number;
  firmwareMinor: number;
  firmwareBuild: number;
  bootloaderMajor: number;
  bootloaderMinor: number;
  bootloaderBuild: number;
  maxPacketSize: number;
  productGroupDevice: ProductGroupDevice;
}

export interface ErrorReportRequest {
  id: MessageType.ErrorReportRequest;
}

export interface ErrorReportResponse {
  id: MessageType.ErrorReportResponse;
  reportData: number[];
}

export interface BeginFirmwareUpdateRequest {
  id: MessageType.BeginFirmwareUpdateRequest;
  productGroupDevice: ProductGroupDevice;
}

export interface BeginFirmwareUpdateResponse {
  id: MessageType.BeginFirmwareUpdateResponse;
  status: ResponseStatus;
}

export interface DeviceUuidRequest {
  id: MessageType.DeviceUuidRequest;
}

export interface DeviceUuidResponse {
  id: MessageType.DeviceUuidResponse;
  uuid: number[];
}

export interface ProgramFlowNotification {
  id: MessageType.ProgramFlowNotification;
  action: ProgramAction;
}

export interface DeviceNotificationRequest {
  id: MessageType.DeviceNotificationRequest;
  delay: number;
}

export interface DeviceNotificationResponse {
  id: MessageType.DeviceNotificationResponse;
  status: ResponseStatus;
}

export interface MotorSetSpeedCommand {
  id: MessageType.MotorSetSpeedCommand;
  motorBitMask: MotorBits;
  speed: number;
}

export interface MotorSetSpeedResult {
  id: MessageType.MotorSetSpeedResult;
  motorBitMask: MotorBits;
  status: CommandStatus;
}

export interface MotorSetDutyCycleCommand {
  id: MessageType.MotorSetDutyCycleCommand;
  motorBitMask: MotorBits;
  dutyCycle: number;
}

export interface MotorSetDutyCycleResult {
  id: MessageType.MotorSetDutyCycleResult;
  motorBitMask: MotorBits;
  status: CommandStatus;
}

export interface MotorRunCommand {
  id: MessageType.MotorRunCommand;
  motorBitMask: MotorBits;
  direction: MotorMoveDirection;
}

export interface MotorRunResult {
  id: MessageType.MotorRunResult;
  motorBitMask: MotorBits;
  status: CommandStatus;
}

export interface MotorResetRelativePositionCommand {
  id: MessageType.MotorResetRelativePositionCommand;
  motorBitMask: MotorBits;
  position: number;
}

export interface MotorResetRelativePositionResult {
  id: MessageType.MotorResetRelativePositionResult;
  motorBitMask: MotorBits;
  status: CommandStatus;
}

export interface MotorRunForDegreesCommand {
  id: MessageType.MotorRunForDegreesCommand;
  motorBitMask: MotorBits;
  degrees: number;
  direction: MotorMoveDirection;
}

export interface MotorRunForDegreesResult {
  id: MessageType.MotorRunForDegreesResult;
  motorBitMask: MotorBits;
  status: CommandStatus;
}

export interface MotorRunForTimeCommand {
  id: MessageType.MotorRunForTimeCommand;
  motorBitMask: MotorBits;
  time: number;
  direction: MotorMoveDirection;
}

export interface MotorRunForTimeResult {
  id: MessageType.MotorRunForTimeResult;
  motorBitMask: MotorBits;
  status: CommandStatus;
}

export interface MotorRunToAbsolutePositionCommand {
  id: MessageType.MotorRunToAbsolutePositionCommand;
  motorBitMask: MotorBits;
  position: number;
  direction: MotorMoveDirection;
}

export interface MotorRunToAbsolutePositionResult {
  id: MessageType.MotorRunToAbsolutePositionResult;
  motorBitMask: MotorBits;
  status: CommandStatus;
}

export interface MotorRunToRelativePositionCommand {
  id: MessageType.MotorRunToRelativePositionCommand;
  motorBitMask: MotorBits;
  position: number;
}

export interface MotorRunToRelativePositionResult {
  id: MessageType.MotorRunToRelativePositionResult;
  motorBitMask: MotorBits;
  status: CommandStatus;
}

export interface MotorStopCommand {
  id: MessageType.MotorStopCommand;
  motorBitMask: MotorBits;
}

export interface MotorStopResult {
  id: MessageType.MotorStopResult;
  motorBitMask: MotorBits;
  status: CommandStatus;
}

export interface MotorSetEndStateCommand {
  id: MessageType.MotorSetEndStateCommand;
  motorBitMask: MotorBits;
  endState: MotorEndState;
}

export interface MotorSetEndStateResult {
  id: MessageType.MotorSetEndStateResult;
  motorBitMask: MotorBits;
  status: CommandStatus;
}

export interface MotorSetAccelerationCommand {
  id: MessageType.MotorSetAccelerationCommand;
  motorBitMask: MotorBits;
  acceleration: number;
  deceleration: number;
}

export interface MotorSetAccelerationResult {
  id: MessageType.MotorSetAccelerationResult;
  motorBitMask: MotorBits;
  status: CommandStatus;
}

export interface LightColorCommand {
  id: MessageType.LightColorCommand;
  color: LegoColor;
  pattern: LightPattern;
}

export interface LightColorResult {
  id: MessageType.LightColorResult;
  status: CommandStatus;
}

export interface BeepCommand {
  id: MessageType.BeepCommand;
  frequency: number;
  duration: number;
}

export interface BeepResult {
  id: MessageType.BeepResult;
  status: CommandStatus;
}

export interface StopSoundCommand {
  id: MessageType.StopSoundCommand;
}

export interface StopSoundResult {
  id: MessageType.StopSoundResult;
  status: CommandStatus;
}

export interface MovementMoveCommand {
  id: MessageType.MovementMoveCommand;
  direction: MovementDirection;
}

export interface MovementMoveResult {
  id: MessageType.MovementMoveResult;
  status: CommandStatus;
}

export interface MovementMoveForTimeCommand {
  id: MessageType.MovementMoveForTimeCommand;
  time: number;
  direction: MovementDirection;
}

export interface MovementMoveForTimeResult {
  id: MessageType.MovementMoveForTimeResult;
  status: CommandStatus;
}

export interface MovementMoveForDegreesCommand {
  id: MessageType.MovementMoveForDegreesCommand;
  degrees: number;
  direction: MovementDirection;
}

export interface MovementMoveForDegreesResult {
  id: MessageType.MovementMoveForDegreesResult;
  status: CommandStatus;
}

export interface MovementMoveTankCommand {
  id: MessageType.MovementMoveTankCommand;
  speedLeft: number;
  speedRight: number;
}

export interface MovementMoveTankResult {
  id: MessageType.MovementMoveTankResult;
  status: CommandStatus;
}

export interface MovementMoveTankForTimeCommand {
  id: MessageType.MovementMoveTankForTimeCommand;
  time: number;
  speedLeft: number;
  speedRight: number;
}

export interface MovementMoveTankForTimeResult {
  id: MessageType.MovementMoveTankForTimeResult;
  status: CommandStatus;
}

export interface MovementMoveTankForDegreesCommand {
  id: MessageType.MovementMoveTankForDegreesCommand;
  degrees: number;
  speedLeft: number;
  speedRight: number;
}

export interface MovementMoveTankForDegreesResult {
  id: MessageType.MovementMoveTankForDegreesResult;
  status: CommandStatus;
}

export interface MovementStopCommand {
  id: MessageType.MovementStopCommand;
}

export interface MovementStopResult {
  id: MessageType.MovementStopResult;
  status: CommandStatus;
}

export interface MovementSetSpeedCommand {
  id: MessageType.MovementSetSpeedCommand;
  speed: number;
}

export interface MovementSetSpeedResult {
  id: MessageType.MovementSetSpeedResult;
  status: CommandStatus;
}

export interface MovementSetEndStateCommand {
  id: MessageType.MovementSetEndStateCommand;
  endState: MotorEndState;
}

export interface MovementSetEndStateResult {
  id: MessageType.MovementSetEndStateResult;
  status: CommandStatus;
}

export interface MovementSetAccelerationCommand {
  id: MessageType.MovementSetAccelerationCommand;
  acceleration: number;
  deceleration: number;
}

export interface MovementSetAccelerationResult {
  id: MessageType.MovementSetAccelerationResult;
  status: CommandStatus;
}

export interface MovementSetTurnSteeringCommand {
  id: MessageType.MovementSetTurnSteeringCommand;
  steering: number;
}

export interface MovementSetTurnSteeringResult {
  id: MessageType.MovementSetTurnSteeringResult;
  status: CommandStatus;
}

export interface ImuSetYawFaceCommand {
  id: MessageType.ImuSetYawFaceCommand;
  yawFace: HubFace;
}

export interface ImuSetYawFaceResult {
  id: MessageType.ImuSetYawFaceResult;
  status: CommandStatus;
}

export interface ImuResetYawAxisCommand {
  id: MessageType.ImuResetYawAxisCommand;
  value: number;
}

export interface ImuResetYawAxisResult {
  id: MessageType.ImuResetYawAxisResult;
  status: CommandStatus;
}

export type CoralCommand =
  | InfoRequest
  | ErrorReportRequest
  | BeginFirmwareUpdateRequest
  | DeviceUuidRequest
  | DeviceNotificationRequest
  | LightColorCommand
  | BeepCommand
  | StopSoundCommand
  | MotorResetRelativePositionCommand
  | MotorSetSpeedCommand
  | MotorSetDutyCycleCommand
  | MotorRunCommand
  | MotorRunForDegreesCommand
  | MotorRunForTimeCommand
  | MotorRunToAbsolutePositionCommand
  | MotorRunToRelativePositionCommand
  | MotorStopCommand
  | MotorSetEndStateCommand
  | MotorSetAccelerationCommand
  | MovementMoveCommand
  | MovementMoveForTimeCommand
  | MovementMoveForDegreesCommand
  | MovementMoveTankCommand
  | MovementMoveTankForTimeCommand
  | MovementMoveTankForDegreesCommand
  | MovementStopCommand
  | MovementSetSpeedCommand
  | MovementSetEndStateCommand
  | MovementSetAccelerationCommand
  | MovementSetTurnSteeringCommand
  | ImuSetYawFaceCommand
  | ImuResetYawAxisCommand;
export type CoralIncomingMessage =
  | InfoResponse
  | ErrorReportResponse
  | BeginFirmwareUpdateResponse
  | DeviceUuidResponse
  | ProgramFlowNotification
  | DeviceNotificationResponse
  | LightColorResult
  | BeepResult
  | StopSoundResult
  | MotorResetRelativePositionResult
  | MotorSetSpeedResult
  | MotorRunResult
  | MotorSetDutyCycleResult
  | MotorRunForDegreesResult
  | MotorRunForTimeResult
  | MotorRunToAbsolutePositionResult
  | MotorRunToRelativePositionResult
  | MotorStopResult
  | MotorSetEndStateResult
  | MotorSetAccelerationResult
  | MovementMoveResult
  | MovementMoveForTimeResult
  | MovementMoveForDegreesResult
  | MovementMoveTankResult
  | MovementMoveTankForTimeResult
  | MovementMoveTankForDegreesResult
  | MovementStopResult
  | MovementSetSpeedResult
  | MovementSetEndStateResult
  | MovementSetAccelerationResult
  | MovementSetTurnSteeringResult
  | ImuSetYawFaceResult
  | ImuResetYawAxisResult
  | DeviceNotificationMessage;

type StatusOnlyMessage =
  | MovementMoveResult
  | MovementMoveForTimeResult
  | MovementMoveForDegreesResult
  | MovementMoveTankResult
  | MovementMoveTankForTimeResult
  | MovementMoveTankForDegreesResult
  | MovementStopResult
  | MovementSetSpeedResult
  | MovementSetEndStateResult
  | MovementSetAccelerationResult
  | MovementSetTurnSteeringResult
  | ImuSetYawFaceResult
  | ImuResetYawAxisResult;

export type DeviceNotificationMessage = {
  id: MessageType.DeviceNotification;
  deviceData: DeviceSensorPayload[];
};

export type DeviceSensorPayload =
  | MotorNotificationPayload
  | ColorSensorPayload
  | JoystickPayload
  | BatteryPayload
  | ButtonPayload
  | MotionSensorPayload
  | TagPayload
  | MotionGesturePayload
  | MotorGesturePayload;

export interface MotorNotificationPayload {
  kind: "motor";
  motorBitMask: MotorBits;
  state: MotorState;
  absolutePosition: number;
  position: number;
  speed: number;
  power: number;
}

export interface ColorSensorPayload {
  kind: "color";
  color: number;
  reflection: number;
  rawRed: number;
  rawGreen: number;
  rawBlue: number;
  hue: number;
  saturation: number;
  value: number;
}

export interface JoystickPayload {
  kind: "joystick";
  leftPercent: number;
  rightPercent: number;
  leftAngle: number;
  rightAngle: number;
}

export interface BatteryPayload {
  kind: "battery";
  level: number;
  usbPowerState: UsbPowerState;
}

export interface ButtonPayload {
  kind: "button";
  pressed: boolean;
}

export interface MotionSensorPayload {
  kind: "motion-sensor";
  orientation: number;
  yawFace: number;
  yaw: number;
  pitch: number;
  roll: number;
  accelerometerX: number;
  accelerometerY: number;
  accelerometerZ: number;
  gyroscopeX: number;
  gyroscopeY: number;
  gyroscopeZ: number;
}

export interface TagPayload {
  kind: "tag";
  color: number;
  id: number;
}

export interface MotionGesturePayload {
  kind: "motion-gesture";
  gesture: number;
}

export interface MotorGesturePayload {
  kind: "motor-gesture";
  motorBitMask: MotorBits;
  gesture: number;
}

const RESPONSE_TO_REQUEST: Record<number, MessageType> = {
  [MessageType.InfoResponse]: MessageType.InfoRequest,
  [MessageType.ErrorReportResponse]: MessageType.ErrorReportRequest,
  [MessageType.BeginFirmwareUpdateResponse]: MessageType.BeginFirmwareUpdateRequest,
  [MessageType.DeviceUuidResponse]: MessageType.DeviceUuidRequest,
  [MessageType.DeviceNotificationResponse]: MessageType.DeviceNotificationRequest
};

const RESULT_TO_COMMAND: Record<number, MessageType> = {
  [MessageType.LightColorResult]: MessageType.LightColorCommand,
  [MessageType.BeepResult]: MessageType.BeepCommand,
  [MessageType.StopSoundResult]: MessageType.StopSoundCommand,
  [MessageType.MotorResetRelativePositionResult]: MessageType.MotorResetRelativePositionCommand,
  [MessageType.MotorRunResult]: MessageType.MotorRunCommand,
  [MessageType.MotorRunForDegreesResult]: MessageType.MotorRunForDegreesCommand,
  [MessageType.MotorRunForTimeResult]: MessageType.MotorRunForTimeCommand,
  [MessageType.MotorRunToAbsolutePositionResult]: MessageType.MotorRunToAbsolutePositionCommand,
  [MessageType.MotorRunToRelativePositionResult]: MessageType.MotorRunToRelativePositionCommand,
  [MessageType.MotorSetDutyCycleResult]: MessageType.MotorSetDutyCycleCommand,
  [MessageType.MotorStopResult]: MessageType.MotorStopCommand,
  [MessageType.MotorSetSpeedResult]: MessageType.MotorSetSpeedCommand,
  [MessageType.MotorSetEndStateResult]: MessageType.MotorSetEndStateCommand,
  [MessageType.MotorSetAccelerationResult]: MessageType.MotorSetAccelerationCommand,
  [MessageType.MovementMoveResult]: MessageType.MovementMoveCommand,
  [MessageType.MovementMoveForTimeResult]: MessageType.MovementMoveForTimeCommand,
  [MessageType.MovementMoveForDegreesResult]: MessageType.MovementMoveForDegreesCommand,
  [MessageType.MovementMoveTankResult]: MessageType.MovementMoveTankCommand,
  [MessageType.MovementMoveTankForTimeResult]: MessageType.MovementMoveTankForTimeCommand,
  [MessageType.MovementMoveTankForDegreesResult]: MessageType.MovementMoveTankForDegreesCommand,
  [MessageType.MovementStopResult]: MessageType.MovementStopCommand,
  [MessageType.MovementSetSpeedResult]: MessageType.MovementSetSpeedCommand,
  [MessageType.MovementSetEndStateResult]: MessageType.MovementSetEndStateCommand,
  [MessageType.MovementSetAccelerationResult]: MessageType.MovementSetAccelerationCommand,
  [MessageType.MovementSetTurnSteeringResult]: MessageType.MovementSetTurnSteeringCommand,
  [MessageType.ImuSetYawFaceResult]: MessageType.ImuSetYawFaceCommand,
  [MessageType.ImuResetYawAxisResult]: MessageType.ImuResetYawAxisCommand
};

export function createInfoRequest(): InfoRequest {
  return { id: MessageType.InfoRequest };
}

export function createErrorReportRequest(): ErrorReportRequest {
  return { id: MessageType.ErrorReportRequest };
}

export function createBeginFirmwareUpdateRequest(productGroupDevice: ProductGroupDevice): BeginFirmwareUpdateRequest {
  return { id: MessageType.BeginFirmwareUpdateRequest, productGroupDevice };
}

export function createDeviceUuidRequest(): DeviceUuidRequest {
  return { id: MessageType.DeviceUuidRequest };
}

export function createDeviceNotificationRequest(delay: number): DeviceNotificationRequest {
  return { id: MessageType.DeviceNotificationRequest, delay };
}

export function createLightColorCommand(color: LegoColor, pattern: LightPattern): LightColorCommand {
  return { id: MessageType.LightColorCommand, color, pattern };
}

export function createBeepCommand(frequency: number, duration: number): BeepCommand {
  return { id: MessageType.BeepCommand, frequency, duration };
}

export function createStopSoundCommand(): StopSoundCommand {
  return { id: MessageType.StopSoundCommand };
}

export function createMotorSetSpeedCommand(
  motorBitMask: MotorBits,
  speed: number
): MotorSetSpeedCommand {
  return { id: MessageType.MotorSetSpeedCommand, motorBitMask, speed };
}

export function createMotorSetDutyCycleCommand(
  motorBitMask: MotorBits,
  dutyCycle: number
): MotorSetDutyCycleCommand {
  return { id: MessageType.MotorSetDutyCycleCommand, motorBitMask, dutyCycle };
}

export function createMotorRunCommand(
  motorBitMask: MotorBits,
  direction: MotorMoveDirection
): MotorRunCommand {
  return { id: MessageType.MotorRunCommand, motorBitMask, direction };
}

export function createMotorResetRelativePositionCommand(
  motorBitMask: MotorBits,
  position: number
): MotorResetRelativePositionCommand {
  return { id: MessageType.MotorResetRelativePositionCommand, motorBitMask, position };
}

export function createMotorRunForDegreesCommand(
  motorBitMask: MotorBits,
  degrees: number,
  direction: MotorMoveDirection
): MotorRunForDegreesCommand {
  return { id: MessageType.MotorRunForDegreesCommand, motorBitMask, degrees, direction };
}

export function createMotorRunForTimeCommand(
  motorBitMask: MotorBits,
  time: number,
  direction: MotorMoveDirection
): MotorRunForTimeCommand {
  return { id: MessageType.MotorRunForTimeCommand, motorBitMask, time, direction };
}

export function createMotorRunToAbsolutePositionCommand(
  motorBitMask: MotorBits,
  position: number,
  direction: MotorMoveDirection
): MotorRunToAbsolutePositionCommand {
  return { id: MessageType.MotorRunToAbsolutePositionCommand, motorBitMask, position, direction };
}

export function createMotorRunToRelativePositionCommand(
  motorBitMask: MotorBits,
  position: number
): MotorRunToRelativePositionCommand {
  return { id: MessageType.MotorRunToRelativePositionCommand, motorBitMask, position };
}

export function createMotorStopCommand(motorBitMask: MotorBits): MotorStopCommand {
  return { id: MessageType.MotorStopCommand, motorBitMask };
}

export function createMotorSetEndStateCommand(
  motorBitMask: MotorBits,
  endState: MotorEndState
): MotorSetEndStateCommand {
  return { id: MessageType.MotorSetEndStateCommand, motorBitMask, endState };
}

export function createMotorSetAccelerationCommand(
  motorBitMask: MotorBits,
  acceleration: number,
  deceleration: number
): MotorSetAccelerationCommand {
  return { id: MessageType.MotorSetAccelerationCommand, motorBitMask, acceleration, deceleration };
}

export function createMovementMoveCommand(direction: MovementDirection): MovementMoveCommand {
  return { id: MessageType.MovementMoveCommand, direction };
}

export function createMovementMoveForTimeCommand(
  time: number,
  direction: MovementDirection
): MovementMoveForTimeCommand {
  return { id: MessageType.MovementMoveForTimeCommand, time, direction };
}

export function createMovementMoveForDegreesCommand(
  degrees: number,
  direction: MovementDirection
): MovementMoveForDegreesCommand {
  return { id: MessageType.MovementMoveForDegreesCommand, degrees, direction };
}

export function createMovementMoveTankCommand(
  speedLeft: number,
  speedRight: number
): MovementMoveTankCommand {
  return { id: MessageType.MovementMoveTankCommand, speedLeft, speedRight };
}

export function createMovementMoveTankForTimeCommand(
  time: number,
  speedLeft: number,
  speedRight: number
): MovementMoveTankForTimeCommand {
  return { id: MessageType.MovementMoveTankForTimeCommand, time, speedLeft, speedRight };
}

export function createMovementMoveTankForDegreesCommand(
  degrees: number,
  speedLeft: number,
  speedRight: number
): MovementMoveTankForDegreesCommand {
  return { id: MessageType.MovementMoveTankForDegreesCommand, degrees, speedLeft, speedRight };
}

export function createMovementStopCommand(): MovementStopCommand {
  return { id: MessageType.MovementStopCommand };
}

export function createMovementSetSpeedCommand(speed: number): MovementSetSpeedCommand {
  return { id: MessageType.MovementSetSpeedCommand, speed };
}

export function createMovementSetEndStateCommand(endState: MotorEndState): MovementSetEndStateCommand {
  return { id: MessageType.MovementSetEndStateCommand, endState };
}

export function createMovementSetAccelerationCommand(
  acceleration: number,
  deceleration: number
): MovementSetAccelerationCommand {
  return { id: MessageType.MovementSetAccelerationCommand, acceleration, deceleration };
}

export function createMovementSetTurnSteeringCommand(steering: number): MovementSetTurnSteeringCommand {
  return { id: MessageType.MovementSetTurnSteeringCommand, steering };
}

export function createImuSetYawFaceCommand(yawFace: HubFace): ImuSetYawFaceCommand {
  return { id: MessageType.ImuSetYawFaceCommand, yawFace };
}

export function createImuResetYawAxisCommand(value: number): ImuResetYawAxisCommand {
  return { id: MessageType.ImuResetYawAxisCommand, value };
}

export function encodeMessage(message: CoralCommand): Buffer {
  const bytes: number[] = [message.id];
  switch (message.id) {
    case MessageType.InfoRequest:
    case MessageType.ErrorReportRequest:
    case MessageType.DeviceUuidRequest:
    case MessageType.StopSoundCommand:
    case MessageType.MovementStopCommand:
      break;
    case MessageType.BeginFirmwareUpdateRequest:
      pushUint16(bytes, message.productGroupDevice);
      break;
    case MessageType.DeviceNotificationRequest:
      pushUint16(bytes, message.delay);
      break;
    case MessageType.LightColorCommand:
      pushInt8(bytes, message.color);
      pushUint8(bytes, message.pattern);
      break;
    case MessageType.BeepCommand:
      pushUint16(bytes, message.frequency);
      pushUint32(bytes, message.duration);
      break;
    case MessageType.MotorSetSpeedCommand:
      bytes.push(message.motorBitMask);
      pushInt8(bytes, message.speed);
      break;
    case MessageType.MotorSetDutyCycleCommand:
      bytes.push(message.motorBitMask);
      pushInt16(bytes, message.dutyCycle);
      break;
    case MessageType.MotorRunCommand:
      bytes.push(message.motorBitMask);
      bytes.push(message.direction);
      break;
    case MessageType.MotorResetRelativePositionCommand:
      bytes.push(message.motorBitMask);
      pushInt32(bytes, message.position);
      break;
    case MessageType.MotorRunForDegreesCommand:
      bytes.push(message.motorBitMask);
      pushInt32(bytes, message.degrees);
      bytes.push(message.direction);
      break;
    case MessageType.MotorRunForTimeCommand:
      bytes.push(message.motorBitMask);
      pushUint32(bytes, message.time);
      bytes.push(message.direction);
      break;
    case MessageType.MotorRunToAbsolutePositionCommand:
      bytes.push(message.motorBitMask);
      pushUint16(bytes, message.position);
      bytes.push(message.direction);
      break;
    case MessageType.MotorRunToRelativePositionCommand:
      bytes.push(message.motorBitMask);
      pushInt32(bytes, message.position);
      break;
    case MessageType.MotorStopCommand:
      bytes.push(message.motorBitMask);
      break;
    case MessageType.MotorSetEndStateCommand:
      bytes.push(message.motorBitMask);
      pushInt8(bytes, message.endState);
      break;
    case MessageType.MotorSetAccelerationCommand:
      bytes.push(message.motorBitMask);
      pushUint8(bytes, message.acceleration);
      pushUint8(bytes, message.deceleration);
      break;
    case MessageType.MovementMoveCommand:
      bytes.push(message.direction);
      break;
    case MessageType.MovementMoveForTimeCommand:
      pushUint32(bytes, message.time);
      bytes.push(message.direction);
      break;
    case MessageType.MovementMoveForDegreesCommand:
      pushInt32(bytes, message.degrees);
      bytes.push(message.direction);
      break;
    case MessageType.MovementMoveTankCommand:
      pushInt8(bytes, message.speedLeft);
      pushInt8(bytes, message.speedRight);
      break;
    case MessageType.MovementMoveTankForTimeCommand:
      pushUint32(bytes, message.time);
      pushInt8(bytes, message.speedLeft);
      pushInt8(bytes, message.speedRight);
      break;
    case MessageType.MovementMoveTankForDegreesCommand:
      pushInt32(bytes, message.degrees);
      pushInt8(bytes, message.speedLeft);
      pushInt8(bytes, message.speedRight);
      break;
    case MessageType.MovementSetSpeedCommand:
      pushInt8(bytes, message.speed);
      break;
    case MessageType.MovementSetEndStateCommand:
      pushInt8(bytes, message.endState);
      break;
    case MessageType.MovementSetAccelerationCommand:
      pushUint8(bytes, message.acceleration);
      pushUint8(bytes, message.deceleration);
      break;
    case MessageType.MovementSetTurnSteeringCommand:
      pushUint8(bytes, message.steering);
      break;
    case MessageType.ImuSetYawFaceCommand:
      bytes.push(message.yawFace);
      break;
    case MessageType.ImuResetYawAxisCommand:
      pushInt16(bytes, message.value);
      break;
    default: {
      const exhaustive: never = message;
      throw new Error("Unsupported command");
    }
  }
  return Buffer.from(bytes);
}

export function decodeMessage(data: Buffer): CoralIncomingMessage | null {
  if (!data.length) {
    return null;
  }
  const reader = new BufferReader(data);
  const id = reader.readUInt8();
  switch (id) {
    case MessageType.InfoResponse:
      return {
        id,
        rpcMajor: reader.readUInt8(),
        rpcMinor: reader.readUInt8(),
        rpcBuild: reader.readUInt16(),
        firmwareMajor: reader.readUInt8(),
        firmwareMinor: reader.readUInt8(),
        firmwareBuild: reader.readUInt16(),
        bootloaderMajor: reader.readUInt8(),
        bootloaderMinor: reader.readUInt8(),
        bootloaderBuild: reader.readUInt16(),
        maxPacketSize: reader.readUInt16(),
        productGroupDevice: reader.readUInt16() as ProductGroupDevice
      };
    case MessageType.ErrorReportResponse: {
      const count = reader.readUInt8();
      const reportData: number[] = [];
      for (let i = 0; i < count; i += 1) {
        reportData.push(reader.readUInt32());
      }
      return { id, reportData };
    }
    case MessageType.BeginFirmwareUpdateResponse:
      return {
        id,
        status: reader.readUInt8() as ResponseStatus
      };
    case MessageType.DeviceUuidResponse: {
      const uuid = Array.from(reader.readBytes(8));
      return { id, uuid };
    }
    case MessageType.ProgramFlowNotification:
      return {
        id,
        action: reader.readUInt8() as ProgramAction
      };
    case MessageType.DeviceNotificationResponse:
      return {
        id,
        status: reader.readUInt8()
      };
    case MessageType.LightColorResult:
      return {
        id,
        status: reader.readUInt8() as CommandStatus
      };
    case MessageType.BeepResult:
      return {
        id,
        status: reader.readUInt8() as CommandStatus
      };
    case MessageType.StopSoundResult:
      return {
        id,
        status: reader.readUInt8() as CommandStatus
      };
    case MessageType.MotorResetRelativePositionResult:
      return {
        id,
        motorBitMask: reader.readUInt8() as MotorBits,
        status: reader.readUInt8() as CommandStatus
      };
    case MessageType.MotorSetSpeedResult:
      return {
        id,
        motorBitMask: reader.readUInt8() as MotorBits,
        status: reader.readUInt8() as CommandStatus
      };
    case MessageType.MotorSetDutyCycleResult:
      return {
        id,
        motorBitMask: reader.readUInt8() as MotorBits,
        status: reader.readUInt8() as CommandStatus
      };
    case MessageType.MotorRunResult:
      return {
        id,
        motorBitMask: reader.readUInt8() as MotorBits,
        status: reader.readUInt8() as CommandStatus
      };
    case MessageType.MotorRunForDegreesResult:
      return {
        id,
        motorBitMask: reader.readUInt8() as MotorBits,
        status: reader.readUInt8() as CommandStatus
      };
    case MessageType.MotorRunForTimeResult:
      return {
        id,
        motorBitMask: reader.readUInt8() as MotorBits,
        status: reader.readUInt8() as CommandStatus
      };
    case MessageType.MotorRunToAbsolutePositionResult:
      return {
        id,
        motorBitMask: reader.readUInt8() as MotorBits,
        status: reader.readUInt8() as CommandStatus
      };
    case MessageType.MotorRunToRelativePositionResult:
      return {
        id,
        motorBitMask: reader.readUInt8() as MotorBits,
        status: reader.readUInt8() as CommandStatus
      };
    case MessageType.MotorStopResult:
      return {
        id,
        motorBitMask: reader.readUInt8() as MotorBits,
        status: reader.readUInt8() as CommandStatus
      };
    case MessageType.MotorSetEndStateResult:
      return {
        id,
        motorBitMask: reader.readUInt8() as MotorBits,
        status: reader.readUInt8() as CommandStatus
      };
    case MessageType.MotorSetAccelerationResult:
      return {
        id,
        motorBitMask: reader.readUInt8() as MotorBits,
        status: reader.readUInt8() as CommandStatus
      };
    case MessageType.DeviceNotification:
      reader.readUInt16(); // reserved
      return {
        id,
        deviceData: decodeDeviceData(reader.readRemaining())
      };
    case MessageType.MovementMoveResult:
    case MessageType.MovementMoveForTimeResult:
    case MessageType.MovementMoveForDegreesResult:
    case MessageType.MovementMoveTankResult:
    case MessageType.MovementMoveTankForTimeResult:
    case MessageType.MovementMoveTankForDegreesResult:
    case MessageType.MovementStopResult:
    case MessageType.MovementSetSpeedResult:
    case MessageType.MovementSetEndStateResult:
    case MessageType.MovementSetAccelerationResult:
    case MessageType.MovementSetTurnSteeringResult:
    case MessageType.ImuSetYawFaceResult:
    case MessageType.ImuResetYawAxisResult:
      return createStatusOnlyMessage(id as StatusOnlyMessage["id"], reader.readUInt8() as CommandStatus);
    default:
      return null;
  }
}

const DEVICE_MESSAGE_TYPES = new Set<number>([
  DeviceMessageType.InfoHubNotification,
  DeviceMessageType.ImuHubNotification,
  DeviceMessageType.TagHubNotification,
  DeviceMessageType.ButtonStateNotification,
  DeviceMessageType.MotorNotification,
  DeviceMessageType.ColorSensorNotification,
  DeviceMessageType.JoystickNotification,
  DeviceMessageType.ImuGestureNotification,
  DeviceMessageType.MotorGestureNotification
]);

function isDeviceMessageTypeValue(value: number | undefined): boolean {
  return value !== undefined && DEVICE_MESSAGE_TYPES.has(value);
}

function decodeDeviceData(buffer: Buffer): DeviceSensorPayload[] {
  if (!buffer.length) {
    return [];
  }
  const payloadReader = new BufferReader(buffer);
  const events: DeviceSensorPayload[] = [];
  while (payloadReader.remaining > 0) {
    const type = payloadReader.readUInt8();
    switch (type) {
      case DeviceMessageType.InfoHubNotification:
        events.push({
          kind: "battery",
          level: payloadReader.readUInt8(),
          usbPowerState: payloadReader.readUInt8() as UsbPowerState
        });
        if (payloadReader.remaining >= 6 && !isDeviceMessageTypeValue(payloadReader.peekUInt8())) {
          events.push({
            kind: "joystick",
            leftPercent: payloadReader.readInt8(),
            rightPercent: payloadReader.readInt8(),
            leftAngle: payloadReader.readInt16(),
            rightAngle: payloadReader.readInt16()
          });
        }
        break;
      case DeviceMessageType.ButtonStateNotification:
        events.push({
          kind: "button",
          pressed: payloadReader.readUInt8() === ButtonState.Pressed
        });
        break;
      case DeviceMessageType.MotorNotification:
        events.push({
          kind: "motor",
          motorBitMask: payloadReader.readUInt8() as MotorBits,
          state: payloadReader.readUInt8() as MotorState,
          absolutePosition: payloadReader.readUInt16(),
          power: payloadReader.readInt16(),
          speed: payloadReader.readInt8(),
          position: payloadReader.readInt32()
        });
        break;
      case DeviceMessageType.ColorSensorNotification:
        events.push({
          kind: "color",
          color: payloadReader.readInt8(),
          reflection: payloadReader.readUInt8(),
          rawRed: payloadReader.readUInt16(),
          rawGreen: payloadReader.readUInt16(),
          rawBlue: payloadReader.readUInt16(),
          hue: payloadReader.readUInt16(),
          saturation: payloadReader.readUInt8(),
          value: payloadReader.readUInt8()
        });
        break;
      case DeviceMessageType.JoystickNotification:
        events.push({
          kind: "joystick",
          leftPercent: payloadReader.readInt8(),
          rightPercent: payloadReader.readInt8(),
          leftAngle: payloadReader.readInt16(),
          rightAngle: payloadReader.readInt16()
        });
        break;
      case DeviceMessageType.ImuHubNotification:
        events.push({
          kind: "motion-sensor",
          orientation: payloadReader.readUInt8(),
          yawFace: payloadReader.readUInt8(),
          yaw: payloadReader.readInt16(),
          pitch: payloadReader.readInt16(),
          roll: payloadReader.readInt16(),
          accelerometerX: payloadReader.readInt16(),
          accelerometerY: payloadReader.readInt16(),
          accelerometerZ: payloadReader.readInt16(),
          gyroscopeX: payloadReader.readInt16(),
          gyroscopeY: payloadReader.readInt16(),
          gyroscopeZ: payloadReader.readInt16()
        });
        break;
      case DeviceMessageType.TagHubNotification:
        events.push({
          kind: "tag",
          color: payloadReader.readInt8(),
          id: payloadReader.readUInt16()
        });
        break;
      case DeviceMessageType.ImuGestureNotification:
        events.push({
          kind: "motion-gesture",
          gesture: payloadReader.readInt8()
        });
        break;
      case DeviceMessageType.MotorGestureNotification:
        events.push({
          kind: "motor-gesture",
          motorBitMask: payloadReader.readUInt8() as MotorBits,
          gesture: payloadReader.readInt8()
        });
        break;
      default:
        payloadReader.skipRemaining();
        return events;
    }
  }
  return events;
}

function createStatusOnlyMessage(id: StatusOnlyMessage["id"], status: CommandStatus): StatusOnlyMessage {
  return { id, status } as StatusOnlyMessage;
}

export function getRequestKey(message: CoralCommand): string {
  const suffix = "motorBitMask" in message ? String(message.motorBitMask) : "";
  return `${MessageType[message.id]}${suffix}`;
}

export function getResponseKey(message: CoralIncomingMessage): string {
  const mapped =
    (RESPONSE_TO_REQUEST[message.id] as MessageType | undefined) ??
    (RESULT_TO_COMMAND[message.id] as MessageType | undefined) ??
    message.id;
  const suffix = "motorBitMask" in message ? String(message.motorBitMask) : "";
  return `${MessageType[mapped]}${suffix}`;
}

export function mapProductToKind(device: ProductGroupDevice): CoralDeviceKind | "unknown" {
  switch (device) {
    case ProductGroupDevice.CoralSingleMotor:
      return "SingleMotor";
    case ProductGroupDevice.CoralDualMotor:
      return "DoubleMotor";
    case ProductGroupDevice.CoralColorSensor:
      return "ColorSensor";
    case ProductGroupDevice.CoralJoystick:
      return "Remote";
    default:
      return "unknown";
  }
}

class BufferReader {
  public offset = 0;
  constructor(private readonly buffer: Buffer) {}

  get remaining(): number {
    return Math.max(this.buffer.length - this.offset, 0);
  }

  readUInt8(): number {
    const value = this.buffer.readUInt8(this.offset);
    this.offset += 1;
    return value;
  }

  readInt8(): number {
    const value = this.buffer.readInt8(this.offset);
    this.offset += 1;
    return value;
  }

  readUInt16(): number {
    const value = this.buffer.readUInt16LE(this.offset);
    this.offset += 2;
    return value;
  }

  readInt16(): number {
    const value = this.buffer.readInt16LE(this.offset);
    this.offset += 2;
    return value;
  }

  readInt32(): number {
    const value = this.buffer.readInt32LE(this.offset);
    this.offset += 4;
    return value;
  }

  readUInt32(): number {
    const value = this.buffer.readUInt32LE(this.offset);
    this.offset += 4;
    return value;
  }

  readBytes(length: number): Buffer {
    const slice = this.buffer.slice(this.offset, this.offset + length);
    this.offset += length;
    return slice;
  }

  readRemaining(): Buffer {
    const remaining = this.buffer.slice(this.offset);
    this.offset = this.buffer.length;
    return remaining;
  }

  peekUInt8(): number {
    return this.buffer.readUInt8(this.offset);
  }

  skipRemaining(): void {
    this.offset = this.buffer.length;
  }
}

function pushUint16(target: number[], value: number): void {
  const safe = Math.max(0, Math.min(0xffff, value));
  target.push(safe & 0xff, (safe >> 8) & 0xff);
}

function pushInt8(target: number[], value: number): void {
  const safe = Math.max(-128, Math.min(127, value | 0));
  target.push(safe & 0xff);
}

function pushInt16(target: number[], value: number): void {
  const safe = Math.max(-0x8000, Math.min(0x7fff, value | 0));
  const normalized = safe < 0 ? 0x10000 + safe : safe;
  target.push(normalized & 0xff, (normalized >> 8) & 0xff);
}

function pushInt32(target: number[], value: number): void {
  const safe = Math.max(-0x80000000, Math.min(0x7fffffff, value | 0));
  const normalized = safe < 0 ? 0x100000000 + safe : safe;
  target.push(normalized & 0xff, (normalized >> 8) & 0xff, (normalized >> 16) & 0xff, (normalized >> 24) & 0xff);
}

function pushUint32(target: number[], value: number): void {
  const safe = Math.max(0, Math.min(0xffffffff, value >>> 0));
  target.push(safe & 0xff, (safe >> 8) & 0xff, (safe >> 16) & 0xff, (safe >> 24) & 0xff);
}

function pushUint8(target: number[], value: number): void {
  const safe = Math.max(0, Math.min(0xff, value | 0));
  target.push(safe & 0xff);
}
