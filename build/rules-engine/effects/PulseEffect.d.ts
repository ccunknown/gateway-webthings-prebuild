/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import PropertyEffect from './PropertyEffect';
import { SetEffectDescription } from './SetEffect';
import { Any } from 'gateway-addon/lib/schema';
import { State } from '../State';
export declare type PulseEffectDescription = SetEffectDescription;
/**
 * An Effect which temporarily sets the target property to
 * a value before restoring its original value
 */
export default class PulseEffect extends PropertyEffect {
    private value;
    private on;
    private oldValue;
    /**
     * @param {EffectDescription} desc
     */
    constructor(desc: PulseEffectDescription);
    /**
     * @return {EffectDescription}
     */
    toDescription(): PulseEffectDescription;
    /**
     * @param {State} state
     */
    setState(state: State): Promise<Any>;
}
//# sourceMappingURL=PulseEffect.d.ts.map