"use strict";
/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const APIError_1 = __importDefault(require("../rules-engine/APIError"));
const Database_1 = __importDefault(require("../rules-engine/Database"));
const Engine_1 = __importDefault(require("../rules-engine/Engine"));
const Rule_1 = __importDefault(require("../rules-engine/Rule"));
class RulesController {
    constructor() {
        this.controller = express_1.default.Router();
        this.engine = new Engine_1.default();
        this.controller.get('/', async (_req, res) => {
            const rules = await this.engine.getRules();
            res.send(rules.map((rule) => {
                return rule.toDescription();
            }));
        });
        this.controller.get('/:id', async (req, res) => {
            try {
                const id = parseInt(req.params.id);
                const rule = await this.engine.getRule(id);
                res.send(rule.toDescription());
            }
            catch (e) {
                res.status(404).send(new APIError_1.default('Engine failed to get rule', e).toString());
            }
        });
        this.controller.post('/', this.parseRuleFromBody.bind(this), async (req, res) => {
            const ruleId = await this.engine.addRule(req.rule);
            res.send({ id: ruleId });
        });
        this.controller.put('/:id', this.parseRuleFromBody.bind(this), async (req, res) => {
            try {
                await this.engine.updateRule(parseInt(req.params.id), req.rule);
                res.send({});
            }
            catch (e) {
                res.status(404).send(new APIError_1.default('Engine failed to update rule', e).toString());
            }
        });
        this.controller.delete('/:id', async (req, res) => {
            try {
                await this.engine.deleteRule(parseInt(req.params.id));
                res.send({});
            }
            catch (e) {
                res.status(404).send(new APIError_1.default('Engine failed to delete rule', e).toString());
            }
        });
    }
    async configure() {
        await Database_1.default.open();
        await this.engine.getRules();
    }
    /**
     * Express middleware for extracting rules from the bodies of requests
     * @param {express.Request} req
     * @param {express.Response} res
     * @param {Function} next
     */
    parseRuleFromBody(req, res, next) {
        if (!req.body.trigger) {
            res.status(400).send(new APIError_1.default('No trigger provided').toString());
            return;
        }
        if (!req.body.effect) {
            res.status(400).send(new APIError_1.default('No effect provided').toString());
            return;
        }
        let rule = null;
        try {
            rule = Rule_1.default.fromDescription(req.body);
        }
        catch (e) {
            res.status(400).send(new APIError_1.default('Invalid rule', e).toString());
            return;
        }
        req.rule = rule;
        next();
    }
    getController() {
        return this.controller;
    }
}
exports.default = new RulesController();
//# sourceMappingURL=rules_controller.js.map