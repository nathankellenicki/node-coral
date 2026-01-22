import type { Characteristic, Peripheral, Service } from "@stoprocent/noble";
import { EventEmitter } from "./event-emitter";
import { createDebug } from "./logger";
import { WebBluetoothDevice, WebBluetoothEvent, WebBluetoothRemoteGATTCharacteristic } from "./web-bluetooth";
import {
  CommandStatus,
  CoralCommand,
  CoralIncomingMessage,
  DeviceNotificationMessage,
  DeviceSensorPayload,
  InfoResponse,
  MessageType,
  ResponseStatus,
  createDeviceNotificationRequest,
  createInfoRequest,
  encodeMessage,
  decodeMessage,
  getRequestKey,
  getResponseKey
} from "./protocol";
import {
  CORAL_NOTIFY_CHAR_UUID,
  CORAL_SERVICE_UUID,
  CORAL_SERVICE_SHORT,
  CORAL_WRITE_CHAR_UUID,
  DEFAULT_NOTIFICATION_INTERVAL_MS
} from "./constants";

export type NotificationListener = (payload: DeviceSensorPayload[]) => void;

const DEFAULT_TIMEOUT_MS = 30_000;
const log = createDebug("node-coral:connection");
const logRaw = createDebug("node-coral:connection:raw");

type PendingRequest = {
  resolve: (msg: CoralIncomingMessage) => void;
  reject: (err: Error) => void;
  timeout: NodeJS.Timeout;
};

export class CoralConnection extends EventEmitter {
  private writeChar?: Characteristic | WebBluetoothRemoteGATTCharacteristic;
  private notifyChar?: Characteristic | WebBluetoothRemoteGATTCharacteristic;
  private readonly pending = new Map<string, PendingRequest[]>();
  private readonly handleDataBound = (data: Uint8Array) => this.handleIncoming(data);
  private readonly handleWebNotificationBound = (event: WebBluetoothEvent) => {
    const target = event.target as WebBluetoothRemoteGATTCharacteristic | null;
    const value = target?.value;
    if (!value) {
      return;
    }
    const data = new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
    this.handleIncoming(data);
  };
  private isOpen = false;

  constructor(public readonly peripheral: Peripheral | WebBluetoothDevice) {
    super();
  }

  async open(): Promise<void> {
    if (this.isOpen) {
      return;
    }
    if (isWebBluetoothDevice(this.peripheral)) {
      await this.openWeb(this.peripheral);
      this.isOpen = true;
      return;
    }
    await connectPeripheral(this.peripheral);
    const serviceIds = [normalizeUuid(CORAL_SERVICE_UUID)];
    const characteristicIds = [normalizeUuid(CORAL_WRITE_CHAR_UUID), normalizeUuid(CORAL_NOTIFY_CHAR_UUID)];
    const { characteristics } = await discoverCharacteristics(this.peripheral, serviceIds, characteristicIds);
    const writeChar = characteristics.find(({ uuid }) => normalizeUuid(uuid) === normalizeUuid(CORAL_WRITE_CHAR_UUID));
    const notifyChar = characteristics.find(({ uuid }) => normalizeUuid(uuid) === normalizeUuid(CORAL_NOTIFY_CHAR_UUID));
    if (!writeChar || !notifyChar) {
      throw new Error("Unable to locate Coral characteristics");
    }
    this.writeChar = writeChar;
    this.notifyChar = notifyChar;
    this.notifyChar.on("data", this.handleDataBound);
    await subscribe(this.notifyChar);
    this.isOpen = true;
  }

  private async openWeb(device: WebBluetoothDevice): Promise<void> {
    if (!device.gatt) {
      throw new Error("Bluetooth GATT is not available on this device");
    }
    const server = device.gatt.connected ? device.gatt : await device.gatt.connect();
    const service = await server.getPrimaryService(CORAL_SERVICE_UUID);
    const writeChar = await service.getCharacteristic(CORAL_WRITE_CHAR_UUID);
    const notifyChar = await service.getCharacteristic(CORAL_NOTIFY_CHAR_UUID);
    this.writeChar = writeChar;
    this.notifyChar = notifyChar;
    notifyChar.addEventListener("characteristicvaluechanged", this.handleWebNotificationBound);
    await notifyChar.startNotifications();
  }

  async request<T extends CoralIncomingMessage = CoralIncomingMessage>(
    command: CoralCommand,
    timeoutMs: number = DEFAULT_TIMEOUT_MS
  ): Promise<T> {
    if (!this.writeChar) {
      throw new Error("Connection is not ready");
    }
    const key = getRequestKey(command);
    const messagePromise = new Promise<T>((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.rejectPending(key, new Error(`Request '${key}' timed out`));
      }, timeoutMs);
      const entry: PendingRequest = {
        resolve: (msg) => {
          clearTimeout(timeout);
          resolve(msg as T);
        },
        reject: (err) => {
          clearTimeout(timeout);
          reject(err);
        },
        timeout
      };
      const queue = this.pending.get(key) ?? [];
      queue.push(entry);
      this.pending.set(key, queue);
    });

    log("sending command %s (%s) params=%o", formatMessageName(command.id), key, getMessageParams(command));
    await writeWithoutResponse(this.writeChar, encodeMessage(command));
    return messagePromise;
  }

  async requestInfo(): Promise<InfoResponse> {
    const response = await this.request<InfoResponse>(createInfoRequest());
    return response;
  }

  async enableNotifications(interval: number = DEFAULT_NOTIFICATION_INTERVAL_MS): Promise<void> {
    await this.request(createDeviceNotificationRequest(interval));
  }

  disconnect(): void {
    if (this.notifyChar) {
      if (isWebBluetoothCharacteristic(this.notifyChar)) {
        this.notifyChar.removeEventListener("characteristicvaluechanged", this.handleWebNotificationBound);
      } else {
        this.notifyChar.removeListener("data", this.handleDataBound);
      }
    }
    if (isWebBluetoothDevice(this.peripheral)) {
      this.peripheral.gatt?.disconnect();
    } else {
      this.peripheral.disconnect();
    }
    this.isOpen = false;
    for (const [key] of this.pending) {
      this.rejectPending(key, new Error("Connection closed"));
    }
    this.pending.clear();
  }

  private handleIncoming(raw: Uint8Array): void {
    logRaw("rx %s", formatHex(raw));
    const parsed = decodeMessage(raw);
    if (!parsed) {
      return;
    }

    const responseKey = getResponseKey(parsed);
    const pendingQueue = this.pending.get(responseKey);
    if (pendingQueue && pendingQueue.length > 0) {
      const request = pendingQueue.shift();
      if (request) {
        try {
          log("received response %s (%s) params=%o", formatMessageName(parsed.id), responseKey, getMessageParams(parsed));
          this.ensureSuccess(parsed);
          request.resolve(parsed);
        } catch (error) {
          request.reject(error instanceof Error ? error : new Error(String(error)));
        }
      }
      if (pendingQueue.length === 0) {
        this.pending.delete(responseKey);
      }
      return;
    }

    if (parsed.id === MessageType.DeviceNotification) {
      const notification = parsed as DeviceNotificationMessage;
      log("received notification %s params=%o", formatMessageName(parsed.id), getMessageParams(notification));
      this.emit("notification", notification.deviceData);
    } else {
      log("received message %s params=%o", formatMessageName(parsed.id), getMessageParams(parsed));
      this.emit("message", parsed);
    }
  }

  private rejectPending(key: string, error: Error): void {
    const queue = this.pending.get(key);
    if (!queue) {
      return;
    }
    while (queue.length) {
      const entry = queue.shift();
      if (entry) {
        clearTimeout(entry.timeout);
        entry.reject(error);
      }
    }
    this.pending.delete(key);
  }

  private ensureSuccess(message: CoralIncomingMessage): void {
    switch (message.id) {
      case MessageType.BeginFirmwareUpdateResponse:
      case MessageType.DeviceNotificationResponse:
        if (message.status !== ResponseStatus.Ack) {
          throw new Error(
            `Command ${MessageType[message.id]} failed with status ${ResponseStatus[message.status] ?? message.status}`
          );
        }
        return;
      case MessageType.LightColorResult:
      case MessageType.BeepResult:
      case MessageType.StopSoundResult:
      case MessageType.MotorResetRelativePositionResult:
      case MessageType.MotorSetSpeedResult:
      case MessageType.MotorSetDutyCycleResult:
      case MessageType.MotorRunResult:
      case MessageType.MotorRunForDegreesResult:
      case MessageType.MotorRunForTimeResult:
      case MessageType.MotorRunToAbsolutePositionResult:
      case MessageType.MotorRunToRelativePositionResult:
      case MessageType.MotorStopResult:
      case MessageType.MotorSetEndStateResult:
      case MessageType.MotorSetAccelerationResult:
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
        if (message.status !== CommandStatus.Completed) {
          throw new Error(
            `Command ${MessageType[message.id]} failed with status ${CommandStatus[message.status] ?? message.status}`
          );
        }
        return;
      default:
        return;
    }
  }
}

export function matchesCoralService(peripheral: Peripheral): boolean {
  const services = peripheral.advertisement?.serviceUuids ?? [];
  const canonical = normalizeUuid(CORAL_SERVICE_UUID);
  return services.some((uuid) => normalizeUuid(uuid) === canonical || uuid.toLowerCase() === CORAL_SERVICE_SHORT);
}

function isWebBluetoothDevice(device: Peripheral | WebBluetoothDevice): device is WebBluetoothDevice {
  return typeof (device as WebBluetoothDevice).gatt !== "undefined";
}

function isWebBluetoothCharacteristic(
  characteristic: Characteristic | WebBluetoothRemoteGATTCharacteristic
): characteristic is WebBluetoothRemoteGATTCharacteristic {
  return typeof (characteristic as WebBluetoothRemoteGATTCharacteristic).startNotifications === "function";
}

async function connectPeripheral(peripheral: Peripheral): Promise<void> {
  if (peripheral.state === "connected") {
    return;
  }
  await new Promise<void>((resolve, reject) => {
    peripheral.connect((err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

async function discoverCharacteristics(
  peripheral: Peripheral,
  serviceUUIDs: string[],
  characteristicUUIDs: string[]
): Promise<{ services: Service[]; characteristics: Characteristic[] }> {
  return new Promise((resolve, reject) => {
    peripheral.discoverSomeServicesAndCharacteristics(serviceUUIDs, characteristicUUIDs, (err, services, characteristics) => {
      if (err) {
        reject(err);
      } else {
        resolve({ services, characteristics });
      }
    });
  });
}

async function subscribe(characteristic: Characteristic): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    characteristic.subscribe((err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

async function writeWithoutResponse(
  characteristic: Characteristic | WebBluetoothRemoteGATTCharacteristic,
  data: Uint8Array
): Promise<void> {
  logRaw("tx %s", formatHex(data));
  if (isWebBluetoothCharacteristic(characteristic)) {
    await characteristic.writeValueWithoutResponse(data);
    return;
  }
  const payload = toNodeBuffer(data) as Buffer;
  await new Promise<void>((resolve, reject) => {
    characteristic.write(payload, true, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

function normalizeUuid(uuid: string): string {
  return uuid.replace(/-/g, "").toLowerCase();
}

function toNodeBuffer(data: Uint8Array): Buffer | Uint8Array {
  if (typeof Buffer !== "undefined" && !(data instanceof Buffer)) {
    return Buffer.from(data);
  }
  return data;
}

function formatHex(data: Uint8Array): string {
  return Array.from(data, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function formatMessageName(id: MessageType): string {
  return MessageType[id] ?? `${id}`;
}

function getMessageParams(message: CoralCommand | CoralIncomingMessage): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(message as Record<string, unknown>)) {
    if (key !== "id") {
      result[key] = value;
    }
  }
  return result;
}
