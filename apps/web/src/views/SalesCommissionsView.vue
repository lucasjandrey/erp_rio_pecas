<template>
  <section class="page">
    <div class="hero-card">
      <div class="hero-copy">
        <p class="eyebrow">Aba da planilha</p>
        <h3>Vendas e comissoes</h3>
        <p class="hero-text">Espelho inicial da aba original com destaque para maquinas novas e usadas por mes.</p>
      </div>
    </div>

    <div class="grid kpis" v-if="report">
      <article class="card kpi-card">
        <div class="kpi-accent"></div>
        <p class="kpi-label">2025 nova</p>
        <strong>{{ currency(report.totals.sales2025New) }}</strong>
      </article>
      <article class="card kpi-card">
        <div class="kpi-accent"></div>
        <p class="kpi-label">2025 usada</p>
        <strong>{{ currency(report.totals.sales2025Used) }}</strong>
      </article>
      <article class="card kpi-card">
        <div class="kpi-accent"></div>
        <p class="kpi-label">2026 nova</p>
        <strong>{{ currency(report.totals.sales2026New) }}</strong>
      </article>
      <article class="card kpi-card">
        <div class="kpi-accent"></div>
        <p class="kpi-label">2026 usada</p>
        <strong>{{ currency(report.totals.sales2026Used) }}</strong>
      </article>
    </div>

    <article class="card table-card" v-if="report">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Planilha original</p>
          <h3>Comparativo mensal</h3>
        </div>
      </div>
      <div class="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Mes</th>
              <th>2025 nova</th>
              <th>2025 usada</th>
              <th>2026 nova</th>
              <th>2026 usada</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in report.machineRows" :key="item.month">
              <td>{{ item.month }}</td>
              <td>{{ currency(item.sales2025New) }}</td>
              <td>{{ currency(item.sales2025Used) }}</td>
              <td>{{ currency(item.sales2026New) }}</td>
              <td>{{ currency(item.sales2026Used) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </article>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { api, ensureAuth } from '../lib/api';

const report = ref<any>(null);
const currency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

onMounted(async () => {
  await ensureAuth();
  const response = await api.get('/reports/sales-commissions');
  report.value = response.data;
});
</script>
