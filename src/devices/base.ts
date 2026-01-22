import { EventEmitter } from "../event-emitter";
import { CoralDeviceKind, DEFAULT_NOTIFICATION_INTERVAL_MS } from "../constants";
import { CoralConnection } from "../connection";
import { DeviceSensorPayload, mapProductToKind } from "../protocol";

export interface CoralDeviceInfo {
  name?: string;
  firmwareVersion: [number, number, number];
  bootloaderVersion: [number, number, number];
  uuid: string;
  color?: number;
  tag?: number;
}

export abstract class CoralDevice extends EventEmitter {
  protected readonly handleNotificationBound = (payload: DeviceSensorPayload[]) => this.handleNotification(payload);
  private readonly handleConnectionDisconnectBound = () => this.handleConnectionDisconnect();
  private isConnected = false;
  private notificationsAttached = false;
  private readonly lastPayloads = new Map<string, DeviceSensorPayload>();

  constructor(
    protected readonly connection: CoralConnection,
    public readonly kind: CoralDeviceKind,
    public readonly info: CoralDeviceInfo
  ) {
    super();
  }

  get connected(): boolean {
    return this.isConnected;
  }

  async connect(): Promise<void> {
    if (this.isConnected) {
      return;
    }
    try {
      await this.connection.open();
      const info = await this.connection.requestInfo();
      const reportedKind = mapProductToKind(info.productGroupDevice);
      if (reportedKind === "unknown" || reportedKind !== this.kind) {
        throw new Error(`Discovered device reported unexpected type '${reportedKind}'`);
      }
      this.info.firmwareVersion = [info.firmwareMajor, info.firmwareMinor, info.firmwareBuild];
      this.info.bootloaderVersion = [info.bootloaderMajor, info.bootloaderMinor, info.bootloaderBuild];
      if (!this.notificationsAttached) {
        this.connection.on("notification", this.handleNotificationBound);
        this.connection.on("disconnect", this.handleConnectionDisconnectBound);
        this.notificationsAttached = true;
      }
      await this.connection.enableNotifications(DEFAULT_NOTIFICATION_INTERVAL_MS);
      this.isConnected = true;
    } catch (error) {
      if (this.notificationsAttached && !this.isConnected) {
        this.connection.off("notification", this.handleNotificationBound);
        this.connection.off("disconnect", this.handleConnectionDisconnectBound);
        this.notificationsAttached = false;
      }
      this.connection.disconnect();
      throw error;
    }
  }

  disconnect(): void {
    if (this.notificationsAttached) {
      this.connection.off("notification", this.handleNotificationBound);
      this.connection.off("disconnect", this.handleConnectionDisconnectBound);
      this.notificationsAttached = false;
    }
    this.connection.disconnect();
    this.isConnected = false;
    this.lastPayloads.clear();
    this.emit("disconnect");
  }

  sleep(timeMs: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, timeMs));
  }

  protected handleNotification(payload: DeviceSensorPayload[]): void {
    payload.forEach((item) => {
      if (!this.hasPayloadChanged(item)) {
        return;
      }
      this.emit("notification", item);
      switch (item.kind) {
        case "battery":
          this.emit("battery", item);
          break;
        case "motor":
          this.emit("motor", item);
          break;
        case "motor-gesture":
          this.emit("motor-gesture", item);
          break;
        case "color":
          this.emit("color", item);
          break;
        case "joystick":
          this.emit("joystick", item);
          break;
        case "button":
          this.emit("button", item);
          break;
        case "motion-sensor":
          this.emit("motion", item);
          break;
        case "motion-gesture":
          this.emit("motion-gesture", item);
          break;
        case "tag":
          this.emit("tag", item);
          break;
        default:
          break;
      }
    });
  }

  private hasPayloadChanged(payload: DeviceSensorPayload): boolean {
    const key = this.getPayloadKey(payload);
    const previous = this.lastPayloads.get(key);
    if (previous && this.arePayloadsEqual(previous, payload)) {
      return false;
    }
    this.lastPayloads.set(key, this.clonePayload(payload));
    return true;
  }

  private getPayloadKey(payload: DeviceSensorPayload): string {
    switch (payload.kind) {
      case "motor":
      case "motor-gesture":
        return `${payload.kind}:${payload.motorBitMask}`;
      default:
        return payload.kind;
    }
  }

  private arePayloadsEqual(a: DeviceSensorPayload, b: DeviceSensorPayload): boolean {
    if (a.kind !== b.kind) {
      return false;
    }
    const aKeys = Object.keys(a) as (keyof typeof a)[];
    const bKeys = Object.keys(b) as (keyof typeof b)[];
    if (aKeys.length !== bKeys.length) {
      return false;
    }
    return aKeys.every((key) =>
      Object.prototype.hasOwnProperty.call(b, key) && a[key] === (b as typeof a)[key]
    );
  }

  private clonePayload<T extends DeviceSensorPayload>(payload: T): T {
    return { ...payload };
  }

  private handleConnectionDisconnect(): void {
    if (this.notificationsAttached) {
      this.connection.off("notification", this.handleNotificationBound);
      this.connection.off("disconnect", this.handleConnectionDisconnectBound);
      this.notificationsAttached = false;
    }
    this.isConnected = false;
    this.lastPayloads.clear();
    this.emit("disconnect");
  }
}
