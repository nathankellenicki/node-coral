import { CoralDevice } from "./base";
import { DeviceSensorPayload } from "../protocol";

export class ControllerDevice extends CoralDevice {
  protected handleNotification(payload: DeviceSensorPayload[]): void {
    super.handleNotification(payload);
  }
}
