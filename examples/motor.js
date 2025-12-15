import { Coral, SingleMotorDevice, DoubleMotorDevice } from "../dist/index.js";

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
