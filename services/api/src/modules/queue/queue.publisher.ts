type TaskPublishResult = {
  accepted: boolean;
  taskId: string;
  publisherKey?: string;
  queueName?: string;
  deliveryMode?: "in-memory" | "external";
};

type TaskPublisher = (taskId: string) => Promise<TaskPublishResult>;

const DEFAULT_QUEUE_NAME = process.env.TRYON_QUEUE_NAME ?? "virtual-tryon";
const DEFAULT_PUBLISHER_KEY = process.env.TRYON_QUEUE_PROVIDER ?? "in-memory-queue";

const defaultTaskPublisher: TaskPublisher = async (taskId) => {
  return {
    accepted: true,
    taskId,
    publisherKey: DEFAULT_PUBLISHER_KEY,
    queueName: DEFAULT_QUEUE_NAME,
    deliveryMode: DEFAULT_PUBLISHER_KEY === "in-memory-queue" ? "in-memory" : "external"
  };
};

let taskPublisher: TaskPublisher = defaultTaskPublisher;

export function setTaskPublisher(publisher: TaskPublisher) {
  taskPublisher = publisher;
}

export function resetTaskPublisher() {
  taskPublisher = defaultTaskPublisher;
}

export function getTaskQueueConfig() {
  return {
    queueName: DEFAULT_QUEUE_NAME,
    publisherKey: DEFAULT_PUBLISHER_KEY,
    deliveryMode: DEFAULT_PUBLISHER_KEY === "in-memory-queue" ? "in-memory" : "external"
  } as const;
}

export async function publishTryonTask(taskId: string) {
  const result = await taskPublisher(taskId);

  return {
    ...getTaskQueueConfig(),
    ...result
  };
}
