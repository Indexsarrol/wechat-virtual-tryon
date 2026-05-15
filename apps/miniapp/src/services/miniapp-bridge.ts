export type PickedMiniappImage = {
  dataUrl: string;
  fileName: string;
  source: "browser" | "miniapp";
};

type MiniappChooseImageSuccess = {
  tempFilePaths?: string[];
  tempFiles?: Array<{
    path?: string;
    name?: string;
  }>;
};

type MiniappBridge = {
  navigateTo?: (options: { url: string }) => void;
  reLaunch?: (options: { url: string }) => void;
  chooseImage?: (options: {
    count?: number;
    sizeType?: string[];
    sourceType?: string[];
    success?: (result: MiniappChooseImageSuccess) => void;
    fail?: (error?: unknown) => void;
  }) => void;
  saveImageToPhotosAlbum?: (options: {
    filePath: string;
    success?: () => void;
    fail?: (error?: unknown) => void;
  }) => void;
};

function getBridge(): MiniappBridge | null {
  const miniappGlobal = globalThis as {
    uni?: MiniappBridge;
    wx?: MiniappBridge;
  };

  return miniappGlobal.uni ?? miniappGlobal.wx ?? null;
}

function normalizeMiniappPath(path: string) {
  if (!path) {
    return "miniapp-image.jpg";
  }

  const normalized = path.split("?")[0];
  return normalized.split("/").pop() ?? "miniapp-image.jpg";
}

function readFileAsDataUrl(file: File): Promise<PickedMiniappImage> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve({
          dataUrl: reader.result,
          fileName: file.name,
          source: "browser"
        });
        return;
      }

      reject(new Error("无法读取本地图片"));
    };
    reader.onerror = () => reject(new Error("读取本地图片失败"));
    reader.readAsDataURL(file);
  });
}

function pickImageFromBrowser(): Promise<PickedMiniappImage> {
  return new Promise((resolve, reject) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.style.display = "none";
    document.body.appendChild(input);

    input.addEventListener("change", async () => {
      try {
        const file = input.files?.[0];
        if (!file) {
          reject(new Error("未选择图片"));
          return;
        }

        resolve(await readFileAsDataUrl(file));
      } catch (error) {
        reject(error);
      } finally {
        input.remove();
      }
    });

    input.click();
  });
}

function pickImageFromMiniapp(bridge: MiniappBridge): Promise<PickedMiniappImage> {
  return new Promise((resolve, reject) => {
    bridge.chooseImage?.({
      count: 1,
      sizeType: ["compressed"],
      sourceType: ["album", "camera"],
      success(result) {
        const path = result.tempFilePaths?.[0] ?? result.tempFiles?.[0]?.path;
        const fileName =
          result.tempFiles?.[0]?.name ??
          normalizeMiniappPath(path ?? "");

        if (!path) {
          reject(new Error("未获取到图片路径"));
          return;
        }

        resolve({
          dataUrl: path,
          fileName,
          source: "miniapp"
        });
      },
      fail(error) {
        reject(error ?? new Error("选择图片失败"));
      }
    });
  });
}

export function navigateTo(url: string) {
  const bridge = getBridge();

  if (bridge?.navigateTo) {
    bridge.navigateTo({ url });
    return;
  }

  if (typeof window !== "undefined") {
    window.location.hash = url;
  }
}

export function reLaunch(url: string) {
  const bridge = getBridge();

  if (bridge?.reLaunch) {
    bridge.reLaunch({ url });
    return;
  }

  if (typeof window !== "undefined") {
    window.location.hash = url;
  }
}

export async function pickSourceImage(): Promise<PickedMiniappImage> {
  const bridge = getBridge();

  if (bridge?.chooseImage) {
    return pickImageFromMiniapp(bridge);
  }

  if (typeof document !== "undefined") {
    return pickImageFromBrowser();
  }

  throw new Error("当前环境不支持选择图片");
}

export async function saveImage(imageUrl: string) {
  const bridge = getBridge();

  if (bridge?.saveImageToPhotosAlbum) {
    return new Promise<void>((resolve, reject) => {
      bridge.saveImageToPhotosAlbum?.({
        filePath: imageUrl,
        success() {
          resolve();
        },
        fail(error) {
          reject(error ?? new Error("保存图片失败"));
        }
      });
    });
  }

  if (typeof document !== "undefined") {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = "virtual-tryon-result.png";
    document.body.appendChild(link);
    link.click();
    link.remove();
    return;
  }

  throw new Error("当前环境不支持保存图片");
}

export function isMiniappRuntime() {
  return Boolean(getBridge());
}
