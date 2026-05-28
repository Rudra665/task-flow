# Task Flow Backend

Express.js + MongoDB API for the Task Flow application.

## Features

- JWT authentication
- Protected REST endpoints
- CRUD for tasks
- Validation and centralized error handling
- Swagger UI docs
- Postman collection for import

## Setup

1. Install dependencies in `backend/`.
2. Make sure MongoDB is running locally or update `MONGODB_URI` to your Atlas cluster.
3. Set `JWT_SECRET` to a strong value.
4. Start the server.

> If you use an Atlas `mongodb+srv://` URI and Node struggles to resolve SRV records, set `DNS_SERVERS` in `.env` (for example `1.1.1.1,8.8.8.8`). The backend will apply those DNS servers before connecting.

> If MongoDB is unavailable during development, the backend falls back to in-memory storage so the API still starts and the routes remain usable.

> For deployment, set `CORS_ORIGIN` on Render to your frontend URL if you want to lock the API to a specific site. The backend also allows common deployment origins like Vercel, Netlify, Render, localhost, and `127.0.0.1`.

## Scripts

- `npm run dev` — run with nodemon
- `npm start` — run production server
- `npm run build` — backend build check (no transpilation)

## API docs

- Root health check: `GET /`
- Health endpoint: `GET /health`
- Swagger UI: `http://localhost:4000/api-docs`
- Postman collection: `docs/task-flow.postman_collection.json`

## Main endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/users`
- `GET /api/tasks`
- `POST /api/tasks`
- `GET /api/tasks/:id`
- `PATCH /api/tasks/:id`
- `DELETE /api/tasks/:id`
