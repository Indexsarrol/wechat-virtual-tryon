import { createPinia, setActivePinia } from "pinia";
import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useTaskStore } from "../../stores/task";
import LipstickPage from "./index.vue";

vi.mock("../../services/image-picker", () => ({
  pickSourceImage: vi.fn(async () => ({
    dataUrl: "data:image/mock;base64,lipstick-source.jpg",
    fileName: "lipstick-source.jpg",
    source: "browser"
  }))
}));

afterEach(() => {
  delete (globalThis as { uni?: unknown }).uni;
  vi.clearAllMocks();
});

describe("lipstick page", () => {
  it("shows upload and template model modes", () => {
    const wrapper = mount(LipstickPage, {
      global: {
        plugins: [createPinia()]
      }
    });

    expect(wrapper.text()).toContain("上传自拍");
    expect(wrapper.text()).toContain("选择模板模特");
    expect(wrapper.text()).toContain("上传图片仅用于生成试色效果，系统会在到期后自动清理。");
    expect(wrapper.text()).toContain("选择图片");
    expect(wrapper.text()).toContain("开始试色");
  });

  it("creates a lipstick demo task and stores a simulated result", async () => {
    const pinia = createPinia();
    setActivePinia(pinia);
    const navigateTo = vi.fn();
    (globalThis as { uni?: { navigateTo: typeof navigateTo } }).uni = { navigateTo };

    const wrapper = mount(LipstickPage, {
      global: {
        plugins: [pinia]
      }
    });

    await wrapper.get('[data-testid="start-demo"]').trigger("click");
    await new Promise((resolve) => setTimeout(resolve, 0));
    await new Promise((resolve) => setTimeout(resolve, 0));
    await new Promise((resolve) => setTimeout(resolve, 0));

    const taskStore = useTaskStore();
    expect(taskStore.currentStatus).toBe("success");
    expect(taskStore.currentTaskType).toBe("lipstick");
    expect(taskStore.currentOriginalImageUrl).toContain("data:image/svg+xml");
    expect(taskStore.currentResultTitle).toBe("口红试色演示结果");
    expect(navigateTo).toHaveBeenCalledWith({
      url: "/pages/result/index"
    });
    expect(wrapper.text()).toContain("演示结果已生成");
  });

  it("stores a user-selected source image for the lipstick flow", async () => {
    const pinia = createPinia();
    setActivePinia(pinia);
    const navigateTo = vi.fn();
    (globalThis as { uni?: { navigateTo: typeof navigateTo } }).uni = { navigateTo };

    const wrapper = mount(LipstickPage, {
      global: {
        plugins: [pinia]
      }
    });

    await wrapper.get('[data-testid="pick-source"]').trigger("click");
    await wrapper.get('[data-testid="start-demo"]').trigger("click");
    await new Promise((resolve) => setTimeout(resolve, 0));
    await new Promise((resolve) => setTimeout(resolve, 0));
    await new Promise((resolve) => setTimeout(resolve, 0));

    const taskStore = useTaskStore();
    expect(taskStore.currentOriginalImageUrl).toBe("data:image/mock;base64,lipstick-source.jpg");
    expect(taskStore.currentSourceImageName).toBe("已上传用户自拍");
  });
});
