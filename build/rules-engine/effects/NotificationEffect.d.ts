/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import Effect, { EffectDescription } from './Effect';
import { State } from '../State';
export interface NotificationEffectDescription extends EffectDescription {
    message: string;
}
/**
 * An Effect which creates a notification
 */
export default class NotificationEffect extends Effect {
    private message;
    /**
     * @param {EffectDescription} desc
     */
    constructor(desc: NotificationEffectDescription);
    /**
     * @return {EffectDescription}
     */
    toDescription(): NotificationEffectDescription;
    /**
     * @param {State} state
     */
    setState(state: State): void;
}
//# sourceMappingURL=NotificationEffect.d.ts.map