export const isDevelopment = import.meta.env.MODE === 'development';

// API endpoints
export const API_ENDPOINTS = {
  MENTOR: import.meta.env.VITE_MENTOR_ENDPOINT || '/api/mentor',
  SUMMARIZER: import.meta.env.VITE_SUMMARIZER_ENDPOINT || '/api/summarizer',
  EMAIL_EDITOR: import.meta.env.VITE_EMAIL_EDITOR_ENDPOINT || '/api/email-editor',
  AGENT: import.meta.env.VITE_AGENT_ENDPOINT || '/api/agent'
};

// API configuration
export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_URL || (isDevelopment ? 'http://localhost:3000' : window.location.origin),
  timeout: 30000,
  retryAttempts: 3
}; 