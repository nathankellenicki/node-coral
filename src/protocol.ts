import { CoralDeviceKind } from "./constants";

export enum MessageType {
  InfoRequest = 0,
  InfoResponse = 1,
  DeviceNotificationRequest = 40,
  DeviceNotificationResponse = 41,
  DeviceNotification = 60,
  MotorRunCommand = 122,
  MotorRunResult = 123,
  MotorSetDutyCycleCommand = 132,
  MotorSetDutyCycleResult = 133,
  MotorSetSpeedCommand = 140,
  MotorSetSpeedResult = 141
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

export type CoralCommand =
  | InfoRequest
  | DeviceNotificationRequest
  | MotorSetSpeedCommand
  | MotorSetDutyCycleCommand
  | MotorRunCommand;
export type CoralIncomingMessage =
  | InfoResponse
  | DeviceNotificationResponse
  | MotorSetSpeedResult
  | MotorRunResult
  | MotorSetDutyCycleResult
  | DeviceNotificationMessage;

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
  usbPowerState: number;
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
  [MessageType.DeviceNotificationResponse]: MessageType.DeviceNotificationRequest
};

const RESULT_TO_COMMAND: Record<number, MessageType> = {
  [MessageType.MotorRunResult]: MessageType.MotorRunCommand,
  [MessageType.MotorSetSpeedResult]: MessageType.MotorSetSpeedCommand,
  [MessageType.MotorSetDutyCycleResult]: MessageType.MotorSetDutyCycleCommand
};

export function createInfoRequest(): InfoRequest {
  return { id: MessageType.InfoRequest };
}

export function createDeviceNotificationRequest(delay: number): DeviceNotificationRequest {
  return { id: MessageType.DeviceNotificationRequest, delay };
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

export function encodeMessage(message: CoralCommand): Buffer {
  const bytes: number[] = [message.id];
  switch (message.id) {
    case MessageType.InfoRequest:
      break;
    case MessageType.DeviceNotificationRequest:
      pushUint16(bytes, message.delay);
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
    case MessageType.DeviceNotificationResponse:
      return {
        id,
        status: reader.readUInt8()
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
          usbPowerState: payloadReader.readUInt8()
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
