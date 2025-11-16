import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
  }),
  actions: {
    setUser(u) { this.user = u },
    clear() { this.user = null },
  },
  persist: false,
})
