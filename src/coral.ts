import type { Peripheral } from "@stoprocent/noble";
import { EventEmitter } from "./event-emitter";
import { CoralDeviceKind, CORAL_SERVICE_UUID } from "./constants";
import { CoralConnection, matchesCoralService } from "./connection";
import {
  CoralDevice,
  CoralDeviceInfo,
  ColorSensorDevice,
  ControllerDevice,
  DoubleMotorDevice,
  SingleMotorDevice
} from "./devices";
import { mapProductToKind } from "./protocol";
import { getWebBluetooth, WebBluetooth, WebBluetoothDevice } from "./web-bluetooth";

export interface CoralDiscoverEventMap {
  discover: (device: CoralDevice) => void;
}

type NobleAdapter = {
  state: string;
  on(event: "discover", listener: (peripheral: Peripheral) => void): void;
  on(event: "stateChange", listener: (state: string) => void): void;
  removeListener(event: "discover" | "stateChange", listener: (...args: any[]) => void): void;
  startScanning(serviceUUIDs: string[], allowDuplicates: boolean, callback: (err?: Error | null) => void): void;
  stopScanning(): void;
};

export class Coral extends EventEmitter {
  private scanning = false;
  private readonly discovered = new Set<string>();
  private readonly handleDiscoverBound = (peripheral: Peripheral) => {
    void this.handleDiscover(peripheral);
  };
  private adapter: NobleAdapter | undefined;

  constructor(adapter?: NobleAdapter) {
    super();
    this.adapter = adapter;
  }

  async scan(): Promise<void> {
    if (this.scanning) {
      return;
    }
    this.scanning = true;
    const webBluetooth = getWebBluetooth();
    if (webBluetooth) {
      try {
        await this.scanWeb(webBluetooth);
      } finally {
        this.scanning = false;
      }
      return;
    }
    const adapter = await this.getAdapter();
    adapter.on("discover", this.handleDiscoverBound);
    try {
      await this.startScanning(adapter);
    } catch (error) {
      adapter.removeListener("discover", this.handleDiscoverBound);
      this.scanning = false;
      throw error;
    }
  }

  stop(): void {
    if (!this.scanning) {
      return;
    }
    this.scanning = false;
    this.discovered.clear();
    if (this.adapter) {
      this.adapter.removeListener("discover", this.handleDiscoverBound);
      try {
        this.adapter.stopScanning();
      } catch (error) {
        // Ignore stop errors; adapter may already be stopped.
      }
    }
  }

  private async startScanning(adapter: NobleAdapter): Promise<void> {
    if (adapter.state === "poweredOn") {
      await beginScanning(adapter);
      return;
    }
    await new Promise<void>((resolve, reject) => {
      const cleanup = () => {
        adapter.removeListener("stateChange", handleStateChange);
      };
      const handleStateChange = (state: string) => {
        if (state === "poweredOn") {
          cleanup();
          beginScanning(adapter).then(resolve).catch(reject);
        } else if (state === "unauthorized" || state === "unsupported") {
          cleanup();
          reject(new Error(`Bluetooth adapter is ${state}`));
        }
      };
      adapter.on("stateChange", handleStateChange);
    });
  }

  private handleDiscover(peripheral: Peripheral): void {
    if (!matchesCoralService(peripheral)) {
      return;
    }
    if (this.discovered.has(peripheral.id)) {
      return;
    }
    const advertisement = parseManufacturerData(peripheral);
    if (!advertisement) {
      return;
    }
    const connection = new CoralConnection(peripheral);
    const deviceInfo: CoralDeviceInfo = {
      name: peripheral.advertisement?.localName,
      firmwareVersion: [0, 0, 0],
      bootloaderVersion: [0, 0, 0],
      uuid: peripheral.uuid,
      ...(advertisement.color !== undefined ? { color: advertisement.color } : {}),
      ...(advertisement.tag !== undefined ? { tag: advertisement.tag } : {})
    };
    const device = createDeviceInstance(advertisement.kind, connection, deviceInfo);
    this.discovered.add(peripheral.id);
    peripheral.once("disconnect", () => {
      this.discovered.delete(peripheral.id);
    });
    this.emit("discover", device);
  }

  private async scanWeb(webBluetooth: WebBluetooth): Promise<void> {
    try {
      const device = await webBluetooth.requestDevice({
        filters: [{ services: [CORAL_SERVICE_UUID] }],
        optionalServices: [CORAL_SERVICE_UUID]
      });
      if (this.discovered.has(device.id)) {
        return;
      }
      const identified = await this.identifyWebDevice(device);
      const kind = identified?.kind ?? "SingleMotor";
      const info = identified?.info ?? {
        ...(device.name ? { name: device.name } : {}),
        firmwareVersion: [0, 0, 0],
        bootloaderVersion: [0, 0, 0],
        uuid: device.id
      };
      const connection = identified?.connection ?? new CoralConnection(device);
      const coralDevice = createDeviceInstance(kind, connection, info);
      this.discovered.add(device.id);
      device.addEventListener?.("gattserverdisconnected", () => {
        this.discovered.delete(device.id);
      });
      this.emit("discover", coralDevice);
    } catch (error) {
      const maybeDomError = error as { name?: string } | undefined;
      if (maybeDomError?.name === "NotFoundError") {
        return;
      }
      throw error;
    }
  }

  private async identifyWebDevice(
    device: WebBluetoothDevice
  ): Promise<{ kind: CoralDeviceKind; info: CoralDeviceInfo; connection: CoralConnection } | null> {
    const connection = new CoralConnection(device);
    try {
      await connection.open();
      const info = await connection.requestInfo();
      const kind = mapProductToKind(info.productGroupDevice);
      if (kind === "unknown") {
        connection.disconnect();
        return null;
      }
      const deviceInfo: CoralDeviceInfo = {
        ...(device.name ? { name: device.name } : {}),
        firmwareVersion: [info.firmwareMajor, info.firmwareMinor, info.firmwareBuild],
        bootloaderVersion: [info.bootloaderMajor, info.bootloaderMinor, info.bootloaderBuild],
        uuid: device.id
      };
      return { kind, info: deviceInfo, connection };
    } catch (error) {
      connection.disconnect();
      throw error;
    }
  }

  private async getAdapter(): Promise<NobleAdapter> {
    if (this.adapter) {
      return this.adapter;
    }
    const module = await import("@stoprocent/noble");
    const adapter = (module as { default?: NobleAdapter }).default ?? (module as unknown as NobleAdapter);
    this.adapter = adapter;
    return adapter;
  }
}

function createDeviceInstance(kind: CoralDeviceKind, connection: CoralConnection, info: CoralDeviceInfo): CoralDevice {
  switch (kind) {
    case "SingleMotor":
      return new SingleMotorDevice(connection, kind, info);
    case "DoubleMotor":
      return new DoubleMotorDevice(connection, kind, info);
    case "ColorSensor":
      return new ColorSensorDevice(connection, kind, info);
    case "Controller":
      return new ControllerDevice(connection, kind, info);
    default:
      return new SingleMotorDevice(connection, kind, info);
  }
}

type AdvertisementDetails = {
  kind: CoralDeviceKind;
  color?: number;
  tag?: number;
};

const LEGO_COMPANY_IDENTIFIER = 0x0397;
const HARDWARE_KIND_MAP: Partial<Record<number, CoralDeviceKind>> = {
  0: "SingleMotor",
  1: "DoubleMotor",
  2: "ColorSensor",
  3: "Controller"
};

function parseManufacturerData(peripheral: Peripheral): AdvertisementDetails | null {
  const data = peripheral.advertisement?.manufacturerData;
  if (!data || data.length < 4) {
    return null;
  }
  const companyIdLittle = readUInt16LE(data, 0);
  const companyIdBig = readUInt16BE(data, 0);
  if (companyIdLittle !== LEGO_COMPANY_IDENTIFIER && companyIdBig !== LEGO_COMPANY_IDENTIFIER) {
    return null;
  }
  const payload = data.subarray(2);
  if (payload.length < 2 || payload[0] !== 0x02) {
    return null;
  }
  const hardwareByte = payload[1];
  if (hardwareByte === undefined) {
    return null;
  }
  const hardwareValue = hardwareByte & 0x7f;
  const kind = HARDWARE_KIND_MAP[hardwareValue];
  if (!kind) {
    return null;
  }
  const details: AdvertisementDetails = { kind };
  if (payload.length >= 3) {
    details.color = readInt8(payload, 2);
  }
  const tagLow = payload[3];
  const tagHigh = payload[4];
  if (tagLow !== undefined && tagHigh !== undefined) {
    details.tag = tagLow | (tagHigh << 8);
  }
  return details;
}

async function beginScanning(adapter: NobleAdapter): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    adapter.startScanning(["fd02"], false, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

function readUInt16LE(data: Uint8Array, offset: number): number {
  const low = data[offset] ?? 0;
  const high = data[offset + 1] ?? 0;
  return low | (high << 8);
}

function readUInt16BE(data: Uint8Array, offset: number): number {
  const high = data[offset] ?? 0;
  const low = data[offset + 1] ?? 0;
  return (high << 8) | low;
}

function readInt8(data: Uint8Array, offset: number): number {
  const value = data[offset] ?? 0;
  return value > 0x7f ? value - 0x100 : value;
}
