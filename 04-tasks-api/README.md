# Tasks API
 
A REST API for managing personal tasks, built with Node.js, Express, and PostgreSQL. Users register, log in with JWT authentication, and manage only their own tasks. Data isolation between users is verified by automated route-level tests.
 
## Features
 
- User registration and login with bcrypt password hashing and JWT authentication
- Full CRUD for tasks, scoped to the authenticated user
- Input validation at the request boundary: malformed ids are rejected with `400`, not left to fail in the database as `500`
- Another user's task returns `404`, so the API does not reveal whether a task exists
- Unit tests (Jest) and route tests (Supertest) running against a separate test database, with a guard that refuses to run on a database whose name does not end in `_test`
## Tech Stack
 
| Area | Tools |
| --- | --- |
| Runtime | Node.js (ES modules) |
| Framework | Express |
| Database | PostgreSQL, `pg` |
| Auth | JWT, bcrypt |
| Testing | Jest, Supertest |
 
## API Overview
 
All `/tasks` routes require an `Authorization: Bearer <token>` header.
 
| Method | Endpoint | Description | Success |
| --- | --- | --- | --- |
| POST | `/register` | Create an account (`email`, `username`, `password`) | `201` |
| POST | `/login` | Log in with `identifier` (email or username) and `password`, returns `token` | `200` |
| GET | `/tasks` | List the authenticated user's tasks | `200` |
| GET | `/tasks/:id` | Get one task | `200` |
| POST | `/tasks` | Create a task | `201` |
| PATCH | `/tasks/:id` | Update fields of a task | `200` |
| DELETE | `/tasks/:id` | Delete a task | `204` |
 
A task has these fields:
 
| Field | Rules |
| --- | --- |
| `title` | Required, non-empty string |
| `status` | `pending` (default), `in-progress`, or `completed` |
| `description` | Optional text |
| `urgency` | `low`, `medium` (default), or `high` |
| `deadline` | Optional date, `YYYY-MM-DD` |
 
Errors are returned as JSON: `{ "error": "message" }`.
 
Common status codes: `400` invalid input, `401` missing or invalid token, `404` task not found (or not owned by the caller), `500` unexpected server error.
 
## Project Structure
 
```
04-tasks-api/
├── app.js              # Express app (no listen, so tests can import it)
├── index.js            # Entry point: loads env, starts the server
├── db.js               # PostgreSQL connection pool
├── jest.config.js      # Jest configuration
├── package.json        # Project configuration and dependencies
├── package-lock.json   # Locked dependencies
├── routes/             # Route definitions and middleware order
├── controllers/        # Request handling and responses
├── repositories/       # SQL queries
├── middleware/         # Authentication and id validation
├── utils/              # Validators (with unit tests) and helpers
├── db/schema.sql       # Database schema
└── tests/              # Supertest route tests and test environment setup
```
 
## Getting Started
 
Prerequisites: Node.js and PostgreSQL. Developed with Node.js v24.20.0 and PostgreSQL 17.11.
 
1. Install dependencies:
```bash
   npm install
```
 
2. Create the database and load the schema:
```bash
   psql -U postgres -c "CREATE DATABASE tasks_db"
   psql -U postgres -d tasks_db -f db/schema.sql
```
 
3. Create a `.env` file in this folder:
```env
   DB_USER=postgres
   DB_PASSWORD=<your-postgres-password>
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=tasks_db
   JWT_SECRET=<a-long-random-string>
```
 
4. Start the server (listens on port 3000):
```bash
   node index.js
```
 
## Running Tests
 
The tests use a separate database. The test setup stops immediately if `DB_NAME` does not end with `_test`.
 
> **Warning:** every test suite truncates the `users` and `tasks` tables in the test database. Never point `.env.test` at a database that holds data you care about.
 
1. Create the test database and load the schema:
```bash
   psql -U postgres -c "CREATE DATABASE tasks_test"
   psql -U postgres -d tasks_test -f db/schema.sql
```
 
2. Create a `.env.test` file in this folder (it is git-ignored):
```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=postgres
   DB_PASSWORD=<your-postgres-password>
   DB_NAME=tasks_test
   JWT_SECRET=<any-test-secret>
```
 
3. Run the tests:
```bash
   npm test
```
 
   All test suites should pass.
 
## What the Tests Cover
 
- **Validators (unit):** task fields and id validation, including edge cases such as `":7"`, `"1e3"`, `" 7 "`, leading zeros, and values above the PostgreSQL `integer` limit
- **Routes (Supertest):** unauthenticated requests return `401`, malformed ids return `400`, and a user cannot read, update, or delete another user's task, nor see it in their own list
The isolation tests were checked by deliberately removing the `user_id` filter from the SQL queries and confirming that the tests fail, so they are known to catch real data leaks.
 
## Design Notes
 
- **Validate at the boundary.** `Number(":7")` silently becomes `NaN` and only failed inside PostgreSQL, surfacing as a `500`. The id is now checked with a regex first and then compared against the `integer` maximum (`2147483647`), so client mistakes get a `400`.
- **`404` instead of `403`** for tasks owned by someone else, to avoid confirming that the id exists.
- **`app.js` is separate from `index.js`** so tests can import the app without starting a server or depending on the entry point's environment loading.

 