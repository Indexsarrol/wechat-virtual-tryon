import { describe, expect, it } from "vitest";
import {
  taskStatusSchema,
  taskTypeSchema,
  tryonTaskCreateSchema
} from "./task";

describe("task contracts", () => {
  it("accepts only supported task types and statuses", () => {
    expect(taskTypeSchema.parse("fitting")).toBe("fitting");
    expect(taskStatusSchema.parse("success")).toBe("success");
    expect(() => taskTypeSchema.parse("unknown")).toThrow();
  });

  it("requires source image for upload mode", () => {
    expect(() =>
      tryonTaskCreateSchema.parse({
        taskType: "fitting",
        mode: "user_upload",
        assetId: "garment_001"
      })
    ).toThrow("sourceImageId");
  });

  it("accepts upload mode when source image is present", () => {
    expect(
      tryonTaskCreateSchema.parse({
        taskType: "fitting",
        mode: "user_upload",
        assetId: "garment_001",
        sourceImageId: "source_001"
      })
    ).toEqual({
      taskType: "fitting",
      mode: "user_upload",
      assetId: "garment_001",
      sourceImageId: "source_001"
    });
  });

  it("requires model asset for template mode", () => {
    expect(() =>
      tryonTaskCreateSchema.parse({
        taskType: "fitting",
        mode: "template_model",
        assetId: "garment_001"
      })
    ).toThrow("modelAssetId");
  });

  it("accepts template mode when model asset is present", () => {
    expect(
      tryonTaskCreateSchema.parse({
        taskType: "lipstick",
        mode: "template_model",
        assetId: "garment_002",
        modelAssetId: "model_001"
      })
    ).toEqual({
      taskType: "lipstick",
      mode: "template_model",
      assetId: "garment_002",
      modelAssetId: "model_001"
    });
  });
});
