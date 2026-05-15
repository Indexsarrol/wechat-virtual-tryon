import { afterEach, describe, expect, it, vi } from "vitest";
import { processTryonJob } from "./process-tryon-job";
import * as fittingProvider from "../provider/fitting.provider";
import * as lipstickProvider from "../provider/lipstick.provider";

describe("processTryonJob", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("selects the fitting provider for fitting tasks", async () => {
    const fittingSpy = vi.spyOn(fittingProvider, "runFittingProvider");
    const lipstickSpy = vi.spyOn(lipstickProvider, "runLipstickProvider");

    const result = await processTryonJob({
      taskId: "task_001",
      taskType: "fitting",
      assetId: "garment_001"
    });

    expect(fittingSpy).toHaveBeenCalledOnce();
    expect(fittingSpy).toHaveBeenCalledWith({
      taskId: "task_001",
      taskType: "fitting",
      assetId: "garment_001"
    });
    expect(lipstickSpy).not.toHaveBeenCalled();
    expect(result.providerKey).toBe("fitting-default");
    expect(result.status).toBe("success");
    expect(result).not.toHaveProperty("jobMeta");
  });

  it("selects the lipstick provider for lipstick tasks", async () => {
    const lipstickSpy = vi.spyOn(lipstickProvider, "runLipstickProvider");
    const fittingSpy = vi.spyOn(fittingProvider, "runFittingProvider");

    const result = await processTryonJob({
      taskId: "task_002",
      taskType: "lipstick",
      assetId: "shade_001"
    });

    expect(lipstickSpy).toHaveBeenCalledOnce();
    expect(lipstickSpy).toHaveBeenCalledWith({
      taskId: "task_002",
      taskType: "lipstick",
      assetId: "shade_001"
    });
    expect(fittingSpy).not.toHaveBeenCalled();
    expect(result.providerKey).toBe("lipstick-default");
    expect(result.status).toBe("success");
    expect(result).not.toHaveProperty("jobMeta");
  });

  it("fails fast for unsupported runtime task types without invoking providers", async () => {
    const fittingSpy = vi.spyOn(fittingProvider, "runFittingProvider");
    const lipstickSpy = vi.spyOn(lipstickProvider, "runLipstickProvider");

    const result = await processTryonJob({
      taskId: "task_003",
      taskType: "invalid-runtime-type" as "fitting",
      assetId: "asset_003"
    });

    expect(result.status).toBe("failed");
    expect(result.providerKey).toBe("dispatcher");
    expect(result.failReason).toBeTruthy();
    expect(fittingSpy).not.toHaveBeenCalled();
    expect(lipstickSpy).not.toHaveBeenCalled();
    expect(result).not.toHaveProperty("jobMeta");
  });
});
