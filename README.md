# QuizNova Backend

Production-oriented Node.js backend for the QuizNova mobile app.

## Stack

- Node.js + Express.js
- MySQL with `mysql2/promise`
- JWT authentication
- Socket.io real-time battles
- OpenAI-powered quiz generation
- MVC-style folders under `backend/`

## Folder Structure

```text
backend/
  controllers/
  routes/
  models/
  middleware/
  services/
  sockets/
  config/
  utils/
  database/
    schema.sql
  app.js
  server.js
```

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create the database:

```bash
mysql -u root -p < backend/database/schema.sql
```

3. Create your environment file:

```bash
cp .env.example .env
```

4. Fill in `.env` with MySQL credentials, `JWT_SECRET`, and `OPENAI_API_KEY`.

5. Run the API:

```bash
npm run dev
```

Production:

```bash
npm start
```

Default health check:

```text
GET /health
```

## API Response Format

All REST endpoints return:

```json
{
  "success": true,
  "message": "OK",
  "data": {}
}
```

Validation and runtime errors return:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": []
}
```

## REST API

### Auth

`POST /api/auth/register`

```json
{
  "name": "Ava",
  "email": "ava@example.com",
  "password": "password123",
  "avatar": "https://example.com/avatar.png"
}
```

`POST /api/auth/login`

```json
{
  "email": "ava@example.com",
  "password": "password123"
}
```

Both return `{ user, token }`. Send the token as `Authorization: Bearer <token>`.

### Users

- `GET /api/users/me`
- `PATCH /api/users/me`
- `GET /api/users/me/results`
- `GET /api/users/me/analytics`

### Quiz

- `GET /api/quiz?topic=javascript`
- `POST /api/quiz/submit`

Submit body:

```json
{
  "quizId": 1,
  "answers": [
    { "questionId": 1, "answer": "A" }
  ]
}
```

### AI

`POST /api/ai/generate-quiz`

```json
{
  "topic": "JavaScript closures",
  "difficulty": "medium",
  "count": 5
}
```

The generated quiz is stored in MySQL and returned with correct answers and explanations.

### Leaderboard

- `GET /api/leaderboard/global`
- `GET /api/leaderboard/weekly`

### Battle

- `GET /api/battle/:roomId`

Socket.io handles live matchmaking and scoring.

### Admin

Requires a user with `role = 'admin'`.

- `GET /api/admin/users`
- `DELETE /api/admin/users/:id`
- `GET /api/admin/quizzes`

## Socket.io Battle Events

Client connection:

```js
const socket = io(API_URL, {
  auth: { token }
});
```

Client emits:

- `battle:find` with `{ "topic": "javascript" }`
- `battle:answer` with `{ "roomId": "...", "questionId": 1, "answer": "A" }`
- `battle:finish` with `{ "roomId": "..." }`

Server emits:

- `connected`
- `battle:queued`
- `battle:matched`
- `battle:score`
- `battle:finished`
- `battle:error`

## Notes

- Generate at least one quiz for a topic before starting a battle for that topic.
- Set an admin manually in MySQL:

```sql
UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';
```
