import { afterEach, describe, expect, it, vi } from "vitest";
import { createTask, getTask, resetTaskStore, setTaskPersistence } from "./task.service";

describe("task service integration", () => {
  afterEach(async () => {
    await resetTaskStore();
  });

  it("persists tasks and exposes terminal results", async () => {
    const created = await createTask({
      taskType: "lipstick",
      mode: "template_model",
      assetId: "lip_001",
      modelAssetId: "model_001"
    });

    const found = await getTask(created.taskId);
    expect(found?.status).toBe("pending");
    expect(found).toMatchObject({
      taskId: created.taskId,
      taskType: "lipstick",
      mode: "template_model",
      assetId: "lip_001",
      modelAssetId: "model_001"
    });
    expect(created).not.toHaveProperty("persistenceKey");
    expect(found).not.toHaveProperty("persistenceKey");
  });

  it("restores the default adapter when the store is reset", async () => {
    const adapterCreate = vi.fn(async (task) => task);
    const adapterGet = vi.fn(async () => null);
    const adapterReset = vi.fn(async () => undefined);

    setTaskPersistence({
      create: adapterCreate,
      get: adapterGet,
      reset: adapterReset
    });

    await resetTaskStore();
    await createTask({
      taskType: "fitting",
      mode: "template_model",
      assetId: "asset_after_reset",
      modelAssetId: "model_after_reset"
    });

    expect(adapterReset).toHaveBeenCalledOnce();
    expect(adapterCreate).not.toHaveBeenCalled();
    expect(adapterGet).not.toHaveBeenCalled();
  });
});
