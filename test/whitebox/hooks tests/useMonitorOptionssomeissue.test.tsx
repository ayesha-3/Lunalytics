import { renderHook, act } from "@testing-library/react";
import useMonitorOptions from "../../../app/hooks/useMonitorOptions";

// Mocks
jest.mock("../../../app/services/axios", () => ({
  createGetRequest: jest.fn(),
  createPostRequest: jest.fn(),
}));

jest.mock("react-toastify", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock("../../../app/components/modal/monitor/configure", () => () => (
  <div data-testid="configure-modal" />
));

jest.mock("../../../app/components/modal/monitor/delete", () => () => (
  <div data-testid="delete-modal" />
));

import { createGetRequest, createPostRequest } from "../../../app/services/axios";
import { toast } from "react-toastify";

describe("useMonitorOptions Hook", () => {
  const Container = jest.fn(({ onClick }) => (
    <button data-testid="container" onClick={onClick} />
  ));

  const monitor = {
    monitorId: "123",
    name: "CPU Monitor",
    paused: false,
  };

  const mockAddMonitor = jest.fn();
  const mockEditMonitor = jest.fn();
  const mockRemoveMonitor = jest.fn();
  const mockCloseModal = jest.fn();
  const mockOpenModal = jest.fn();

  const setupHook = (overrideMonitor = monitor) =>
    renderHook(() =>
      useMonitorOptions(
        Container,
        overrideMonitor,
        mockAddMonitor,
        mockEditMonitor,
        mockRemoveMonitor,
        mockCloseModal,
        mockOpenModal
      )
    );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ----------------------------------------------------------------------

  test("options array contains clone, edit, delete, pause items", () => {
    const { result } = setupHook();

    expect(result.current.options).toHaveLength(4);
    expect(result.current.options[0].id).toBe("monitor-clone-button");
    expect(result.current.options[1].id).toBe("monitor-edit-button");
    expect(result.current.options[2].id).toBe("monitor-delete-button");
    expect(result.current.options[3].id).toBe("monitor-pause-button");
  });

  // ----------------------------------------------------------------------

  test("handleClone opens modal with MonitorConfigureModal (addMonitor)", () => {
    const { result } = setupHook();

    const cloneButton = result.current.options[0].text;

    act(() => {
      cloneButton.props.onClick();
    });

    expect(mockOpenModal).toHaveBeenCalled();
  });

  // ----------------------------------------------------------------------

  test("handleEdit opens modal with MonitorConfigureModal (editMonitor)", () => {
    const { result } = setupHook();

    const editButton = result.current.options[1].text;

    act(() => {
      editButton.props.onClick();
    });

    expect(mockOpenModal).toHaveBeenCalled();
  });

  // ----------------------------------------------------------------------

  test("handleDelete opens modal with MonitorModal", () => {
    const { result } = setupHook();

    const deleteButton = result.current.options[2].text;

    act(() => {
      deleteButton.props.onClick();
    });

    expect(mockOpenModal).toHaveBeenCalled();
  });

  // ----------------------------------------------------------------------

  test("handleConfirm deletes monitor successfully", async () => {
    (createGetRequest as jest.Mock).mockResolvedValue({});

    const { result } = setupHook();

    // Extract handleConfirm from delete modal open
    let handleConfirmFn: any;

    mockOpenModal.mockImplementation((component) => {
      handleConfirmFn = component.props.handleConfirm;
    });

    act(() => {
      result.current.options[2].text.props.onClick(); // open delete modal
    });

    await act(async () => {
      await handleConfirmFn();
    });

    expect(createGetRequest).toHaveBeenCalledWith("/api/monitor/delete", {
      monitorId: monitor.monitorId,
    });

    expect(mockRemoveMonitor).toHaveBeenCalledWith("123");
    expect(toast.success).toHaveBeenCalledWith("Monitor deleted successfully!");
    expect(mockCloseModal).toHaveBeenCalled();
  });

  // ----------------------------------------------------------------------

  test("handleConfirm shows error toast on failure", async () => {
    (createGetRequest as jest.Mock).mockRejectedValue(new Error("failed"));

    const { result } = setupHook();

    let confirmFn: any;

    mockOpenModal.mockImplementation((component) => {
      confirmFn = component.props.handleConfirm;
    });

    act(() => {
      result.current.options[2].text.props.onClick();
    });

    await act(async () => {
      await confirmFn();
    });

    expect(toast.error).toHaveBeenCalledWith(
      "Error occurred while deleting monitor!"
    );
    expect(mockCloseModal).toHaveBeenCalled();
  });

  // ----------------------------------------------------------------------

  test("handlePause toggles paused state successfully", async () => {
    (createPostRequest as jest.Mock).mockResolvedValue({});

    const pausedMonitor = { ...monitor, paused: false };

    const { result } = setupHook(pausedMonitor);

    const pauseButton = result.current.options[3].text;

    await act(async () => {
      await pauseButton.props.onClick();
    });

    expect(createPostRequest).toHaveBeenCalledWith("/api/monitor/pause", {
      monitorId: "123",
      pause: true,
    });

    expect(mockEditMonitor).toHaveBeenCalledWith({
      ...pausedMonitor,
      paused: true,
    });

    expect(toast.success).toHaveBeenCalledWith(
      "Monitor paused successfully!"
    );
  });

  // ----------------------------------------------------------------------

  test("handlePause shows error toast on failure", async () => {
    (createPostRequest as jest.Mock).mockRejectedValue(new Error("fail"));

    const { result } = setupHook();

    const pauseButton = result.current.options[3].text;

    await act(async () => {
      await pauseButton.props.onClick();
    });

    expect(toast.error).toHaveBeenCalledWith(
      "Error occurred while pausing monitor!"
    );
  });

  // ----------------------------------------------------------------------

  test("resume button appears if monitor.paused = true", () => {
    const pausedMonitor = { ...monitor, paused: true };

    const { result } = setupHook(pausedMonitor);

    const pauseOption = result.current.options[3];

    expect(pauseOption.text.props.text).toBe("Resume");
  });

  // ----------------------------------------------------------------------
});
