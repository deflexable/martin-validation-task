import { collection } from "../database/index.js";
import db_path from "../database/db_path.js";
import { isEmptyString } from "../utils/validator.js";
import { getCompany } from "./company.js";

export const createEmployee = async ({ id, name, tenant_id, metadata }) => {
    if (isEmptyString(id)) throw `id must be a trimmed non-empty string but got "${id}"`;
    if (isEmptyString(tenant_id)) throw `tenant_id must be a trimmed non-empty string but got "${tenant_id}"`;
    if (isEmptyString(name)) throw `name must be a trimmed non-empty string but got "${name}"`;

    if (!(await getCompany(tenant_id))) throw `company with tenant_id=${tenant_id} does not exist`;

    console.log('creating:', tenant_id);
    await collection(db_path.employees).insertOne({
        _id: `${tenant_id} ${id}`,
        name,
        tenant_id,
        created_on: Date.now(),
        metadata
    });
    console.log('finished:', tenant_id);
}

export const getEmployee = (id) => {
    if (isEmptyString(id)) throw `id must be a trimmed non-empty string but got "${id}"`;

    return collection(db_path.employees)
        .findOne({ _id: id })
        .then(r => r && rephrase(r));
}

export const listEmployees = async (tenant_id, limit, skip) => {
    if (isEmptyString(tenant_id)) throw `tenant_id must be a trimmed non-empty string but got "${tenant_id}"`;

    let q = collection(db_path.employees).find({ tenant_id });

    if (skip !== undefined) q = q.skip(skip * 1);
    if (limit !== undefined) q = q.limit(limit * 1);

    return q.toArray().then(r =>
        r.map(rephrase)
    );
}

const rephrase = ({ _id, ...rest }) => ({ id: _id.split(' ')[1], ...rest });