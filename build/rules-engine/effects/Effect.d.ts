/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { State } from '../State';
export interface EffectDescription {
    type: string;
    label?: string;
}
/**
 * Effect - The outcome of a Rule once triggered
 */
export default class Effect {
    private type;
    private label?;
    /**
     * Create an Effect based on a wire-format description with a property
     * @param {EffectDescription} desc
     */
    constructor(desc: EffectDescription);
    /**
     * @return {EffectDescription}
     */
    toDescription(): EffectDescription;
    /**
     * Set the state of Effect based on a trigger
     * @param {State} _state
     */
    setState(_state: State): void;
}
//# sourceMappingURL=Effect.d.ts.map