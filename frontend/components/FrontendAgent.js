import React, { useEffect, useState } from 'react';
import axios from 'axios';

// Function to assign task to the frontend agent
export function assignToFrontendAgent(task) {
  console.log('Assigning frontend task:', task);

  // Example for task handling, you can extend this to handle more frontend tasks
  switch (task.title) {
    case 'Create Login Screen':
      return generateLoginScreen();
    case 'Create Task List UI':
      return generateTaskListUI();
    default:
      console.log(`No handler for task: ${task.title}`);
      return null; // If no handler exists, return null
  }
}

// Function to generate Login Screen component code
function generateLoginScreen() {
  console.log("Generating Login Screen...");
  return `
import React, { useState } from 'react';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login submitted:', { email, password });
  };

  return (
    <div className="login-screen">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button type="submit">Login</button>
      </form>
    </div>
  );
}
  `;
}

// Function to generate Task List UI component code
function generateTaskListUI() {
  console.log("Generating Task List UI...");
  return `
import React, { useState, useEffect } from 'react';

export default function TaskListUI() {
  const [tasks, setTasks] = useState([]);

  // Fetch tasks dynamically from the backend
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await axios.get('/api/tasks'); // Replace with your backend endpoint
        setTasks(response.data); // Set tasks from the backend
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };
    fetchTasks();
  }, []);

  return (
    <div className="task-list">
      <h2>Task List</h2>
      <ul>
        {tasks.map((task) => (
          <li key={task.id}>
            <h3>{task.title}</h3>
            <p>{task.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
  `;
}

