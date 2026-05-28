# Task Flow

A responsive task management UI built with **React**, **Tailwind CSS**, and
shadcn-style reusable components.

## Features

- User login and signup with form validation
- Dashboard with task stats and filtering
- Create, edit, delete, and update task status
- Completed, pending, and all-task filters
- Responsive layout for desktop and mobile
- Backend-ready API service with local fallback storage

## Getting started

1. Install dependencies.
2. Update `.env` if your backend runs on a different base URL.
3. Start the development server.

## Deployment note

If you deploy the frontend to Vercel, keep the root `vercel.json` file in place so client-side routes like `/tasks` reload correctly instead of returning a 404. It rewrites unmatched paths to `index.html` for the React router.

## Demo credentials

Use these credentials to try the local fallback flow:

- Email: `demo@taskflow.app`
- Password: `Password123!`

## API integration

The app reads `VITE_API_BASE_URL` from `.env`.

- If the value is present, task/auth requests are sent to the backend.
- If it is missing, the app uses localStorage so the UI still works.

Expected backend endpoints:

- `POST /auth/login`
- `POST /auth/signup`
- `GET /tasks?userId=...`
- `POST /tasks`
- `PATCH /tasks/:id`
- `DELETE /tasks/:id`

## Verification

- `npm run lint`
- `npm run build`

## Backend

The API server now lives in `backend/` as a separate Node.js + Express project.

- Backend docs: `backend/README.md`
- Swagger UI: `http://localhost:4000/api-docs`
- Postman collection: `backend/docs/task-flow.postman_collection.json`
