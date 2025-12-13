# **node-coral** – A JavaScript/TypeScript module for LEGO Education Science ("Coral") devices

### Introduction

LEGO Education Science ("Coral") introduces a compact family of Bluetooth Low Energy devices that expose motors, sensors, and interactive controllers. `node-coral` enables you to programatically control them from Node.js, allowing you to create complex applications.

### Sample Usage

```javascript
const { Coral, SingleMotorDevice, DoubleMotorDevice } = require("node-coral");

const coral = new Coral();

coral.on("discover", async (device) => { // Wait to discover a device
  console.log(`Discovered ${device.info.name ?? device.info.uuid}!`);
  coral.stop(); // Stop scanning once we connect

  if (device instanceof SingleMotorDevice) {
    await device.setMotorSpeed(50);
    await device.runMotorForDegrees(720, "Cw");
    await device.runMotorForDegrees(720, "Ccw");
  } else if (device instanceof DoubleMotorDevice) {
    await device.setMovementSpeed(40);
    await device.moveForDegrees(360, "Forward");
    await device.moveForDegrees(360, "Backward");
  } else {
    console.log("This example only controls motor devices.");
    device.disconnect();
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
