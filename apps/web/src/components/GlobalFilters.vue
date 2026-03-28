<template>
  <section class="filters-bar">
    <div class="filters-grid">
      <label class="filter-field">
        <span>Empresa</span>
        <select v-model="store.companyCode" class="company-select">
          <option value="">Consolidado</option>
          <option v-for="company in store.companies" :key="company.code" :value="company.code">
            {{ company.name }}
          </option>
        </select>
      </label>

      <label class="filter-field">
        <span>Ano</span>
        <select v-model="store.year">
          <option value="">Todos</option>
          <option v-for="year in store.years" :key="year" :value="String(year)">
            {{ year }}
          </option>
        </select>
      </label>

      <label class="filter-field">
        <span>Mes</span>
        <select v-model="store.month">
          <option value="">Todos</option>
          <option v-for="month in store.months" :key="month.value" :value="String(month.value)">
            {{ month.label }}
          </option>
        </select>
      </label>

      <label class="filter-field">
        <span>Status</span>
        <select v-model="store.status">
          <option value="">Todos</option>
          <option v-for="status in store.statuses" :key="status" :value="status">
            {{ status }}
          </option>
        </select>
      </label>
    </div>

    <button class="ghost-button" @click="store.clear">Limpar filtros</button>
  </section>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useFiltersStore } from '../stores/filters';

const store = useFiltersStore();

onMounted(() => {
  void store.bootstrap();
});
</script>
