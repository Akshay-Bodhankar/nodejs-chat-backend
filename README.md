# Node.js Chat Backend

A RESTful chat backend built with **Node.js, TypeScript, Express, PostgreSQL, Prisma ORM, and Firebase Cloud Firestore**. It supports private one-to-one conversations, group conversations, message history, read receipts, last-seen tracking, and message editing/deletion.

## Features

### Users
- Create users with name and email.
- Retrieve a user by ID.
- Validate request payloads and prevent duplicate email addresses.

### Private chats
- Create or retrieve a one-to-one chat between two users.
- Prevent duplicate private chats using a normalized participant-pair key.
- Retrieve chat details and a user's chat list.

### Group chats
- Create group chats with a name and at least three participants, including the creator.
- Assign the creator the `ADMIN` role and other participants the `MEMBER` role.
- Allow admins to add and remove group members.
- Prevent an admin from removing themselves through the member-removal endpoint and protect the last remaining admin.

### Messages
- Send messages to a chat.
- Retrieve messages in chronological order, with a configurable limit.
- Mark messages as read using per-user read receipts.
- Update a member's last-seen message and timestamp.
- Edit or soft-delete a message. Only the original sender can edit or delete their message.
- Preserve deleted message records and display the placeholder `This message was deleted`.

## Technology stack

| Component | Technology |
|---|---|
| Runtime | Node.js 20 |
| Language | TypeScript (strict mode enabled) |
| HTTP framework | Express 5 |
| Relational database | PostgreSQL |
| ORM / migrations | Prisma 7 |
| Message storage | Firebase Cloud Firestore |
| Firebase integration | Firebase Admin SDK |
| Request validation | Zod |
| API documentation | Swagger UI / OpenAPI |
| Security middleware | Helmet, CORS |
| Containerization | Docker and Docker Compose |

## Architecture

The backend follows a layered architecture. HTTP requests enter through Express routes, are handled by controllers, validated, and passed to services for business rules. Repositories handle persistence through Prisma/PostgreSQL or Firebase Admin/Cloud Firestore.

### High-level system architecture

```mermaid
flowchart TB
    Client["Client Application / Swagger UI"]
    API["Express REST API<br/>Node.js + TypeScript"]

    subgraph Backend["Backend application"]
        MW["Middleware<br/>Validation · Error handling"]
        Routes["Routes"]
        Controllers["Controllers"]
        Services["Services / Business logic"]
        Repositories["Repositories / Data access"]

        MW --> Routes --> Controllers --> Services --> Repositories
    end

    PG[("PostgreSQL<br/>Prisma ORM")]
    FS[("Firebase Cloud Firestore<br/>Firebase Admin SDK")]

    Client -->|"HTTP / JSON"| API
    API --> MW
    Repositories -->|"Users · Chats · Members<br/>Last-seen metadata"| PG
    Repositories -->|"Messages · Read receipts"| FS
```

### Request and data flow

```mermaid
flowchart LR
    Request["HTTP request"] --> Route["Express route"]
    Route --> Controller["Controller<br/>Parse and validate input"]
    Controller --> Service["Service<br/>Apply business rules"]
    Service --> Repository["Repository<br/>Execute data operation"]

    Repository -->|Relational data| Prisma["Prisma Client"]
    Prisma --> PostgreSQL[("PostgreSQL")]

    Repository -->|Chat message data| Firebase["Firebase Admin SDK"]
    Firebase --> Firestore[("Cloud Firestore")]

    PostgreSQL --> Result["Result"]
    Firestore --> Result
    Result --> Service
    Service --> Controller
    Controller --> Response["HTTP JSON response"]
```

### Data ownership

- **PostgreSQL** stores users, chats, chat membership, member roles, and last-seen metadata.
- **Cloud Firestore** stores chat messages and read-receipt documents.
- **Docker Compose** runs the API and PostgreSQL locally. Firestore remains a managed Firebase cloud service.

The Firestore collection layout is:

```text
chats/{chatId}/
  messages/{messageId}/
    readReceipts/{userId}
```

A message document contains fields such as `senderId`, `text`, `createdAt`, `editedAt`, and `deletedAt`.

## Project structure

```text
nodejs-chat-backend/
├── prisma/
│   ├── migrations/
│   └── schema.prisma
├── prisma7.config.ts
├── src/
│   ├── config/
│   │   ├── database.ts
│   │   ├── firebase.ts
│   │   └── swagger.ts
│   ├── modules/
│   │   ├── chats/
│   │   ├── groups/
│   │   ├── messages/
│   │   └── users/
│   ├── generated/
│   │   └── prisma/
│   ├── app.ts
│   └── server.ts
├── Dockerfile
├── docker-compose.yml
├── .dockerignore
├── .env.example
├── package.json
├── package-lock.json
└── tsconfig.json
```

## Requirements

For local development:
- Node.js 20.x
- npm
- PostgreSQL 18 (or a compatible supported PostgreSQL version)
- A Firebase project with Cloud Firestore enabled
- A Firebase service-account JSON key

For the Docker setup:
- Docker Desktop or Docker Engine with the Compose plugin

## Configuration

### 1. Clone the repository

```bash
git clone <YOUR_REPOSITORY_URL>
cd nodejs-chat-backend
```

Replace `<YOUR_REPOSITORY_URL>` with your Git remote URL.

### 2. Install dependencies

```bash
npm ci
```

### 3. Configure environment variables

Create a local `.env` file:

```bash
cp .env.example .env
```

For local development, set the PostgreSQL connection string in `.env`:

```env
PORT=8000
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/chat_backend?schema=public"
```

Replace the username, password, host, and database name with your local PostgreSQL settings. URL-encode special characters in the password when required.

### 4. Configure Firebase

1. Create or select a Firebase project.
2. Enable Cloud Firestore.
3. Generate a service-account key from the Firebase project settings.
4. Save the downloaded JSON file in the project root as:

```text
serviceAccountKey.json
```

**Never commit this file.** It is excluded by `.gitignore` and `.dockerignore`. Do not paste service-account credentials into source code, README files, or public repositories.

## Run locally (without Docker)

Make sure PostgreSQL is running and the `DATABASE_URL` in `.env` points to the database.

```bash
npm ci
npx prisma migrate deploy --config prisma7.config.ts
npm run dev
```

The development server uses `tsx watch`.

### Build and run

```bash
npm run build
npm start
```

The build script generates the Prisma client and compiles TypeScript into `dist/`.

## Run with Docker Compose

Docker Compose starts PostgreSQL and the API. The API waits for PostgreSQL's health check, applies existing Prisma migrations, and then starts the server. Firebase Firestore remains a managed cloud dependency.

### 1. Prepare configuration

```bash
cp .env.example .env
```

Edit `.env` and set a strong local password:

```env
PORT=8000
POSTGRES_USER=postgres
POSTGRES_PASSWORD=replace_with_a_strong_local_password
POSTGRES_DB=chat_backend
POSTGRES_PORT=5432
```

Place your Firebase service-account file at the project root:

```text
serviceAccountKey.json
```

The Compose file mounts it read-only into the API container.

### 2. Build and start

```bash
docker compose up --build
```

Run in the background:

```bash
docker compose up --build -d
```

### 3. Check container status and logs

```bash
docker compose ps
docker compose logs -f api
docker compose logs -f postgres
```

Expected API startup messages include successful PostgreSQL connection, Firebase initialization, and the API listening on port 8000.

### 4. Verify the API

- Health: http://localhost:8000/health
- Firebase health: http://localhost:8000/health/firebase
- Swagger UI: http://localhost:8000/api-docs

### 5. Stop the containers

```bash
docker compose down
```

To also delete the PostgreSQL data volume (this permanently removes the database data):

```bash
docker compose down -v
```

### Docker notes

- Inside Compose, the API connects to PostgreSQL using the hostname `postgres`, not `localhost`.
- The database data is persisted in the named Docker volume `postgres_data`.
- The Firebase service-account JSON is mounted read-only and is not copied into the image.
- The Docker image currently retains the Prisma CLI and development dependencies so the container can apply migrations at startup. A later production-hardening pass can separate migrations into a dedicated one-off job and prune build-time dependencies from the runtime image.
- The Compose configuration is intended for local development/demo use. Use managed secrets, restricted network exposure, TLS, resource limits, and a hardened deployment setup for production.

## API reference

The interactive and authoritative request/response documentation is available at:

**http://localhost:8000/api-docs**

Base URL for local execution: `http://localhost:8000`

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/users` | Create a user |
| `GET` | `/users/{userId}` | Get a user |
| `POST` | `/chat/create` | Create or retrieve a private chat |
| `GET` | `/chat/{chatId}` | Get chat details |
| `POST` | `/chat/group/create` | Create a group chat |
| `POST` | `/chat/{chatId}/members` | Add group members |
| `DELETE` | `/chat/{chatId}/members/{userId}` | Remove a group member |
| `GET` | `/user/{userId}/chats` | Get a user's chats |
| `POST` | `/chat/{chatId}/message/send` | Send a message |
| `GET` | `/chat/{chatId}/messages?limit=50` | Retrieve messages |
| `POST` | `/chat/{chatId}/message/{messageId}/read` | Mark a message as read |
| `POST` | `/chat/{chatId}/lastseen` | Update last-seen metadata |
| `PUT` | `/chat/{chatId}/message/{messageId}/edit` | Edit a message |
| `DELETE` | `/chat/{chatId}/message/{messageId}/delete` | Soft-delete a message |

### Example requests

Create a user:

```bash
curl -X POST http://localhost:8000/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Alex","email":"alex@example.com"}'
```

Create or retrieve a private chat:

```bash
curl -X POST http://localhost:8000/chat/create \
  -H "Content-Type: application/json" \
  -d '{
    "userAId":"<USER_A_UUID>",
    "userBId":"<USER_B_UUID>"
  }'
```

Create a group chat:

```bash
curl -X POST http://localhost:8000/chat/group/create \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Development Team",
    "creatorId":"<CREATOR_UUID>",
    "memberIds":["<CREATOR_UUID>","<USER_B_UUID>","<USER_C_UUID>"]
  }'
```

Send a message:

```bash
curl -X POST http://localhost:8000/chat/<CHAT_UUID>/message/send \
  -H "Content-Type: application/json" \
  -d '{
    "senderId":"<SENDER_UUID>",
    "text":"Hello, everyone!"
  }'
```

Retrieve messages:

```bash
curl "http://localhost:8000/chat/<CHAT_UUID>/messages?limit=50"
```

The path IDs and request-body fields are documented in Swagger. Replace the placeholder values with IDs returned by the API.

## Database migrations

Prisma schema: `prisma/schema.prisma`

Prisma configuration: `prisma7.config.ts`

Apply committed migrations to the configured database:

```bash
npx prisma migrate deploy --config prisma7.config.ts
```

During local schema development, create a migration with:

```bash
npx prisma migrate dev --config prisma7.config.ts --name <migration_name>
```

Generate the Prisma client:

```bash
npx prisma generate --config prisma7.config.ts
```

## Security and production considerations

This project demonstrates the chat API workflow and database integration. Before exposing it to real users, add or verify:

- Authentication (for example, JWT or an identity provider) and derive the acting user from the authenticated session rather than trusting `senderId`, `requesterId`, or `userId` supplied in request bodies.
- Authorization checks for every chat and message operation.
- Rate limiting, request-size limits, input/output logging policy, and operational monitoring.
- HTTPS/TLS and secret management for database and Firebase credentials.
- Automated unit and integration tests.
- A production deployment strategy for database backups, migrations, and Firestore security/administration.

The current API accepts actor identifiers in request payloads for the assignment workflow; this is not a substitute for production authentication.

## Current scope

- REST APIs are provided through Express and Swagger UI.
- Message persistence and read receipts use Firestore.
- User/chat/membership/last-seen persistence uses PostgreSQL.
- No WebSocket-based real-time delivery is documented in this implementation.
- Automated Jest/Supertest coverage has not been included in this project snapshot.

## License

See the [LICENSE](LICENSE) file.
