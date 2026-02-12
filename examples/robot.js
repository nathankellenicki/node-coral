import { Coral, DoubleMotorDevice, MovementDirection } from "../dist/index.js";

const coral = new Coral();

coral.on("discover", async (device) => { // Wait to discover a device
  if (device instanceof DoubleMotorDevice) {
    console.log(
      `Discovered ${device.info.name} / ${device.info.uuid} (color=${device.info.color ?? "n/a"} tag=${device.info.tag ?? "n/a"})`
    );
    coral.stop(); // Stop scanning once we discover an eligible device
    await device.connect();

    await device.setMovementSpeed(20);
    while (true) {
      await device.moveForDistance(360, MovementDirection.Forward)
      await device.sleep(1000);
      await device.turn(90, MovementDirection.Left);
      await device.sleep(1000);
      await device.moveForDistance(360, MovementDirection.Forward);
      await device.sleep(1000);
      await device.turn(90, MovementDirection.Right);
      await device.sleep(1000);
      await device.moveForDistance(360, MovementDirection.Forward)
      await device.sleep(1000);
      await device.turn(180, MovementDirection.Left);
      await device.sleep(1000);
    }
  }
});

coral.scan(); // Start scanning for devices
console.log("Scanning for Coral Double Motor...");
