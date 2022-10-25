/**
 * @module Plugin
 *
 * Object created for each plugin that the gateway talks to.
 */
/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/// <reference types="node" />
import PluginServer from './plugin-server';
import { AddonManager } from '../addon-manager';
import Deferred from '../deferred';
import { ChildProcessWithoutNullStreams } from 'child_process';
import { Message } from 'gateway-addon/lib/schema';
import WebSocket from 'ws';
export default class Plugin {
    private pluginId;
    private addonManager;
    private pluginServer;
    private forceEnable;
    private logPrefix;
    private adapters;
    private notifiers;
    private apiHandlers;
    private exec;
    private execPath;
    private startPromise?;
    private process;
    private restart;
    private restartDelay;
    private lastRestart;
    private pendingRestart;
    private unloadCompletedPromise;
    private nextId;
    private requestActionPromises;
    private removeActionPromises;
    private setPinPromises;
    private setCredentialsPromises;
    private notifyPromises;
    private apiRequestPromises;
    private ws?;
    private stdoutReadline?;
    private stderrReadline?;
    private unloding;
    constructor(pluginId: string, addonManager: AddonManager, pluginServer: PluginServer, forceEnable?: boolean);
    getProcess(): {
        p: ChildProcessWithoutNullStreams | null;
    };
    getStartPromise(): Promise<void> | undefined;
    setExec(exec: string): void;
    setExecPath(execPath: string): void;
    setRestart(restart: boolean): void;
    setWebSocket(ws: WebSocket): void;
    asDict(): Record<string, unknown>;
    onMsg(msg: Message): void;
    /**
     * Generate an ID for a message.
     *
     * @returns {integer} An id.
     */
    generateMsgId(): number;
    sendMsg(methodType: number, data: Record<string, unknown>, deferred?: Deferred<unknown, unknown>): void;
    /**
     * Does cleanup required to allow the test suite to complete cleanly.
     */
    shutdown(): void;
    start(): Promise<void>;
    unload(): void;
    unloadComponents(): Promise<void>;
    kill(): void;
}
//# sourceMappingURL=plugin.d.ts.map