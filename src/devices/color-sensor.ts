import { CoralDevice } from "./base";
import { DeviceSensorPayload } from "../protocol";

/**
 * A Coral color sensor device.
 *
 * Color readings are emitted via the `"color"` event as
 * {@link ColorSensorPayload} objects after connecting.
 */
export class ColorSensorDevice extends CoralDevice {
  protected handleNotification(payload: DeviceSensorPayload[]): void {
    super.handleNotification(payload);
  }
}
