/**
 * Elliptic curve helpers for the ES256 curve.
 *
 * This file contains the logic to generate public/private key pairs and return
 * them in the format openssl/crypto expects.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/**
 * Generate a public/private key pair.
 *
 * The returned keys are formatted in PEM for use with openssl (crypto).
 *
 * @return {Object} .public in PEM. .prviate in PEM.
 */
export declare function generateKeyPair(): {
    public: string;
    private: string;
};
export declare const JWT_ALGORITHM = "ES256";
//# sourceMappingURL=ec-crypto.d.ts.map