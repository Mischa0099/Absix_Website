// src/index.js
import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles/globals.css';
import './styles/variables.css';
import './styles/robotStatus.css';
import './styles/components.css';
import './styles/dashboard.css';
import './styles/animations.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Get the root element
const container = document.getElementById('root');
const root = createRoot(container);

// Render the app
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();