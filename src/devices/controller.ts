import { CoralDevice } from "./base";
import { DeviceSensorPayload } from "../protocol";

/**
 * A Coral joystick controller device.
 *
 * Joystick input is emitted via the `"joystick"` event as
 * {@link JoystickPayload} objects after connecting. Button state is emitted
 * via the `"button"` event as {@link ButtonPayload} objects.
 */
export class ControllerDevice extends CoralDevice {
  protected handleNotification(payload: DeviceSensorPayload[]): void {
    super.handleNotification(payload);
  }
}
