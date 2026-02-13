
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error("Critical Failure: Root element not found in DOM.");
} else {
  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (err) {
    console.error("Render Error:", err);
    rootElement.innerHTML = `
      <div style="height: 100vh; display: flex; align-items: center; justify-content: center; font-family: sans-serif; background: #f8fafc; color: #1e293b; text-align: center; padding: 20px;">
        <div>
          <h1 style="font-size: 24px; font-weight: 900; margin-bottom: 8px;">Initialization Failed</h1>
          <p style="color: #64748b;">The application failed to start. Please clear your cache and refresh.</p>
          <button onclick="window.location.reload()" style="margin-top: 16px; padding: 10px 20px; background: #4f46e5; color: white; border: none; border-radius: 8px; font-weight: bold; cursor: pointer;">Retry Boot</button>
        </div>
      </div>
    `;
  }
}
