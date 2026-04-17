# martin-validation-task
Validation task for Martin Hovland

# API Documentation

## Base URL
Default URL is `http://localhost:5326` but you can change it from environment variable `API_URL=url_of_your_choice`
The default port is `5326`

# General Notes
- All responses are in JSON format
- Role-based access is enforced using JWT
- Multi-tenancy is handled via tenant_id
- Ensure proper validation and error handling for all endpoints
- Check [./env.js](./env.js) to see environments variables

## Authentication

All protected endpoints require a JWT token in the request headers:

```json
{ "token": <jwt_token> }
```

## 1. Auth

### POST `/auth/login`

Authenticate as **Super Admin** or **Company user**

#### Request Body
```json
{
  "username": "string",
  "password": "string"
}
```

#### Response
```json
{
  "result": "token_string"
}
```

## 2. Admin - Companies

### POST `/admin/companies`

Create a new company (Super Admin only)

#### Headers:
```json
{ "token": <super_admin_jwt> }
```

#### Request Body
```json
{
  "name": "string",
  "tenant_id": "string",
  "username": "string (optional)",
  "password": "string (optional)",
  "metadata": "any (optional)"
}
```

Notes: tenant_id must be unique

#### Response
```json
{
  "username": "company's username",
  "password": "company's password",
}
```


### GET `/admin/companies`

List all companies (Super Admin only)

#### Headers:
```json
{ "token": <super_admin_jwt> }
```

#### Query Params
```json
{
    "limit": number (optional),
    "skip": number (optional)
}
```

### GET `/admin/companies/:tenant_id`

Get a single company

#### Headers
```json
{ "token": <super_admin_jwt | company_jwt> }
```

#### Notes:
Company users can only access their own data


## 3. Company - Employees
### POST `/company/employees`

Create an employee

#### Headers
```json
{ "token": <super_admin_jwt | company_jwt> }
```

#### Request Body
```json
{
  "id": "string",
  "name": "string",
  "tenant_id": "string",
  "metadata": "any (optional)"
}
```

#### Notes:
Employee must belong to a valid tenant_id

### GET `/company/employees/:tenant_id`

List employees in a company

#### Headers
```json
{ "token": <super_admin_jwt | company_jwt> }
```

#### Query Params
```json
{
    "limit": number (optional),
    "skip": number (optional)
}
```

### GET `/company/employees/:tenant_id/:id`

Get a single employee

#### Headers
```json
{ "token": <super_admin_jwt | company_jwt> }
```

#### Notes
Company users can only access employees within their own tenant