import { describe, expect, it } from "vitest";
import { shouldDeleteImage } from "./cleanup.job";

describe("cleanup job", () => {
  it("deletes expired uploaded images", () => {
    expect(
      shouldDeleteImage(
        {
          expiresAt: new Date("2026-05-01T00:00:00.000Z")
        },
        new Date("2026-05-12T00:00:00.000Z")
      )
    ).toBe(true);
  });

  it("deletes uploaded images expiring exactly now", () => {
    const now = new Date("2026-05-12T00:00:00.000Z");

    expect(
      shouldDeleteImage(
        {
          expiresAt: new Date("2026-05-12T00:00:00.000Z")
        },
        now
      )
    ).toBe(true);
  });

  it("keeps uploaded images that expire in the future", () => {
    expect(
      shouldDeleteImage(
        {
          expiresAt: new Date("2026-05-13T00:00:00.000Z")
        },
        new Date("2026-05-12T00:00:00.000Z")
      )
    ).toBe(false);
  });

  it("deletes uploaded images with invalid expiration dates", () => {
    expect(
      shouldDeleteImage(
        {
          expiresAt: new Date("invalid")
        },
        new Date("2026-05-12T00:00:00.000Z")
      )
    ).toBe(true);
  });
});
