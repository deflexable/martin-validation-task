import { hash, verify } from "argon2";
import { collection } from "../database/index.js"
import db_path from "../database/db_path.js"
import jwtPkg from 'jsonwebtoken';
import { API_URL, PROJECT_NAME, SIGNER_KEY, TOKEN_EXPIRY_SECONDS } from "../../env.js";
import { isEmptyString } from "../utils/validator.js";

/**
 * This function only register a user and write their credentials and data into the database
 */
export const register = async ({ claims, username, password }) => {
    if (isEmptyString(username)) throw `username must be a trimmed non-empty string but got "${username}"`;
    if (isEmptyString(password)) throw `password must be a trimmed non-empty string but got "${password}"`;

    await collection(db_path.users).insertOne({
        _id: username,
        password: await hash(password),
        claims
    });
}

/**
 * This function checks the database for a user then sign and return jwt token that later expires.
 */
export const login = async ({ username, password }) => {
    if (isEmptyString(username)) throw `username must be a trimmed non-empty string but got "${username}"`;
    if (isEmptyString(password)) throw `password must be a trimmed non-empty string but got "${password}"`;

    const userData = await collection(db_path.users).findOne({ _id: username });
    if (!userData) throw 'account does not exist';
    const matchedPassword = await verify(userData.password, password);

    if (!matchedPassword) throw 'incorrect password';

    const token = await new Promise((resolve, reject) => {
        jwtPkg.sign({
            exp: Date.now() + TOKEN_EXPIRY_SECONDS,
            aud: PROJECT_NAME,
            iss: API_URL,
            sub: username,
            claims: userData.claims
        },
            SIGNER_KEY,
            undefined,
            async (err, token) => {
                if (err) reject(err);
                else resolve(token);
            }
        );
    });

    return token;
}

export const getUser = (username) =>
    collection(db_path.users).findOne({ _id: username });

export const updateClaims = async (username, claims) => {
    const result = await collection(db_path.users).updateOne({ _id: username }, {
        $set: { claims }
    });

    if (!result.matchedCount) throw `user with username:${username} does not exist`;
    return true;
}

export const validateToken = (token) =>
    new Promise((resolve, reject) => {
        jwtPkg.verify(token, SIGNER_KEY, { ignoreExpiration: false }, (error, result) => {
            if (error || !result) {
                reject(error);
            } else resolve(result);
        })
    });