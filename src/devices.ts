import { EventEmitter } from "events";
import { CoralDeviceKind } from "./constants";
import { CoralConnection } from "./connection";
import {
  ButtonPayload,
  ColorSensorPayload,
  DeviceSensorPayload,
  JoystickPayload,
  MotionSensorPayload,
  MotorBits,
  MotorMoveDirection,
  createMotorRunCommand,
  createMotorSetDutyCycleCommand,
  createMotorSetSpeedCommand
} from "./protocol";

export type MotorPort = "left" | "right" | "both";
export type MotorDirection = "Cw" | "Ccw" | "Shortest" | "Longest";

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

export class SingleMotorDevice extends CoralDevice {
  async setMotorSpeed(speed: number): Promise<void> {
    await this.connection.request(createMotorSetSpeedCommand(MotorBits.Left, clampSpeed(speed)));
  }

  async setMotorPower(power: number): Promise<void> {
    await this.connection.request(createMotorSetDutyCycleCommand(MotorBits.Left, clampSpeed(power)));
  }

  async startMotor(direction: MotorDirection = "Cw"): Promise<void> {
    await this.connection.request(createMotorRunCommand(MotorBits.Left, directionToEnum(direction)));
  }
}

export class DoubleMotorDevice extends CoralDevice {
  async setMotorSpeed(port: MotorPort, speed: number): Promise<void> {
    await this.connection.request(createMotorSetSpeedCommand(portToBits(port), clampSpeed(speed)));
  }

  async setMotorSpeeds(left: number, right: number): Promise<void> {
    await this.setMotorSpeed("left", left);
    await this.setMotorSpeed("right", right);
  }

  async setMotorPower(port: MotorPort, power: number): Promise<void> {
    await this.connection.request(createMotorSetDutyCycleCommand(portToBits(port), clampSpeed(power)));
  }

  async setMotorPowers(left: number, right: number): Promise<void> {
    await this.setMotorPower("left", left);
    await this.setMotorPower("right", right);
  }

  async startMotor(port: MotorPort, direction: MotorDirection = "Cw"): Promise<void> {
    await this.connection.request(createMotorRunCommand(portToBits(port), directionToEnum(direction)));
  }
}

export class RemoteDevice extends CoralDevice {
  protected handleNotification(payload: DeviceSensorPayload[]): void {
    super.handleNotification(payload);
  }
}

export class ColorSensorDevice extends CoralDevice {
  protected handleNotification(payload: DeviceSensorPayload[]): void {
    super.handleNotification(payload);
  }
}

function clampSpeed(speed: number): number {
  return Math.max(-100, Math.min(100, Math.round(speed)));
}

function portToBits(port: MotorPort): MotorBits {
  switch (port) {
    case "left":
      return MotorBits.Left;
    case "right":
      return MotorBits.Right;
    case "both":
      return MotorBits.Both;
    default:
      return MotorBits.Left;
  }
}

function directionToEnum(direction: MotorDirection): MotorMoveDirection {
  switch (direction) {
    case "Ccw":
      return MotorMoveDirection.Ccw;
    case "Shortest":
      return MotorMoveDirection.Shortest;
    case "Longest":
      return MotorMoveDirection.Longest;
    case "Cw":
    default:
      return MotorMoveDirection.Cw;
  }
}
