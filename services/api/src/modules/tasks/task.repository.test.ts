import { describe, expect, it } from "vitest";
import { buildTaskRecord } from "./task.repository";

describe("buildTaskRecord", () => {
  it("creates a pending task record with the provided provider key", () => {
    const record = buildTaskRecord({
      taskType: "fitting",
      mode: "template_model",
      sessionId: "session_001",
      assetId: "garment_001",
      modelAssetId: "model_001",
      providerKey: "fitting-default"
    });

    expect(record.status).toBe("pending");
    expect(record.providerKey).toBe("fitting-default");
    expect(record.taskType).toBe("fitting");
  });
});
