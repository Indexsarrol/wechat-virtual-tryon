import { z } from "zod";

export const taskTypeSchema = z.enum(["fitting", "lipstick"]);
export const taskStatusSchema = z.enum(["pending", "running", "success", "failed"]);
export const tryonModeSchema = z.enum(["user_upload", "template_model"]);

const tryonTaskCreateBaseSchema = z.object({
  taskType: taskTypeSchema,
  assetId: z.string().min(1)
});

const userUploadTryonTaskCreateSchema = tryonTaskCreateBaseSchema.extend({
  mode: z.literal("user_upload"),
  sourceImageId: z.string().min(1)
});

const templateModelTryonTaskCreateSchema = tryonTaskCreateBaseSchema.extend({
  mode: z.literal("template_model"),
  modelAssetId: z.string().min(1)
});

export const tryonTaskCreateSchema = z.discriminatedUnion("mode", [
  userUploadTryonTaskCreateSchema,
  templateModelTryonTaskCreateSchema
]);

export const tryonTaskCreateByModeSchema = {
  user_upload: userUploadTryonTaskCreateSchema,
  template_model: templateModelTryonTaskCreateSchema
} as const;

export const tryonTaskEnvelopeSchema = z
  .object({
    taskType: taskTypeSchema,
    mode: tryonModeSchema,
    assetId: z.string().min(1),
    sourceImageId: z.string().min(1).optional(),
    modelAssetId: z.string().min(1).optional()
  })
  .pipe(tryonTaskCreateSchema);

export type TaskType = z.infer<typeof taskTypeSchema>;
export type TaskStatus = z.infer<typeof taskStatusSchema>;
export type TryonMode = z.infer<typeof tryonModeSchema>;
export type TryonTaskCreate = z.infer<typeof tryonTaskCreateSchema>;
