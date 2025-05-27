import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import ErrorBoundary from '../ErrorBoundary';

// Simple component that throws an error
const ThrowError = () => {
  throw new Error('Test error');
};

// Simple component that renders text
const TestComponent = () => <div>Test content</div>;

describe('ErrorBoundary', () => {
  it('renders children when there is no error', () => {
    const { container } = render(
      <ErrorBoundary>
        <TestComponent />
      </ErrorBoundary>
    );
    
    expect(container.textContent).toBe('Test content');
  });

  it('renders error UI when there is an error', () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    const { container } = render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );
    
    expect(container.textContent).toContain('Something went wrong');
    expect(container.textContent).toContain('Refresh Page');
    
    consoleSpy.mockRestore();
  });
}); 