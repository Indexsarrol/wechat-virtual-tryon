import { defineStore } from "pinia";

export const useSessionStore = defineStore("session", {
  state: () => ({
    sessionId: ""
  }),
  actions: {
    setSessionId(sessionId: string) {
      this.sessionId = sessionId;
    }
  }
});
