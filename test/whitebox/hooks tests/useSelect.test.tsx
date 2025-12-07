import { renderHook, act } from '@testing-library/react';
import useSelect from '../../../app/hooks/useSelect';

describe('useSelect Hook', () => {

  // -----------------------------------------------------
  // 1️⃣ INITIAL STATE
  // -----------------------------------------------------
  it('should initialize with default state values', () => {
    const { result } = renderHook(() => useSelect(false));

    expect(result.current.selectIsOpen).toBe(false);
    expect(result.current.selectedIds).toEqual([]);
    expect(result.current.selectSearch).toBe('');
  });

  it('should initialize with provided default selected values', () => {
    const { result } = renderHook(() => useSelect(false, ['a', 'b']));

    expect(result.current.selectedIds).toEqual(['a', 'b']);
  });

  // -----------------------------------------------------
  // 2️⃣ TOGGLE SELECT DROPDOWN
  // -----------------------------------------------------
  it('should toggle select open/close state', () => {
    const { result } = renderHook(() => useSelect(false));

    act(() => {
      result.current.toggleSelect();
    });

    expect(result.current.selectIsOpen).toBe(true);

    act(() => {
      result.current.toggleSelect();
    });

    expect(result.current.selectIsOpen).toBe(false);
  });

  // -----------------------------------------------------
  // 3️⃣ SEARCH INPUT HANDLER
  // -----------------------------------------------------
  it('should update search value with handleSearch', () => {
    const { result } = renderHook(() => useSelect(false));

    const event = {
      target: { value: 'hello' },
    } as React.ChangeEvent<HTMLInputElement>;

    act(() => {
      result.current.handleSearch(event);
    });

    expect(result.current.selectSearch).toBe('hello');
  });

  // -----------------------------------------------------
  // 4️⃣ SELECT ITEM (closeOnSelect = false)
  // -----------------------------------------------------
  it('should add item to selectedIds without closing dropdown when closeOnSelect is false', () => {
    const { result } = renderHook(() => useSelect(false));

    act(() => {
      result.current.handleItemSelect('item1');
    });

    expect(result.current.selectedIds).toEqual(['item1']);
    expect(result.current.selectIsOpen).toBe(false); // remains same
  });

  // -----------------------------------------------------
  // 5️⃣ REMOVE ITEM (closeOnSelect = false)
  // -----------------------------------------------------
  it('should remove item from selectedIds without closing dropdown when closeOnSelect is false', () => {
    const { result } = renderHook(() => useSelect(false, ['item1', 'item2']));

    act(() => {
      result.current.handleItemSelect('item1', true); // remove = true
    });

    expect(result.current.selectedIds).toEqual(['item2']);
    expect(result.current.selectIsOpen).toBe(false);
  });

  // -----------------------------------------------------
  // 6️⃣ SELECT ITEM (closeOnSelect = true)
  // -----------------------------------------------------
  it('should add item and toggle dropdown when closeOnSelect is true', () => {
    const { result } = renderHook(() => useSelect(true));

    act(() => {
      result.current.toggleSelect(); // open dropdown
    });

    expect(result.current.selectIsOpen).toBe(true);

    act(() => {
      result.current.handleItemSelect('item1');
    });

    expect(result.current.selectedIds).toEqual(['item1']);
    expect(result.current.selectIsOpen).toBe(false); // toggled closed
  });

  // -----------------------------------------------------
  // 7️⃣ REMOVE ITEM (closeOnSelect = true)
  // -----------------------------------------------------
  it('should remove item and toggle dropdown when closeOnSelect is true', () => {
    const { result } = renderHook(() => useSelect(true, ['x', 'y']));

    act(() => {
      result.current.toggleSelect(); // open dropdown
    });

    expect(result.current.selectIsOpen).toBe(true);

    act(() => {
      result.current.handleItemSelect('x', true); // remove item
    });

    expect(result.current.selectedIds).toEqual(['y']);
    expect(result.current.selectIsOpen).toBe(false); // toggled closed
  });
});
