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
