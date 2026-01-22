import { Coral, ControllerDevice, DoubleMotorDevice, SingleMotorDevice, ColorSensorDevice } from "../dist/index.js";

const coral = new Coral();

coral.on("discover", async (device) => { // Wait to discover a device
  console.log(
    `Discovered ${device.info.name} / ${device.info.uuid} (color=${device.info.color ?? "n/a"} tag=${device.info.tag ?? "n/a"})`
  );
  // Connect to the device
  await device.connect();
  console.log(`Connected to ${device.info.name}`);

  device.on("disconnect", () => {
    console.log(`Device ${device.info.name} disconnected`);
  });

  // DoubleMotorDevice sensors
  if (device instanceof DoubleMotorDevice) {
    device.on("motion", (motion) => {
      console.log(motion);
    });

    device.on("motor", (motor) => {
      console.log(motor);
    });
  }

  // SingleMotorDevice sensors
  if (device instanceof SingleMotorDevice) {
    device.on("motor", (motor) => {
      console.log(motor);
    });
  }

  // ControllerDevice sensors
  if (device instanceof ControllerDevice) {
    device.on("joystick", (joystick) => {
      console.log(joystick);
    });
  }

  // ColorSensorDevice sensors
  if (device instanceof ColorSensorDevice) {
    device.on("color", (color) => {
      console.log(color);
    });
  }
});

coral.scan(); // Start scanning for Coral devices
console.log("Scanning for Coral devices...");
