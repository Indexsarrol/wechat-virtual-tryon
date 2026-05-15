import { afterEach, describe, expect, it } from "vitest";
import { buildApp } from "../../app";
import { resetTaskPublisher, setTaskPublisher } from "../queue/queue.publisher";

describe("task routes", () => {
  afterEach(() => {
    resetTaskPublisher();
  });

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

  it("returns a created task when polling by id", async () => {
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

    const { taskId } = createResponse.json();
    const getResponse = await app.inject({
      method: "GET",
      url: `/tasks/${taskId}`
    });

    expect(getResponse.statusCode).toBe(200);
    expect(getResponse.json()).toMatchObject({
      taskId,
      status: "pending",
      taskType: "fitting",
      mode: "template_model",
      assetId: "garment_001",
      modelAssetId: "model_001"
    });
  });

  it("returns 404 when polling a missing task id", async () => {
    const app = await buildApp();
    const response = await app.inject({
      method: "GET",
      url: "/tasks/missing-task-id"
    });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toEqual({
      message: "Task not found"
    });
  });

  it("returns 400 for an invalid task payload", async () => {
    const app = await buildApp();
    const response = await app.inject({
      method: "POST",
      url: "/tasks",
      payload: {
        taskType: "fitting",
        mode: "template_model",
        assetId: "garment_001"
      }
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({
      message: "Invalid task payload"
    });
  });

  it("returns 500 and does not leave a pollable task when publishing fails", async () => {
    let publishedTaskId: string | null = null;
    setTaskPublisher(async (taskId) => {
      publishedTaskId = taskId;
      throw new Error("Queue unavailable");
    });

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

    expect(createResponse.statusCode).toBe(500);
    expect(publishedTaskId).toBeTruthy();

    const getResponse = await app.inject({
      method: "GET",
      url: `/tasks/${publishedTaskId}`
    });

    expect(getResponse.statusCode).toBe(404);
    expect(getResponse.json()).toEqual({
      message: "Task not found"
    });
  });

  it("returns 503 and does not leave a pollable task when publishing is rejected", async () => {
    let publishedTaskId: string | null = null;
    setTaskPublisher(async (taskId) => {
      publishedTaskId = taskId;
      return {
        accepted: false,
        taskId
      };
    });

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

    expect(createResponse.statusCode).toBe(503);
    expect(createResponse.json()).toEqual({
      message: "Task publish rejected"
    });
    expect(publishedTaskId).toBeTruthy();

    const getResponse = await app.inject({
      method: "GET",
      url: `/tasks/${publishedTaskId}`
    });

    expect(getResponse.statusCode).toBe(404);
    expect(getResponse.json()).toEqual({
      message: "Task not found"
    });
  });
});
