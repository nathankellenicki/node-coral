import { Coral, DoubleMotorDevice, MotorEndState, MotorPort } from "../dist/index.js";

const coral = new Coral();

coral.on("discover", async (device) => { // Wait to discover a device
  if (device instanceof DoubleMotorDevice) {
    console.log(
      `Discovered ${device.info.name} / ${device.info.uuid} (color=${device.info.color ?? "n/a"} tag=${device.info.tag ?? "n/a"})`
    );
    coral.stop(); // Stop scanning once we discover an eligible device
    await device.connect();

    // Spin in place — left motor forward, right motor backward
    await device.moveAtDualSpeed(50, -50);
    await device.sleep(1500);
    await device.stopMoving();
    await device.sleep(500);

    // Gentle right arc — left motor faster than right
    await device.moveAtDualSpeedForDegrees(60, 20, 720);
    await device.sleep(500);

    // Straight burst then coast to a stop
    await device.setMotorEndState(MotorPort.Both, MotorEndState.Coast);
    await device.moveAtDualSpeed(80, 80);
    await device.sleep(1000);
    await device.stopMoving();
  }
});

coral.scan(); // Start scanning for Coral devices
console.log("Scanning for Coral Double Motor...");
