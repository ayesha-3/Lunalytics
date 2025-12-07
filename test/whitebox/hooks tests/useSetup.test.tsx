import { renderHook, act } from '@testing-library/react';
import { toast } from 'react-toastify';
import { useSetup } from '../../../app/hooks/useSetup';
import { setupData, setupPages } from '../../../shared/data/setup';
import setupValidators from '../../../shared/validators/setup';

// ------------------ MOCKS --------------------

jest.mock('../../../shared/data/setup', () => ({
  setupData: {
    EMAIL_FORM: { name: 'email', prev: null, required: ['email'] },
    USERNAME_FORM: { name: 'username', prev: 'EMAIL_FORM', required: [] },
  },
  setupPages: {
    EMAIL_FORM: 'EMAIL_FORM',
    USERNAME_FORM: 'USERNAME_FORM',
  },
}));

jest.mock('../../../shared/validators/setup', () => ({
  email: jest.fn(),
  username: jest.fn(),
}));

jest.mock('react-toastify', () => ({
  toast: { error: jest.fn() },
}));

// ------------------------------------------------------

describe('useSetup Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock window location for useLayoutEffect
    delete (window as any).location;
    (window as any).location = {
      protocol: 'http:',
      hostname: 'localhost',
      port: '3000',
    };
  });



  // ------------------------------------------------------
  // 2️⃣ handleInput updates input values
  // ------------------------------------------------------
  it('should update input values using handleInput', () => {
    const { result } = renderHook(() => useSetup());

    act(() => {
      result.current.handleInput({
        target: { id: 'email', value: '  test@example.com  ' },
      } as any);
    });

    expect(result.current.inputs.email).toBe('test@example.com');
  });

  // ------------------------------------------------------
  // 3️⃣ setErrors merges and updates error messages
  // ------------------------------------------------------
  it('should update error state via setErrors', () => {
    const { result } = renderHook(() => useSetup());

    act(() => {
      result.current.setErrors({ email: 'Invalid Email' });
    });

    expect(result.current.errors.email).toBe('Invalid Email');
  });

  // ------------------------------------------------------
  // 4️⃣ handlePageChange → runs validators and blocks navigation on error
  // ------------------------------------------------------
  it('should NOT change page if validators return an error', async () => {
    (setupValidators.email as jest.Mock).mockReturnValue(true); // validator fails

    const { result } = renderHook(() => useSetup());
    const originalPage = result.current.page;

    await act(async () => {
      await result.current.handlePageChange('USERNAME_FORM');
    });

    // Should remain on same page
    expect(result.current.page).toEqual(originalPage);
  });

  // ------------------------------------------------------
  // 5️⃣ handlePageChange → successfully moves to next page
  // ------------------------------------------------------
  it('should change page if validation succeeds', async () => {
    (setupValidators.email as jest.Mock).mockReturnValue(false); // passed

    const { result } = renderHook(() => useSetup());

    await act(async () => {
      await result.current.handlePageChange('USERNAME_FORM');
    });

    expect(result.current.page).toEqual(setupData.USERNAME_FORM);
  });

  // ------------------------------------------------------
  // 6️⃣ handlePageChange → preSubmit function is executed successfully
  // ------------------------------------------------------
  it('should run preSubmit successfully and move page', async () => {
    (setupValidators.email as jest.Mock).mockReturnValue(false);

    const mockPre = jest.fn().mockResolvedValue(undefined);

    const { result } = renderHook(() => useSetup());

    await act(async () => {
      await result.current.handlePageChange('USERNAME_FORM', mockPre);
    });

    expect(mockPre).toHaveBeenCalled();
    expect(result.current.page).toEqual(setupData.USERNAME_FORM);
  });

  // ------------------------------------------------------
  // 7️⃣ preSubmit throws validation error → setErrors is called
  // ------------------------------------------------------
  it('should handle validation error returned from preSubmit', async () => {
    const backendError = {
      status: 400,
      response: { data: { email: 'Email exists' } },
    };

    const mockPre = jest.fn().mockRejectedValue(backendError);

    const { result } = renderHook(() => useSetup());

    await act(async () => {
      await result.current.handlePageChange('USERNAME_FORM', mockPre);
    });

    expect(result.current.errors.email).toBe('Email exists');
  });

  // ------------------------------------------------------
  // 8️⃣ preSubmit throws unknown error → toast.error is called
  // ------------------------------------------------------
  it('should show toast error on unknown preSubmit error', async () => {
    const mockPre = jest.fn().mockRejectedValue(new Error('Some error'));

    const { result } = renderHook(() => useSetup());

    await act(async () => {
      await result.current.handlePageChange('USERNAME_FORM', mockPre);
    });

    expect(toast.error).toHaveBeenCalledWith(
      'Error while creating user and setting up configuration.'
    );
  });


});
