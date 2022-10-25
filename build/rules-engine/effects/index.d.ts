/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import Effect, { EffectDescription } from './Effect';
declare type EffectClass = {
    new (desc: any): Effect;
};
export declare const effects: Record<string, EffectClass>;
/**
 * Produce an effect from a serialized effect description. Throws if `desc` is
 * invalid
 * @param {EffectDescription} desc
 * @return {Effect}
 */
export declare function fromDescription(desc: EffectDescription): Effect;
export {};
//# sourceMappingURL=index.d.ts.map