
# AI Agent Project

This project is a full-stack web application that implements an AI Agent capable of translating high-level project briefs into concrete technical tasks. The solution includes specialized sub-agents responsible for frontend and backend development.

## Features
- Coordinator Agent: Accepts project briefs and breaks them into well-defined tasks.
- Frontend Agent: Creates React components based on the technical tasks.
- Backend Agent: Creates REST APIs and handles database schema.

## AI Agent (Coordinator)
The AI Agent is responsible for accepting a high-level project brief, breaking it into concrete technical tasks, and assigning these tasks to the appropriate sub-agents (Frontend and Backend). It coordinates the work of these sub-agents and collects the final output. For example, if the project brief is to build a task management app, the AI Agent will break this into tasks like creating a login page (Frontend) and creating an authentication API .

## Sub-Agents:
- Frontend Agent: Responsible for building React components based on the technical tasks provided by the AI Agent. It ensures that the UI is responsive and works according to the project requirements.
- Backend Agent: Responsible for creating REST APIs, handling business logic (e.g., authentication), and setting up a database schema for the application.

## Task Flow
1. AI Agent receives a project brief and breaks it down into tasks.
2. Frontend Agent is assigned the task of creating UI components (e.g., login page, task list).
3. Backend Agent is assigned the task of setting up REST APIs (e.g., authentication, CRUD operations).
4. The AI Agent coordinates and ensures that tasks are completed according to the brief.

## Tech Stack
- Frontend: React.js (UI components, responsive design)
- Backend: Node.js, Express.js, MongoDB (for storing tasks and user data)
- Authentication: JWT (for user authentication)
- AI Agent: Implements a task coordination system for breaking down high-level project briefs into technical tasks.
- Deployment: Can be deployed using platforms like Vercel (Frontend), Heroku/Render (Backend)

## Setup

### Prerequisites:
1. Node.js (for backend and frontend)
2. MongoDB (for backend data storage)

### Installation:

1. Clone the repository:
   bash
   git clone https://github.com/Kush146/Ai-agent
   

2. Install backend dependencies:
   bash
   cd backend
   npm install
   

3. Install frontend dependencies:
   bash
   cd frontend
   npm install
   

4. Set up your environment variables:
   Create an `.env` file in the backend folder with the following content:
   env
   MONGODB_URI=your_mongo_connection_string
   PORT=5000
   

5. Run the backend server:
   bash
   node server.js
   

6. Run the frontend development server:
   bash
   parcel index.html 
   

## Demo Video (Loom):
[Watch the demo video](https://www.loom.com/share/5a017aa1636a4092b991ffa3d376ccc9?sid=d80928f9-52a0-43d5-ac2c-ae40ded8202f)
