<template>
  <section class="page">
    <div class="hero-card">
      <div class="hero-copy">
        <p class="eyebrow">DRE financeiro</p>
        <h3>Demonstrativo de resultado com filtros e espelho da aba original</h3>
        <p class="hero-text">A tela combina o DRE filtrado pela base importada com a leitura direta da aba DRE Financeiro da planilha.</p>
      </div>
    </div>

    <div class="grid charts">
      <article class="card">
        <div class="section-heading">
          <div>
            <p class="eyebrow">Resumo filtrado</p>
            <h3>Indicadores DRE</h3>
          </div>
          <div class="soft-badge">Banco + filtros</div>
        </div>

        <div class="dre-summary">
          <div class="dre-stat">
            <span>Total de linhas</span>
            <strong>{{ rows.length }}</strong>
          </div>
          <div class="dre-stat">
            <span>Receitas positivas</span>
            <strong>{{ currency(positiveTotal) }}</strong>
          </div>
          <div class="dre-stat">
            <span>Impacto liquido</span>
            <strong>{{ currency(netTotal) }}</strong>
          </div>
        </div>
      </article>

      <article class="card table-card">
        <div class="section-heading">
          <div>
            <p class="eyebrow">Estrutura filtrada</p>
            <h3>Linhas do DRE</h3>
          </div>
          <div class="soft-badge is-green">API dedicada</div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Grupo</th>
              <th>Total</th>
              <th>% Receita</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in rows" :key="item.group">
              <td>{{ item.group }}</td>
              <td><strong>{{ currency(item.total) }}</strong></td>
              <td>{{ percent(item.percentOfRevenue) }}</td>
            </tr>
          </tbody>
        </table>
      </article>
    </div>

    <article class="card table-card" v-if="workbook">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Aba original</p>
          <h3>DRE Financeiro fiel a planilha</h3>
        </div>
        <div class="soft-badge">Workbook</div>
      </div>
      <div class="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Linha</th>
              <th>Total</th>
              <th>%</th>
              <th v-for="month in workbook.months.slice(0, 12)" :key="month">{{ month }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in workbook.entries.slice(0, 30)" :key="item.label">
              <td><strong>{{ item.label }}</strong></td>
              <td>{{ currency(item.total) }}</td>
              <td>{{ percent(item.percentage * 100) }}</td>
              <td v-for="month in item.months.slice(0, 12)" :key="`${item.label}-${month.month}`">{{ currency(month.value) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </article>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { api, ensureAuth } from '../lib/api';
import { useFiltersStore } from '../stores/filters';

const filters = useFiltersStore();
const rows = ref<Array<{ group: string; total: number; percentOfRevenue: number }>>([]);
const workbook = ref<any>(null);

const currency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
const percent = (value: number) => `${value.toFixed(1)}%`;

const positiveTotal = computed(() => rows.value.filter((item) => item.total > 0).reduce((sum, item) => sum + item.total, 0));
const netTotal = computed(() => rows.value.reduce((sum, item) => sum + item.total, 0));

const loadRows = async () => {
  await ensureAuth();
  const [dreResponse, workbookResponse] = await Promise.all([
    api.get('/reports/dre', { params: filters.query }),
    api.get('/reports/dre-workbook'),
  ]);
  rows.value = dreResponse.data;
  workbook.value = workbookResponse.data;
};

onMounted(async () => {
  await filters.bootstrap();
  await loadRows();
});

watch(
  () => ({ ...filters.query }),
  () => {
    void loadRows();
  },
);
</script>
