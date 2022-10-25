/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import Effect, { EffectDescription } from './Effect';
import { State } from '../State';
import { Any } from 'gateway-addon/lib/schema';
export interface ActionEffectDescription extends EffectDescription {
    thing: string;
    action: string;
    parameters: unknown;
}
/**
 * An Effect which creates an action
 */
export default class ActionEffect extends Effect {
    parameters: Any;
    thing: string;
    action: string;
    /**
     * @param {EffectDescription} desc
     */
    constructor(desc: ActionEffectDescription);
    /**
     * @return {EffectDescription}
     */
    toDescription(): ActionEffectDescription;
    /**
     * @param {State} state
     */
    setState(state: State): void;
    createAction(): Promise<void>;
}
//# sourceMappingURL=ActionEffect.d.ts.map