import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@/App';
import ErrorBoundary from '@/components/ErrorBoundary';
import '@/index.css';

// Polyfill crypto.randomUUID for iOS < 15.4
if (typeof crypto !== 'undefined' && !crypto.randomUUID) {
  crypto.randomUUID = () => {
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
      (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16)
    );
  };
}
// Fix for mobile 100vh issue
// const setAppHeight = () => {
//   const doc = document.documentElement;
//   doc.style.setProperty('--app-height', `${window.innerHeight}px`);
// };
// window.addEventListener('resize', setAppHeight);
// setAppHeight();

// Ensure the root element exists before mounting
const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
} else {
  console.error('Root element not found');
}