import { TryonJobPayload, TryonJobResult } from "./provider.types";

export async function runFittingProvider(_: TryonJobPayload): Promise<TryonJobResult> {
  return {
    status: "success",
    providerKey: "fitting-default",
    resultImageUrl: "https://cdn.local/results/fitting-demo.jpg"
  };
}
