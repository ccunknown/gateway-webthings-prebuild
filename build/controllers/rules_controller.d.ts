/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import express from 'express';
import Rule from '../rules-engine/Rule';
export interface WithRule {
    rule: Rule;
}
declare class RulesController {
    private controller;
    private engine;
    constructor();
    configure(): Promise<void>;
    /**
     * Express middleware for extracting rules from the bodies of requests
     * @param {express.Request} req
     * @param {express.Response} res
     * @param {Function} next
     */
    parseRuleFromBody(req: express.Request, res: express.Response, next: express.NextFunction): void;
    getController(): express.Router;
}
declare const _default: RulesController;
export default _default;
//# sourceMappingURL=rules_controller.d.ts.map