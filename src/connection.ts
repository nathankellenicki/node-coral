import { EventEmitter } from "events";
import noble, { Characteristic, Peripheral, Service } from "@stoprocent/noble";
import {
  CoralCommand,
  CoralIncomingMessage,
  DeviceNotificationMessage,
  DeviceSensorPayload,
  InfoResponse,
  MessageType,
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

const DEFAULT_TIMEOUT_MS = 3_000;

type PendingRequest = {
  resolve: (msg: CoralIncomingMessage) => void;
  reject: (err: Error) => void;
  timeout: NodeJS.Timeout;
};

export class CoralConnection extends EventEmitter {
  private writeChar?: Characteristic;
  private notifyChar?: Characteristic;
  private readonly pending = new Map<string, PendingRequest[]>();
  private readonly handleDataBound = (data: Buffer) => this.handleIncoming(data);

  constructor(public readonly peripheral: Peripheral) {
    super();
  }

  async open(): Promise<void> {
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
      this.notifyChar.removeListener("data", this.handleDataBound);
    }
    this.peripheral.disconnect();
    for (const [key] of this.pending) {
      this.rejectPending(key, new Error("Connection closed"));
    }
    this.pending.clear();
  }

  private handleIncoming(raw: Buffer): void {
    const parsed = decodeMessage(raw);
    if (!parsed) {
      return;
    }

    const responseKey = getResponseKey(parsed);
    const pendingQueue = this.pending.get(responseKey);
    if (pendingQueue && pendingQueue.length > 0) {
      const request = pendingQueue.shift();
      if (request) {
        request.resolve(parsed);
      }
      if (pendingQueue.length === 0) {
        this.pending.delete(responseKey);
      }
      return;
    }

    if (parsed.id === MessageType.DeviceNotification) {
      const notification = parsed as DeviceNotificationMessage;
      notification.deviceData.forEach((payload) => this.emit("notification", [payload]));
    } else {
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
}

export function matchesCoralService(peripheral: Peripheral): boolean {
  const services = peripheral.advertisement?.serviceUuids ?? [];
  const canonical = normalizeUuid(CORAL_SERVICE_UUID);
  return services.some((uuid) => normalizeUuid(uuid) === canonical || uuid.toLowerCase() === CORAL_SERVICE_SHORT);
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

async function writeWithoutResponse(characteristic: Characteristic, data: Buffer): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    characteristic.write(data, true, (err) => {
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
