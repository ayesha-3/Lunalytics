import { renderHook, act } from "@testing-library/react";
import useGoBack from "../../../app/hooks/useGoBack";
import { useLocation, useNavigate } from "react-router-dom";

// -----------------------------
// Mock react-router-dom
// -----------------------------
jest.mock("react-router-dom", () => ({
  useLocation: jest.fn(),
  useNavigate: jest.fn(),
}));

describe("useGoBack Hook", () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
  });

  // --------------------------------------------------------

  test("navigates back when prevKey !== 'default'", () => {
    (useLocation as jest.Mock).mockReturnValue({ key: "abc123" });

    const { result } = renderHook(() => useGoBack());

    act(() => {
      result.current(); // call hook's returned function
    });

    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  // --------------------------------------------------------

  test("navigates to fallback when prevKey === 'default'", () => {
    (useLocation as jest.Mock).mockReturnValue({ key: "default" });

    const { result } = renderHook(() => useGoBack());

    act(() => {
      result.current({ fallback: "/dashboard" });
    });

    expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
  });

  // --------------------------------------------------------

  test("uses default fallback '/home' when none provided", () => {
    (useLocation as jest.Mock).mockReturnValue({ key: "default" });

    const { result } = renderHook(() => useGoBack());

    act(() => {
      result.current(); // no fallback passed
    });

    expect(mockNavigate).toHaveBeenCalledWith("/home");
  });
});
