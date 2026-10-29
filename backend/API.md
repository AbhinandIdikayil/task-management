# Task Manager API

Base URL: `http://localhost:5000/api`

All responses look like this:

```json
{
  "success": true,
  "message": "Message here",
  "data": {}
}
```

Task fields:

| Field | Type | Values |
| --- | --- | --- |
| `title` | string | required, max 120 chars |
| `description` | string | optional, max 2000 chars |
| `priority` | string | `low`, `medium`, `high` (default `medium`) |
| `status` | string | `pending`, `in_progress`, `completed` (default `pending`) |

---

## 1. Create Task

`POST /api/tasks`

Body:

```json
{
  "title": "Finish report",
  "description": "Q3 summary",
  "priority": "high",
  "status": "pending"
}
```

Response `201`:

```json
{
  "success": true,
  "message": "Task created successfully",
  "data": {
    "_id": "68f1a2b3c4d5e6f789012345",
    "title": "Finish report",
    "description": "Q3 summary",
    "priority": "high",
    "status": "pending",
    "createdAt": "2026-10-29T10:00:00.000Z",
    "updatedAt": "2026-10-29T10:00:00.000Z"
  }
}
```

---

## 2. View Task

`GET /api/tasks/:id`

Response `200`:

```json
{
  "success": true,
  "message": "Task fetched successfully",
  "data": {
    "_id": "68f1a2b3c4d5e6f789012345",
    "title": "Finish report",
    "description": "Q3 summary",
    "priority": "high",
    "status": "pending",
    "createdAt": "2026-10-29T10:00:00.000Z",
    "updatedAt": "2026-10-29T10:00:00.000Z"
  }
}
```

---

## 3. Edit Task

`PATCH /api/tasks/:id`

Send only the fields you want to change.

Body:

```json
{
  "status": "completed",
  "priority": "low"
}
```

Response `200`:

```json
{
  "success": true,
  "message": "Task updated successfully",
  "data": {
    "_id": "68f1a2b3c4d5e6f789012345",
    "title": "Finish report",
    "description": "Q3 summary",
    "priority": "low",
    "status": "completed",
    "createdAt": "2026-10-29T10:00:00.000Z",
    "updatedAt": "2026-10-29T11:30:00.000Z"
  }
}
```

---

## 4. Delete Task

`DELETE /api/tasks/:id`

Response `200`:

```json
{
  "success": true,
  "message": "Task deleted successfully",
  "data": null
}
```

---

## 5. List Tasks

`GET /api/tasks`

Query parameters (all optional):

| Param | Values | Default |
| --- | --- | --- |
| `search` | any text (title/description) | – |
| `status` | `pending`, `in_progress`, `completed` | – |
| `priority` | `low`, `medium`, `high` | – |
| `page` | number >= 1 | `1` |
| `limit` | 1–100 | `10` |
| `sortBy` | `createdAt`, `updatedAt`, `title`, `priority`, `status` | `createdAt` |
| `order` | `asc`, `desc` | `desc` |

Example:

```
GET /api/tasks?search=report&status=pending&priority=high&page=1&limit=10
```

Response `200`:

```json
{
  "success": true,
  "message": "Tasks fetched successfully",
  "data": [
    {
      "_id": "68f1a2b3c4d5e6f789012345",
      "title": "Finish report",
      "description": "Q3 summary",
      "priority": "high",
      "status": "pending",
      "createdAt": "2026-10-29T10:00:00.000Z",
      "updatedAt": "2026-10-29T10:00:00.000Z"
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPrevPage": false
  }
}
```

---

## 6. Dashboard

`GET /api/dashboard`

Response `200`:

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

---

## Error Response

```json
{
  "success": false,
  "message": "Validation failed",
  "details": [
    { "field": "title", "message": "Title is required" }
  ]
}
```

| Status | Meaning |
| --- | --- |
| `400` | Validation error or invalid task id |
| `404` | Task or route not found |
| `500` | Server error |
