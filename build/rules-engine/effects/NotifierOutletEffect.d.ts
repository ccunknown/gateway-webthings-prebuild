/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { Level } from 'gateway-addon/lib/schema';
import Effect, { EffectDescription } from './Effect';
import { State } from '../State';
export interface NotifierOutletEffectDescription extends EffectDescription {
    notifier: string;
    outlet: string;
    title: string;
    message: string;
    level: Level;
}
/**
 * An Effect which calls notify on a notifier's outlet
 */
export default class NotifierOutletEffect extends Effect {
    private notifier;
    private outlet;
    private title;
    private message;
    private level;
    /**
     * @param {EffectDescription} desc
     */
    constructor(desc: NotifierOutletEffectDescription);
    /**
     * @return {EffectDescription}
     */
    toDescription(): NotifierOutletEffectDescription;
    /**
     * @param {State} state
     */
    setState(state: State): void;
}
//# sourceMappingURL=NotifierOutletEffect.d.ts.map