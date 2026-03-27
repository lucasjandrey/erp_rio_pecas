import { defineStore } from 'pinia';
import { api, ensureAuth } from '../lib/api';

export const useDashboardStore = defineStore('dashboard', {
  state: () => ({
    loading: false,
    executive: null as any,
  }),
  actions: {
    async bootstrap(filters: Record<string, string> = {}) {
      this.loading = true;
      try {
        await ensureAuth();
        const response = await api.get('/dashboard/executive', { params: filters });
        this.executive = response.data;
      } finally {
        this.loading = false;
      }
    },
  },
});
