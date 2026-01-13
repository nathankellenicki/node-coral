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

type CommandStatusResult<T extends MessageType> = { id: T; status: CommandStatus };
type MotorCommandResult<T extends MessageType> = CommandStatusResult<T> & { motorBitMask: MotorBits };

export interface MotorSetSpeedCommand {
  id: MessageType.MotorSetSpeedCommand;
  motorBitMask: MotorBits;
  speed: number;
}

export type MotorSetSpeedResult = MotorCommandResult<MessageType.MotorSetSpeedResult>;

export interface MotorSetDutyCycleCommand {
  id: MessageType.MotorSetDutyCycleCommand;
  motorBitMask: MotorBits;
  dutyCycle: number;
}

export type MotorSetDutyCycleResult = MotorCommandResult<MessageType.MotorSetDutyCycleResult>;

export interface MotorRunCommand {
  id: MessageType.MotorRunCommand;
  motorBitMask: MotorBits;
  direction: MotorMoveDirection;
}

export type MotorRunResult = MotorCommandResult<MessageType.MotorRunResult>;

export interface MotorResetRelativePositionCommand {
  id: MessageType.MotorResetRelativePositionCommand;
  motorBitMask: MotorBits;
  position: number;
}

export type MotorResetRelativePositionResult = MotorCommandResult<MessageType.MotorResetRelativePositionResult>;

export interface MotorRunForDegreesCommand {
  id: MessageType.MotorRunForDegreesCommand;
  motorBitMask: MotorBits;
  degrees: number;
  direction: MotorMoveDirection;
}

export type MotorRunForDegreesResult = MotorCommandResult<MessageType.MotorRunForDegreesResult>;

export interface MotorRunForTimeCommand {
  id: MessageType.MotorRunForTimeCommand;
  motorBitMask: MotorBits;
  time: number;
  direction: MotorMoveDirection;
}

export type MotorRunForTimeResult = MotorCommandResult<MessageType.MotorRunForTimeResult>;

export interface MotorRunToAbsolutePositionCommand {
  id: MessageType.MotorRunToAbsolutePositionCommand;
  motorBitMask: MotorBits;
  position: number;
  direction: MotorMoveDirection;
}

export type MotorRunToAbsolutePositionResult = MotorCommandResult<MessageType.MotorRunToAbsolutePositionResult>;

export interface MotorRunToRelativePositionCommand {
  id: MessageType.MotorRunToRelativePositionCommand;
  motorBitMask: MotorBits;
  position: number;
}

export type MotorRunToRelativePositionResult = MotorCommandResult<MessageType.MotorRunToRelativePositionResult>;

export interface MotorStopCommand {
  id: MessageType.MotorStopCommand;
  motorBitMask: MotorBits;
}

export type MotorStopResult = MotorCommandResult<MessageType.MotorStopResult>;

export interface MotorSetEndStateCommand {
  id: MessageType.MotorSetEndStateCommand;
  motorBitMask: MotorBits;
  endState: MotorEndState;
}

export type MotorSetEndStateResult = MotorCommandResult<MessageType.MotorSetEndStateResult>;

export interface MotorSetAccelerationCommand {
  id: MessageType.MotorSetAccelerationCommand;
  motorBitMask: MotorBits;
  acceleration: number;
  deceleration: number;
}

export type MotorSetAccelerationResult = MotorCommandResult<MessageType.MotorSetAccelerationResult>;

export interface LightColorCommand {
  id: MessageType.LightColorCommand;
  color: LegoColor;
  pattern: LightPattern;
}

export type LightColorResult = CommandStatusResult<MessageType.LightColorResult>;

export interface BeepCommand {
  id: MessageType.BeepCommand;
  frequency: number;
  duration: number;
}

export type BeepResult = CommandStatusResult<MessageType.BeepResult>;

export interface StopSoundCommand {
  id: MessageType.StopSoundCommand;
}

export type StopSoundResult = CommandStatusResult<MessageType.StopSoundResult>;

export interface MovementMoveCommand {
  id: MessageType.MovementMoveCommand;
  direction: MovementDirection;
}

export type MovementMoveResult = CommandStatusResult<MessageType.MovementMoveResult>;

export interface MovementMoveForTimeCommand {
  id: MessageType.MovementMoveForTimeCommand;
  time: number;
  direction: MovementDirection;
}

export type MovementMoveForTimeResult = CommandStatusResult<MessageType.MovementMoveForTimeResult>;

export interface MovementMoveForDegreesCommand {
  id: MessageType.MovementMoveForDegreesCommand;
  degrees: number;
  direction: MovementDirection;
}

export type MovementMoveForDegreesResult = CommandStatusResult<MessageType.MovementMoveForDegreesResult>;

export interface MovementMoveTankCommand {
  id: MessageType.MovementMoveTankCommand;
  speedLeft: number;
  speedRight: number;
}

export type MovementMoveTankResult = CommandStatusResult<MessageType.MovementMoveTankResult>;

export interface MovementMoveTankForTimeCommand {
  id: MessageType.MovementMoveTankForTimeCommand;
  time: number;
  speedLeft: number;
  speedRight: number;
}

export type MovementMoveTankForTimeResult = CommandStatusResult<MessageType.MovementMoveTankForTimeResult>;

export interface MovementMoveTankForDegreesCommand {
  id: MessageType.MovementMoveTankForDegreesCommand;
  degrees: number;
  speedLeft: number;
  speedRight: number;
}

export type MovementMoveTankForDegreesResult = CommandStatusResult<MessageType.MovementMoveTankForDegreesResult>;

export interface MovementStopCommand {
  id: MessageType.MovementStopCommand;
}

export type MovementStopResult = CommandStatusResult<MessageType.MovementStopResult>;

export interface MovementSetSpeedCommand {
  id: MessageType.MovementSetSpeedCommand;
  speed: number;
}

export type MovementSetSpeedResult = CommandStatusResult<MessageType.MovementSetSpeedResult>;

export interface MovementSetEndStateCommand {
  id: MessageType.MovementSetEndStateCommand;
  endState: MotorEndState;
}

export type MovementSetEndStateResult = CommandStatusResult<MessageType.MovementSetEndStateResult>;

export interface MovementSetAccelerationCommand {
  id: MessageType.MovementSetAccelerationCommand;
  acceleration: number;
  deceleration: number;
}

export type MovementSetAccelerationResult = CommandStatusResult<MessageType.MovementSetAccelerationResult>;

export interface MovementSetTurnSteeringCommand {
  id: MessageType.MovementSetTurnSteeringCommand;
  steering: number;
}

export type MovementSetTurnSteeringResult = CommandStatusResult<MessageType.MovementSetTurnSteeringResult>;

export interface ImuSetYawFaceCommand {
  id: MessageType.ImuSetYawFaceCommand;
  yawFace: HubFace;
}

export type ImuSetYawFaceResult = CommandStatusResult<MessageType.ImuSetYawFaceResult>;

export interface ImuResetYawAxisCommand {
  id: MessageType.ImuResetYawAxisCommand;
  value: number;
}

export type ImuResetYawAxisResult = CommandStatusResult<MessageType.ImuResetYawAxisResult>;

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

type MotorStatusMessage =
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
  | MotorSetAccelerationResult;

type StatusOnlyMessage =
  | LightColorResult
  | BeepResult
  | StopSoundResult
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

const MOTOR_STATUS_RESULT_IDS: readonly MotorStatusMessage["id"][] = [
  MessageType.MotorResetRelativePositionResult,
  MessageType.MotorSetSpeedResult,
  MessageType.MotorRunResult,
  MessageType.MotorSetDutyCycleResult,
  MessageType.MotorRunForDegreesResult,
  MessageType.MotorRunForTimeResult,
  MessageType.MotorRunToAbsolutePositionResult,
  MessageType.MotorRunToRelativePositionResult,
  MessageType.MotorStopResult,
  MessageType.MotorSetEndStateResult,
  MessageType.MotorSetAccelerationResult
];

const STATUS_ONLY_RESULT_IDS: readonly StatusOnlyMessage["id"][] = [
  MessageType.LightColorResult,
  MessageType.BeepResult,
  MessageType.StopSoundResult,
  MessageType.MovementMoveResult,
  MessageType.MovementMoveForTimeResult,
  MessageType.MovementMoveForDegreesResult,
  MessageType.MovementMoveTankResult,
  MessageType.MovementMoveTankForTimeResult,
  MessageType.MovementMoveTankForDegreesResult,
  MessageType.MovementStopResult,
  MessageType.MovementSetSpeedResult,
  MessageType.MovementSetEndStateResult,
  MessageType.MovementSetAccelerationResult,
  MessageType.MovementSetTurnSteeringResult,
  MessageType.ImuSetYawFaceResult,
  MessageType.ImuResetYawAxisResult
];

const MOTOR_STATUS_RESULT_SET = new Set<number>(MOTOR_STATUS_RESULT_IDS);
const STATUS_ONLY_RESULT_SET = new Set<number>(STATUS_ONLY_RESULT_IDS);

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

function buildCommand<T extends MessageType, P extends object = Record<string, never>>(id: T, payload?: P): { id: T } & P {
  return (payload ? { id, ...payload } : { id }) as { id: T } & P;
}

export function createInfoRequest(): InfoRequest {
  return buildCommand(MessageType.InfoRequest);
}

export function createErrorReportRequest(): ErrorReportRequest {
  return buildCommand(MessageType.ErrorReportRequest);
}

export function createBeginFirmwareUpdateRequest(productGroupDevice: ProductGroupDevice): BeginFirmwareUpdateRequest {
  return buildCommand(MessageType.BeginFirmwareUpdateRequest, { productGroupDevice });
}

export function createDeviceUuidRequest(): DeviceUuidRequest {
  return buildCommand(MessageType.DeviceUuidRequest);
}

export function createDeviceNotificationRequest(delay: number): DeviceNotificationRequest {
  return buildCommand(MessageType.DeviceNotificationRequest, { delay });
}

export function createLightColorCommand(color: LegoColor, pattern: LightPattern): LightColorCommand {
  return buildCommand(MessageType.LightColorCommand, { color, pattern });
}

export function createBeepCommand(frequency: number, duration: number): BeepCommand {
  return buildCommand(MessageType.BeepCommand, { frequency, duration });
}

export function createStopSoundCommand(): StopSoundCommand {
  return buildCommand(MessageType.StopSoundCommand);
}

export function createMotorSetSpeedCommand(
  motorBitMask: MotorBits,
  speed: number
): MotorSetSpeedCommand {
  return buildCommand(MessageType.MotorSetSpeedCommand, { motorBitMask, speed });
}

export function createMotorSetDutyCycleCommand(
  motorBitMask: MotorBits,
  dutyCycle: number
): MotorSetDutyCycleCommand {
  return buildCommand(MessageType.MotorSetDutyCycleCommand, { motorBitMask, dutyCycle });
}

export function createMotorRunCommand(
  motorBitMask: MotorBits,
  direction: MotorMoveDirection
): MotorRunCommand {
  return buildCommand(MessageType.MotorRunCommand, { motorBitMask, direction });
}

export function createMotorResetRelativePositionCommand(
  motorBitMask: MotorBits,
  position: number
): MotorResetRelativePositionCommand {
  return buildCommand(MessageType.MotorResetRelativePositionCommand, { motorBitMask, position });
}

export function createMotorRunForDegreesCommand(
  motorBitMask: MotorBits,
  degrees: number,
  direction: MotorMoveDirection
): MotorRunForDegreesCommand {
  return buildCommand(MessageType.MotorRunForDegreesCommand, { motorBitMask, degrees, direction });
}

export function createMotorRunForTimeCommand(
  motorBitMask: MotorBits,
  time: number,
  direction: MotorMoveDirection
): MotorRunForTimeCommand {
  return buildCommand(MessageType.MotorRunForTimeCommand, { motorBitMask, time, direction });
}

export function createMotorRunToAbsolutePositionCommand(
  motorBitMask: MotorBits,
  position: number,
  direction: MotorMoveDirection
): MotorRunToAbsolutePositionCommand {
  return buildCommand(MessageType.MotorRunToAbsolutePositionCommand, { motorBitMask, position, direction });
}

export function createMotorRunToRelativePositionCommand(
  motorBitMask: MotorBits,
  position: number
): MotorRunToRelativePositionCommand {
  return buildCommand(MessageType.MotorRunToRelativePositionCommand, { motorBitMask, position });
}

export function createMotorStopCommand(motorBitMask: MotorBits): MotorStopCommand {
  return buildCommand(MessageType.MotorStopCommand, { motorBitMask });
}

export function createMotorSetEndStateCommand(
  motorBitMask: MotorBits,
  endState: MotorEndState
): MotorSetEndStateCommand {
  return buildCommand(MessageType.MotorSetEndStateCommand, { motorBitMask, endState });
}

export function createMotorSetAccelerationCommand(
  motorBitMask: MotorBits,
  acceleration: number,
  deceleration: number
): MotorSetAccelerationCommand {
  return buildCommand(MessageType.MotorSetAccelerationCommand, { motorBitMask, acceleration, deceleration });
}

export function createMovementMoveCommand(direction: MovementDirection): MovementMoveCommand {
  return buildCommand(MessageType.MovementMoveCommand, { direction });
}

export function createMovementMoveForTimeCommand(
  time: number,
  direction: MovementDirection
): MovementMoveForTimeCommand {
  return buildCommand(MessageType.MovementMoveForTimeCommand, { time, direction });
}

export function createMovementMoveForDegreesCommand(
  degrees: number,
  direction: MovementDirection
): MovementMoveForDegreesCommand {
  return buildCommand(MessageType.MovementMoveForDegreesCommand, { degrees, direction });
}

export function createMovementMoveTankCommand(
  speedLeft: number,
  speedRight: number
): MovementMoveTankCommand {
  return buildCommand(MessageType.MovementMoveTankCommand, { speedLeft, speedRight });
}

export function createMovementMoveTankForTimeCommand(
  time: number,
  speedLeft: number,
  speedRight: number
): MovementMoveTankForTimeCommand {
  return buildCommand(MessageType.MovementMoveTankForTimeCommand, { time, speedLeft, speedRight });
}

export function createMovementMoveTankForDegreesCommand(
  degrees: number,
  speedLeft: number,
  speedRight: number
): MovementMoveTankForDegreesCommand {
  return buildCommand(MessageType.MovementMoveTankForDegreesCommand, { degrees, speedLeft, speedRight });
}

export function createMovementStopCommand(): MovementStopCommand {
  return buildCommand(MessageType.MovementStopCommand);
}

export function createMovementSetSpeedCommand(speed: number): MovementSetSpeedCommand {
  return buildCommand(MessageType.MovementSetSpeedCommand, { speed });
}

export function createMovementSetEndStateCommand(endState: MotorEndState): MovementSetEndStateCommand {
  return buildCommand(MessageType.MovementSetEndStateCommand, { endState });
}

export function createMovementSetAccelerationCommand(
  acceleration: number,
  deceleration: number
): MovementSetAccelerationCommand {
  return buildCommand(MessageType.MovementSetAccelerationCommand, { acceleration, deceleration });
}

export function createMovementSetTurnSteeringCommand(steering: number): MovementSetTurnSteeringCommand {
  return buildCommand(MessageType.MovementSetTurnSteeringCommand, { steering });
}

export function createImuSetYawFaceCommand(yawFace: HubFace): ImuSetYawFaceCommand {
  return buildCommand(MessageType.ImuSetYawFaceCommand, { yawFace });
}

export function createImuResetYawAxisCommand(value: number): ImuResetYawAxisCommand {
  return buildCommand(MessageType.ImuResetYawAxisCommand, { value });
}

type NumericFieldType = "uint8" | "int8" | "uint16" | "int16" | "uint32" | "int32";
type CommandField = { key: string; type: NumericFieldType };
type CommandSchema = readonly CommandField[];

const FIELD_WRITERS: Record<NumericFieldType, (target: number[], value: number) => void> = {
  uint8: pushUint8,
  int8: pushInt8,
  uint16: pushUint16,
  int16: pushInt16,
  uint32: pushUint32,
  int32: pushInt32
};

const COMMAND_SCHEMAS: Partial<Record<MessageType, CommandSchema>> = {
  [MessageType.BeginFirmwareUpdateRequest]: [{ key: "productGroupDevice", type: "uint16" }],
  [MessageType.DeviceNotificationRequest]: [{ key: "delay", type: "uint16" }],
  [MessageType.LightColorCommand]: [
    { key: "color", type: "int8" },
    { key: "pattern", type: "uint8" }
  ],
  [MessageType.BeepCommand]: [
    { key: "frequency", type: "uint16" },
    { key: "duration", type: "uint32" }
  ],
  [MessageType.MotorSetSpeedCommand]: [
    { key: "motorBitMask", type: "uint8" },
    { key: "speed", type: "int8" }
  ],
  [MessageType.MotorSetDutyCycleCommand]: [
    { key: "motorBitMask", type: "uint8" },
    { key: "dutyCycle", type: "int16" }
  ],
  [MessageType.MotorRunCommand]: [
    { key: "motorBitMask", type: "uint8" },
    { key: "direction", type: "uint8" }
  ],
  [MessageType.MotorResetRelativePositionCommand]: [
    { key: "motorBitMask", type: "uint8" },
    { key: "position", type: "int32" }
  ],
  [MessageType.MotorRunForDegreesCommand]: [
    { key: "motorBitMask", type: "uint8" },
    { key: "degrees", type: "int32" },
    { key: "direction", type: "uint8" }
  ],
  [MessageType.MotorRunForTimeCommand]: [
    { key: "motorBitMask", type: "uint8" },
    { key: "time", type: "uint32" },
    { key: "direction", type: "uint8" }
  ],
  [MessageType.MotorRunToAbsolutePositionCommand]: [
    { key: "motorBitMask", type: "uint8" },
    { key: "position", type: "uint16" },
    { key: "direction", type: "uint8" }
  ],
  [MessageType.MotorRunToRelativePositionCommand]: [
    { key: "motorBitMask", type: "uint8" },
    { key: "position", type: "int32" }
  ],
  [MessageType.MotorStopCommand]: [{ key: "motorBitMask", type: "uint8" }],
  [MessageType.MotorSetEndStateCommand]: [
    { key: "motorBitMask", type: "uint8" },
    { key: "endState", type: "int8" }
  ],
  [MessageType.MotorSetAccelerationCommand]: [
    { key: "motorBitMask", type: "uint8" },
    { key: "acceleration", type: "uint8" },
    { key: "deceleration", type: "uint8" }
  ],
  [MessageType.MovementMoveCommand]: [{ key: "direction", type: "uint8" }],
  [MessageType.MovementMoveForTimeCommand]: [
    { key: "time", type: "uint32" },
    { key: "direction", type: "uint8" }
  ],
  [MessageType.MovementMoveForDegreesCommand]: [
    { key: "degrees", type: "int32" },
    { key: "direction", type: "uint8" }
  ],
  [MessageType.MovementMoveTankCommand]: [
    { key: "speedLeft", type: "int8" },
    { key: "speedRight", type: "int8" }
  ],
  [MessageType.MovementMoveTankForTimeCommand]: [
    { key: "time", type: "uint32" },
    { key: "speedLeft", type: "int8" },
    { key: "speedRight", type: "int8" }
  ],
  [MessageType.MovementMoveTankForDegreesCommand]: [
    { key: "degrees", type: "int32" },
    { key: "speedLeft", type: "int8" },
    { key: "speedRight", type: "int8" }
  ],
  [MessageType.MovementSetSpeedCommand]: [{ key: "speed", type: "int8" }],
  [MessageType.MovementSetEndStateCommand]: [{ key: "endState", type: "int8" }],
  [MessageType.MovementSetAccelerationCommand]: [
    { key: "acceleration", type: "uint8" },
    { key: "deceleration", type: "uint8" }
  ],
  [MessageType.MovementSetTurnSteeringCommand]: [{ key: "steering", type: "int8" }],
  [MessageType.ImuSetYawFaceCommand]: [{ key: "yawFace", type: "uint8" }],
  [MessageType.ImuResetYawAxisCommand]: [{ key: "value", type: "int16" }]
};

export function encodeMessage(message: CoralCommand): Uint8Array {
  const bytes: number[] = [message.id];
  const schema = COMMAND_SCHEMAS[message.id];
  if (schema) {
    const numericMessage = message as unknown as Record<string, number | undefined>;
    for (const field of schema) {
      const writer = FIELD_WRITERS[field.type];
      const value = numericMessage[field.key];
      if (value === undefined) {
        throw new Error(`Missing field "${field.key}" for ${MessageType[message.id]}.`);
      }
      writer(bytes, value);
    }
  }
  return Uint8Array.from(bytes);
}

export function decodeMessage(data: Uint8Array): CoralIncomingMessage | null {
  if (!data.length) {
    return null;
  }
  const reader = new BufferReader(data);
  const id = reader.readUInt8();
  if (MOTOR_STATUS_RESULT_SET.has(id)) {
    const result: MotorStatusMessage = {
      id: id as MotorStatusMessage["id"],
      motorBitMask: reader.readUInt8() as MotorBits,
      status: reader.readUInt8() as CommandStatus
    };
    return result;
  }
  if (STATUS_ONLY_RESULT_SET.has(id)) {
    const result: StatusOnlyMessage = {
      id: id as StatusOnlyMessage["id"],
      status: reader.readUInt8() as CommandStatus
    };
    return result;
  }
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
        status: reader.readUInt8() as ResponseStatus
      };
    case MessageType.DeviceNotification:
      reader.readUInt16(); // reserved
      return {
        id,
        deviceData: decodeDeviceData(reader.readRemaining())
      };
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

function decodeDeviceData(buffer: Uint8Array): DeviceSensorPayload[] {
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
      default: {
        while (payloadReader.remaining > 0) {
          if (isDeviceMessageTypeValue(payloadReader.peekUInt8())) {
            break;
          }
          payloadReader.readUInt8();
        }
        break;
      }
    }
  }
  return events;
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
      return "Controller";
    default:
      return "unknown";
  }
}

class BufferReader {
  public offset = 0;
  private readonly view: DataView;
  constructor(private readonly buffer: Uint8Array) {
    this.view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
  }

  get remaining(): number {
    return Math.max(this.buffer.length - this.offset, 0);
  }

  readUInt8(): number {
    const value = this.view.getUint8(this.offset);
    this.offset += 1;
    return value;
  }

  readInt8(): number {
    const value = this.view.getInt8(this.offset);
    this.offset += 1;
    return value;
  }

  readUInt16(): number {
    const value = this.view.getUint16(this.offset, true);
    this.offset += 2;
    return value;
  }

  readInt16(): number {
    const value = this.view.getInt16(this.offset, true);
    this.offset += 2;
    return value;
  }

  readInt32(): number {
    const value = this.view.getInt32(this.offset, true);
    this.offset += 4;
    return value;
  }

  readUInt32(): number {
    const value = this.view.getUint32(this.offset, true);
    this.offset += 4;
    return value;
  }

  readBytes(length: number): Uint8Array {
    const slice = this.buffer.slice(this.offset, this.offset + length);
    this.offset += length;
    return slice;
  }

  readRemaining(): Uint8Array {
    const remaining = this.buffer.slice(this.offset);
    this.offset = this.buffer.length;
    return remaining;
  }

  peekUInt8(): number {
    return this.view.getUint8(this.offset);
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
