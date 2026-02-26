import { describe, expect, it } from 'vitest';
import React from 'react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { clearLogsForTests, getRecentLogs } from '@/lib/logger';

describe('ErrorBoundary', () => {
  it('logs crash details when a render error is caught', () => {
    clearLogsForTests();
    const boundary = new ErrorBoundary({ children: React.createElement('div'), onError: undefined });

    const derived = ErrorBoundary.getDerivedStateFromError(new Error('boom'));
    expect(derived.hasError).toBe(true);

    boundary.componentDidCatch(new Error('boom'), { componentStack: 'at Bomb' } as React.ErrorInfo);
    expect(getRecentLogs().some((evt) => evt.event === 'ui.error_boundary')).toBe(true);
  });
});
