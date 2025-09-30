
# AI Agent Project

This project is a full-stack web application that implements an AI Agent capable of translating high-level project briefs into concrete technical tasks. The solution includes specialized sub-agents responsible for frontend and backend development.

## Features
- Coordinator Agent: Accepts project briefs and breaks them into well-defined tasks.
- Frontend Agent: Creates React components based on the technical tasks.
- Backend Agent: Creates REST APIs and handles database schema.

## Tech Stack
- Frontend: React.js (UI components)
- Backend: Node.js, Express.js, MongoDB (for storing tasks)
- Authentication: JWT (JSON Web Tokens)
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
   Create a env file in the backend folder with the following content:
   env
   MONGODB_URI=your_mongo_connection_string
   PORT=5000
   

5. Run the backend server:
   bash
   npm start
   

6. Run the frontend development server:
   bash
   npm start
   

### Deployment:
- **Frontend**: You can deploy the React app on platforms like **Vercel** or **Netlify**.
- **Backend**: The backend can be deployed on **Heroku** or **Render**.



