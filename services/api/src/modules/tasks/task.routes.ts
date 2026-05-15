import type { FastifyInstance } from "fastify";
import { publishTryonTask } from "../queue/queue.publisher";
import { buildTask, getTask, saveTask } from "./task.service";

export async function registerTaskRoutes(app: FastifyInstance) {
  app.post("/tasks", async (request, reply) => {
    const buildResult = await buildTask(request.body);

    if (!buildResult.success) {
      return reply.code(400).send({
        message: "Invalid task payload"
      });
    }

    const { task } = buildResult;
    const publishResult = await publishTryonTask(task.taskId);

    if (!publishResult.accepted) {
      return reply.code(503).send({
        message: "Task publish rejected"
      });
    }

    await saveTask(task);
    return reply.code(202).send(task);
  });

  app.get("/tasks/:taskId", async (request, reply) => {
    const { taskId } = request.params as { taskId: string };
    const task = await getTask(taskId);

    if (!task) {
      return reply.code(404).send({
        message: "Task not found"
      });
    }

    return task;
  });
}
