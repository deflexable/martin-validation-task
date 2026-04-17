import { ADMIN_PASSWORD, ADMIN_USERNAME, API_URL } from "./env.js";

const JsonApp = { 'content-type': 'application/json' }

const capResult = async (fetchInstance) => {
    const { result, status, message } = await (await fetchInstance).json();
    if (status === 'error') throw message;
    return result;
}

const flattenQuery = (obj) => {
    let q = new URLSearchParams(
        Object.fromEntries(
            Object.entries(obj).filter(v => v[1] !== undefined && v[1] !== null)
        )
    );

    if (q.size) return `?${q.toString()}`;
    return '';
}

const login = (username, password) =>
    capResult(
        fetch(API_URL.concat('/auth/login'), {
            body: JSON.stringify({ username, password }),
            headers: JsonApp,
            method: 'POST'
        })
    );

const register_company = (token, { name, tenant_id, username, password, metadata }) =>
    capResult(
        fetch(API_URL.concat('/admin/companies'), {
            body: JSON.stringify({ name, tenant_id, username, password, metadata }),
            headers: { ...JsonApp, token },
            method: 'POST',
        })
    );

const list_companies = ({ limit, skip, token }) =>
    capResult(
        fetch(API_URL.concat('/admin/companies') + flattenQuery({ limit, skip }), {
            headers: { token },
            method: 'GET',
        })
    );

const get_companies = ({ tenant_id, token }) =>
    capResult(
        fetch(API_URL.concat(`/admin/companies/${tenant_id}`), {
            headers: { token },
            method: 'GET'
        })
    );


const register_employee = ({ id, name, tenant_id, metadata, token }) =>
    capResult(
        fetch(API_URL.concat('/company/employees'), {
            body: JSON.stringify({ id, name, tenant_id, metadata }),
            headers: { ...JsonApp, token },
            method: 'POST',
        })
    );

const list_employee = ({ limit, skip, token, tenant_id }) =>
    capResult(
        fetch(API_URL.concat(`/company/employees/${tenant_id}`) + flattenQuery({ limit, skip }), {
            headers: { token },
            method: 'GET',
        })
    );

const get_employee = ({ tenant_id, id, token }) =>
    capResult(
        fetch(API_URL.concat(`/company/employees/${tenant_id}/${id}`), {
            headers: { token },
            method: 'GET'
        })
    );


async function doTest(params) {
    const tenant_id = 'TestTenant5'; // CHANGE TO YOUR TASTE

    try {
        console.log('doTest start');
        const admin_token = await login(ADMIN_USERNAME, ADMIN_PASSWORD);

        console.log('doTest admin_token:', admin_token);
        const newCompany = await register_company(admin_token, {
            name: 'Test Company',
            metadata: { some_data: 'yes' },
            username: 'G-' + '-' + tenant_id,
            password: 'TestPassword',
            tenant_id
        });
        console.log('doTest newCompany:', newCompany);

        const company_token = await login(newCompany.username, newCompany.password);

        console.log('doTest company_token:', company_token);
        await register_employee({
            id: 'Test',
            metadata: { test: true },
            name: 'Test Name',
            tenant_id,
            token: company_token
        });

        console.log('doTest successful');
    } catch (error) {
        console.error('doTest err:', error);
    }
}

doTest();