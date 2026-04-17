import { collection } from "../database";
import db_path from "../database/db_path";
import { randomString } from "../utils/utils";
import { isEmptyString } from "../utils/validator";
import { ROLE } from "../utils/values";
import { register } from "./auth";

export const createCompany = async ({ name, tenant_id, username, password, metadata }) => {
    if (isEmptyString(username)) throw `username must be a trimmed non-empty string but got "${username}"`;
    if (isEmptyString(password)) throw `password must be a trimmed non-empty string but got "${password}"`;
    if (isEmptyString(tenant_id)) throw `tenant_id must be a trimmed non-empty string but got "${tenant_id}"`;
    if (isEmptyString(name)) throw `name must be a trimmed non-empty string but got "${name}"`;

    await collection(db_path.company).insertOne({
        _id: tenant_id,
        name,
        created_on: Date.now(),
        metadata
    });

    if (username === undefined) username = `${Date.now()}`;
    if (password === undefined) password = randomString(5, true, false, true);

    await register({ username, password, claims: { role: ROLE.COMPANY, tenant_id } });

    return { username, password };
}

export const getCompany = (tenant_id) => {
    if (isEmptyString(tenant_id)) throw `tenant_id must be a trimmed non-empty string but got "${tenant_id}"`;

    return collection(db_path.company)
        .findOne({ _id: tenant_id })
        .then(r => r && rephrase(r));
}

export const listCompanies = async (limit, skip) => {
    let q = collection(db_path.company).find({});

    if (skip !== undefined) q = q.skip(skip * 1);
    if (limit !== undefined) q = q.limit(limit * 1);

    return q.toArray().then(r =>
        r.map(rephrase)
    );
}

const rephrase = ({ _id, ...rest }) => ({ tenant_id: _id, ...rest });