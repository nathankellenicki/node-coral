import { EventEmitter } from "events";
import noble, { Peripheral } from "@stoprocent/noble";
import { CoralDeviceKind } from "./constants";
import { CoralConnection, matchesCoralService } from "./connection";
import {
  CoralDevice,
  CoralDeviceInfo,
  ColorSensorDevice,
  ControllerDevice,
  DoubleMotorDevice,
  SingleMotorDevice
} from "./devices";

export interface CoralDiscoverEventMap {
  discover: (device: CoralDevice) => void;
}

export class Coral extends EventEmitter {
  private scanning = false;
  private readonly discovered = new Set<string>();
  private readonly handleDiscoverBound = (peripheral: Peripheral) => {
    void this.handleDiscover(peripheral);
  };

  constructor(private readonly adapter = noble) {
    super();
  }

  async scan(): Promise<void> {
    if (this.scanning) {
      return;
    }
    this.scanning = true;
    this.adapter.on("discover", this.handleDiscoverBound);
    try {
      await this.startScanning();
    } catch (error) {
      this.adapter.removeListener("discover", this.handleDiscoverBound);
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
    this.adapter.removeListener("discover", this.handleDiscoverBound);
    try {
      this.adapter.stopScanning();
    } catch (error) {
      // Ignore stop errors; adapter may already be stopped.
    }
  }

  private async startScanning(): Promise<void> {
    if (this.adapter.state === "poweredOn") {
      await beginScanning(this.adapter);
      return;
    }
    await new Promise<void>((resolve, reject) => {
      const cleanup = () => {
        this.adapter.removeListener("stateChange", handleStateChange);
      };
      const handleStateChange = (state: string) => {
        if (state === "poweredOn") {
          cleanup();
          beginScanning(this.adapter).then(resolve).catch(reject);
        } else if (state === "unauthorized" || state === "unsupported") {
          cleanup();
          reject(new Error(`Bluetooth adapter is ${state}`));
        }
      };
      this.adapter.on("stateChange", handleStateChange);
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
  const companyIdLittle = data.readUInt16LE(0);
  const companyIdBig = data.readUInt16BE(0);
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
    details.color = payload.readInt8(2);
  }
  const tagLow = payload[3];
  const tagHigh = payload[4];
  if (tagLow !== undefined && tagHigh !== undefined) {
    details.tag = tagLow | (tagHigh << 8);
  }
  return details;
}

async function beginScanning(adapter: typeof noble): Promise<void> {
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
