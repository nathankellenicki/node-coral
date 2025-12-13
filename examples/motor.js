import { Coral, SingleMotorDevice, DoubleMotorDevice } from "../dist/index.js";

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