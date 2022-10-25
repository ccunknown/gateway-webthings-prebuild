/**
 * mock-adapter.ts - Mock Adapter.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { Adapter, AddonManagerProxy, Device } from 'gateway-addon';
export declare class MockAdapter extends Adapter {
    private port;
    private app;
    private server;
    private pairDeviceId;
    private pairDeviceDescription;
    constructor(addonManager: AddonManagerProxy, packageName: string);
    /**
     * For cleanup between tests. Returns a promise which resolves
     * when all of the state has been cleared.
     */
    clearState(): Promise<Device[]>;
    /**
     * Add a MockDevice to the MockAdapter
     *
     * @param {String} deviceId ID of the device to add.
     * @return {Promise} which resolves to the device added.
     */
    addDevice(deviceId: string, deviceDescription: Record<string, unknown>): Promise<Device>;
    /**
     * Remove a MockDevice from the MockAdapter.
     *
     * @param {String} deviceId ID of the device to remove.
     * @return {Promise} which resolves to the device removed.
     */
    removeDevice(deviceId: string): Promise<Device>;
    pairDevice(deviceId: string, deviceDescription: Record<string, unknown>): void;
    unpairDevice(_deviceId: string): void;
    startPairing(_timeoutSeconds: number): void;
    cancelPairing(): void;
    removeThing(device: Device): void;
    cancelRemoveThing(device: Device): void;
    setPin(_deviceId: string, pin: string): Promise<void>;
    setCredentials(_deviceId: string, username: string, password: string): Promise<void>;
    unload(): Promise<void>;
    getPort(): number;
}
declare function loadMockAdapter(addonManager: AddonManagerProxy): void;
export default loadMockAdapter;
//# sourceMappingURL=index.d.ts.map