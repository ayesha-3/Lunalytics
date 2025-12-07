import React from 'react';
import { renderHook, act } from '@testing-library/react';
import useNotificationForm from '../../../app/hooks/useNotificationForm';
import NotificationValidators from '../../../shared/validators/notifications';
import { NotificationValidatorError } from '../../../shared/utils/errors';
import { createPostRequest } from '../../../app/services/axios';

jest.mock('../../../app/services/axios', () => ({
  createPostRequest: jest.fn(),
}));

describe('useNotificationForm - full coverage', () => {
  const mockAddNotification = jest.fn();
  const mockCloseModal = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useNotificationForm());
    expect(result.current.inputs.platform).toBe('Discord');
    expect(result.current.inputs.messageType).toBe('basic');
    expect(result.current.errors).toEqual({});
  });

  it('should reset inputs when values change', () => {
    const initial = { platform: 'Discord', messageType: 'basic' };
    const { result, rerender } = renderHook(
      (props) => useNotificationForm(props.values),
      { initialProps: { values: initial } }
    );

    act(() => {
      result.current.handleInput({ key: 'platform', value: 'Slack' });
    });
    expect(result.current.inputs.platform).toBe('Slack');

    // Change props to trigger reset
    const newValues = { platform: 'Teams', messageType: 'advanced' };
    rerender({ values: newValues });

    expect(result.current.inputs).toEqual(newValues);
  });

  it('should handle input changes', () => {
    const { result } = renderHook(() => useNotificationForm());
    act(() => {
      result.current.handleInput({ key: 'platform', value: 'Slack' });
    });
    expect(result.current.inputs.platform).toBe('Slack');
    expect(result.current.inputs.messageType).toBe('basic'); // unchanged
  });

  it('should handle validation error from NotificationValidators', async () => {
    const { result } = renderHook(() => useNotificationForm());

    NotificationValidators.Discord = jest.fn(() => {
      throw new NotificationValidatorError('messageType', 'Invalid type');
    });

    act(() => {
      result.current.handleInput({ key: 'messageType', value: 'invalid' });
    });

    await act(async () => {
      await result.current.handleSubmit(mockAddNotification);
    });

    expect(result.current.errors.messageType).toBe('Invalid type');
    expect(mockAddNotification).not.toHaveBeenCalled();
  });

  it('should handle unknown errors gracefully', async () => {
    const { result } = renderHook(() => useNotificationForm());

    NotificationValidators.Discord = jest.fn((inputs) => inputs);

    (createPostRequest as jest.Mock).mockRejectedValue(new Error('Network error'));

    await act(async () => {
      await result.current.handleSubmit(mockAddNotification);
    });

    expect(result.current.errors.general).toBe(
      'Unknown error occured. Please try again.'
    );
    expect(mockAddNotification).not.toHaveBeenCalled();
  });

  it('should submit successfully in create mode', async () => {
    const { result } = renderHook(() => useNotificationForm(undefined, false, mockCloseModal));

    NotificationValidators.Discord = jest.fn((inputs) => inputs);

    (createPostRequest as jest.Mock).mockResolvedValue({
      status: 201,
      data: { id: 1, platform: 'Discord', messageType: 'basic' },
    });

    await act(async () => {
      await result.current.handleSubmit(mockAddNotification);
    });

    expect(mockAddNotification).toHaveBeenCalledWith({
      id: 1,
      platform: 'Discord',
      messageType: 'basic',
    });
    expect(mockCloseModal).toHaveBeenCalled();
  });

  it('should submit successfully in edit mode', async () => {
    const initialInputs = { platform: 'Discord', messageType: 'basic' };
    const { result } = renderHook(() => useNotificationForm(initialInputs, true, mockCloseModal));

    NotificationValidators.Discord = jest.fn((inputs) => inputs);

    (createPostRequest as jest.Mock).mockResolvedValue({
      status: 200,
      data: { id: 2, platform: 'Discord', messageType: 'basic' },
    });

    await act(async () => {
      await result.current.handleSubmit(mockAddNotification);
    });

    expect(createPostRequest).toHaveBeenCalledWith(
      '/api/notifications/edit',
      initialInputs
    );
    expect(mockAddNotification).toHaveBeenCalledWith({
      id: 2,
      platform: 'Discord',
      messageType: 'basic',
    });
    expect(mockCloseModal).toHaveBeenCalled();
  });

  it('should handle invalid platform', async () => {
    const { result } = renderHook(() => useNotificationForm({ platform: 'Invalid', messageType: 'basic' }));

    await act(async () => {
      await result.current.handleSubmit(mockAddNotification);
    });

    expect(result.current.errors.general).toBe(
      'Unknown error occured. Please try again.'
    );
    expect(mockAddNotification).not.toHaveBeenCalled();
  });

  it('should handle handleError directly', () => {
    const { result } = renderHook(() => useNotificationForm());
    act(() => {
      result.current.handleError({ key: 'general', value: 'Test error' });
    });
    expect(result.current.errors.general).toBe('Test error');
  });
});
