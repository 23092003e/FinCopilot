import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from './contexts/AuthContext';
import { UIProvider } from './contexts/UIContext';

// Filter out and suppress benign Vite WebSocket HMR closed-rejection events in sandbox preview environment
if ((import.meta as any).env?.DEV) {
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    const msg = typeof reason === 'string' ? reason : (reason?.message || '');
    if (
      msg.includes('WebSocket') || 
      msg.includes('websocket') || 
      msg.includes('vite') || 
      msg.includes('hmr') || 
      msg.includes('HMR')
    ) {
      event.preventDefault();
      event.stopPropagation();
      console.warn('[Vite Sandbox Wrapper] Suppressed benign sandbox HMR websocket rejection:', msg);
    }
  }, { capture: true });

  window.addEventListener('error', (event) => {
    const msg = event.message || '';
    if (
      msg.includes('WebSocket') || 
      msg.includes('websocket') || 
      msg.includes('vite') || 
      msg.includes('hmr') || 
      msg.includes('HMR')
    ) {
      event.preventDefault();
      event.stopPropagation();
      console.warn('[Vite Sandbox Wrapper] Suppressed benign sandbox HMR websocket error:', msg);
    }
  }, { capture: true });
}

// Register PWA Service Worker
if ('serviceWorker' in navigator && (import.meta as any).env?.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((reg) => {
        console.log('[PWA] Service Worker registered successfully:', reg.scope);
      })
      .catch((err) => {
        console.error('[PWA] Service Worker registration failed:', err);
      });
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <UIProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </UIProvider>
  </StrictMode>,
);

