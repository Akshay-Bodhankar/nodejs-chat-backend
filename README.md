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

    Repository -->|"Relational data"| Prisma["Prisma Client"]
    Prisma --> PostgreSQL[("PostgreSQL")]

    Repository -->|"Chat message data"| Firebase["Firebase Admin SDK"]
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
├── package.json
├── package-lock.json
└── tsconfig.json
```

## Requirements

- macOS, Linux, or Windows
- Node.js 20.x
- npm
- PostgreSQL 18 (or a compatible supported PostgreSQL version)
- A Firebase project with Cloud Firestore enabled
- A Firebase service-account JSON key

## Local setup and execution

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

### 3. Create the PostgreSQL database

Make sure the PostgreSQL server is running. Create a database named `chat_backend` if it does not already exist.

Using `psql`, for example:

```sql
CREATE DATABASE chat_backend;
```

If the database already exists, you can continue to the next step.

### 4. Configure environment variables

Create a `.env` file in the project root:

```env
PORT=8000
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/chat_backend?schema=public"
```

Replace `YOUR_PASSWORD` with the password for your local PostgreSQL user. Update the username, host, port, or database name if your local PostgreSQL configuration differs. URL-encode special characters in the password when required.

Do not commit `.env` to Git.

### 5. Configure Firebase

1. Create or select a Firebase project.
2. Enable Cloud Firestore.
3. Generate a service-account key from the Firebase project settings.
4. Save the downloaded JSON file in the project root with this exact filename:

```text
serviceAccountKey.json
```

**Never commit this file.** It contains private credentials. Keep it excluded through `.gitignore`, and do not paste its contents into source code, README files, or public repositories.

### 6. Apply database migrations

Run the committed Prisma migrations against your local PostgreSQL database:

```bash
npx prisma migrate deploy --config prisma7.config.ts
```

Generate the Prisma client if needed:

```bash
npx prisma generate --config prisma7.config.ts
```

### 7. Start the development server

```bash
npm run dev
```

The development server uses `tsx watch` and listens on port `8000` by default.

### 8. Build and run the application

To compile the TypeScript application:

```bash
npm run build
```

To run the compiled application:

```bash
npm start
```

The build script generates the Prisma client and compiles TypeScript into `dist/`.

## API documentation

The interactive API documentation is available through Swagger UI after starting the server:

**http://localhost:8000/api-docs**

Base URL: `http://localhost:8000`

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

Replace the placeholder IDs with IDs returned by the API. Refer to Swagger for the exact request-body fields and response formats.

## Database migrations and schema changes

Prisma schema: `prisma/schema.prisma`

Prisma configuration: `prisma7.config.ts`

Apply committed migrations:

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

Before exposing the application to real users, add or verify:

- Authentication (for example, JWT or an identity provider) and derive the acting user from the authenticated session rather than trusting `senderId`, `requesterId`, or `userId` supplied in request bodies.
- Authorization checks for every chat and message operation.
- Rate limiting, request-size limits, input/output logging policy, and operational monitoring.
- HTTPS/TLS and secure secret management for database and Firebase credentials.
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
