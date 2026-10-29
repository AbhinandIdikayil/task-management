# Task Manager API

A task management REST API built with **Node.js, Express 5, TypeScript, MongoDB (Mongoose) and Zod**.

It supports full task CRUD, search, filtering, pagination, sorting, and a dashboard summary endpoint.

## Features

- Create, read, update and delete tasks
- Task fields: `title`, `description`, `priority`, `status` (+ `createdAt` / `updatedAt`)
- Case-insensitive search across `title` and `description`
- Filter by `status` and `priority`
- Pagination and validated sorting
- Dashboard stats: total, pending, in-progress, completed, completion rate
- Request validation with Zod (body, query and route params)
- Central error handling with consistent JSON error payloads
- Environment validation at startup
- Mongo connection closed on `SIGINT` / `SIGTERM` and on startup failure

## Project structure

```
src/
├── main.ts                          # entry point: env, DB connection, HTTP server, shutdown
├── app.ts                           # Express app: middleware, routes, 404 + error handler
├── common/
│   ├── constants.ts                 # status/priority/sort whitelists
│   ├── errors.ts                    # AppError and HTTP error classes
│   ├── response.ts                  # success/error response helpers
│   ├── validation.ts                # Zod validation middleware
│   ├── error-handler.ts             # not-found + central error handler
│   └── request-logger.ts            # simple request logging
├── config/
│   ├── env.ts                       # dotenv + Zod-validated environment
│   └── db.ts                        # MongoDB connect/disconnect
├── types/
│   └── express.d.ts                 # `req.validated` type augmentation
└── modules/
    ├── task/
    │   ├── task.route.ts            # routes
    │   ├── task.controller.ts       # HTTP layer
    │   ├── task.repository.ts       # all Mongoose queries
    │   ├── task.model.ts            # Mongoose schema/model
    │   ├── task.validation.ts       # Zod schemas
    │   └── task.types.ts            # domain types
    └── dashboard/
        ├── dashboard.route.ts
        ├── dashboard.controller.ts
        └── dashboard.repository.ts  # status aggregation
```

The request flow follows `main.ts -> route.ts -> controller -> repository.ts`. Controllers never touch Mongoose directly, and repositories never touch `req`/`res`.

## Getting started

### 1. Requirements

- Node.js 18+ (tested on Node 24)
- MongoDB running locally or a MongoDB Atlas connection string

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

Copy `.env.example` to `.env` and adjust if needed:

```bash
cp .env.example .env
```

| Variable | Default | Description |
| --- | --- | --- |
| `NODE_ENV` | `development` | `development`, `test` or `production` |
| `PORT` | `5000` | HTTP port |
| `MONGODB_URI` | `mongodb://127.0.0.1:27017/task_manager` | MongoDB connection string |
| `CORS_ORIGIN` | `*` | `*` or comma-separated allowed origins |

### 4. Run

```bash
# development (watch mode)
npm run dev

# production build
npm run build
npm start
```

Health check: <http://localhost:5000/health>

## Data model

```ts
{
  _id: string;
  title: string;              // required, 1-120 chars
  description: string;        // optional, max 2000 chars, defaults to ""
  priority: 'low' | 'medium' | 'high';          // default: medium
  status: 'pending' | 'in_progress' | 'completed'; // default: pending
  createdAt: string;
  updatedAt: string;
}
```

## API reference

Base URL: `http://localhost:5000`

All responses use the same envelope:

```json
{
  "success": true,
  "message": "Tasks fetched successfully",
  "data": [],
  "meta": { "total": 0, "page": 1, "limit": 10, "totalPages": 0, "hasNextPage": false, "hasPrevPage": false }
}
```

Errors:

```json
{
  "success": false,
  "message": "Validation failed",
  "details": [{ "field": "title", "message": "Title is required" }]
}
```

### `POST /api/tasks` — create a task

```json
{
  "title": "Write API docs",
  "description": "Document every endpoint with examples",
  "priority": "high",
  "status": "pending"
}
```

`201 Created`, `400` on validation errors.

### `GET /api/tasks` — list, search, filter, sort, paginate

Query parameters:

| Param | Type | Default | Notes |
| --- | --- | --- | --- |
| `search` | string | – | Matches `title` or `description`, case-insensitive, max 100 chars |
| `status` | `pending` \| `in_progress` \| `completed` | – | Exact match |
| `priority` | `low` \| `medium` \| `high` | – | Exact match |
| `page` | integer >= 1 | `1` | Page number |
| `limit` | integer 1-100 | `10` | Items per page |
| `sortBy` | `createdAt` \| `updatedAt` \| `title` \| `priority` \| `status` | `createdAt` | Sort field |
| `order` | `asc` \| `desc` | `desc` | Sort direction |

Example:

```
GET /api/tasks?search=docs&status=pending&priority=high&page=1&limit=10&sortBy=createdAt&order=desc
```

`200 OK` with `data` array and pagination `meta`.

### `GET /api/tasks/:id` — get one task

`200 OK`, or `404` if not found.

### `PATCH /api/tasks/:id` — update a task

Send any subset of `title`, `description`, `priority`, `status`. At least one field is required.

```json
{ "status": "completed" }
```

`200 OK`, `400` on validation errors, `404` if not found.

### `DELETE /api/tasks/:id` — delete a task

`200 OK`, `404` if not found.

### `GET /api/dashboard` — dashboard stats

```json
{
  "success": true,
  "message": "Dashboard stats fetched successfully",
  "data": {
    "total": 12,
    "pending": 5,
    "inProgress": 3,
    "completed": 4,
    "completionRate": 33
  }
}
```

### `GET /health` — service health

Returns service status plus MongoDB connection state.

## Example requests

```bash
# Create
curl -X POST http://localhost:5000/api/tasks \
  -H "Content-Type: application/json" \
  -d "{\"title\":\"Finish report\",\"description\":\"Q3 summary\",\"priority\":\"high\"}"

# List with search + filter
curl "http://localhost:5000/api/tasks?search=report&status=pending&page=1&limit=10"

# Get one
curl http://localhost:5000/api/tasks/<taskId>

# Update
curl -X PATCH http://localhost:5000/api/tasks/<taskId> \
  -H "Content-Type: application/json" \
  -d "{\"status\":\"completed\"}"

# Delete
curl -X DELETE http://localhost:5000/api/tasks/<taskId>

# Dashboard
curl http://localhost:5000/api/dashboard
```

## Error handling

| Status | When |
| --- | --- |
| `400` | Zod validation failure, invalid ObjectId, malformed JSON, Mongoose validation error |
| `404` | Unknown route or task not found |
| `409` | Duplicate key (reserved for future unique fields) |
| `413` | Request body exceeds the 100kb limit |
| `500` | Unexpected server error |

Validation errors include a `details` array of `{ field, message }`.

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start with `tsx watch` (hot reload) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run the compiled build |
| `npm run typecheck` | Type-check without emitting files |

## Notes

- CORS is enabled; set `CORS_ORIGIN` to a comma-separated allowlist in production.
- `req.query` is read-only in Express 5, so validated query values are stored on `req.validated` by the validation middleware.
- Search uses an escaped regular expression, preventing regex injection.
- The dashboard uses a single MongoDB aggregation instead of multiple count queries.
