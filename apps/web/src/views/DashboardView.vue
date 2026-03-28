<template>
  <section class="page">
    <div class="hero-card">
      <div class="hero-copy">
        <p class="eyebrow">Dashboard executivo</p>
        <h3>Visao consolidada das duas empresas com KPIs, forecast e leitura mensal</h3>
        <p class="hero-text">Resumo financeiro com foco em entradas, saidas, posicao aberta e interpretacao gerencial do periodo.</p>
      </div>
      <button class="button" @click="refresh">Atualizar dados</button>
    </div>

    <div class="grid kpis" v-if="dashboard">
      <KpiCard label="Faturamento bruto" :value="currency(dashboard.kpis.faturamentoBruto)" detail="Receitas do escopo atual" />
      <KpiCard label="Despesas" :value="currency(dashboard.kpis.despesas)" detail="Saidas consolidadas" />
      <KpiCard label="Contas a receber" :value="currency(dashboard.kpis.contasReceber)" detail="Receitas em aberto" />
      <KpiCard label="Contas a pagar" :value="currency(dashboard.kpis.contasPagar)" detail="Despesas em aberto" />
      <KpiCard label="Saldo" :value="currency(dashboard.kpis.saldo)" detail="Resultado consolidado" />
      <KpiCard label="Previsao de caixa" :value="currency(Number(dashboard.kpis.previsaoCaixa))" detail="Cenario provavel inicial" />
    </div>

    <div class="grid charts" v-if="chartData && dashboard">
      <article class="card chart-card">
        <div class="section-heading">
          <div>
            <p class="eyebrow">Performance mensal</p>
            <h3>Entradas x saidas</h3>
          </div>
          <div class="soft-badge">Consolidado</div>
        </div>
        <div class="chart-frame">
          <Bar :data="chartData" :options="chartOptions" />
        </div>
      </article>

      <article class="card table-card">
        <div class="section-heading">
          <div>
            <p class="eyebrow">Projecao</p>
            <h3>Forecast de caixa</h3>
          </div>
          <div class="soft-badge is-green">Cenarios</div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Cenario</th>
              <th>Data</th>
              <th>Entrada</th>
              <th>Saida</th>
              <th>Resultado</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in dashboard.forecast" :key="`${item.scenario}-${item.referenceDate}`">
              <td>{{ item.scenario }}</td>
              <td>{{ formatDate(item.referenceDate) }}</td>
              <td>{{ currency(Number(item.projectedIn)) }}</td>
              <td>{{ currency(Number(item.projectedOut)) }}</td>
              <td>{{ currency(Number(item.projectedNet)) }}</td>
            </tr>
          </tbody>
        </table>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue';
import { Bar } from 'vue-chartjs';
import { BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Title, Tooltip } from 'chart.js';
import KpiCard from '../components/KpiCard.vue';
import { useDashboardStore } from '../stores/dashboard';
import { useFiltersStore } from '../stores/filters';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const store = useDashboardStore();
const filters = useFiltersStore();
const dashboard = computed(() => store.executive);

const chartData = computed(() => {
  if (!dashboard.value) return null;
  return {
    labels: dashboard.value.monthlySeries.map((item: any) => item.month),
    datasets: [
      { label: 'Receita', backgroundColor: '#2f8ea1', borderRadius: 10, data: dashboard.value.monthlySeries.map((item: any) => item.revenue) },
      { label: 'Despesa', backgroundColor: '#204e75', borderRadius: 10, data: dashboard.value.monthlySeries.map((item: any) => item.expense) },
    ],
  };
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { labels: { usePointStyle: true, boxWidth: 10 } } },
};

const currency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
const formatDate = (value: string) => new Date(value).toLocaleDateString('pt-BR');
const refresh = () => store.bootstrap(filters.query);

onMounted(async () => {
  await filters.bootstrap();
  await refresh();
});

watch(
  () => ({ ...filters.query }),
  () => {
    void refresh();
  },
);
</script>
