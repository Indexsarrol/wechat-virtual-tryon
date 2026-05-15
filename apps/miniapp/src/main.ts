import { createPinia } from "pinia";
import { createApp } from "vue";
import App from "./App.vue";

declare const wx: {
  getLaunchOptionsSync?: () => {
    scene?: number;
  };
};

declare global {
  interface Window {
    uni?: {
      navigateTo?: (options: { url: string }) => void;
      chooseImage?: (options: {
        count?: number;
        sizeType?: string[];
        sourceType?: string[];
        success?: (result: {
          tempFilePaths?: string[];
          tempFiles?: Array<{
            path?: string;
            name?: string;
          }>;
        }) => void;
        fail?: (error?: unknown) => void;
      }) => void;
      saveImageToPhotosAlbum?: (options: {
        filePath: string;
        success?: () => void;
        fail?: (error?: unknown) => void;
      }) => void;
    };
  }
}

if (typeof window !== "undefined") {
  window.uni = window.uni ?? {
    navigateTo(options) {
      window.location.hash = options.url;
    },
    chooseImage(options) {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.style.display = "none";
      document.body.appendChild(input);

      input.addEventListener("change", () => {
        const file = input.files?.[0];
        if (!file) {
          options.fail?.(new Error("未选择图片"));
          input.remove();
          return;
        }

        const objectUrl = URL.createObjectURL(file);
        options.success?.({
          tempFilePaths: [objectUrl],
          tempFiles: [
            {
              path: objectUrl,
              name: file.name
            }
          ]
        });
        input.remove();
      });

      input.click();
    },
    saveImageToPhotosAlbum(options) {
      const link = document.createElement("a");
      link.href = options.filePath;
      link.download = "virtual-tryon-result.png";
      document.body.appendChild(link);
      link.click();
      link.remove();
      options.success?.();
    }
  };
}

const app = createApp(App);

app.use(createPinia());

if (typeof wx !== "undefined" && typeof wx.getLaunchOptionsSync === "function") {
  wx.getLaunchOptionsSync();
}

app.mount("#app");
