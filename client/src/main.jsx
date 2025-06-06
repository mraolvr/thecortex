import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import Logger from './utils/logger';
import { API_CONFIG } from './config/environment';
import './styles/fonts.css';
import './index.css';

// Add global error handler
window.onerror = function(message, source, lineno, colno, error) {
  Logger.error('Global error:', { message, source, lineno, colno, error });
};

// Add unhandled rejection handler
window.onunhandledrejection = function(event) {
  Logger.error('Unhandled promise rejection:', event.reason);
};

Logger.info('Starting application...');

// Configure React Query client with proper caching and retry logic
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: API_CONFIG.retryAttempts,
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      refetchOnReconnect: true,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      onError: (error) => {
        Logger.error('Query error:', error);
      }
    },
    mutations: {
      retry: API_CONFIG.retryAttempts,
      onError: (error) => {
        Logger.error('Mutation error:', error);
      }
    }
  },
});

// Loading fallback component
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

// Register service worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then(registration => {
                console.log('ServiceWorker registration successful with scope: ', registration.scope);
            })
            .catch(error => {
                console.error('ServiceWorker registration failed: ', error);
            });
    });
}

try {
  const root = ReactDOM.createRoot(document.getElementById('root'));
  Logger.info('Root element found, rendering app...');
  
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <Suspense fallback={<LoadingFallback />}>
              <App />
            </Suspense>
          </BrowserRouter>
        </QueryClientProvider>
      </ErrorBoundary>
    </React.StrictMode>
  );
} catch (error) {
  Logger.error('Failed to render application:', error);
  document.body.innerHTML = `
    <div class="min-h-screen flex items-center justify-center bg-gray-100">
      <div class="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
        <h2 class="text-2xl font-bold text-red-600 mb-4">Application Error</h2>
        <p class="text-gray-600 mb-4">
          The application failed to start. Please refresh the page or contact support if the problem persists.
        </p>
        <button
          onclick="window.location.reload()"
          class="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
        >
          Refresh Page
        </button>
      </div>
    </div>
  `;
} 