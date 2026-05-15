import { z } from "zod";

export const appEnvSchema = z.enum(["development", "test", "production"]);

export const contractsEnvSchema = z.object({
  NODE_ENV: appEnvSchema.default("development")
});

export type AppEnv = z.infer<typeof appEnvSchema>;
export type ContractsEnv = z.infer<typeof contractsEnvSchema>;
