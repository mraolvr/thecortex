import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import './styles/fonts.css';
import './index.css';

// Add global error handler
window.onerror = function(message, source, lineno, colno, error) {
  console.error('Global error:', { message, source, lineno, colno, error });
  // Here you would typically send this to your error tracking service
};

// Add unhandled rejection handler
window.onunhandledrejection = function(event) {
  console.error('Unhandled promise rejection:', event.reason);
  // Here you would typically send this to your error tracking service
};

console.log('Starting application...');

// Configure React Query client with proper caching
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      refetchOnReconnect: true,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

// Loading fallback component
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

try {
  const root = ReactDOM.createRoot(document.getElementById('root'));
  console.log('Root element found, rendering app...');
  
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
  console.error('Error during app initialization:', error);
  // Here you would typically send this to your error tracking service
} 