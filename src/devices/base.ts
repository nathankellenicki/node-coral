import { EventEmitter } from "events";
import { CoralDeviceKind } from "../constants";
import { CoralConnection } from "../connection";
import { DeviceSensorPayload } from "../protocol";

export interface CoralDeviceInfo {
  name?: string;
  firmwareVersion: [number, number, number];
  bootloaderVersion: [number, number, number];
  uuid: string;
}

export abstract class CoralDevice extends EventEmitter {
  protected readonly handleNotificationBound = (payload: DeviceSensorPayload[]) => this.handleNotification(payload);

  constructor(
    protected readonly connection: CoralConnection,
    public readonly kind: CoralDeviceKind,
    public readonly info: CoralDeviceInfo
  ) {
    super();
    this.connection.on("notification", this.handleNotificationBound);
  }

  disconnect(): void {
    this.connection.off("notification", this.handleNotificationBound);
    this.connection.disconnect();
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
