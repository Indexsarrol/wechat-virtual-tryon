<template>
  <view class="page">
    <view class="hero">AI 试搭体验</view>
    <navigator url="/pages/fitting/index" @click="navigateTo('/pages/fitting/index')">在线试衣</navigator>
    <navigator url="/pages/lipstick/index" @click="navigateTo('/pages/lipstick/index')">口红试色</navigator>
  </view>
</template>

<script setup lang="ts">
import { navigateTo } from "../../services/miniapp-bridge";
</script>
