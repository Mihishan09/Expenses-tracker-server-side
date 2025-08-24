# Expenses-tracker-server-side
Overview
A small Express.js API that powers the Simple Expense Tracker. It provides CRUD endpoints for tasks (expenses) and persists data in MongoDB.

Features
- GET /tasks — list all tasks
- POST /tasks — create a new task
- PUT /tasks/:id — update a task
- DELETE /tasks/:id — delete a task
- Input validation and basic error handling
- CORS enabled for local frontend testing

Tech stack
- Node.js, Express
- MongoDB (Atlas or local)
- Mongoose for data modeling
- Postman for testing





Run locally (quickstart)
1. Clone:
   **git clone https://github.com/Mihishan09/simple-expense-tracker-backend.git**
2. Install:
   cd simple-expense-tracker-backend
   npm install
3. Environment:
   Create a `.env` with:
   - PORT=5000
4. Start:
   npm run dev