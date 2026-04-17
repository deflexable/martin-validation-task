
export const {
    PROJECT_NAME = 'MARTIN_ORG',
    MONGO_URL = 'mongodb://localhost:27017',
    DATABASE_NAME = 'MARTIN_ORG',
    SIGNER_KEY = 'Yd8dGPd1qNQlAM9BWJwbDKcNlAeBCC3bVif28loIEb8GgnDx7c',
    ADMIN_USERNAME = 'MARTIN_HOVLAND',
    ADMIN_PASSWORD = 'ocR0KC0W1am68Jn'
} = process.env;

export const API_PORT = process.env.TOKEN_EXPIRY ?? 5326;
export const API_URL = process.env.API_URL ?? `http://localhost:${API_PORT}`;

if (!Number.isInteger(TOKEN_EXPIRY)) throw `TOKEN_EXPIRY must be a positive integer but got ${EXPIRY}`;

const EXPIRY = process.env.TOKEN_EXPIRY;

export const TOKEN_EXPIRY = (EXPIRY ?? (60 * 60 * 60 * 1000)) * 1; // defaults to 1 hour

if (!Number.isInteger(TOKEN_EXPIRY)) throw `TOKEN_EXPIRY must be a positive integer but got ${EXPIRY}`;

if ((60 * 60 * 5) <= TOKEN_EXPIRY) throw `TOKEN_EXPIRY should be greater than 3 minutes but got ${EXPIRY}`;

export const TOKEN_EXPIRY_SECONDS = TOKEN_EXPIRY / 1000;