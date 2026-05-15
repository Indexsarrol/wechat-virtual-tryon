import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/garments",
      name: "garments",
      component: () => import("./views/garments/index.vue")
    },
    {
      path: "/lipsticks",
      name: "lipsticks",
      component: () => import("./views/lipsticks/index.vue")
    },
    {
      path: "/models",
      name: "models",
      component: () => import("./views/models/index.vue")
    },
    {
      path: "/tasks",
      name: "tasks",
      component: () => import("./views/tasks/index.vue")
    },
    {
      path: "/:pathMatch(.*)*",
      redirect: "/tasks"
    }
  ]
});

export default router;
