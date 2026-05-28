# Task Flow

Task Flow is a responsive task management app with a React/Vite frontend and an Express API backend. It supports authentication, task CRUD, board-wide task sharing, and a local fallback mode when the backend is not configured.

## Tech stack

- **Frontend:** React 19, Vite, Tailwind CSS 4, React Router
- **Backend:** Node.js, Express 5, MongoDB, Mongoose, JWT
- **UI helpers:** lucide-react, shadcn-style reusable components, class-variance-authority
- **Tooling:** ESLint, Vite build, Swagger UI, Postman collection

## Setup

### Frontend

1. Install dependencies in the project root.
2. Create a `.env` file if needed and set `VITE_API_BASE_URL` to your backend URL.
3. Start the frontend with `npm run dev`.

### Backend

1. Install dependencies in `backend/`.
2. Set `MONGODB_URI` and `JWT_SECRET` in `backend/.env`.
3. Start the backend with `npm run dev` from the `backend/` folder.

## Local development commands

- Frontend dev: `npm run dev`
- Frontend lint: `npm run lint`
- Frontend build: `npm run build`
- Backend dev: `npm run dev` inside `backend/`
- Backend build check: `npm run build` inside `backend/`

## API details

The frontend reads `VITE_API_BASE_URL` from `.env`.

- If it is set, task/auth requests go to the backend.
- If it is not set, the app uses localStorage so the UI still works offline.

### Main endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/users`
- `GET /api/tasks`
- `POST /api/tasks`
- `GET /api/tasks/:id`
- `PATCH /api/tasks/:id`
- `DELETE /api/tasks/:id`

### Task model

Tasks use this shape:

- `id`
- `title`
- `description`
- `dueDate`
- `status` (`pending` or `completed`)
- `priority` (`high`, `medium`, or `low`)
- `board`
- `assignee`
- `createdAt`
- `updatedAt`

## Folder structure

```text
.
├── backend/
│   ├── src/
│   │   ├── app.js
│   │   ├── server.js
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   └── utils/
│   └── docs/
├── src/
│   ├── components/
│   ├── context/
│   ├── data/
│   ├── pages/
│   └── services/
├── public/
├── index.html
├── vite.config.js
└── vercel.json
```

## Assumptions made

- All users work against the same shared board by default.
- Tasks are shared across users in both local and backend modes.
- `status` is the only state field used for task lanes.
- MongoDB may be unavailable during development, so the backend can fall back to in-memory storage.
- Client-side routes should be preserved on deployment, so `vercel.json` should remain in place.

## Demo credentials

Use these credentials for the local fallback flow:

- Email: `demo@taskflow.app`
- Password: `Password123!`

## API docs

- Swagger UI: `http://localhost:4000/api-docs`
- Postman collection: `backend/docs/task-flow.postman_collection.json`

## Additional notes

- The backend disables cache validators so API reloads return a fresh `200` instead of `304`.
- The app keeps task updates optimistic for a snappy UI.
- See `backend/README.md` for backend-specific setup and deployment notes.
