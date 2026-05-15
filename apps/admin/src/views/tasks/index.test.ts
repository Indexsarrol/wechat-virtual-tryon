import { mount } from "@vue/test-utils";
import { defineComponent, h } from "vue";
import { describe, expect, it } from "vitest";
import TaskView from "./index.vue";

const ElTable = defineComponent({
  name: "ElTable",
  setup(_, { slots }) {
    return () => h("div", { class: "el-table" }, slots.default?.());
  }
});

const ElTableColumn = defineComponent({
  name: "ElTableColumn",
  props: {
    label: {
      type: String,
      required: true
    }
  },
  setup(props) {
    return () => h("div", { class: "el-table-column" }, props.label);
  }
});

describe("task monitor view", () => {
  it("shows task status and fail reason columns", () => {
    const wrapper = mount(TaskView, {
      global: {
        components: {
          ElTable,
          ElTableColumn
        }
      }
    });

    const columnTexts = wrapper
      .findAll(".el-table-column")
      .map((column) => column.text());

    expect(columnTexts).toEqual(["任务状态", "失败原因"]);
  });
});
