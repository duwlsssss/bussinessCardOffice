// index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { GoogleOAuthProvider } from '@react-oauth/google';


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
      <GoogleOAuthProvider clientId="802272773387-b4m9urg8a09ov95v8rev0mhdfellp5pu.apps.googleusercontent.com">
        <App />
      </GoogleOAuthProvider>
  </React.StrictMode>
);
