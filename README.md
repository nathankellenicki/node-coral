# **node-coral** – A JavaScript/TypeScript module for LEGO Education Science ("Coral") devices

### Introduction

LEGO Education Science ("Coral") introduces a compact family of Bluetooth Low Energy devices that expose motors, sensors, and interactive controllers. `node-coral` enables you to programatically control them from Node.js, allowing you to create complex applications.

### Sample Usage

```javascript
import { Coral, SingleMotorDevice, DoubleMotorDevice } from "node-coral";

const coral = new Coral();

coral.on("discover", async (device) => { // Wait to discover a device
  if (device instanceof SingleMotorDevice) {
    console.log(
      `Discovered ${device.info.name} / ${device.info.uuid} (color=${device.info.color ?? "n/a"} tag=${device.info.tag ?? "n/a"})`
    );
    coral.stop(); // Stop scanning once we discover an eligible device
    await device.connect();

    await device.setMotorSpeed(50);
    await device.runMotorForDegrees(720, "Cw");
    await device.runMotorForDegrees(720, "Ccw");

  }
});

coral.scan(); // Start scanning for Coral devices
console.log("Scanning for Coral devices...");

``` 

### Node.js Installation

Node.js v18+ is recommended.

```bash
npm install node-coral --save
```

`node-coral` relies on the `@stoprocent/noble` library. Ensure any prerequisites [documented here](https://github.com/stoprocent/noble?tab=readme-ov-file#prerequisites) are satisfied.

### Compatibility

| Device | Type | Notes |
| ------ | ---- | ----- |
| Coral Single Motor | Motor | Provides motor control plus position/speed notifications. |
| Coral Double Motor | Dual Motor & Movement | Adds high-level movement helpers (forward/back/turn) along with per-motor controls. |
| Coral Color Sensor | Sensor | Streams color/reflection data that can be consumed via device events. |
| Coral Controller | Controller | Exposes joystick events for interactive projects. |

Each device exposes typed payloads (`MotorNotificationPayload`, `JoystickPayload`, etc.) so that listening to notifications is ergonomically the same as issuing commands.

### Development

Clone the repo, install dependencies, and build the TypeScript sources:

```bash
npm install
npm run build
```

Hardware integration tests live under `tests/` and require actual Coral devices connected over BLE. Use `npm test:e2e` when you have the hardware powered on and nearby.
