# Task Manager — Frontend

React + TypeScript + Vite frontend for the Task Manager API.

## Prerequisites

- Node.js
- The search/filter/dashboard calls require the API running on `http://localhost:5000`
  (see `../backend`).

## Setup

```bash
npm install
npm run dev        # http://localhost:5173
```

Optional: set the API base URL via an env file if the backend runs elsewhere:

```ini
# .env.development
VITE_API_URL=http://localhost:5000
```

Other scripts: `npm run build` (typecheck + production build), `npm run preview`, `npm run lint`.

## Features

- **Dashboard cards** — total, pending, in-progress, completed counts + completion rate
  (`GET /api/dashboard`).
- **Task CRUD** — create and edit via a modal form (`POST /api/tasks`, `PATCH /api/tasks/:id`),
  delete with a confirmation dialog (`DELETE /api/tasks/:id`).
- **Search** — debounced, server-side search on title/description.
- **Filters & sorting** — status, priority, sort field and order (`GET /api/tasks` query params).
- **Pagination** — server-driven via the response `meta` block, 10 per page.
- **Validation & error handling** (react-hook-form + zod, `zodResolver`)
  - Client-side: schema mirrors the API rules — required title, max lengths (120 / 2000),
    enum-constrained status/priority; inline field errors via form state.
  - Server-side: API validation `details` are mapped back onto form fields with `setError`;
    other API errors and network failures surface as banners / toasts.

## Structure

```
src/
  types.ts               # domain types + label maps (mirrors the API)
  lib/api.ts             # fetch wrapper: envelope unwrapping, ApiError
  services/tasks.ts      # API calls
  hooks/useTasks.ts      # list state: filters, debounce, pagination, error
  hooks/useDashboard.ts  # stats state
  components/            # DashboardStats, TaskToolbar, TaskList, TaskFormModal,
                         # ConfirmDialog, Pagination, Toast
  App.tsx                # orchestration, modals, toasts, refresh flow
  index.css              # Tailwind v4 theme tokens + shared component classes
```

## Design

Tailwind CSS v4 (`@tailwindcss/vite`). Custom theme in `src/index.css`: ink (`#1c2333`) /
paper (`#eceff2`) palette with border-carried structure (no card shadows), semantic status
colors, Archivo for display type and Instrument Sans for UI. The dashboard is a proportional
status bar whose segment widths are the data, plus a completion-rate figure.
