import { buildApp } from "./app";

const port = Number(process.env.PORT ?? 3000);
const host = process.env.HOST ?? "0.0.0.0";

async function start() {
  const app = await buildApp();
  await app.listen({ host, port });
}

void start().catch((error) => {
  console.error(error);
  process.exit(1);
});
