// Ensure window.fetch has a setter if defined with only a getter in restricted environments
if (typeof window !== 'undefined') {
  try {
    const desc =
      Object.getOwnPropertyDescriptor(window, 'fetch') ||
      Object.getOwnPropertyDescriptor(Object.getPrototypeOf(window), 'fetch');
    if (desc && (!desc.writable || !desc.set)) {
      let currentFetch = window.fetch ? window.fetch.bind(window) : undefined;
      try {
        Object.defineProperty(window, 'fetch', {
          get() {
            return currentFetch;
          },
          set(fn) {
            currentFetch = fn;
          },
          configurable: true,
          enumerable: true,
        });
      } catch {
        // Ignore if non-configurable
      }
    }
  } catch {
    // Ignore error
  }

  // Intercept and swallow harmless HTMLMediaElement errors (e.g. unsupported source / blocked CDN)
  window.addEventListener(
    'error',
    (event) => {
      const target = event.target as HTMLElement | null;
      if (
        (target && (target.tagName === 'AUDIO' || target.tagName === 'VIDEO')) ||
        event.message?.includes('no supported source') ||
        event.message?.includes('Failed to load')
      ) {
        event.preventDefault();
        event.stopPropagation();
        return true;
      }
    },
    true
  );

  window.addEventListener('unhandledrejection', (event) => {
    if (
      event.reason?.message?.includes('no supported source') ||
      event.reason?.name === 'NotSupportedError'
    ) {
      event.preventDefault();
    }
  });
}

import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
