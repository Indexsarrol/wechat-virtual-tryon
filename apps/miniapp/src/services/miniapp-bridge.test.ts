import { afterEach, describe, expect, it, vi } from "vitest";
import { navigateTo, pickSourceImage, saveImage } from "./miniapp-bridge";

afterEach(() => {
  delete (globalThis as { uni?: unknown }).uni;
  delete (globalThis as { wx?: unknown }).wx;
  vi.restoreAllMocks();
});

describe("miniapp bridge", () => {
  it("uses miniapp navigateTo when available", () => {
    const navigateToSpy = vi.fn();
    (globalThis as { uni?: { navigateTo: typeof navigateToSpy } }).uni = {
      navigateTo: navigateToSpy
    };

    navigateTo("/pages/result/index");

    expect(navigateToSpy).toHaveBeenCalledWith({
      url: "/pages/result/index"
    });
  });

  it("uses chooseImage from the miniapp bridge when available", async () => {
    (globalThis as {
      uni?: {
        chooseImage: (options: {
          success?: (result: {
            tempFilePaths?: string[];
            tempFiles?: Array<{ path?: string; name?: string }>;
          }) => void;
        }) => void;
      };
    }).uni = {
      chooseImage(options) {
        options.success?.({
          tempFilePaths: ["wxfile://tmp/demo-image.jpg"],
          tempFiles: [
            {
              path: "wxfile://tmp/demo-image.jpg",
              name: "demo-image.jpg"
            }
          ]
        });
      }
    };

    const result = await pickSourceImage();

    expect(result).toEqual({
      dataUrl: "wxfile://tmp/demo-image.jpg",
      fileName: "demo-image.jpg",
      source: "miniapp"
    });
  });

  it("uses saveImageToPhotosAlbum from the miniapp bridge when available", async () => {
    const saveSpy = vi.fn((options: { filePath: string; success?: () => void }) => {
      options.success?.();
    });

    (globalThis as { uni?: { saveImageToPhotosAlbum: typeof saveSpy } }).uni = {
      saveImageToPhotosAlbum: saveSpy
    };

    await saveImage("wxfile://tmp/result-image.jpg");

    expect(saveSpy).toHaveBeenCalledWith({
      filePath: "wxfile://tmp/result-image.jpg",
      fail: expect.any(Function),
      success: expect.any(Function)
    });
  });
});
