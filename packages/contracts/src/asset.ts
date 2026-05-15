import { z } from "zod";

export const assetKindSchema = z.enum(["garment", "model", "image"]);

export const assetReferenceSchema = z.object({
  id: z.string().min(1),
  kind: assetKindSchema
});

export type AssetKind = z.infer<typeof assetKindSchema>;
export type AssetReference = z.infer<typeof assetReferenceSchema>;
