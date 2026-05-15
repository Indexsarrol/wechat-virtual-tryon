import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { buildApp } from "../../services/api/src/app";
import { resetTaskStore } from "../../services/api/src/modules/tasks/task.service";

describe("anonymous flow release readiness smoke", () => {
  const sessionId = "e2e-anon-session";

  beforeEach(async () => {
    await resetTaskStore();
  });

  afterEach(async () => {
    await resetTaskStore();
  });

  it("allows an anonymous user to bootstrap assets, upload an image, create a task, and poll it", async () => {
    const app = await buildApp();

    const bootstrapResponse = await app.inject({
      method: "GET",
      url: "/assets/bootstrap",
      headers: {
        "x-session-id": sessionId
      }
    });

    expect(bootstrapResponse.statusCode).toBe(200);
    const bootstrap = bootstrapResponse.json();
    expect(bootstrap.garments.length).toBeGreaterThan(0);
    expect(bootstrap.models.length).toBeGreaterThan(0);

    const uploadResponse = await app.inject({
      method: "POST",
      url: "/uploads",
      headers: {
        "x-session-id": sessionId
      },
      payload: {
        purpose: "fitting",
        imageUrl: "https://cdn.local/uploads/user-fitting-source.jpg"
      }
    });

    expect(uploadResponse.statusCode).toBe(201);
    const upload = uploadResponse.json();
    expect(upload.imageId).toBeTruthy();
    expect(upload.expiresAt).toBeTruthy();

    const createResponse = await app.inject({
      method: "POST",
      url: "/tasks",
      headers: {
        "x-session-id": sessionId
      },
      payload: {
        taskType: "fitting",
        mode: "user_upload",
        assetId: bootstrap.garments[0].id,
        sourceImageId: upload.imageId
      }
    });

    expect(createResponse.statusCode).toBe(202);
    const createdTask = createResponse.json();
    expect(createdTask.taskId).toBeTruthy();
    expect(createdTask.status).toBe("pending");

    const pollResponse = await app.inject({
      method: "GET",
      url: `/tasks/${createdTask.taskId}`,
      headers: {
        "x-session-id": sessionId
      }
    });

    expect(pollResponse.statusCode).toBe(200);
    expect(pollResponse.json()).toMatchObject({
      taskId: createdTask.taskId,
      taskType: "fitting",
      mode: "user_upload",
      sourceImageId: upload.imageId,
      assetId: bootstrap.garments[0].id,
      status: "pending"
    });
  });
});
