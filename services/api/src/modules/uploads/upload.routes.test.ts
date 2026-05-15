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
        imageUrl: "https://cdn.local/source.jpg",
        fileName: "source.jpg",
        sourceKind: "browser",
        contentType: "image/jpeg",
        byteSize: 2048,
        transportKind: "browser-data-url"
      }
    });

    expect(response.statusCode).toBe(201);
    expect(response.json()).toMatchObject({
      imageId: expect.any(String),
      purpose: "lipstick",
      imageUrl: "https://cdn.local/source.jpg",
      fileName: "source.jpg",
      sourceKind: "browser",
      contentType: "image/jpeg",
      byteSize: 2048,
      transportKind: "browser-data-url",
      localPath: null
    });
  });

  it("rejects invalid upload payloads", async () => {
    const app = await buildApp();
    const response = await app.inject({
      method: "POST",
      url: "/uploads",
      payload: {
        purpose: "lipstick"
      }
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({
      message: "Invalid upload payload"
    });
  });
});
