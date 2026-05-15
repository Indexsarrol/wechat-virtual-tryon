import type { FastifyInstance } from "fastify";
import { randomUUID } from "node:crypto";

export async function registerSessionPlugin(app: FastifyInstance) {
  app.addHook("onRequest", async (request) => {
    request.headers["x-session-id"] ??= randomUUID();
  });
}
