/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import Effect, { EffectDescription } from './effects/Effect';
import Trigger, { TriggerDescription } from './triggers/Trigger';
import { State } from './State';
export interface RuleDescription {
    enabled: boolean;
    trigger: TriggerDescription;
    effect: EffectDescription;
    id?: number;
    name?: string;
}
export default class Rule {
    private enabled;
    private trigger;
    private effect;
    private id?;
    private name?;
    private _onTriggerStateChanged;
    /**
     * @param {boolean} enabled
     * @param {Trigger} trigger
     * @param {Effect} effect
     */
    constructor(enabled: boolean, trigger: Trigger, effect: Effect);
    setId(id: number): void;
    setName(name: string): void;
    /**
     * Create a rule from a serialized description
     * @param {RuleDescription} desc
     * @return {Rule}
     */
    static fromDescription(desc: RuleDescription): Rule;
    /**
     * Begin executing the rule
     */
    start(): Promise<void>;
    /**
     * On a state changed event, pass the state forward to the rule's effect
     * @param {State} state
     */
    onTriggerStateChanged(state: State): void;
    /**
     * @return {RuleDescription}
     */
    toDescription(): RuleDescription;
    /**
     * Stop executing the rule
     */
    stop(): void;
}
//# sourceMappingURL=Rule.d.ts.map