import type { PickedMiniappImage } from "./miniapp-bridge";

export type DemoTaskType = "fitting" | "lipstick";
export type DemoTaskStatus = "pending" | "running" | "success" | "failed";

type DemoTaskRecord = {
  taskId: string;
  taskType: DemoTaskType;
  status: DemoTaskStatus;
  pollsRemaining: number;
  originalImageUrl: string;
  resultImageUrl: string;
  resultTitle: string;
  resultDescription: string;
};

type DemoTaskSnapshot =
  | {
      taskId: string;
      status: "pending" | "running";
      taskType: DemoTaskType;
    }
  | {
      taskId: string;
      status: "success";
      taskType: DemoTaskType;
      originalImageUrl: string;
      resultImageUrl: string;
      resultTitle: string;
      resultDescription: string;
    }
  | {
      taskId: string;
      status: "failed";
      taskType: DemoTaskType;
      message: string;
    };

const demoTasks = new Map<string, DemoTaskRecord>();
const API_BASE = "/api";
const selectedSourceImages = new Map<DemoTaskType, PickedMiniappImage>();

function buildSvgDataUrl(title: string, subtitle: string, background: string, accent: string) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="480" height="640" viewBox="0 0 480 640">
      <rect width="480" height="640" rx="32" fill="${background}" />
      <rect x="48" y="80" width="384" height="480" rx="28" fill="white" fill-opacity="0.12" />
      <circle cx="240" cy="208" r="72" fill="${accent}" fill-opacity="0.8" />
      <rect x="132" y="300" width="216" height="184" rx="28" fill="${accent}" fill-opacity="0.6" />
      <text x="240" y="540" font-family="Arial, sans-serif" font-size="28" font-weight="700" fill="white" text-anchor="middle">${title}</text>
      <text x="240" y="578" font-family="Arial, sans-serif" font-size="18" fill="white" text-anchor="middle">${subtitle}</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function buildDemoImages(taskType: DemoTaskType) {
  if (taskType === "fitting") {
    return {
      originalImageUrl: buildSvgDataUrl("原图", "未试衣", "#5B6CFF", "#9FD3FF"),
      resultImageUrl: buildSvgDataUrl("试衣效果", "经典西装", "#0E7A67", "#74D8B8"),
      resultTitle: "在线试衣演示结果",
      resultDescription: "系统已生成一张模拟试衣效果图。"
    };
  }

  return {
    originalImageUrl: buildSvgDataUrl("原图", "未试色", "#7A5BFF", "#E0A8FF"),
    resultImageUrl: buildSvgDataUrl("试色效果", "Rose Bloom", "#B9316F", "#FF9AC0"),
    resultTitle: "口红试色演示结果",
    resultDescription: "系统已生成一张模拟试色效果图。"
  };
}

function createTaskId() {
  return `demo-task-${Math.random().toString(36).slice(2, 10)}`;
}

export async function fetchBootstrapAssets() {
  try {
    const response = await fetch(`${API_BASE}/assets/bootstrap`);
    if (!response.ok) {
      throw new Error("bootstrap fetch failed");
    }

    return await response.json();
  } catch {
    return {
      garments: [
        {
          id: "garment_001",
          name: "经典西装",
          imageUrl: buildSvgDataUrl("服装素材", "Classic Blazer", "#1E3A8A", "#93C5FD")
        }
      ],
      lipsticks: [
        {
          id: "lip_001",
          name: "Rose Bloom",
          imageUrl: buildSvgDataUrl("色号素材", "Rose Bloom", "#9D174D", "#FDA4AF")
        }
      ],
      models: [
        {
          id: "model_001",
          name: "演示模特",
          imageUrl: buildSvgDataUrl("模特素材", "Studio Model", "#475569", "#CBD5E1")
        }
      ]
    };
  }
}

export async function createDemoTryonTask(taskType: DemoTaskType): Promise<DemoTaskSnapshot> {
  try {
    const bootstrap = await fetchBootstrapAssets();
    const sourceImage = selectedSourceImages.get(taskType);
    let sourceImageId: string | undefined;

    if (sourceImage) {
      const uploadResponse = await fetch(`${API_BASE}/uploads`, {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          purpose: taskType,
          imageUrl: sourceImage.dataUrl,
          fileName: sourceImage.fileName,
          sourceKind: sourceImage.source,
          contentType: sourceImage.mimeType,
          byteSize: sourceImage.byteSize,
          transportKind: sourceImage.transportKind,
          localPath: sourceImage.localPath
        })
      });

      if (!uploadResponse.ok) {
        throw new Error("upload create failed");
      }

      const upload = await uploadResponse.json();
      sourceImageId = upload.imageId;
    }

    const payload =
      taskType === "fitting"
        ? {
            taskType: "fitting",
            mode: sourceImageId ? "user_upload" : "template_model",
            assetId: bootstrap.garments[0]?.id ?? "garment_001",
            modelAssetId: sourceImageId ? undefined : bootstrap.models[0]?.id ?? "model_001",
            sourceImageId
          }
        : {
            taskType: "lipstick",
            mode: sourceImageId ? "user_upload" : "template_model",
            assetId: bootstrap.lipsticks[0]?.id ?? "lip_001",
            modelAssetId: sourceImageId ? undefined : bootstrap.models[0]?.id ?? "model_001",
            sourceImageId
          };

    const response = await fetch(`${API_BASE}/tasks`, {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error("task create failed");
    }

    const task = await response.json();
    return {
      taskId: task.taskId,
      taskType,
      status: task.status
    };
  } catch {
    const taskId = createTaskId();
    const images = buildDemoImages(taskType);
    const selectedSourceImage = selectedSourceImages.get(taskType);

    demoTasks.set(taskId, {
      taskId,
      taskType,
      status: "pending",
      pollsRemaining: 1,
      ...images,
      originalImageUrl: selectedSourceImage?.dataUrl ?? images.originalImageUrl
    });

    return {
      taskId,
      taskType,
      status: "pending"
    };
  }
}

export async function pollDemoTryonTask(taskId: string): Promise<DemoTaskSnapshot> {
  try {
    const response = await fetch(`${API_BASE}/tasks/${taskId}`);
    if (response.status === 404) {
      return {
        taskId,
        taskType: "fitting",
        status: "failed",
        message: "未找到演示任务"
      };
    }

    if (!response.ok) {
      throw new Error("task poll failed");
    }

    const task = await response.json();
    if (task.status === "success") {
      return {
        taskId: task.taskId,
        taskType: task.taskType,
        status: "success",
        originalImageUrl: task.originalImageUrl,
        resultImageUrl: task.resultImageUrl,
        resultTitle: task.resultTitle,
        resultDescription: task.resultDescription
      };
    }

    return {
      taskId: task.taskId,
      taskType: task.taskType,
      status: task.status
    };
  } catch {
    const task = demoTasks.get(taskId);

    if (!task) {
      return {
        taskId,
        taskType: "fitting",
        status: "failed",
        message: "未找到演示任务"
      };
    }

    if (task.status === "pending") {
      task.status = "running";
      return {
        taskId: task.taskId,
        taskType: task.taskType,
        status: "running"
      };
    }

    task.status = "success";
    task.pollsRemaining = 0;

    return {
      taskId: task.taskId,
      taskType: task.taskType,
      status: "success",
      originalImageUrl: task.originalImageUrl,
      resultImageUrl: task.resultImageUrl,
      resultTitle: task.resultTitle,
      resultDescription: task.resultDescription
    };
  }
}

export function setSelectedSourceImage(taskType: DemoTaskType, image: PickedMiniappImage) {
  selectedSourceImages.set(taskType, image);
}

export function clearSelectedSourceImage(taskType: DemoTaskType) {
  selectedSourceImages.delete(taskType);
}
