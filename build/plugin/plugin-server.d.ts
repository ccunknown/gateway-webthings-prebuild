/**
 * @module PluginServer
 *
 * Takes care of the gateway side of adapter plugins. There is
 * only a single instance of the PluginServer for the entire gateway.
 * There will be an AdapterProxy instance for each adapter plugin.
 */
/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/// <reference types="node" />
import { EventEmitter } from 'events';
import { Message } from 'gateway-addon/lib/schema';
import WebSocket from 'ws';
import Plugin from './plugin';
import { AddonManager } from '../addon-manager';
export default class PluginServer extends EventEmitter {
    private manager;
    private verbose?;
    private plugins;
    private ipcSocket;
    constructor(addonManager: AddonManager, { verbose }?: {
        verbose?: boolean;
    });
    getAddonManager(): AddonManager;
    /**
     * @method onMsg
     *
     * Called when the plugin server receives an adapter manager IPC message
     * from a plugin. This particular IPC channel is only used to register
     * plugins. Each plugin will get its own IPC channel once its registered.
     */
    onMsg(msg: Message, ws: WebSocket): void;
    /**
     * @method getPlugin
     *
     * Returns a previously loaded plugin instance.
     */
    getPlugin(pluginId: string): Plugin | undefined;
    /**
     * @method loadPlugin
     *
     * Loads a plugin by launching a separate process.
     */
    loadPlugin(pluginPath: string, id: string, exec: string): Promise<void>;
    /**
     * @method registerPlugin
     *
     * Called when the plugin server receives a register plugin message
     * via IPC.
     */
    registerPlugin(pluginId: string): Plugin;
    /**
     * @method unregisterPlugin
     *
     * Called when the plugin sends a plugin-unloaded message.
     */
    unregisterPlugin(pluginId: string): void;
    shutdown(): void;
}
//# sourceMappingURL=plugin-server.d.ts.map