import { runFittingProvider } from "../provider/fitting.provider";
import { runLipstickProvider } from "../provider/lipstick.provider";
import { TryonJobPayload, TryonJobResult } from "../provider/provider.types";

export async function processTryonJob(payload: TryonJobPayload): Promise<TryonJobResult> {
  if (payload.taskType === "fitting") {
    return runFittingProvider(payload);
  }

  if (payload.taskType === "lipstick") {
    return runLipstickProvider(payload);
  }

  return {
    status: "failed",
    providerKey: "dispatcher",
    failReason: "Unsupported task type"
  };
}
