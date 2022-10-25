/**
 * Manages all of the add-ons used in the system.
 *
 * @module AddonManager
 */
/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/// <reference types="node" />
import { EventEmitter } from 'events';
import { Any, Device as DeviceSchema, Level } from 'gateway-addon/lib/schema';
import PluginServer from './plugin/plugin-server';
import Plugin from './plugin/plugin';
import { Adapter, APIHandler, Device, Notifier, Outlet } from 'gateway-addon';
interface Extension {
    extensions: {
        css?: string[];
        js?: string[];
    }[];
    resources: string[];
}
/**
 * @class AddonManager
 * @classdesc The AddonManager will load any add-ons from the 'addons'
 * directory. See loadAddons() for details.
 */
export declare class AddonManager extends EventEmitter {
    private adapters;
    private notifiers;
    private apiHandlers;
    private devices;
    private outlets;
    private extensions;
    private deferredAdd;
    private deferredRemovals;
    private removalTimeouts;
    private addonsLoaded;
    private installedAddons;
    private deferredWaitForAdapter;
    private pluginServer;
    private updateTimeout;
    private updateInterval;
    private pairingTimeout;
    getGatewayVersion(): string;
    getUserProfile(): Record<string, unknown>;
    getPreferences(): Record<string, unknown>;
    /**
     * Adds an adapter to the collection of adapters managed by AddonManager.
     * This function is typically called when loading add-ons.
     */
    addAdapter(adapter: Adapter): void;
    addNotifier(notifier: Notifier): void;
    addAPIHandler(handler: APIHandler): void;
    /**
     * @method addNewThing
     *
     * Initiates pairing on all of the adapters that support it.
     *
     * @returns A promise when the pairing process is complete.
     */
    addNewThing(pairingTimeout: number): Promise<void>;
    /**
     * @method cancelAddNewThing
     *
     * Cancels a previous addNewThing request.
     */
    cancelAddNewThing(): void;
    /**
     * @method cancelRemoveThing
     *
     * Cancels a previous removeThing request.
     */
    cancelRemoveThing(thingId: string): void;
    /**
     * @method getAdapter
     * @returns Returns the adapter with the indicated id.
     */
    getAdapter(adapterId: string): Adapter | undefined;
    /**
     * @method getAdapters
     * @returns Returns a Map of the loaded adapters. The dictionary
     *          key corresponds to the adapter id.
     */
    getAdapters(): Map<string, Adapter>;
    /**
     * @method getNotifiers
     * @returns Returns a Map of the loaded notifiers. The dictionary
     *          key corresponds to the notifier id.
     */
    getNotifiers(): Map<string, Notifier>;
    /**
     * @method getNotifier
     * @returns Returns the notifier with the indicated id.
     */
    getNotifier(notifierId: string): Notifier | undefined;
    /**
     * @method getAPIHandlers
     * @returns Returns a Map of the loaded API handlers. The dictionary
     *          key corresponds to the package ID.
     */
    getAPIHandlers(): Map<string, APIHandler>;
    /**
     * @method getAPIHandler
     * @returns Returns the API handler with the given package ID.
     */
    getAPIHandler(packageId: string): APIHandler | undefined;
    /**
     * @method getExtensions
     * @returns Returns a Map of the loaded extensions. The dictionary
     *          key corresponds to the extension ID.
     */
    getExtensions(): Record<string, Extension>;
    /**
     * @method getDevice
     * @returns Returns the device with the indicated id.
     */
    getDevice(id: string): Device;
    /**
     * @method getDevices
     * @returns Returns an dictionary of all of the known devices.
     *          The dictionary key corresponds to the device id.
     */
    getDevices(): Record<string, Device>;
    /**
     * @method getOutlet
     * @returns Returns the outlet with the indicated id.
     */
    getOutlet(id: string): Outlet;
    /**
     * @method getOutlets
     * @returns Returns an dictionary of all of the known outlets.
     *          The dictionary key corresponds to the outlet id.
     */
    getOutlets(): Record<string, Outlet>;
    /**
     * @method getPlugin
     *
     * Returns a previously registered plugin.
     */
    getPlugin(pluginId: string): Plugin | undefined;
    /**
     * @method getThings
     * @returns Returns a dictionary of all of the known things.
     *          The dictionary key corresponds to the device id.
     */
    getThings(): DeviceSchema[];
    /**
     * @method getThing
     * @returns Returns the thing with the indicated id.
     */
    getThing(thingId: string): DeviceSchema | undefined;
    /**
     * @method getPropertyDescriptions
     * @returns Retrieves all of the properties associated with the thing
     *          identified by `thingId`.
     */
    getPropertyDescriptions(thingId: string): Record<string, unknown> | undefined;
    /**
     * @method getProperty
     * @returns a promise which resolves to the retrieved value of `propertyName`
     *          from the thing identified by `thingId`.
     */
    getProperty(thingId: string, propertyName: string): Promise<Any>;
    /**
     * @method setProperty
     * @returns a promise which resolves to the updated value of `propertyName`
     *          for the thing identified by `thingId`.
     */
    setProperty(thingId: string, propertyName: string, value: Any): Promise<Any>;
    /**
     * @method notify
     * @returns a promise which resolves when the outlet has been notified.
     */
    notify(outletId: string, title: string, message: string, level: Level): Promise<void>;
    /**
     * @method setPin
     * @returns a promise which resolves when the PIN has been set.
     */
    setPin(thingId: string, pin: string): Promise<DeviceSchema>;
    /**
     * @method setCredentials
     * @returns a promise which resolves when the credentials have been set.
     */
    setCredentials(thingId: string, username: string, password: string): Promise<DeviceSchema>;
    /**
     * @method requestAction
     * @returns a promise which resolves when the action has been requested.
     */
    requestAction(thingId: string, actionId: string, actionName: string, input: Any): Promise<void>;
    /**
     * @method removeAction
     * @returns a promise which resolves when the action has been removed.
     */
    removeAction(thingId: string, actionId: string, actionName: string): Promise<void>;
    /**
     * @method handleDeviceAdded
     *
     * Called when the indicated device has been added to an adapter.
     */
    handleDeviceAdded(device: Device): void;
    /**
     * @method handleDeviceRemoved
     * Called when the indicated device has been removed by an adapter.
     */
    handleDeviceRemoved(device: Device): void;
    /**
     * @method handleOutletAdded
     *
     * Called when the indicated outlet has been added to a notifier.
     */
    handleOutletAdded(outlet: Outlet): void;
    /**
     * @method handleOutletRemoved
     * Called when the indicated outlet has been removed by a notifier.
     */
    handleOutletRemoved(outlet: Outlet): void;
    /**
     * @method addonEnabled
     *
     * Determine whether the add-on with the given package name is enabled.
     *
     * @param {string} packageId The package ID of the add-on
     * @returns {boolean} Boolean indicating enabled status.
     */
    addonEnabled(packageId: string): Promise<boolean>;
    enableAddon(packageId: string): Promise<void>;
    disableAddon(packageId: string, wait?: boolean): Promise<void>;
    /**
     * @method loadAddon
     *
     * Loads add-on with the given package ID.
     *
     * @param {String} packageId The package ID of the add-on to load.
     * @returns A promise which is resolved when the add-on is loaded.
     */
    loadAddon(packageId: string): Promise<void>;
    /**
     * @method loadAddons
     * Loads all of the configured add-ons from the addons directory.
     */
    loadAddons(): void;
    /**
     * @method removeThing
     *
     * Initiates removing a particular device.
     *
     * @returns A promise that resolves to the device which was actually removed.
     */
    removeThing(thingId: string): Promise<string>;
    removeAdapter(id: string): void;
    removeNotifier(id: string): void;
    removeApiHandler(id: string): void;
    /**
     * @method unloadAddons
     * Unloads all of the loaded add-ons.
     *
     * @returns a promise which is resolved when all of the add-ons
     *          are unloaded.
     */
    unloadAddons(): Promise<void>;
    /**
     * @method unloadAdapter
     * Unload the given adapter.
     *
     * @param {String} id The ID of the adapter to unload.
     * @returns A promise which is resolved when the adapter is unloaded.
     */
    unloadAdapter(id: string): Promise<void>;
    /**
     * @method unloadNotifier
     * Unload the given notifier.
     *
     * @param {String} id The ID of the notifier to unload.
     * @returns A promise which is resolved when the notifier is unloaded.
     */
    unloadNotifier(id: string): Promise<void>;
    /**
     * @method unloadAPIHandler
     * Unload the given API handler.
     *
     * @param {string} packageId The ID of the package the handler belongs to.
     * @returns A promise which is resolved when the handler is unloaded.
     */
    unloadAPIHandler(packageId: string): Promise<void>;
    /**
     * @method unloadAddon
     * Unload add-on with the given package ID.
     *
     * @param {String} packageId The package ID of the add-on to unload.
     * @param {Boolean} wait Whether or not to wait for unloading to finish
     * @returns A promise which is resolved when the add-on is unloaded.
     */
    unloadAddon(packageId: string, wait: boolean): Promise<void>;
    /**
     * @method isAddonInstalled
     *
     * @param {String} packageId The package ID to check
     * @returns Boolean indicating whether or not the package is installed
     *          on the system.
     */
    isAddonInstalled(packageId: string): boolean;
    /**
     * Install an add-on.
     *
     * @param {String} id The package ID
     * @param {String} url The package URL
     * @param {String} checksum SHA-256 checksum of the package
     * @param {Boolean} enable Whether or not to enable the add-on after install
     * @param {object} options Set of options, primarily used by external scripts
     * @returns A Promise that resolves when the add-on is installed.
     */
    installAddonFromUrl(id: string, url: string, checksum: string, enable: boolean, options?: {}): Promise<void>;
    /**
     * @method installAddon
     *
     * @param {String} packageId The package ID to install
     * @param {String} packagePath Path to the package tarball
     * @param {Boolean} enable Whether or not to enable the add-on after install
     * @param {object} options Set of options, primarily used by external scripts
     * @returns A promise that resolves when the package is installed.
     */
    installAddon(packageId: string, packagePath: string, enable: boolean, options?: {
        skipLoad?: boolean;
    }): Promise<void>;
    /**
     * @method uninstallAddon
     *
     * @param {String} packageId The package ID to uninstall
     * @param {Boolean} wait Whether or not to wait for unloading to finish
     * @param {Boolean} disable Whether or not to disable the add-on
     * @returns A promise that resolves when the package is uninstalled.
     */
    uninstallAddon(packageId: string, wait: boolean, disable: boolean): Promise<void>;
    /**
     * @method waitForAdapter
     *
     * Returns a promise which resolves to the adapter with the indicated id.
     * This function is really only used to support testing and
     * ensure that tests don't proceed until
     */
    waitForAdapter(adapterId: string): Promise<Adapter>;
    /**
     * @method updateAddons
     *
     * Attempt to update all installed add-ons.
     *
     * @param {object} options Set of options, primarily used by external scripts
     * @returns A promise which is resolved when updating is complete.
     */
    updateAddons(options?: {
        forceUpdateBinary?: boolean;
    }): Promise<void>;
    getInstalledAddons(): Map<string, Record<string, unknown>>;
    getPluginServer(): PluginServer | null;
}
declare const _default: AddonManager;
export default _default;
//# sourceMappingURL=addon-manager.d.ts.map