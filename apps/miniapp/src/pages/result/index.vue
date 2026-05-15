<template>
  <view class="page result-page">
    <view class="title">试搭结果</view>
    <view class="result-topbar">
      <button class="secondary-action" @click="goHome">返回首页</button>
      <view class="result-status">{{ statusText }}</view>
    </view>
    <view class="toggle-row">
      <view class="toggle-chip">原图</view>
      <view class="toggle-chip">效果图</view>
    </view>
    <view class="result-summary">{{ taskStore.currentResultTitle || "等待演示结果" }}</view>
    <view class="result-description">
      {{ taskStore.currentResultDescription || "点击试衣或试色页的主按钮后，这里会显示模拟效果图。" }}
    </view>
    <view v-if="taskStore.currentSourceImageName" class="result-origin-note">
      原图来源：{{ taskStore.currentSourceImageName }}
    </view>
    <view v-if="taskStore.currentAssetName" class="result-asset-card">
      <img
        v-if="taskStore.currentAssetImageUrl"
        class="asset-image"
        :src="taskStore.currentAssetImageUrl"
        alt="素材预览"
      />
      <view class="asset-copy">
        <view class="asset-name">{{ taskStore.currentAssetName }}</view>
        <view class="asset-description">这是当前演示使用的素材。</view>
      </view>
    </view>
    <img
      v-if="taskStore.currentOriginalImageUrl"
      class="preview-image preview-original"
      :src="taskStore.currentOriginalImageUrl"
      alt="原图预览"
    />
    <view v-else class="preview-empty">原图预览待生成</view>
    <img
      v-if="taskStore.currentResultImageUrl"
      class="preview-image preview-result"
      :src="taskStore.currentResultImageUrl"
      alt="效果图预览"
    />
    <view v-else class="preview-empty">效果图预览待生成</view>
    <button class="primary-action" @click="saveResultImage">保存结果图</button>
  </view>
</template>

<script setup lang="ts">
import { navigateTo, saveImage } from "../../services/miniapp-bridge";
import { useTaskStore } from "../../stores/task";

const taskStore = useTaskStore();

const statusText =
  taskStore.currentTaskType === "lipstick"
    ? "口红试色结果"
    : taskStore.currentTaskType === "fitting"
      ? "在线试衣结果"
      : "演示结果";

function goHome() {
  navigateTo("/pages/index/index");
}

function saveResultImage() {
  if (!taskStore.currentResultImageUrl) {
    return;
  }

  void saveImage(taskStore.currentResultImageUrl);
}
</script>
