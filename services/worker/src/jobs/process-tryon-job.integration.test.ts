import { describe, expect, it } from "vitest";
import { processTryonJob } from "./process-tryon-job";

describe("processTryonJob integration", () => {
  it("returns a fitting result image and provider metadata", async () => {
    const result = await processTryonJob({
      taskId: "task_integration_001",
      taskType: "fitting",
      assetId: "garment_001"
    });

    expect(result.status).toBe("success");
    expect(result).toMatchObject({
      providerKey: "fitting-default",
      resultImageUrl: expect.any(String)
    });
  });
});
