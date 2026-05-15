import { randomUUID } from "node:crypto";
import type { FastifyInstance } from "fastify";

type UploadPayload = {
  purpose: string;
  imageUrl: string;
  fileName?: string;
  sourceKind?: "browser" | "miniapp";
  contentType?: string;
  byteSize?: number;
  transportKind?: "browser-data-url" | "miniapp-temp-path" | "remote-url";
  localPath?: string;
};

function isUploadPayload(body: unknown): body is UploadPayload {
  if (typeof body !== "object" || body === null) {
    return false;
  }

  const { purpose, imageUrl } = body as Record<string, unknown>;
  return typeof purpose === "string" && purpose.length > 0 && typeof imageUrl === "string" && imageUrl.length > 0;
}

export async function registerUploadRoutes(app: FastifyInstance) {
  app.post("/uploads", async (request, reply) => {
    if (!isUploadPayload(request.body)) {
      return reply.code(400).send({
        message: "Invalid upload payload"
      });
    }

    const payload = request.body;
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    return reply.code(201).send({
      imageId: randomUUID(),
      purpose: payload.purpose,
      imageUrl: payload.imageUrl,
      fileName: payload.fileName ?? "user-image",
      sourceKind: payload.sourceKind ?? "browser",
      contentType: payload.contentType ?? "image/unknown",
      byteSize: payload.byteSize ?? 0,
      transportKind: payload.transportKind ?? "remote-url",
      localPath: payload.localPath ?? null,
      uploadSessionId: randomUUID(),
      storageMode: "external-url-proxy",
      expiresAt
    });
  });
}
