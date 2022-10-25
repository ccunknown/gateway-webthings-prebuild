/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import Effect, { EffectDescription } from './Effect';
import { State } from '../State';
export interface MultiEffectDescription extends EffectDescription {
    effects: EffectDescription[];
}
/**
 * MultiEffect - The outcome of a Rule involving multiple effects
 */
export default class MultiEffect extends Effect {
    private effects;
    /**
     * @param {MultiEffectDescription} desc
     */
    constructor(desc: MultiEffectDescription);
    /**
     * @return {EffectDescription}
     */
    toDescription(): MultiEffectDescription;
    /**
     * @param {State} state
     */
    setState(state: State): void;
}
//# sourceMappingURL=MultiEffect.d.ts.map