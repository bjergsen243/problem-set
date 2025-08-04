# Express + TypeScript CRUD API

A simple backend CRUD API built with **Express.js**, **TypeScript**, and **Prisma ORM** using **SQLite** for data persistence.

Link: https://s5tech.notion.site/Problem-5-A-Crude-Server-b2978984b3c64b7dae6451f1c215bef7

## Coverage

[![codecov](https://codecov.io/gh/bjergsen243/problem-set/branch/main/graph/badge.svg)](https://codecov.io/gh/bjergsen243/problem-set)

## Features

- Create a resource (User)
- List resources with basic filters (e.g., filter by name)
- Get details of a resource
- Update a resource
- Delete a resource
- Uses Prisma ORM and SQLite for simplicity

## Tech Stack

- [Express.js](https://expressjs.com/)
- [TypeScript](https://www.typescriptlang.org/)
- [Prisma](https://www.prisma.io/)
- [SQLite](https://www.sqlite.org/)

## Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/bjergsen243/problem-set
   cd problem_5
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Initialize the database**

   ```bash
   npx prisma migrate dev --name init
   ```

4. **Start the development server**

   ```bash
   npm run dev
   ```

5. **Build and start for production**

   ```bash
   npm run build
   npm start
   ```

## API Endpoints

| Method | Endpoint     | Description                     |
| ------ | ------------ | ------------------------------- |
| POST   | `/users`     | Create a new user               |
| GET    | `/users`     | List all users (filter by name) |
| GET    | `/users/:id` | Get a user by ID                |
| PUT    | `/users/:id` | Update a user by ID             |
| DELETE | `/users/:id` | Delete a user by ID             |

## Example Requests

Create a new user:

```bash
curl -X POST http://localhost:3000/users \
-H "Content-Type: application/json" \
-d '{"name": "Alice", "email": "alice@example.com"}'
```

Get all users with name containing "Ali":

```bash
curl http://localhost:3000/users?name=Ali
```

## Project Structure

```
.
├── prisma/
│   └── schema.prisma         # Prisma schema
├── src/
│   ├── app.ts                # Express app config
│   ├── server.ts             # Entry point
│   └── routes/
│       └── user.routes.ts    # User CRUD routes
├── tsconfig.json             # TypeScript config
├── package.json              # Project metadata & scripts
└── README.md                 # This file
```

## Scripts

| Script          | Description                            |
| --------------- | -------------------------------------- |
| `npm run dev`   | Start server in dev mode (ts-node-dev) |
| `npm run build` | Compile TypeScript to JS               |
| `npm start`     | Run compiled server                    |
| `npx prisma`    | Run Prisma CLI                         |
