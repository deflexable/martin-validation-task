import express, { json, text } from "express";
import { ADMIN_PASSWORD, ADMIN_USERNAME, API_PORT, API_URL } from "../env";
import { createCompany, getCompany, listCompanies } from "./modules/company";
import { createEmployee, getEmployee, listEmployees } from "./modules/employee";
import { login, register, validateToken } from "./modules/auth";
import { ROLE } from "./utils/values";

const app = express();
app.disable("x-powered-by");

[
    json({ type: '*/json', limit: '100MB' }),
    text({ type: 'text/plain', limit: '100MB' })
].forEach(e => {
    app.use(e);
});

const router = express.Router({ caseSensitive: true });

/**
 * @param {(req: express.Request, res: express.Response) => Promise<any>} callback 
 * @param {(req: express.Request) => Promise<void>} authenticator 
 * @returns {(req: express.Request, res: express.Response) => void}
 */
const handleRouter = (callback, authenticator) => async (req, res) => {
    try {
        if (authenticator) await authenticator?.(req);

        const result = await callback?.(req, res);
        if (result !== undefined) {
            res.status(200).send({ result });
        }
    } catch (error) {
        if (!res.headersSent) {
            res.status(501).send({
                status: 'error',
                message: `${error}`
            });
        }
    }
}

const adminRegPromise = register({
    username: ADMIN_USERNAME,
    password: ADMIN_PASSWORD,
    claims: { role: ROLE.ADMIN }
});

const AUTH_VALIDATOR = {
    ADMIN: async token => {
        const tokenData = await validateToken(token);
        if (tokenData.claims.role !== ROLE.ADMIN) throw 'unauthorize access';
    },
    COMPANY: async (token, tenant_id) => {
        if (!tenant_id) throw `invalid tenant_id=${tenant_id}`;
        
        const tokenData = await validateToken(token);
        if (
            tokenData.claims.role !== ROLE.ADMIN &&
            (tokenData.claims.role !== ROLE.COMPANY || tenant_id !== tokenData.claims.tenant_id)
        ) throw 'unauthorize access';
    }
};

// login and retrieve token
app.use(
    router.post(
        '/auth/login',
        handleRouter(async req => {
            await adminRegPromise;
            const token = await login(req.body);
            return token;
        })
    )
);

// register a company
app.use(
    router.post(
        '/admin/companies',
        handleRouter(req =>
            createCompany(req.body),
            req => AUTH_VALIDATOR.ADMIN(req.headers.token)
        )
    )
);

// list companies
app.use(
    router.get(
        '/admin/companies',
        handleRouter(req =>
            listCompanies(req.query?.limit, req.query?.skip),
            req => AUTH_VALIDATOR.ADMIN(req.headers.token)
        )
    )
);

// get a specific company
app.use(
    router.get(
        '/admin/companies/:tenant_id',
        handleRouter(req =>
            getCompany(req.params.tenant_id),
            req => AUTH_VALIDATOR.COMPANY(req.headers.token, req.params.tenant_id)
        )
    )
);

// register employee
app.use(
    router.post(
        '/company/employees',
        handleRouter(req =>
            createEmployee(req.body),
            req => AUTH_VALIDATOR.COMPANY(req.headers.token, req.body.tenant_id)
        )
    )
);

// list employee
app.use(
    router.get(
        '/company/employees',
        handleRouter(req =>
            listEmployees(req.query?.tenant_id, req.query?.limit, req.query?.skip),
            req => AUTH_VALIDATOR.COMPANY(req.headers.token, req.query?.tenant_id)
        )
    )
);

// get employee
app.use(
    router.get(
        '/company/employees/:tenant_id/:id',
        handleRouter(req =>
            getEmployee(`${req.params.tenant_id} ${req.params.id}`),
            req => AUTH_VALIDATOR.COMPANY(req.headers.token, req.params.tenant_id)
        )
    )
);

app.listen(API_PORT, (err) => {
    if (err) {
        console.error('unable to start server, err:', err);
    } else console.log('server listening in port:', API_PORT, ' visit:', API_URL);
});