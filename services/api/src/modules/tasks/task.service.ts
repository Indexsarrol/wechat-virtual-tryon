import { randomUUID } from "node:crypto";
import { type TryonTaskCreate, tryonTaskCreateSchema } from "@virtual-tryon/contracts";

export type TaskRecord = {
  taskId: string;
  status: "pending" | "running" | "success" | "failed";
  createdAt: string;
  originalImageUrl?: string;
  resultImageUrl?: string;
  resultTitle?: string;
  resultDescription?: string;
  message?: string;
} & TryonTaskCreate;

type StoredTaskRecord = TaskRecord & {
  persistenceKey: string;
  pollCount: number;
};

type TaskPersistenceAdapter = {
  create(task: TaskRecord): Promise<TaskRecord>;
  get(taskId: string): Promise<TaskRecord | null>;
  reset(): Promise<void>;
};

const memoryTaskStore = new Map<string, StoredTaskRecord>();

function toTaskRecord(task: StoredTaskRecord): TaskRecord {
  const { persistenceKey: _persistenceKey, pollCount: _pollCount, ...record } = task;
  return record;
}

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

function buildDemoTaskMedia(taskType: TaskRecord["taskType"]) {
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

const memoryTaskPersistence: TaskPersistenceAdapter = {
  async create(task) {
    const storedTask: StoredTaskRecord = {
      ...task,
      persistenceKey: `memory:${randomUUID()}`,
      pollCount: 0
    };
    memoryTaskStore.set(task.taskId, storedTask);
    return toTaskRecord(storedTask);
  },
  async get(taskId) {
    const storedTask = memoryTaskStore.get(taskId);
    return storedTask ? toTaskRecord(storedTask) : null;
  },
  async reset() {
    memoryTaskStore.clear();
  }
};

let taskPersistence: TaskPersistenceAdapter = memoryTaskPersistence;

type BuildTaskResult =
  | {
      success: true;
      task: TaskRecord;
    }
  | {
      success: false;
    };

function buildTaskRecord(payload: TryonTaskCreate): TaskRecord {
  return {
    taskId: randomUUID(),
    status: "pending",
    createdAt: new Date().toISOString(),
    ...buildDemoTaskMedia(payload.taskType),
    ...payload
  };
}

export async function buildTask(payload: unknown): Promise<BuildTaskResult> {
  const parsed = tryonTaskCreateSchema.safeParse(payload);

  if (!parsed.success) {
    return {
      success: false
    };
  }

  return {
    success: true,
    task: buildTaskRecord(parsed.data)
  };
}

export async function saveTask(task: TaskRecord) {
  return taskPersistence.create(task);
}

export async function createTask(payload: TryonTaskCreate) {
  const task = buildTaskRecord(tryonTaskCreateSchema.parse(payload));
  return saveTask(task);
}

export async function getTask(taskId: string) {
  const task = await taskPersistence.get(taskId);

  if (!task) {
    return null;
  }

  const storedTask = memoryTaskStore.get(taskId);

  if (!storedTask) {
    return task;
  }

  if (storedTask.status === "pending" && storedTask.pollCount === 0) {
    storedTask.pollCount = 1;
    return toTaskRecord(storedTask);
  }

  if (storedTask.status === "pending" && storedTask.pollCount === 1) {
    storedTask.status = "running";
    storedTask.pollCount = 2;
    return toTaskRecord(storedTask);
  }

  if (storedTask.status === "running") {
    storedTask.status = "success";
    return toTaskRecord(storedTask);
  }

  return taskPersistence.get(taskId);
}

export function setTaskPersistence(adapter: TaskPersistenceAdapter) {
  taskPersistence = adapter;
}

export function resetTaskPersistence() {
  taskPersistence = memoryTaskPersistence;
}

export async function resetTaskStore() {
  const previousPersistence = taskPersistence;
  taskPersistence = memoryTaskPersistence;

  await previousPersistence.reset();
  if (previousPersistence !== memoryTaskPersistence) {
    await memoryTaskPersistence.reset();
  }
}
