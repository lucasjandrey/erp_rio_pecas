<template>
  <section class="page">
    <div class="hero-card">
      <div class="hero-copy">
        <p class="eyebrow">Receber x pagar</p>
        <h3>Comparativo mensal entre entradas, saidas e saldo operacional</h3>
        <p class="hero-text">Resumo consolidado para acompanhar o equilibrio financeiro do periodo filtrado.</p>
      </div>
    </div>

    <div class="grid kpis" v-if="report">
      <KpiCard label="Entradas" :value="currency(report.totals.receivable)" detail="Receitas do recorte" />
      <KpiCard label="Saidas" :value="currency(report.totals.payable)" detail="Despesas do recorte" />
      <KpiCard label="Saldo" :value="currency(report.totals.net)" detail="Receber menos pagar" />
    </div>

    <article class="card table-card" v-if="report">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Serie mensal</p>
          <h3>Comparativo por mes</h3>
        </div>
        <div class="soft-badge">Fluxo financeiro</div>
      </div>
      <table>
        <thead>
          <tr>
            <th>Mes</th>
            <th>Entradas</th>
            <th>Saidas</th>
            <th>Recebido/Pago</th>
            <th>Saldo</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in report.series" :key="item.month">
            <td>{{ item.month }}</td>
            <td>{{ currency(item.receivable) }}</td>
            <td>{{ currency(item.payable) }}</td>
            <td>{{ currency(item.settled) }}</td>
            <td><strong>{{ currency(item.net) }}</strong></td>
          </tr>
        </tbody>
      </table>
    </article>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { api, ensureAuth } from '../lib/api';
import { useFiltersStore } from '../stores/filters';
import KpiCard from '../components/KpiCard.vue';

const filters = useFiltersStore();
const report = ref<any>(null);
const currency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const loadReport = async () => {
  await ensureAuth();
  const response = await api.get('/reports/receivable-vs-payable', { params: filters.query });
  report.value = response.data;
};

onMounted(async () => {
  await filters.bootstrap();
  await loadReport();
});

watch(
  () => ({ ...filters.query }),
  () => {
    void loadReport();
  },
);
</script>
