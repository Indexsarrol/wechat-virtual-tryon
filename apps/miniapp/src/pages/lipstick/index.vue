<template>
  <view class="page lipstick-page">
    <view class="title">口红试色</view>
    <view class="mode-caption">体验方式</view>
    <view class="mode-list">
      <view class="mode-card">上传自拍</view>
      <view class="mode-card">选择模板模特</view>
    </view>
    <view class="asset-card">
      <img class="asset-image" :src="assetPreview.imageUrl" alt="口红素材" />
      <view class="asset-copy">
        <view class="asset-name">{{ assetPreview.name }}</view>
        <view class="asset-description">当前演示将使用这支色号生成模拟试色效果图。</view>
      </view>
    </view>
    <view class="source-card">
      <view class="source-title">用户原图</view>
      <img v-if="selectedSourceImageUrl" class="asset-image" :src="selectedSourceImageUrl" alt="用户自拍" />
      <view v-else class="source-empty">未选择图片时，将使用默认演示原图。</view>
      <view class="source-actions">
        <button data-testid="pick-source" class="secondary-action" @click="selectSourceImage">选择图片</button>
        <button v-if="selectedSourceImageUrl" data-testid="clear-source" class="ghost-action" @click="clearSourceImage">
          清空原图
        </button>
      </view>
    </view>
    <view class="privacy-note">上传图片仅用于生成试色效果，系统会在到期后自动清理。</view>
    <view class="status-note">当前状态：{{ statusText }}</view>
    <button data-testid="start-demo" class="primary-action" @click="runDemo">开始试色</button>
  </view>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import {
  clearSelectedSourceImage,
  createDemoTryonTask,
  fetchBootstrapAssets,
  pollDemoTryonTask,
  setSelectedSourceImage
} from "../../services/api";
import { pickSourceImage } from "../../services/image-picker";
import { navigateTo } from "../../services/miniapp-bridge";
import { useTaskStore } from "../../stores/task";

const taskStore = useTaskStore();
const statusText = ref("待开始");
const assetPreview = ref({
  name: "Rose Bloom",
  imageUrl: ""
});
const selectedSourceImageUrl = ref("");

async function runDemo() {
  taskStore.resetTask();
  statusText.value = "创建任务中";

  const created = await createDemoTryonTask("lipstick");
  taskStore.setTask(created.taskId, created.status, "lipstick");

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const polled = await pollDemoTryonTask(created.taskId);
    taskStore.setTask(created.taskId, polled.status, "lipstick");

    if (polled.status === "success") {
      taskStore.setTaskResult({
        taskId: polled.taskId,
        taskType: "lipstick",
        originalImageUrl: selectedSourceImageUrl.value || polled.originalImageUrl,
        resultImageUrl: polled.resultImageUrl,
        resultTitle: polled.resultTitle,
        resultDescription: polled.resultDescription,
        assetName: assetPreview.value.name,
        assetImageUrl: assetPreview.value.imageUrl,
        sourceImageName: selectedSourceImageUrl.value ? "已上传用户自拍" : "默认演示原图"
      });
      statusText.value = "演示结果已生成";
      navigateTo("/pages/result/index");
      return;
    }

    if (polled.status === "failed") {
      taskStore.setTaskError(polled.message);
      statusText.value = "生成失败";
      return;
    }

    statusText.value = polled.status === "running" ? "生成中" : "任务排队中";
  }

  taskStore.setTaskError("演示任务超时");
  statusText.value = "生成失败";
}

function selectSourceImage() {
  pickSourceImage()
    .then((picked) => {
      selectedSourceImageUrl.value = picked.dataUrl;
      setSelectedSourceImage("lipstick", picked);
    })
    .catch(() => {
      statusText.value = "未选择图片";
    });
}

function clearSourceImage() {
  selectedSourceImageUrl.value = "";
  clearSelectedSourceImage("lipstick");
}

onMounted(async () => {
  const bootstrap = await fetchBootstrapAssets();
  if (bootstrap.lipsticks?.[0]) {
    assetPreview.value = {
      name: bootstrap.lipsticks[0].name,
      imageUrl: bootstrap.lipsticks[0].imageUrl
    };
  }
});
</script>
