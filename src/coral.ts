import { EventEmitter } from "events";
import noble, { Peripheral } from "@stoprocent/noble";
import { CoralDeviceKind, DEFAULT_NOTIFICATION_INTERVAL_MS } from "./constants";
import { CoralConnection, matchesCoralService } from "./connection";
import { CoralDevice, CoralDeviceInfo, ColorSensorDevice, DoubleMotorDevice, RemoteDevice, SingleMotorDevice } from "./devices";
import { mapProductToKind } from "./protocol";

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
    await this.startScanning();
  }

  stop(): void {
    if (!this.scanning) {
      return;
    }
    this.scanning = false;
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

  private async handleDiscover(peripheral: Peripheral): Promise<void> {
    if (!matchesCoralService(peripheral)) {
      return;
    }
    if (this.discovered.has(peripheral.id)) {
      return;
    }
    try {
      const device = await this.prepareDevice(peripheral);
      if (device) {
        this.discovered.add(peripheral.id);
        this.emit("discover", device);
      }
    } catch (error) {
      peripheral.disconnect();
    }
  }

  private async prepareDevice(peripheral: Peripheral): Promise<CoralDevice | null> {
    const connection = new CoralConnection(peripheral);
    await connection.open();
    const info = await connection.requestInfo();
    const kind = mapProductToKind(info.productGroupDevice);
    if (kind === "unknown") {
      connection.disconnect();
      return null;
    }
    await connection.enableNotifications(DEFAULT_NOTIFICATION_INTERVAL_MS);
    const deviceInfo: CoralDeviceInfo = {
      name: peripheral.advertisement?.localName,
      firmwareVersion: [info.firmwareMajor, info.firmwareMinor, info.firmwareBuild],
      bootloaderVersion: [info.bootloaderMajor, info.bootloaderMinor, info.bootloaderBuild],
      uuid: peripheral.uuid
    };

    return createDeviceInstance(kind, connection, deviceInfo);
  }
}

function createDeviceInstance(
  kind: CoralDeviceKind,
  connection: CoralConnection,
  info: CoralDeviceInfo
): CoralDevice {
  switch (kind) {
    case "SingleMotor":
      return new SingleMotorDevice(connection, kind, info);
    case "DoubleMotor":
      return new DoubleMotorDevice(connection, kind, info);
    case "ColorSensor":
      return new ColorSensorDevice(connection, kind, info);
    case "Remote":
      return new RemoteDevice(connection, kind, info);
    default:
      return new SingleMotorDevice(connection, kind, info);
  }
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
