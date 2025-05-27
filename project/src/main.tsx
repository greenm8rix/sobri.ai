import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerServiceWorker } from './registerServiceWorker';

// TEMPORARY DEBUG LOG - REMOVE AFTER DEBUGGING
console.log('[main.tsx] import.meta.env:', import.meta.env);
console.log('[main.tsx] VITE_APP_API_KEY:', import.meta.env.VITE_APP_API_KEY);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

// Register service worker for PWA support
registerServiceWorker();
