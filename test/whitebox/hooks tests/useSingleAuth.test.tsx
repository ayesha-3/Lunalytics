import { renderHook, act } from '@testing-library/react';
import useSingleAuth from '../../../app/hooks/useSingleAuth';

jest.mock('../../../shared/validators', () => ({
  auth: {
    email: jest.fn(),
    password: jest.fn(),
  },
}));

import validators from '../../../shared/validators';

describe('useSingleAuth Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('handleInputChange updates inputs without validation', () => {
    const { result } = renderHook(() => useSingleAuth());

    act(() => {
      result.current.handleInputChange({
        target: { id: 'username', value: 'Ayesha' },
      } as any);
    });

    expect(result.current.inputs.username).toBe('Ayesha');
  });

  test('handleInput with validator: invalid input sets error', () => {
    (validators.auth.email as jest.Mock).mockReturnValue({
      email: 'Invalid email',
    });

    const { result } = renderHook(() => useSingleAuth());

    act(() => {
      result.current.handleInput({
        target: { id: 'email', value: 'badEmail' },
      } as any);
    });

    expect(result.current.errors.email).toBe('Invalid email');
    expect(result.current.inputs.email).toBe('badEmail');
  });

  test('handleInput with validator: valid input clears error', () => {
    (validators.auth.email as jest.Mock).mockReturnValue(false);

    const { result } = renderHook(() => useSingleAuth());

    act(() => {
      result.current.handleInput({
        target: { id: 'email', value: 'test@gmail.com' },
      } as any);
    });

    expect(result.current.errors.email).toBe('');
    expect(result.current.inputs.email).toBe('test@gmail.com');
  });

  test('confirmPassword mismatch sets error', () => {
    const { result } = renderHook(() => useSingleAuth());

    // set password first
    act(() => {
      result.current.handleInputChange({
        target: { id: 'password', value: 'abc123' },
      } as any);
    });

    act(() => {
      result.current.handleInput({
        target: { id: 'confirmPassword', value: 'wrong' },
      } as any);
    });

    expect(result.current.errors.confirmPassword).toBe(
      'Passwords do not match'
    );
  });

  test('confirmPassword match clears error', () => {
    const { result } = renderHook(() => useSingleAuth());

    act(() => {
      result.current.handleInputChange({
        target: { id: 'password', value: 'abc123' },
      } as any);
    });

    act(() => {
      result.current.handleInput({
        target: { id: 'confirmPassword', value: 'abc123' },
      } as any);
    });

    expect(result.current.errors.confirmPassword).toBe('');
  });

  test('setErrors merges provided errors', () => {
    const { result } = renderHook(() => useSingleAuth());

    act(() => {
      result.current.setErrors({ email: 'Bad email' });
    });

    expect(result.current.errors.email).toBe('Bad email');
  });

  test('page updates correctly with setPage', () => {
    const { result } = renderHook(() => useSingleAuth());

    act(() => {
      result.current.setPage('password');
    });

    expect(result.current.page).toBe('password');
  });
});
