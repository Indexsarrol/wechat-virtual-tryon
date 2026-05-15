import { createApp, defineComponent, h } from "vue";
import ElementPlus from "element-plus";
import router from "./router";

const AppShell = defineComponent({
  name: "AdminAppShell",
  setup() {
    return () => h("div", { class: "admin-app-shell" }, [h("router-view")]);
  }
});

createApp(AppShell).use(router).use(ElementPlus).mount("#app");
