import React from 'react';
import { render } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import useCurrentUrl from '../../../app/hooks/useCurrentUrl';

describe('useCurrentUrl', () => {
  const originalLocation = window.location;

  // Helper to mock window.location
  const setWindowLocation = (locationOverride: Partial<Location>) => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      writable: true,
      value: {
        ...originalLocation,
        ...locationOverride,
        assign: jest.fn(),
        reload: jest.fn(),
        replace: jest.fn(),
        toString: () => originalLocation.toString(),
      },
    });
  };

  // Test component to capture hook result
  const TestComponent = ({
    locationOverride,
    callback,
  }: {
    locationOverride?: Partial<Location>;
    callback: (url: Location) => void;
  }) => {
    if (locationOverride) {
      setWindowLocation(locationOverride);
    }

    const url = useCurrentUrl();
    React.useLayoutEffect(() => {
      callback(url);
    }, [url, callback]);

    return null;
  };

  afterEach(() => {
    // Restore original location
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: originalLocation,
    });
    jest.restoreAllMocks();
  });

  it('should return initial pathname before layout effect runs', () => {
    let result: any;

    act(() => {
      render(<TestComponent callback={(url) => (result = url)} />);
    });

    expect(result.pathname).toBe(window.location.pathname);
  });

  it('should update to full URL after layout effect runs', () => {
    let result: any;

    act(() => {
      render(<TestComponent callback={(url) => (result = url)} />);
    });

    expect(result.href).toBe(window.location.href);
  });

  it('should include port if present', () => {
    let result: any;

    act(() => {
      render(
        <TestComponent
          locationOverride={{ port: '8080' }}
          callback={(url) => (result = url)}
        />
      );
    });

    expect(result.port).toBe('8080');
  });

  it('should construct URL using protocol, hostname, and optional port', () => {
    let result: any;

    act(() => {
      render(
        <TestComponent
          locationOverride={{
            protocol: 'https:',
            hostname: 'example.com',
            port: '3000',
          }}
          callback={(url) => (result = url)}
        />
      );
    });

    expect(result.protocol).toBe('https:');
    expect(result.hostname).toBe('example.com');
    expect(result.port).toBe('3000');
  });
});
