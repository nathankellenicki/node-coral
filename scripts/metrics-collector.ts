import { InfluxDB, Point } from "@influxdata/influxdb-client";
import { Coral, DeviceTracker } from "../src/index";
import type { CoralDevice, CoralDeviceInfo, SensorSnapshot } from "../src/index";

const INFLUXDB_URL = process.env.INFLUXDB_URL || "http://localhost:8086";
const INFLUXDB_TOKEN = process.env.INFLUXDB_TOKEN || "openbrickproject-token";
const INFLUXDB_ORG = process.env.INFLUXDB_ORG || "openbrickproject";
const INFLUXDB_BUCKET = process.env.INFLUXDB_BUCKET || "openbrickproject";

const STATS_INTERVAL_MS = 2000;
const TERMINAL_INTERVAL_MS = 5000;

const SENSOR_EVENTS = [
  "battery", "motor", "motor-gesture", "color", "joystick",
  "button", "motion", "motion-gesture", "tag"
];

const influx = new InfluxDB({ url: INFLUXDB_URL, token: INFLUXDB_TOKEN });
const writeApi = influx.getWriteApi(INFLUXDB_ORG, INFLUXDB_BUCKET, "ms", {
  batchSize: 100,
  flushInterval: 500
});

const trackers = new Map<string, DeviceTracker>();
let shuttingDown = false;

interface SensorPayload {
  kind: string;
  motorBitMask?: number;
  [key: string]: unknown;
}

function writeSensorReading(info: CoralDeviceInfo, deviceKind: string, payload: SensorPayload): void {
  const point = new Point("sensor_reading")
    .tag("device_uuid", info.uuid)
    .tag("device_name", info.name || "unknown")
    .tag("device_kind", deviceKind)
    .tag("sensor_kind", payload.kind);

  if ((payload.kind === "motor" || payload.kind === "motor-gesture") && payload.motorBitMask !== undefined) {
    point.tag("motor_mask", String(payload.motorBitMask));
  }

  let hasFields = false;
  for (const [key, value] of Object.entries(payload)) {
    if (key === "kind" || key === "motorBitMask") continue;
    if (typeof value === "boolean") {
      point.intField(key, value ? 1 : 0);
      hasFields = true;
    } else if (typeof value === "number") {
      if (Number.isInteger(value)) {
        point.intField(key, value);
      } else {
        point.floatField(key, value);
      }
      hasFields = true;
    }
  }

  if (hasFields) {
    writeApi.writePoint(point);
  }
}

function writeSensorStats(info: CoralDeviceInfo, deviceKind: string, stat: SensorSnapshot): void {
  const point = new Point("sensor_stats")
    .tag("device_uuid", info.uuid)
    .tag("device_name", info.name || "unknown")
    .tag("device_kind", deviceKind)
    .tag("sensor_kind", stat.sensorKind)
    .floatField("rate", stat.rate)
    .intField("raw_count", stat.rawCount)
    .intField("dedup_count", stat.dedupCount)
    .floatField("mean_interval", stat.meanInterval)
    .floatField("stddev", stat.stddev)
    .floatField("min_interval", stat.minInterval)
    .floatField("max_interval", stat.maxInterval)
    .floatField("jitter_ratio", stat.jitterRatio)
    .floatField("drop_rate", stat.dropRate);

  writeApi.writePoint(point);
}

function printTerminalSummary(): void {
  const lines: string[] = [];
  lines.push("=== Coral Metrics Collector ===");
  lines.push(`Devices: ${trackers.size}  |  InfluxDB: ${INFLUXDB_URL}  |  Bucket: ${INFLUXDB_BUCKET}`);
  lines.push("");
  for (const [uuid, tracker] of trackers) {
    const name = tracker.device.info.name || "unknown";
    lines.push(`  ${name} (${uuid}) [${tracker.deviceKind}]`);
    const stats = tracker.snapshot();
    if (stats.length > 0) {
      for (const stat of stats) {
        const rate = stat.rate.toFixed(1);
        const mean = stat.meanInterval.toFixed(2);
        const jitter = stat.stddev.toFixed(2);
        const drop = stat.dropRate.toFixed(1);
        lines.push(
          `    ${stat.sensorKey}: rate=${rate} pkt/s, mean=${mean}ms, jitter=${jitter}ms, drop=${drop}%, raw=${stat.rawCount}, dedup=${stat.dedupCount}`
        );
      }
    } else {
      lines.push("    (no data yet)");
    }
  }
  lines.push("");
  lines.push("Press Ctrl+C to stop.");
  process.stdout.write("\x1B[2J\x1B[H");
  process.stdout.write(lines.join("\n") + "\n");
}

async function shutdown(): Promise<void> {
  if (shuttingDown) return;
  shuttingDown = true;

  clearInterval(terminalTimer);
  clearInterval(statsTimer);

  for (const [, tracker] of trackers) {
    tracker.stop();
    if (tracker.device.connected) {
      tracker.device.disconnect();
    }
  }

  await writeApi.close();

  console.log("\nShutdown complete.");
  process.exit(0);
}

function handleDiscover(device: CoralDevice): void {
  const uuid = device.info.uuid;
  if (trackers.has(uuid)) return;

  const tracker = new DeviceTracker(device);
  trackers.set(uuid, tracker);

  console.log(`Discovered ${device.info.name || "unnamed"} (${uuid}) [${tracker.deviceKind}]`);

  void (async () => {
    try {
      await device.connect();
      console.log(`Connected to ${device.info.name || uuid}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`Failed to connect to ${uuid}: ${message}`);
      tracker.stop();
      trackers.delete(uuid);
      return;
    }

    for (const eventName of SENSOR_EVENTS) {
      device.on(eventName, (payload: SensorPayload) => {
        writeSensorReading(device.info, tracker.deviceKind, payload);
      });
    }

    device.on("disconnect", () => {
      console.log(`Device disconnected: ${device.info.name || uuid}`);
      tracker.stop();
    });
  })();
}

const statsTimer = setInterval(() => {
  for (const [, tracker] of trackers) {
    for (const stat of tracker.snapshot()) {
      writeSensorStats(tracker.device.info, tracker.deviceKind, stat);
    }
  }
}, STATS_INTERVAL_MS);

const terminalTimer = setInterval(printTerminalSummary, TERMINAL_INTERVAL_MS);

process.on("SIGINT", () => void shutdown());

const coral = new Coral();
coral.on("discover", handleDiscover);
coral.scan();

console.log("Scanning for Coral devices... (all types)");
console.log(`InfluxDB: ${INFLUXDB_URL} | Org: ${INFLUXDB_ORG} | Bucket: ${INFLUXDB_BUCKET}`);
