export type BuildTaskRecordInput = {
  taskType: "fitting" | "lipstick";
  mode: "user_upload" | "template_model";
  sessionId: string;
  assetId: string;
  providerKey: string;
  sourceImageId?: string;
  modelAssetId?: string;
};

export function buildTaskRecord(input: BuildTaskRecordInput) {
  return {
    ...input,
    status: "pending" as const
  };
}
