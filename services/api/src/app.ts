import Fastify from "fastify";
import { registerAssetRoutes } from "./modules/assets/asset.routes";
import { rateLimitPlugin } from "./modules/rate-limit/rate-limit.plugin";
import { registerTaskRoutes } from "./modules/tasks/task.routes";
import { registerUploadRoutes } from "./modules/uploads/upload.routes";
import { registerSessionPlugin } from "./plugins/session";

export async function buildApp() {
  const app = Fastify({ logger: true });
  await registerSessionPlugin(app);
  await app.register(rateLimitPlugin);
  await registerUploadRoutes(app);
  await registerAssetRoutes(app);
  await registerTaskRoutes(app);
  return app;
}
