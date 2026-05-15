import { TryonJobPayload, TryonJobResult } from "./provider.types";

export async function runLipstickProvider(_: TryonJobPayload): Promise<TryonJobResult> {
  return {
    status: "success",
    providerKey: "lipstick-default",
    resultImageUrl: "https://cdn.local/results/lipstick-demo.jpg"
  };
}
