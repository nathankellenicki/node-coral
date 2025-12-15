import { EventEmitter } from "events";
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
  private isConnected = false;
  private notificationsAttached = false;

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
        this.notificationsAttached = true;
      }
      await this.connection.enableNotifications(DEFAULT_NOTIFICATION_INTERVAL_MS);
      this.isConnected = true;
    } catch (error) {
      if (this.notificationsAttached && !this.isConnected) {
        this.connection.off("notification", this.handleNotificationBound);
        this.notificationsAttached = false;
      }
      this.connection.disconnect();
      throw error;
    }
  }

  disconnect(): void {
    if (this.notificationsAttached) {
      this.connection.off("notification", this.handleNotificationBound);
      this.notificationsAttached = false;
    }
    this.connection.disconnect();
    this.isConnected = false;
  }

  sleep(timeMs: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, timeMs));
  }

  protected handleNotification(payload: DeviceSensorPayload[]): void {
    payload.forEach((item) => {
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
}
