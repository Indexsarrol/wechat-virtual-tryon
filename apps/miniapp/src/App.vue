<template>
  <div class="web-preview-shell">
    <section class="web-preview-head">
      <div>
        <h1>Miniapp 假数据演示</h1>
        <p>当前页面直接复用 miniapp 的页面组件与 demo task 逻辑，在浏览器里模拟“小程序试衣/试色”闭环。</p>
      </div>
    </section>
    <section class="miniapp-stage">
      <div class="miniapp-page">
        <component :is="activePage" />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import FittingPage from "./pages/fitting/index.vue";
import IndexPage from "./pages/index/index.vue";
import LipstickPage from "./pages/lipstick/index.vue";
import ResultPage from "./pages/result/index.vue";

function normalizeRoute(hashRoute: string) {
  if (!hashRoute) {
    return "/pages/index/index";
  }

  return hashRoute.startsWith("/") ? hashRoute : `/${hashRoute}`;
}

const routeMap = {
  "/pages/index/index": IndexPage,
  "/pages/fitting/index": FittingPage,
  "/pages/lipstick/index": LipstickPage,
  "/pages/result/index": ResultPage
} as const;

const currentRoute = ref(
  normalizeRoute(typeof window !== "undefined" ? window.location.hash.slice(1) : "")
);

function syncRouteFromHash() {
  currentRoute.value = normalizeRoute(window.location.hash.slice(1));
}

onMounted(() => {
  if (typeof window !== "undefined") {
    window.addEventListener("hashchange", syncRouteFromHash);
  }
});

onUnmounted(() => {
  if (typeof window !== "undefined") {
    window.removeEventListener("hashchange", syncRouteFromHash);
  }
});

const activePage = computed(() => routeMap[currentRoute.value as keyof typeof routeMap] ?? IndexPage);
</script>
