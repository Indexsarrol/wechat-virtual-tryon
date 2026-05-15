export type TryonJobPayload = {
  taskId: string;
  taskType: "fitting" | "lipstick";
  assetId: string;
};

export type TryonJobResult =
  | {
      status: "success";
      providerKey: string;
      resultImageUrl: string;
      failReason?: never;
    }
  | {
      status: "failed";
      providerKey: string;
      failReason: string;
      resultImageUrl?: never;
    };
