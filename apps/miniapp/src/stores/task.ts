import { defineStore } from "pinia";

type TaskStatus = "pending" | "running" | "success" | "failed";
type TaskType = "fitting" | "lipstick" | "";

export const useTaskStore = defineStore("task", {
  state: () => ({
    currentTaskId: "",
    currentStatus: "pending" as TaskStatus,
    currentTaskType: "" as TaskType,
    currentOriginalImageUrl: "",
    currentResultImageUrl: "",
    currentResultTitle: "",
    currentResultDescription: "",
    currentErrorMessage: "",
    currentAssetName: "",
    currentAssetImageUrl: "",
    currentSourceImageName: ""
  }),
  actions: {
    resetTask() {
      this.currentTaskId = "";
      this.currentStatus = "pending";
      this.currentTaskType = "";
      this.currentOriginalImageUrl = "";
      this.currentResultImageUrl = "";
      this.currentResultTitle = "";
      this.currentResultDescription = "";
      this.currentErrorMessage = "";
      this.currentAssetName = "";
      this.currentAssetImageUrl = "";
      this.currentSourceImageName = "";
    },
    setTask(taskId: string, status: TaskStatus, taskType?: Exclude<TaskType, "">) {
      this.currentTaskId = taskId;
      this.currentStatus = status;
      if (taskType) {
        this.currentTaskType = taskType;
      }
    },
    setTaskResult(payload: {
      taskId: string;
      taskType: Exclude<TaskType, "">;
      originalImageUrl: string;
      resultImageUrl: string;
      resultTitle: string;
      resultDescription: string;
      assetName?: string;
      assetImageUrl?: string;
      sourceImageName?: string;
    }) {
      this.currentTaskId = payload.taskId;
      this.currentTaskType = payload.taskType;
      this.currentStatus = "success";
      this.currentOriginalImageUrl = payload.originalImageUrl;
      this.currentResultImageUrl = payload.resultImageUrl;
      this.currentResultTitle = payload.resultTitle;
      this.currentResultDescription = payload.resultDescription;
      this.currentAssetName = payload.assetName ?? "";
      this.currentAssetImageUrl = payload.assetImageUrl ?? "";
      this.currentSourceImageName = payload.sourceImageName ?? "";
      this.currentErrorMessage = "";
    },
    setTaskError(message: string) {
      this.currentStatus = "failed";
      this.currentErrorMessage = message;
    }
  }
});
