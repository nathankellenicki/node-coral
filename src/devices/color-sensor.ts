import { CoralDevice } from "./base";
import { DeviceSensorPayload } from "../protocol";

export class ColorSensorDevice extends CoralDevice {
  protected handleNotification(payload: DeviceSensorPayload[]): void {
    super.handleNotification(payload);
  }
}
