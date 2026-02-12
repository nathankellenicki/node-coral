import { Coral, ControllerDevice } from "../dist/index.js";

const coral = new Coral();

coral.on("discover", async (device) => { // Wait to discover a controller
  if (device instanceof ControllerDevice) {
    console.log(`Discovered controller ${device.info.uuid}`);
    coral.stop(); // Stop scanning once we discover an eligible device
    await device.connect();
    console.log("Connected! Move the joysticks or press the button.");

    device.on("joystick", (joystick) => {
      const left = joystick.leftPercent > 0 ? "FWD" : joystick.leftPercent < 0 ? "REV" : "---";
      const right = joystick.rightPercent > 0 ? "FWD" : joystick.rightPercent < 0 ? "REV" : "---";
      console.log(`Left: ${left} ${String(joystick.leftPercent).padStart(4)}%  Right: ${right} ${String(joystick.rightPercent).padStart(4)}%`);
    });

    device.on("button", (button) => {
      console.log(`Button ${button.pressed ? "PRESSED" : "released"}`);
    });

    device.on("disconnect", () => {
      console.log("Controller disconnected");
      process.exit(0);
    });
  }
});

coral.scan(); // Start scanning for Coral devices
console.log("Scanning for Coral Controller...");
