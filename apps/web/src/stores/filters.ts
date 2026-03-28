import { defineStore } from 'pinia';
import { api, ensureAuth } from '../lib/api';

export const useFiltersStore = defineStore('filters', {
  state: () => ({
    loaded: false,
    companies: [] as Array<{ code: string; name: string }>,
    years: [] as number[],
    months: [] as Array<{ value: number; label: string }>,
    statuses: [] as string[],
    companyCode: '' as string,
    year: '' as string,
    month: '' as string,
    status: '' as string,
  }),
  getters: {
    query(state) {
      return {
        ...(state.companyCode ? { companyCode: state.companyCode } : {}),
        ...(state.year ? { year: state.year } : {}),
        ...(state.month ? { month: state.month } : {}),
        ...(state.status ? { status: state.status } : {}),
      };
    },
    selectedCompanyLabel(state) {
      if (!state.companyCode) return 'CONSOLIDADO';
      return state.companies.find((item) => item.code === state.companyCode)?.name ?? 'CONSOLIDADO';
    },
  },
  actions: {
    async bootstrap() {
      if (this.loaded) return;
      await ensureAuth();
      const response = await api.get('/filters/options');
      this.companies = response.data.companies;
      this.years = response.data.years;
      this.months = response.data.months;
      this.statuses = response.data.statuses;
      this.loaded = true;
    },
    clear() {
      this.companyCode = '';
      this.year = '';
      this.month = '';
      this.status = '';
    },
  },
});
