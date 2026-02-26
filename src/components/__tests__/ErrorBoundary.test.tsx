import { describe, expect, it, vi } from 'vitest';
import React from 'react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { clearLogsForTests, getRecentLogs } from '@/lib/logger';

describe('ErrorBoundary', () => {
  it('logs crash details when a render error is caught', () => {
    clearLogsForTests();
    const onError = vi.fn();
    const boundary = new ErrorBoundary({ children: React.createElement('div'), onError });

    const derived = ErrorBoundary.getDerivedStateFromError(new Error('boom'));
    expect(derived.hasError).toBe(true);

    const error = new Error('boom');
    const errorInfo = { componentStack: 'at Bomb' } as React.ErrorInfo;
    boundary.componentDidCatch(error, errorInfo);
    expect(getRecentLogs().some((evt) => evt.event === 'ui.error_boundary')).toBe(true);
    expect(onError).toHaveBeenCalledWith(error, errorInfo);
  });
});
