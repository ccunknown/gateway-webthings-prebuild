/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import PropertyEffect, { PropertyEffectDescription } from './PropertyEffect';
import { Any } from 'gateway-addon/lib/schema';
import { State } from '../State';
export interface SetEffectDescription extends PropertyEffectDescription {
    value: Any;
}
/**
 * An Effect which permanently sets the target property to
 * a value when triggered
 */
export default class SetEffect extends PropertyEffect {
    private value;
    private on;
    /**
     * @param {EffectDescription} desc
     */
    constructor(desc: SetEffectDescription);
    /**
     * @return {EffectDescription}
     */
    toDescription(): SetEffectDescription;
    /**
     * @return {State}
     */
    setState(state: State): Promise<Any>;
}
//# sourceMappingURL=SetEffect.d.ts.map