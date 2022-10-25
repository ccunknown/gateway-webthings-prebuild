"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const oauth_types_1 = require("../../oauth-types");
describe('OAuth types', () => {
    it('should verify scopes', () => {
        expect((0, oauth_types_1.scopeValidSubset)('/things:read', '/things/potato:readwrite')).toBeFalsy();
        expect((0, oauth_types_1.scopeValidSubset)('/things:readwrite', '/things/potato:readwrite')).toBeTruthy();
        expect((0, oauth_types_1.scopeValidSubset)('/things/potato:readwrite /things/tomato:read', '/things/potato:readwrite')).toBeTruthy();
        expect((0, oauth_types_1.scopeValidSubset)('/things/potato:read /things/tomato:readwrite', '/things/potato:readwrite')).toBeFalsy();
        expect((0, oauth_types_1.scopeValidSubset)('/things/potato:read /things/tomato:readwrite', '/things:readwrite')).toBeFalsy();
    });
});
//# sourceMappingURL=oauth-test.js.map