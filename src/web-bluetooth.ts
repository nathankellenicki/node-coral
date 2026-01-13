export type WebBluetoothEvent = { target?: unknown };

export type WebBluetoothRemoteGATTCharacteristic = {
  uuid: string;
  value?: DataView;
  startNotifications(): Promise<WebBluetoothRemoteGATTCharacteristic>;
  writeValueWithoutResponse(value: ArrayBuffer | ArrayBufferView): Promise<void>;
  addEventListener(type: "characteristicvaluechanged", listener: (event: WebBluetoothEvent) => void): void;
  removeEventListener(type: "characteristicvaluechanged", listener: (event: WebBluetoothEvent) => void): void;
};

export type WebBluetoothRemoteGATTService = {
  getCharacteristic(uuid: string): Promise<WebBluetoothRemoteGATTCharacteristic>;
};

export type WebBluetoothRemoteGATTServer = {
  connected: boolean;
  connect(): Promise<WebBluetoothRemoteGATTServer>;
  disconnect(): void;
  getPrimaryService(uuid: string): Promise<WebBluetoothRemoteGATTService>;
};

export type WebBluetoothDevice = {
  id: string;
  name?: string;
  gatt?: WebBluetoothRemoteGATTServer;
  addEventListener?(type: "gattserverdisconnected", listener: (event: WebBluetoothEvent) => void): void;
  removeEventListener?(type: "gattserverdisconnected", listener: (event: WebBluetoothEvent) => void): void;
};

export type WebBluetoothRequestDeviceOptions = {
  filters?: Array<{ services: string[] }>;
  optionalServices?: string[];
  acceptAllDevices?: boolean;
};

export type WebBluetooth = {
  requestDevice(options: WebBluetoothRequestDeviceOptions): Promise<WebBluetoothDevice>;
};

export function getWebBluetooth(): WebBluetooth | undefined {
  const nav = globalThis as { navigator?: { bluetooth?: WebBluetooth } };
  return nav.navigator?.bluetooth;
}
