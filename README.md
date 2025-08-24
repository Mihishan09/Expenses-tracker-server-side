# Expenses-tracker-server-side
Overview
A small Express.js API that powers the Simple Expense Tracker. It provides CRUD endpoints for tasks (expenses) and persists data in MongoDB.

Features
- GET /tasks — list all task
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

API Endpoints 
   o GET /tasks — list all tasks.
   o POST /tasks — add new task.
   o PUT /tasks/:id — update task.
   o DELETE /tasks/:id — delete task.



Run locally (quickstart)
1. Clone:
   **git clone https://github.com/Mihishan09/Expenses-tracker-server-side.git**
2. Install:
   cd expense-tracker-server-side 
   npm install
3. Environment:
   Create a `.env` with:
   - PORT=5000
4. Start:
   npm run dev