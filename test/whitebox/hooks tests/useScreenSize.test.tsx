import { renderHook, act } from '@testing-library/react';
import useScreenSize from '../../../app/hooks/useScreenSize';

// Helper to change window width and dispatch resize event
const setScreenWidth = (width: number) => {
  (window.innerWidth as number) = width;
  act(() => {
    window.dispatchEvent(new Event('resize'));
  });
};

describe('useScreenSize Hook', () => {
  beforeEach(() => {
    // Default width (just to avoid test leakage)
    (window.innerWidth as number) = 1024;
  });

  // ------------------------------------------------------
  // 1️⃣ TEST: Hook initializes and assigns correct size
  // ------------------------------------------------------
  it('should set initial screen size on mount', () => {
    const { result } = renderHook(() => useScreenSize());

    expect(result.current).toBe('laptop'); // width = 1024 default
  });

  // ------------------------------------------------------
  // 2️⃣ TEST: Resize to mobile
  // ------------------------------------------------------
  it('should set screen size to mobile when width < 768', () => {
    const { result } = renderHook(() => useScreenSize());

    setScreenWidth(500);

    expect(result.current).toBe('mobile');
  });

  // ------------------------------------------------------
  // 3️⃣ TEST: Resize to laptop
  // ------------------------------------------------------
  it('should set screen size to laptop when 768 <= width < 1200', () => {
    const { result } = renderHook(() => useScreenSize());

    setScreenWidth(1000);

    expect(result.current).toBe('laptop');
  });

  // ------------------------------------------------------
  // 4️⃣ TEST: Resize to desktop
  // ------------------------------------------------------
  it('should set screen size to desktop when width >= 1200', () => {
    const { result } = renderHook(() => useScreenSize());

    setScreenWidth(1600);

    expect(result.current).toBe('desktop');
  });

  // ------------------------------------------------------
  // 5️⃣ TEST: Event listener added on mount and removed on unmount
  // ------------------------------------------------------
  it('should add and remove resize event listener', () => {
    const addSpy = jest.spyOn(window, 'addEventListener');
    const removeSpy = jest.spyOn(window, 'removeEventListener');

    const { unmount } = renderHook(() => useScreenSize());

    expect(addSpy).toHaveBeenCalledWith('resize', expect.any(Function));

    unmount();

    expect(removeSpy).toHaveBeenCalledWith('resize', expect.any(Function));

    addSpy.mockRestore();
    removeSpy.mockRestore();
  });
});
