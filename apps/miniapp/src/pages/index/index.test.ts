import { mount } from "@vue/test-utils";
import { defineComponent, h } from "vue";
import { describe, expect, it } from "vitest";
import IndexPage from "./index.vue";

const NavigatorStub = defineComponent({
  name: "Navigator",
  props: {
    url: {
      type: String,
      required: true
    }
  },
  setup(props, { slots, attrs }) {
    return () => h("a", { ...attrs, href: props.url, "data-url": props.url }, slots.default?.());
  }
});

describe("index page", () => {
  it("shows both primary try-on entries", () => {
    const wrapper = mount(IndexPage, {
      global: {
        components: {
          navigator: NavigatorStub
        }
      }
    });
    expect(wrapper.text()).toContain("在线试衣");
    expect(wrapper.text()).toContain("口红试色");
    expect(wrapper.find('a[data-url="/pages/fitting/index"]').exists()).toBe(true);
    expect(wrapper.find('a[data-url="/pages/lipstick/index"]').exists()).toBe(true);
  });
});
