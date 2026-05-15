import { createPinia, setActivePinia } from "pinia";
import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import ResultPage from "./index.vue";
import { useTaskStore } from "../../stores/task";

describe("result page", () => {
  it("shows original and generated toggles", () => {
    const pinia = createPinia();
    setActivePinia(pinia);
    const taskStore = useTaskStore();
    taskStore.setTaskResult({
      taskId: "demo-task-001",
      taskType: "fitting",
      originalImageUrl: "data:image/svg+xml;charset=utf-8,original",
      resultImageUrl: "data:image/svg+xml;charset=utf-8,result",
      resultTitle: "在线试衣演示结果",
      resultDescription: "系统已生成一张模拟试衣效果图。",
      sourceImageName: "已上传用户原图"
    });

    const wrapper = mount(ResultPage, {
      global: {
        plugins: [pinia]
      }
    });

    expect(wrapper.text()).toContain("原图");
    expect(wrapper.text()).toContain("效果图");
    expect(wrapper.text()).toContain("保存结果图");
    expect(wrapper.text()).toContain("在线试衣演示结果");
    expect(wrapper.text()).toContain("原图来源：");
    const images = wrapper.findAll("img");
    expect(images).toHaveLength(2);
    expect(images[0].attributes("src")).toContain("original");
    expect(images[1].attributes("src")).toContain("result");
  });
});
