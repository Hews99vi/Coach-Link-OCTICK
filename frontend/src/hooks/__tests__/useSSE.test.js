import { renderHook, act } from '@testing-library/react';
import useSSE from '../useSSE';

// Mock EventSource
global.EventSource = jest.fn(() => ({
  addEventListener: jest.fn(),
  close: jest.fn(),
  readyState: 1
}));

describe('useSSE Hook', () => {
  const mockUrl = 'http://localhost:5000/api/events/requests?token=test-token';
  const mockOnMessage = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initializes with disconnected state', () => {
    const { result } = renderHook(() => useSSE(mockUrl, mockOnMessage));

    expect(result.current.connected).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.reconnectAttempts).toBe(0);
  });

  it('creates EventSource connection', () => {
    renderHook(() => useSSE(mockUrl, mockOnMessage));

    expect(global.EventSource).toHaveBeenCalledWith(mockUrl);
  });

  it('sets up event listeners', () => {
    const mockEventSource = {
      addEventListener: jest.fn(),
      close: jest.fn(),
      readyState: 1
    };

    global.EventSource = jest.fn(() => mockEventSource);

    renderHook(() => useSSE(mockUrl, mockOnMessage));

    expect(mockEventSource.addEventListener).toHaveBeenCalledWith('open', expect.any(Function));
    expect(mockEventSource.addEventListener).toHaveBeenCalledWith('error', expect.any(Function));
    expect(mockEventSource.addEventListener).toHaveBeenCalledWith('requestUpdate', expect.any(Function));
    expect(mockEventSource.addEventListener).toHaveBeenCalledWith('statusChange', expect.any(Function));
    expect(mockEventSource.addEventListener).toHaveBeenCalledWith('heartbeat', expect.any(Function));
  });

  it('handles connection open', () => {
    let openHandler;
    const mockEventSource = {
      addEventListener: jest.fn((event, handler) => {
        if (event === 'open') openHandler = handler;
      }),
      close: jest.fn(),
      readyState: 1
    };

    global.EventSource = jest.fn(() => mockEventSource);

    const { result } = renderHook(() => useSSE(mockUrl, mockOnMessage));

    act(() => {
      openHandler();
    });

    expect(result.current.connected).toBe(true);
    expect(result.current.reconnectAttempts).toBe(0);
  });

  it('handles errors with reconnect', async () => {
    jest.useFakeTimers();

    let errorHandler;
    const mockEventSource = {
      addEventListener: jest.fn((event, handler) => {
        if (event === 'error') errorHandler = handler;
      }),
      close: jest.fn(),
      readyState: 3 // CLOSED
    };

    global.EventSource = jest.fn(() => mockEventSource);

    const { result } = renderHook(() => useSSE(mockUrl, mockOnMessage));

    act(() => {
      errorHandler(new Event('error'));
    });

    expect(result.current.connected).toBe(false);
    expect(result.current.error).toBe('Connection lost. Reconnecting...');

    jest.useRealTimers();
  });

  it('calls onMessage when receiving events', () => {
    let requestUpdateHandler;
    const mockEventSource = {
      addEventListener: jest.fn((event, handler) => {
        if (event === 'requestUpdate') requestUpdateHandler = handler;
      }),
      close: jest.fn(),
      readyState: 1
    };

    global.EventSource = jest.fn(() => mockEventSource);

    renderHook(() => useSSE(mockUrl, mockOnMessage));

    const mockEvent = {
      type: 'requestUpdate',
      data: JSON.stringify({ id: 1, status: 'approved' })
    };

    act(() => {
      requestUpdateHandler(mockEvent);
    });

    expect(mockOnMessage).toHaveBeenCalledWith(mockEvent);
  });

  it('cleans up EventSource on unmount', () => {
    const mockClose = jest.fn();
    const mockEventSource = {
      addEventListener: jest.fn(),
      close: mockClose,
      readyState: 1
    };

    global.EventSource = jest.fn(() => mockEventSource);

    const { unmount } = renderHook(() => useSSE(mockUrl, mockOnMessage));

    unmount();

    expect(mockClose).toHaveBeenCalled();
  });

  it('stops reconnecting after max attempts', () => {
    jest.useFakeTimers();

    let errorHandler;
    const mockEventSource = {
      addEventListener: jest.fn((event, handler) => {
        if (event === 'error') errorHandler = handler;
      }),
      close: jest.fn(),
      readyState: 3
    };

    global.EventSource = jest.fn(() => mockEventSource);

    const { result } = renderHook(() => useSSE(mockUrl, mockOnMessage, 2)); // maxAttempts = 2

    // First error
    act(() => {
      errorHandler(new Event('error'));
    });

    expect(result.current.reconnectAttempts).toBe(1);

    // Second error
    act(() => {
      errorHandler(new Event('error'));
    });

    expect(result.current.reconnectAttempts).toBe(2);
    expect(result.current.error).toBe('Connection failed after 2 attempts');

    jest.useRealTimers();
  });
});
