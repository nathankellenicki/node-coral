import { CoralDevice } from "../devices/base";
import { CoralDeviceKind } from "../constants";
import { DeviceSensorPayload } from "../protocol";
import { WelfordStats } from "./welford";

const SENSOR_EVENTS = [
  "battery", "motor", "motor-gesture", "color", "joystick",
  "button", "motion", "motion-gesture", "tag"
];

/** A point-in-time snapshot of stats for a single sensor stream. */
export interface SensorSnapshot {
  sensorKey: string;
  sensorKind: string;
  rate: number;
  rawCount: number;
  dedupCount: number;
  meanInterval: number;
  stddev: number;
  minInterval: number;
  maxInterval: number;
  jitterRatio: number;
  dropRate: number;
}

type SensorState = {
  stats: WelfordStats;
  rawCount: number;
  dedupCount: number;
  lastRawTime: number | null;
};

/**
 * Tracks packet timing and quality statistics for a single Coral device.
 *
 * Automatically attaches to the device's `"raw-notification"` stream and
 * per-sensor events on construction. Call {@link snapshot} at any time to
 * retrieve current statistics, and {@link stop} to detach all listeners.
 */
export class DeviceTracker {
  /** The kind of device as a string (e.g. `"SingleMotor"`). */
  readonly deviceKind: string;

  private readonly sensors = new Map<string, SensorState>();
  private readonly startTime: number;
  private readonly handleRawBound: (payload: DeviceSensorPayload[]) => void;
  private readonly sensorHandlers: Array<{ event: string; handler: (payload: DeviceSensorPayload) => void }>;
  private stopped = false;

  constructor(public readonly device: CoralDevice) {
    this.deviceKind = CoralDeviceKind[device.kind] ?? `unknown(${device.kind})`;
    this.startTime = performance.now();

    this.handleRawBound = (payload) => this.handleRawNotification(payload);
    device.on("raw-notification", this.handleRawBound);

    this.sensorHandlers = SENSOR_EVENTS.map((event) => {
      const handler = (payload: DeviceSensorPayload) => this.handleSensorEvent(payload);
      device.on(event, handler);
      return { event, handler };
    });
  }

  /** Return a snapshot of statistics for every tracked sensor stream. */
  snapshot(): SensorSnapshot[] {
    const elapsedSec = (performance.now() - this.startTime) / 1000;
    const result: SensorSnapshot[] = [];
    for (const [key, state] of this.sensors) {
      const sensorKind = key.includes(":") ? key.split(":")[0]! : key;
      const rate = elapsedSec > 0 ? state.rawCount / elapsedSec : 0;
      const jitterRatio = state.stats.mean > 0 ? state.stats.stddev / state.stats.mean : 0;
      const dropRate = state.rawCount > 0
        ? ((state.rawCount - state.dedupCount) / state.rawCount) * 100
        : 0;
      result.push({
        sensorKey: key,
        sensorKind,
        rate,
        rawCount: state.rawCount,
        dedupCount: state.dedupCount,
        meanInterval: state.stats.mean,
        stddev: state.stats.stddev,
        minInterval: Number.isFinite(state.stats.min) ? state.stats.min : 0,
        maxInterval: Number.isFinite(state.stats.max) ? state.stats.max : 0,
        jitterRatio,
        dropRate
      });
    }
    return result;
  }

  /** Remove all event listeners and stop tracking. */
  stop(): void {
    if (this.stopped) return;
    this.stopped = true;
    this.device.off("raw-notification", this.handleRawBound);
    for (const { event, handler } of this.sensorHandlers) {
      this.device.off(event, handler);
    }
  }

  private getSensorKey(item: DeviceSensorPayload): string {
    switch (item.kind) {
      case "motor":
      case "motor-gesture":
        return `${item.kind}:${item.motorBitMask}`;
      default:
        return item.kind;
    }
  }

  private getSensorState(key: string): SensorState {
    let state = this.sensors.get(key);
    if (!state) {
      state = { stats: new WelfordStats(), rawCount: 0, dedupCount: 0, lastRawTime: null };
      this.sensors.set(key, state);
    }
    return state;
  }

  private handleRawNotification(payload: DeviceSensorPayload[]): void {
    const now = performance.now();
    for (const item of payload) {
      const key = this.getSensorKey(item);
      const state = this.getSensorState(key);
      state.rawCount++;
      if (state.lastRawTime !== null) {
        state.stats.push(now - state.lastRawTime);
      }
      state.lastRawTime = now;
    }
  }

  private handleSensorEvent(payload: DeviceSensorPayload): void {
    const key = this.getSensorKey(payload);
    const state = this.getSensorState(key);
    state.dedupCount++;
  }
}
