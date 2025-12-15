import { EventEmitter } from "events";
import assert from "node:assert/strict";
import type { CoralConnection } from "../../../src/connection";
import type { CoralDeviceInfo } from "../../../src/devices";
import {
  CommandStatus,
  CoralCommand,
  CoralIncomingMessage,
  InfoResponse,
  MessageType,
  ProductGroupDevice,
  encodeMessage
} from "../../../src/protocol";

export class MockConnection extends EventEmitter {
  public readonly writes: Buffer[] = [];
  constructor(private readonly product: ProductGroupDevice = ProductGroupDevice.CoralSingleMotor) {
    super();
  }

  async request(command: CoralCommand): Promise<CoralIncomingMessage> {
    this.writes.push(encodeMessage(command));
    return { id: MessageType.LightColorResult, status: CommandStatus.Completed } as CoralIncomingMessage;
  }

  async open(): Promise<void> {
    // no-op for unit tests
  }

  async requestInfo(): Promise<InfoResponse> {
    return {
      id: MessageType.InfoResponse,
      rpcMajor: 1,
      rpcMinor: 0,
      rpcBuild: 0,
      firmwareMajor: 1,
      firmwareMinor: 0,
      firmwareBuild: 0,
      bootloaderMajor: 1,
      bootloaderMinor: 0,
      bootloaderBuild: 0,
      maxPacketSize: 20,
      productGroupDevice: this.product
    };
  }

  async enableNotifications(): Promise<void> {
    // no-op for unit tests
  }

  disconnect(): void {
    // no-op for tests
  }

  popWrite(): Buffer {
    const next = this.writes.shift();
    assert.ok(next, "Expected connection to record bytes");
    return next;
  }

  clearWrites(): void {
    this.writes.length = 0;
  }

  assertDrained(): void {
    assert.strictEqual(this.writes.length, 0, "Unexpected extra command payloads");
  }
}

export const DEVICE_INFO: CoralDeviceInfo = {
  name: "Mock",
  firmwareVersion: [1, 0, 0],
  bootloaderVersion: [1, 0, 0],
  uuid: "mock-uuid"
};

export function createDeviceConnection(): CoralConnection {
  return new MockConnection() as unknown as CoralConnection;
}

export function assertBuffer(
  actual: Buffer,
  expectedLength: number,
  fill: (buffer: Buffer) => void
): void {
  assert.strictEqual(actual.length, expectedLength, `Expected ${expectedLength} bytes, received ${actual.length}`);
  const expected = Buffer.alloc(expectedLength);
  fill(expected);
  assert.deepStrictEqual(actual, expected);
}
