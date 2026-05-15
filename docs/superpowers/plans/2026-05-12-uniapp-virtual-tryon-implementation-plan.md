# Uni-app Virtual Try-On Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a `uni-app` mini program, admin console, API service, and background worker that support anonymous clothing try-on and lipstick try-on through replaceable AI providers.

**Architecture:** Use a fresh `pnpm` monorepo with four deployable apps: `apps/miniapp`, `apps/admin`, `services/api`, and `services/worker`, plus `packages/contracts` for shared request and response types. The API owns sessions, uploads, assets, and task orchestration; the worker consumes queued jobs and calls provider adapters; the miniapp and admin console only talk to the API.

**Tech Stack:** `pnpm` workspaces, `TypeScript`, `Vue 3`, `uni-app`, `Pinia`, admin `Vite` + `Element Plus`, API `Fastify`, `Zod`, `Prisma`, `PostgreSQL`, `Redis`, `BullMQ`, `Vitest`, and `Playwright`.

---

## File Structure

This plan assumes the repository is currently empty except for docs, so implementation should start by creating this structure:

- `package.json`: root workspace scripts
- `pnpm-workspace.yaml`: workspace package discovery
- `tsconfig.base.json`: shared TypeScript config
- `apps/miniapp/`: `uni-app` client for end users
- `apps/admin/`: admin console for assets and task monitoring
- `services/api/`: Fastify API for sessions, uploads, assets, and tasks
- `services/worker/`: BullMQ worker for async task execution
- `packages/contracts/`: shared schemas, enums, and DTOs
- `docs/runbooks/virtual-tryon-local.md`: local setup and operator notes

Use these stable module boundaries:

- `packages/contracts` defines `task_type`, `task_status`, DTOs, and provider-neutral result shapes.
- `services/api` owns `session`, `upload`, `asset`, and `task` modules plus queue publishing.
- `services/worker` owns provider execution, retries, and terminal task updates.
- `apps/miniapp` owns the user flow for `首页`, `试衣`, `试口红`, and `结果`.
- `apps/admin` owns CRUD for `garment_assets`, `lipstick_assets`, `model_assets`, and task monitoring.

### Task 1: Bootstrap The Monorepo

**Files:**
- Create: `package.json`
- Create: `pnpm-workspace.yaml`
- Create: `tsconfig.base.json`
- Create: `.gitignore`
- Create: `.editorconfig`
- Create: `tests/smoke/workspace-layout.test.ts`

- [ ] **Step 1: Write the failing workspace smoke test**

```ts
import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("workspace layout", () => {
  it("defines the expected workspace scripts and package globs", () => {
    const rootPackage = JSON.parse(readFileSync("package.json", "utf8"));
    const workspace = readFileSync("pnpm-workspace.yaml", "utf8");

    expect(rootPackage.scripts.dev).toBeDefined();
    expect(rootPackage.scripts.test).toBeDefined();
    expect(workspace).toContain("apps/*");
    expect(workspace).toContain("services/*");
    expect(workspace).toContain("packages/*");
  });

  it("creates editor and ignore baselines", () => {
    expect(existsSync(".editorconfig")).toBe(true);
    expect(existsSync(".gitignore")).toBe(true);
  });
});
```

- [ ] **Step 2: Run the smoke test to verify it fails**

Run: `pnpm vitest tests/smoke/workspace-layout.test.ts`

Expected: FAIL because `package.json`, `pnpm-workspace.yaml`, `.editorconfig`, and `.gitignore` do not exist yet.

- [ ] **Step 3: Create the minimal workspace files**

```json
{
  "name": "virtual-tryon-workspace",
  "private": true,
  "packageManager": "pnpm@10.0.0",
  "scripts": {
    "dev": "pnpm -r --parallel dev",
    "build": "pnpm -r build",
    "test": "pnpm -r test",
    "typecheck": "pnpm -r typecheck"
  },
  "devDependencies": {
    "typescript": "^5.8.3",
    "vitest": "^3.2.4"
  }
}
```

```yaml
packages:
  - apps/*
  - services/*
  - packages/*
```

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "resolveJsonModule": true,
    "skipLibCheck": true,
    "baseUrl": "."
  }
}
```

```gitignore
node_modules
dist
.DS_Store
.env
.env.*
coverage
.turbo
.pnpm-store
```

```ini
root = true

[*]
charset = utf-8
end_of_line = lf
indent_style = space
indent_size = 2
insert_final_newline = true
trim_trailing_whitespace = true
```

- [ ] **Step 4: Run the smoke test again**

Run: `pnpm vitest tests/smoke/workspace-layout.test.ts`

Expected: PASS with `2 passed`.

- [ ] **Step 5: Commit**

```bash
git add package.json pnpm-workspace.yaml tsconfig.base.json .gitignore .editorconfig tests/smoke/workspace-layout.test.ts
git commit -m "chore: bootstrap workspace metadata"
```

### Task 2: Define Shared Contracts And Environment Baselines

**Files:**
- Create: `packages/contracts/package.json`
- Create: `packages/contracts/tsconfig.json`
- Create: `packages/contracts/src/index.ts`
- Create: `packages/contracts/src/task.ts`
- Create: `packages/contracts/src/asset.ts`
- Create: `packages/contracts/src/env.ts`
- Test: `packages/contracts/src/task.test.ts`

- [ ] **Step 1: Write the failing contract test**

```ts
import { describe, expect, it } from "vitest";
import {
  taskStatusSchema,
  taskTypeSchema,
  tryonTaskCreateSchema
} from "./task";

describe("task contracts", () => {
  it("accepts only supported task types and statuses", () => {
    expect(taskTypeSchema.parse("fitting")).toBe("fitting");
    expect(taskStatusSchema.parse("success")).toBe("success");
    expect(() => taskTypeSchema.parse("unknown")).toThrow();
  });

  it("requires source image for upload mode", () => {
    expect(() =>
      tryonTaskCreateSchema.parse({
        taskType: "fitting",
        mode: "user_upload",
        assetId: "garment_001"
      })
    ).toThrow("sourceImageId");
  });
});
```

- [ ] **Step 2: Run the contract test**

Run: `pnpm --filter @virtual-tryon/contracts vitest src/task.test.ts`

Expected: FAIL because the package and schemas do not exist.

- [ ] **Step 3: Implement the contracts package**

```json
{
  "name": "@virtual-tryon/contracts",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "main": "src/index.ts",
  "scripts": {
    "test": "vitest run",
    "typecheck": "tsc --noEmit -p tsconfig.json"
  },
  "dependencies": {
    "zod": "^3.24.4"
  }
}
```

```ts
import { z } from "zod";

export const taskTypeSchema = z.enum(["fitting", "lipstick"]);
export const taskStatusSchema = z.enum(["pending", "running", "success", "failed"]);
export const tryonModeSchema = z.enum(["user_upload", "template_model"]);

export const tryonTaskCreateSchema = z
  .object({
    taskType: taskTypeSchema,
    mode: tryonModeSchema,
    assetId: z.string().min(1),
    sourceImageId: z.string().min(1).optional(),
    modelAssetId: z.string().min(1).optional()
  })
  .superRefine((value, ctx) => {
    if (value.mode === "user_upload" && !value.sourceImageId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["sourceImageId"],
        message: "sourceImageId is required for user_upload mode"
      });
    }

    if (value.mode === "template_model" && !value.modelAssetId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["modelAssetId"],
        message: "modelAssetId is required for template_model mode"
      });
    }
  });
```

```ts
export * from "./task";
export * from "./asset";
export * from "./env";
```

- [ ] **Step 4: Run the contracts test and typecheck**

Run: `pnpm --filter @virtual-tryon/contracts test && pnpm --filter @virtual-tryon/contracts typecheck`

Expected: PASS with the task contract tests green and no TypeScript errors.

- [ ] **Step 5: Commit**

```bash
git add packages/contracts
git commit -m "feat: add shared contracts package"
```

### Task 3: Create Database Schema And Repository Primitives

**Files:**
- Create: `services/api/package.json`
- Create: `services/api/tsconfig.json`
- Create: `services/api/prisma/schema.prisma`
- Create: `services/api/src/lib/db.ts`
- Create: `services/api/src/modules/tasks/task.repository.ts`
- Create: `services/api/src/modules/tasks/task.repository.test.ts`
- Create: `services/api/src/modules/assets/asset.repository.ts`

- [ ] **Step 1: Write the failing repository test**

```ts
import { describe, expect, it } from "vitest";
import { buildTaskRecord } from "./task.repository";

describe("buildTaskRecord", () => {
  it("creates a pending task record with normalized provider key", () => {
    const record = buildTaskRecord({
      taskType: "fitting",
      mode: "template_model",
      assetId: "garment_001",
      modelAssetId: "model_001",
      providerKey: "fitting-default"
    });

    expect(record.status).toBe("pending");
    expect(record.providerKey).toBe("fitting-default");
    expect(record.taskType).toBe("fitting");
  });
});
```

- [ ] **Step 2: Run the repository test**

Run: `pnpm --filter @virtual-tryon/api vitest src/modules/tasks/task.repository.test.ts`

Expected: FAIL because the API service and repository do not exist.

- [ ] **Step 3: Add the API package, Prisma schema, and repository helpers**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model GarmentAsset {
  id           String   @id @default(cuid())
  name         String
  category     String
  coverUrl     String
  tryonAssetUrl String
  genderTag    String?
  bodyTypeTag  String?
  status       String   @default("draft")
  sortOrder    Int      @default(0)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

model LipstickAsset {
  id         String   @id @default(cuid())
  brand      String
  series     String
  shadeName  String
  shadeCode  String?
  colorHex   String
  coverUrl   String
  status     String   @default("draft")
  sortOrder  Int      @default(0)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}

model ModelAsset {
  id             String   @id @default(cuid())
  type           String
  name           String
  previewUrl     String
  sourceImageUrl String
  genderTag      String?
  skinToneTag    String?
  faceShapeTag   String?
  styleTag       String?
  status         String   @default("draft")
  sortOrder      Int      @default(0)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}

model UploadedImage {
  id               String   @id @default(cuid())
  sessionId        String
  purpose          String
  imageUrl         String
  validationStatus String   @default("pending")
  expiresAt        DateTime
  createdAt        DateTime @default(now())
}

model TryonTask {
  id            String   @id @default(cuid())
  taskType      String
  mode          String
  sessionId     String
  sourceImageId String?
  modelAssetId  String?
  assetId       String
  providerKey   String
  status        String   @default("pending")
  failReason    String?
  resultImageUrl String?
  durationMs    Int?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```

```ts
type BuildTaskRecordInput = {
  taskType: "fitting" | "lipstick";
  mode: "user_upload" | "template_model";
  assetId: string;
  providerKey: string;
  sourceImageId?: string;
  modelAssetId?: string;
};

export function buildTaskRecord(input: BuildTaskRecordInput) {
  return {
    ...input,
    status: "pending" as const
  };
}
```

- [ ] **Step 4: Run the repository test and Prisma validation**

Run: `pnpm --filter @virtual-tryon/api vitest src/modules/tasks/task.repository.test.ts && pnpm --filter @virtual-tryon/api prisma validate`

Expected: PASS with the repository helper test green and Prisma schema valid.

- [ ] **Step 5: Commit**

```bash
git add services/api
git commit -m "feat: add api data model primitives"
```

### Task 4: Implement API Session, Upload, And Asset Read Endpoints

**Files:**
- Modify: `services/api/src/lib/db.ts`
- Create: `services/api/src/app.ts`
- Create: `services/api/src/server.ts`
- Create: `services/api/src/plugins/session.ts`
- Create: `services/api/src/modules/uploads/upload.routes.ts`
- Create: `services/api/src/modules/assets/asset.routes.ts`
- Create: `services/api/src/modules/uploads/upload.routes.test.ts`
- Create: `services/api/src/modules/assets/asset.routes.test.ts`

- [ ] **Step 1: Write the failing route tests**

```ts
import { describe, expect, it } from "vitest";
import { buildApp } from "../../app";

describe("upload routes", () => {
  it("creates an uploaded image record", async () => {
    const app = await buildApp();
    const response = await app.inject({
      method: "POST",
      url: "/uploads",
      payload: {
        purpose: "lipstick",
        imageUrl: "https://cdn.local/source.jpg"
      }
    });

    expect(response.statusCode).toBe(201);
    expect(response.json().imageId).toBeTruthy();
  });
});
```

```ts
import { describe, expect, it } from "vitest";
import { buildApp } from "../../app";

describe("asset routes", () => {
  it("returns grouped asset payloads", async () => {
    const app = await buildApp();
    const response = await app.inject({
      method: "GET",
      url: "/assets/bootstrap"
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toHaveProperty("garments");
    expect(response.json()).toHaveProperty("lipsticks");
    expect(response.json()).toHaveProperty("models");
  });
});
```

- [ ] **Step 2: Run the route tests**

Run: `pnpm --filter @virtual-tryon/api vitest src/modules/uploads/upload.routes.test.ts src/modules/assets/asset.routes.test.ts`

Expected: FAIL because the Fastify app and routes do not exist.

- [ ] **Step 3: Implement the API shell, session plugin, and read endpoints**

```ts
import Fastify from "fastify";
import { registerSessionPlugin } from "./plugins/session";
import { registerUploadRoutes } from "./modules/uploads/upload.routes";
import { registerAssetRoutes } from "./modules/assets/asset.routes";

export async function buildApp() {
  const app = Fastify({ logger: true });
  await registerSessionPlugin(app);
  await registerUploadRoutes(app);
  await registerAssetRoutes(app);
  return app;
}
```

```ts
import { FastifyInstance } from "fastify";
import { randomUUID } from "node:crypto";

export async function registerSessionPlugin(app: FastifyInstance) {
  app.addHook("onRequest", async (request) => {
    request.headers["x-session-id"] ??= randomUUID();
  });
}
```

```ts
import { FastifyInstance } from "fastify";

export async function registerUploadRoutes(app: FastifyInstance) {
  app.post("/uploads", async (request, reply) => {
    const payload = request.body as { purpose: string; imageUrl: string };
    return reply.code(201).send({
      imageId: crypto.randomUUID(),
      purpose: payload.purpose,
      imageUrl: payload.imageUrl
    });
  });
}
```

```ts
import { FastifyInstance } from "fastify";

export async function registerAssetRoutes(app: FastifyInstance) {
  app.get("/assets/bootstrap", async () => {
    return {
      garments: [],
      lipsticks: [],
      models: []
    };
  });
}
```

- [ ] **Step 4: Run the route tests**

Run: `pnpm --filter @virtual-tryon/api test`

Expected: PASS with upload and asset route tests green.

- [ ] **Step 5: Commit**

```bash
git add services/api/src
git commit -m "feat: add api upload and asset endpoints"
```

### Task 5: Implement Task Creation, Polling, And Queue Publishing

**Files:**
- Create: `services/api/src/modules/tasks/task.routes.ts`
- Create: `services/api/src/modules/tasks/task.service.ts`
- Create: `services/api/src/modules/queue/queue.publisher.ts`
- Create: `services/api/src/modules/tasks/task.routes.test.ts`
- Modify: `services/api/src/app.ts`

- [ ] **Step 1: Write the failing task route test**

```ts
import { describe, expect, it } from "vitest";
import { buildApp } from "../../app";

describe("task routes", () => {
  it("creates a pending fitting task and returns a task id", async () => {
    const app = await buildApp();
    const createResponse = await app.inject({
      method: "POST",
      url: "/tasks",
      payload: {
        taskType: "fitting",
        mode: "template_model",
        assetId: "garment_001",
        modelAssetId: "model_001"
      }
    });

    expect(createResponse.statusCode).toBe(202);
    expect(createResponse.json().status).toBe("pending");
    expect(createResponse.json().taskId).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run the task route test**

Run: `pnpm --filter @virtual-tryon/api vitest src/modules/tasks/task.routes.test.ts`

Expected: FAIL because the task service and routes do not exist.

- [ ] **Step 3: Implement the minimal task service and queue publisher**

```ts
import { tryonTaskCreateSchema } from "@virtual-tryon/contracts";

const memoryTaskStore = new Map<string, Record<string, unknown>>();

export async function createTask(payload: unknown) {
  const parsed = tryonTaskCreateSchema.parse(payload);
  const taskId = crypto.randomUUID();
  const task = {
    taskId,
    status: "pending",
    ...parsed
  };

  memoryTaskStore.set(taskId, task);
  return task;
}

export async function getTask(taskId: string) {
  return memoryTaskStore.get(taskId) ?? null;
}
```

```ts
export async function publishTryonTask(taskId: string) {
  return {
    accepted: true,
    taskId
  };
}
```

```ts
import { FastifyInstance } from "fastify";
import { createTask, getTask } from "./task.service";
import { publishTryonTask } from "../queue/queue.publisher";

export async function registerTaskRoutes(app: FastifyInstance) {
  app.post("/tasks", async (request, reply) => {
    const task = await createTask(request.body);
    await publishTryonTask(task.taskId);
    return reply.code(202).send(task);
  });

  app.get("/tasks/:taskId", async (request) => {
    const params = request.params as { taskId: string };
    return getTask(params.taskId);
  });
}
```

- [ ] **Step 4: Run the task route test**

Run: `pnpm --filter @virtual-tryon/api vitest src/modules/tasks/task.routes.test.ts`

Expected: PASS with `1 passed`.

- [ ] **Step 5: Commit**

```bash
git add services/api/src/modules/tasks services/api/src/modules/queue services/api/src/app.ts
git commit -m "feat: add task creation and polling endpoints"
```

### Task 6: Add Worker Processing And Replaceable Provider Adapters

**Files:**
- Create: `services/worker/package.json`
- Create: `services/worker/src/provider/provider.types.ts`
- Create: `services/worker/src/provider/fitting.provider.ts`
- Create: `services/worker/src/provider/lipstick.provider.ts`
- Create: `services/worker/src/jobs/process-tryon-job.ts`
- Create: `services/worker/src/jobs/process-tryon-job.test.ts`
- Create: `services/worker/src/worker.ts`

- [ ] **Step 1: Write the failing worker job test**

```ts
import { describe, expect, it } from "vitest";
import { processTryonJob } from "./process-tryon-job";

describe("processTryonJob", () => {
  it("selects the fitting provider for fitting tasks", async () => {
    const result = await processTryonJob({
      taskId: "task_001",
      taskType: "fitting",
      assetId: "garment_001"
    });

    expect(result.providerKey).toBe("fitting-default");
    expect(result.status).toBe("success");
  });
});
```

- [ ] **Step 2: Run the worker job test**

Run: `pnpm --filter @virtual-tryon/worker vitest src/jobs/process-tryon-job.test.ts`

Expected: FAIL because the worker package and provider adapters do not exist.

- [ ] **Step 3: Implement fake providers behind a stable interface**

```ts
export type TryonJobPayload = {
  taskId: string;
  taskType: "fitting" | "lipstick";
  assetId: string;
};

export type TryonJobResult = {
  status: "success" | "failed";
  providerKey: string;
  resultImageUrl?: string;
  failReason?: string;
};
```

```ts
import { TryonJobPayload, TryonJobResult } from "./provider.types";

export async function runFittingProvider(_: TryonJobPayload): Promise<TryonJobResult> {
  return {
    status: "success",
    providerKey: "fitting-default",
    resultImageUrl: "https://cdn.local/results/fitting-demo.jpg"
  };
}
```

```ts
import { TryonJobPayload, TryonJobResult } from "./provider.types";

export async function runLipstickProvider(_: TryonJobPayload): Promise<TryonJobResult> {
  return {
    status: "success",
    providerKey: "lipstick-default",
    resultImageUrl: "https://cdn.local/results/lipstick-demo.jpg"
  };
}
```

```ts
import { runFittingProvider } from "../provider/fitting.provider";
import { runLipstickProvider } from "../provider/lipstick.provider";
import { TryonJobPayload } from "../provider/provider.types";

export async function processTryonJob(payload: TryonJobPayload) {
  if (payload.taskType === "fitting") {
    return runFittingProvider(payload);
  }

  return runLipstickProvider(payload);
}
```

- [ ] **Step 4: Run the worker test**

Run: `pnpm --filter @virtual-tryon/worker test`

Expected: PASS with the job dispatcher choosing the correct provider.

- [ ] **Step 5: Commit**

```bash
git add services/worker
git commit -m "feat: add async worker and provider abstraction"
```

### Task 7: Build The Miniapp Shell And Shared API Client

**Files:**
- Create: `apps/miniapp/package.json`
- Create: `apps/miniapp/src/pages.json`
- Create: `apps/miniapp/src/main.ts`
- Create: `apps/miniapp/src/App.vue`
- Create: `apps/miniapp/src/services/api.ts`
- Create: `apps/miniapp/src/stores/session.ts`
- Create: `apps/miniapp/src/pages/index/index.vue`
- Create: `apps/miniapp/src/pages/index/index.test.ts`

- [ ] **Step 1: Write the failing miniapp homepage test**

```ts
import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import IndexPage from "./index.vue";

describe("index page", () => {
  it("shows both primary try-on entries", () => {
    const wrapper = mount(IndexPage);
    expect(wrapper.text()).toContain("在线试衣");
    expect(wrapper.text()).toContain("口红试色");
  });
});
```

- [ ] **Step 2: Run the homepage test**

Run: `pnpm --filter @virtual-tryon/miniapp vitest src/pages/index/index.test.ts`

Expected: FAIL because the miniapp package and page do not exist.

- [ ] **Step 3: Implement the miniapp shell and landing page**

```ts
import { defineStore } from "pinia";

export const useSessionStore = defineStore("session", {
  state: () => ({
    sessionId: ""
  }),
  actions: {
    setSessionId(sessionId: string) {
      this.sessionId = sessionId;
    }
  }
});
```

```ts
export async function fetchBootstrapAssets() {
  return {
    garments: [],
    lipsticks: [],
    models: []
  };
}
```

```vue
<template>
  <view class="page">
    <view class="hero">AI 试搭体验</view>
    <navigator url="/pages/fitting/index">在线试衣</navigator>
    <navigator url="/pages/lipstick/index">口红试色</navigator>
  </view>
</template>
```

- [ ] **Step 4: Run the homepage test**

Run: `pnpm --filter @virtual-tryon/miniapp test`

Expected: PASS with the landing page rendering both entry points.

- [ ] **Step 5: Commit**

```bash
git add apps/miniapp
git commit -m "feat: scaffold miniapp shell"
```

### Task 8: Implement Miniapp Fitting, Lipstick, And Result Flows

**Files:**
- Create: `apps/miniapp/src/pages/fitting/index.vue`
- Create: `apps/miniapp/src/pages/lipstick/index.vue`
- Create: `apps/miniapp/src/pages/result/index.vue`
- Create: `apps/miniapp/src/stores/task.ts`
- Create: `apps/miniapp/src/pages/fitting/index.test.ts`
- Create: `apps/miniapp/src/pages/lipstick/index.test.ts`
- Create: `apps/miniapp/src/pages/result/index.test.ts`

- [ ] **Step 1: Write the failing flow tests**

```ts
import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import FittingPage from "./index.vue";

describe("fitting page", () => {
  it("shows upload and template model modes", () => {
    const wrapper = mount(FittingPage);
    expect(wrapper.text()).toContain("上传本人照片");
    expect(wrapper.text()).toContain("选择模板模特");
  });
});
```

```ts
import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import ResultPage from "./index.vue";

describe("result page", () => {
  it("shows original and generated toggles", () => {
    const wrapper = mount(ResultPage);
    expect(wrapper.text()).toContain("原图");
    expect(wrapper.text()).toContain("效果图");
  });
});
```

- [ ] **Step 2: Run the flow tests**

Run: `pnpm --filter @virtual-tryon/miniapp vitest src/pages/fitting/index.test.ts src/pages/lipstick/index.test.ts src/pages/result/index.test.ts`

Expected: FAIL because these pages and store modules do not exist.

- [ ] **Step 3: Implement the user flows**

```ts
import { defineStore } from "pinia";

export const useTaskStore = defineStore("task", {
  state: () => ({
    currentTaskId: "",
    currentStatus: "pending" as "pending" | "running" | "success" | "failed"
  }),
  actions: {
    setTask(taskId: string, status: "pending" | "running" | "success" | "failed") {
      this.currentTaskId = taskId;
      this.currentStatus = status;
    }
  }
});
```

```vue
<template>
  <view class="page">
    <text>上传本人照片</text>
    <text>选择模板模特</text>
    <button>开始试衣</button>
  </view>
</template>
```

```vue
<template>
  <view class="page">
    <text>上传自拍</text>
    <text>选择模板模特</text>
    <button>开始试色</button>
  </view>
</template>
```

```vue
<template>
  <view class="page">
    <button>原图</button>
    <button>效果图</button>
    <button>保存结果图</button>
  </view>
</template>
```

- [ ] **Step 4: Run the flow tests**

Run: `pnpm --filter @virtual-tryon/miniapp test`

Expected: PASS with fitting, lipstick, and result page smoke tests green.

- [ ] **Step 5: Commit**

```bash
git add apps/miniapp/src/pages apps/miniapp/src/stores/task.ts
git commit -m "feat: add miniapp try-on flows"
```

### Task 9: Build The Admin Console For Asset CRUD And Task Monitoring

**Files:**
- Create: `apps/admin/package.json`
- Create: `apps/admin/src/main.ts`
- Create: `apps/admin/src/router.ts`
- Create: `apps/admin/src/views/garments/index.vue`
- Create: `apps/admin/src/views/lipsticks/index.vue`
- Create: `apps/admin/src/views/models/index.vue`
- Create: `apps/admin/src/views/tasks/index.vue`
- Create: `apps/admin/src/views/tasks/index.test.ts`

- [ ] **Step 1: Write the failing admin test**

```ts
import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import TaskView from "./index.vue";

describe("task monitor view", () => {
  it("shows task status and fail reason columns", () => {
    const wrapper = mount(TaskView);
    expect(wrapper.text()).toContain("任务状态");
    expect(wrapper.text()).toContain("失败原因");
  });
});
```

- [ ] **Step 2: Run the admin test**

Run: `pnpm --filter @virtual-tryon/admin vitest src/views/tasks/index.test.ts`

Expected: FAIL because the admin package and views do not exist.

- [ ] **Step 3: Implement the admin shell and views**

```vue
<template>
  <el-table :data="rows">
    <el-table-column label="任务状态" prop="status" />
    <el-table-column label="失败原因" prop="failReason" />
  </el-table>
</template>

<script setup lang="ts">
const rows = [
  { status: "success", failReason: "" },
  { status: "failed", failReason: "provider timeout" }
];
</script>
```

```vue
<template>
  <div>衣服素材管理</div>
</template>
```

```vue
<template>
  <div>口红色号管理</div>
</template>
```

```vue
<template>
  <div>模板模特管理</div>
</template>
```

- [ ] **Step 4: Run the admin test**

Run: `pnpm --filter @virtual-tryon/admin test`

Expected: PASS with the task monitor smoke test green.

- [ ] **Step 5: Commit**

```bash
git add apps/admin
git commit -m "feat: scaffold admin management console"
```

### Task 10: Replace In-Memory Paths With Real Persistence, Queueing, And Providers

**Files:**
- Modify: `services/api/src/modules/tasks/task.service.ts`
- Modify: `services/api/src/modules/queue/queue.publisher.ts`
- Modify: `services/api/src/modules/uploads/upload.routes.ts`
- Modify: `services/api/src/modules/assets/asset.routes.ts`
- Modify: `services/worker/src/jobs/process-tryon-job.ts`
- Create: `services/api/src/modules/tasks/task.integration.test.ts`
- Create: `services/worker/src/jobs/process-tryon-job.integration.test.ts`
- Create: `docs/runbooks/virtual-tryon-local.md`

- [ ] **Step 1: Write the failing integration tests**

```ts
import { describe, expect, it } from "vitest";
import { createTask, getTask } from "./task.service";

describe("task service integration", () => {
  it("persists tasks and exposes terminal results", async () => {
    const created = await createTask({
      taskType: "lipstick",
      mode: "template_model",
      assetId: "lip_001",
      modelAssetId: "model_001"
    });

    const found = await getTask(created.taskId);
    expect(found?.status).toBe("pending");
  });
});
```

- [ ] **Step 2: Run the integration tests**

Run: `pnpm --filter @virtual-tryon/api vitest src/modules/tasks/task.integration.test.ts && pnpm --filter @virtual-tryon/worker vitest src/jobs/process-tryon-job.integration.test.ts`

Expected: FAIL because persistence is still in-memory and the worker is still using fake providers.

- [ ] **Step 3: Wire real persistence and provider configuration**

```ts
import { PrismaClient } from "@prisma/client";

export const db = new PrismaClient();
```

```ts
import { Queue } from "bullmq";

export const tryonQueue = new Queue("tryon-tasks", {
  connection: {
    host: process.env.REDIS_HOST ?? "127.0.0.1",
    port: Number(process.env.REDIS_PORT ?? 6379)
  }
});
```

```md
# Local Runbook

1. Start Postgres and Redis.
2. Run `pnpm install`.
3. Run `pnpm --filter @virtual-tryon/api prisma migrate dev`.
4. Run `pnpm --filter @virtual-tryon/api dev`.
5. Run `pnpm --filter @virtual-tryon/worker dev`.
6. Run `pnpm --filter @virtual-tryon/miniapp dev`.
7. Run `pnpm --filter @virtual-tryon/admin dev`.
```

- [ ] **Step 4: Run the integration tests and smoke the stack**

Run: `pnpm --filter @virtual-tryon/api test && pnpm --filter @virtual-tryon/worker test && pnpm --filter @virtual-tryon/miniapp test && pnpm --filter @virtual-tryon/admin test`

Expected: PASS with unit and integration tests green. Manual smoke should confirm one fitting task and one lipstick task move from `pending` to `success`.

- [ ] **Step 5: Commit**

```bash
git add services/api services/worker docs/runbooks/virtual-tryon-local.md
git commit -m "feat: wire real persistence and provider execution"
```

### Task 11: Add Privacy, Cleanup, And Release Readiness Checks

**Files:**
- Create: `services/api/src/modules/cleanup/cleanup.job.ts`
- Create: `services/api/src/modules/cleanup/cleanup.job.test.ts`
- Create: `services/api/src/modules/rate-limit/rate-limit.plugin.ts`
- Modify: `services/api/src/app.ts`
- Modify: `apps/miniapp/src/pages/fitting/index.vue`
- Modify: `apps/miniapp/src/pages/lipstick/index.vue`
- Create: `tests/e2e/anonymous-flow.spec.ts`

- [ ] **Step 1: Write the failing privacy and cleanup tests**

```ts
import { describe, expect, it } from "vitest";
import { shouldDeleteImage } from "./cleanup.job";

describe("cleanup job", () => {
  it("deletes expired uploaded images", () => {
    expect(
      shouldDeleteImage({
        expiresAt: new Date("2026-05-01T00:00:00.000Z")
      }, new Date("2026-05-12T00:00:00.000Z"))
    ).toBe(true);
  });
});
```

- [ ] **Step 2: Run the privacy and cleanup tests**

Run: `pnpm --filter @virtual-tryon/api vitest src/modules/cleanup/cleanup.job.test.ts`

Expected: FAIL because cleanup and rate-limit modules do not exist.

- [ ] **Step 3: Implement cleanup, rate limiting, and consent copy**

```ts
export function shouldDeleteImage(
  image: { expiresAt: Date },
  now: Date
) {
  return image.expiresAt.getTime() <= now.getTime();
}
```

```ts
import fp from "fastify-plugin";
import rateLimit from "@fastify/rate-limit";

export const rateLimitPlugin = fp(async (app) => {
  await app.register(rateLimit, {
    max: 10,
    timeWindow: "1 minute"
  });
});
```

```vue
<template>
  <view>
    <text>上传图片仅用于生成试衣效果，系统会在到期后自动清理。</text>
  </view>
</template>
```

- [ ] **Step 4: Run cleanup tests and end-to-end smoke**

Run: `pnpm --filter @virtual-tryon/api test && pnpm playwright test tests/e2e/anonymous-flow.spec.ts`

Expected: PASS with cleanup tests green and the anonymous flow verifying that users can enter, upload, create a task, poll, and see a result without login.

- [ ] **Step 5: Commit**

```bash
git add services/api apps/miniapp tests/e2e/anonymous-flow.spec.ts
git commit -m "feat: add privacy guardrails and release checks"
```

## Self-Review Notes

- Spec coverage:
  - `首页 / 试衣 / 试口红 / 结果页` are covered in Tasks 7 and 8.
  - `匿名会话 / 上传 / 素材接口 / 任务流` are covered in Tasks 4 and 5.
  - `AI 适配层 / 可替换供应商 / Worker` are covered in Tasks 6 and 10.
  - `后台素材管理 / 任务监控` are covered in Task 9.
  - `隐私、清理、限流、上线前检查` are covered in Task 11.
- Placeholder scan:
  - No `TBD`, `TODO`, or “similar to Task N” placeholders remain.
- Type consistency:
  - `taskType` stays `fitting | lipstick`.
  - `mode` stays `user_upload | template_model`.
  - `status` stays `pending | running | success | failed`.

