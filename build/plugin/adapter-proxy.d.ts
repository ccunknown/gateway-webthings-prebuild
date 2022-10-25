/**
 * @module AdapterProxy base class.
 *
 * Manages Adapter data model and business logic.
 */
/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { Adapter, Device } from 'gateway-addon';
import { Device as DeviceSchema } from 'gateway-addon/lib/schema';
import Deferred from '../deferred';
import { AddonManager } from '../addon-manager';
import Plugin from './plugin';
/**
 * Class used to describe an adapter from the perspective
 * of the gateway.
 */
export default class AdapterProxy extends Adapter {
    private plugin;
    deferredMock: (Deferred<Device | void, unknown> & {
        device: Device | null;
    }) | null;
    unloadCompletedPromise: Deferred<void, void> | null;
    private eventHandlers;
    constructor(addonManager: AddonManager, adapterId: string, name: string, packageName: string, plugin: Plugin);
    getEventHandlers(): Record<string, (...args: any[]) => void>;
    startPairing(timeoutSeconds: number): void;
    cancelPairing(): void;
    removeThing(device: Device): void;
    cancelRemoveThing(device: Device): void;
    sendMsg(methodType: number, data: Record<string, unknown>, deferred?: Deferred<unknown, unknown>): void;
    /**
     * Unloads an adapter.
     *
     * @returns a promise which resolves when the adapter has
     *          finished unloading.
     */
    unload(): Promise<void>;
    /**
     * Set the PIN for the given device.
     *
     * @param {String} deviceId ID of the device
     * @param {String} pin PIN to set
     *
     * @returns a promise which resolves when the PIN has been set.
     */
    setPin(deviceId: string, pin: string): Promise<void>;
    /**
     * Set the credentials for the given device.
     *
     * @param {String} deviceId ID of the device
     * @param {String} username Username to set
     * @param {String} password Password to set
     *
     * @returns a promise which resolves when the credentials have been set.
     */
    setCredentials(deviceId: string, username: string, password: string): Promise<void>;
    clearState(): Promise<void>;
    addDevice(deviceId: string, deviceDescription: DeviceSchema): Promise<void>;
    removeDevice(deviceId: string): Promise<void>;
    pairDevice(deviceId: string, deviceDescription: DeviceSchema): void;
    unpairDevice(deviceId: string): void;
}
//# sourceMappingURL=adapter-proxy.d.ts.map