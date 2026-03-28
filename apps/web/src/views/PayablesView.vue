<template>
  <section class="page">
    <div class="hero-card">
      <div class="hero-copy">
        <p class="eyebrow">Contas a pagar</p>
        <h3>Posicao de despesas, contas em aberto e grupos mais relevantes</h3>
        <p class="hero-text">Visao operacional das saidas com foco em saldos pendentes, pagamentos e concentracao por conta contabil.</p>
      </div>
    </div>

    <div class="grid kpis" v-if="report">
      <KpiCard label="Total a pagar" :value="currency(report.summary.total)" detail="Despesas no recorte" />
      <KpiCard label="Em aberto" :value="currency(report.summary.open)" detail="Saldo pendente" />
      <KpiCard label="Pago" :value="currency(report.summary.paid)" detail="Valor liquidado" />
      <KpiCard label="Vencido" :value="currency(report.summary.overdue)" detail="Contas em atraso" />
    </div>

    <div class="grid charts" v-if="report">
      <article class="card table-card">
        <div class="section-heading">
          <div>
            <p class="eyebrow">Ranking</p>
            <h3>Contas mais relevantes</h3>
          </div>
          <div class="soft-badge">Top 10</div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Conta</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in report.topAccounts" :key="item.accountName">
              <td>{{ item.accountName }}</td>
              <td><strong>{{ currency(item.total) }}</strong></td>
            </tr>
          </tbody>
        </table>
      </article>

      <article class="card table-card">
        <div class="section-heading">
          <div>
            <p class="eyebrow">Lancamentos</p>
            <h3>Pagamentos recentes</h3>
          </div>
          <div class="soft-badge">50 registros</div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Vencimento</th>
              <th>Conta</th>
              <th>Empresa</th>
              <th>Valor</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in report.items" :key="item.id">
              <td>{{ item.dueDate ? new Date(item.dueDate).toLocaleDateString('pt-BR') : '-' }}</td>
              <td>{{ item.account?.description || '-' }}</td>
              <td>{{ item.company.name }}</td>
              <td>{{ currency(Number(item.expenseAmount || 0)) }}</td>
              <td><span class="row-badge" :class="statusClass(item.financialStatus)">{{ item.financialStatus }}</span></td>
            </tr>
          </tbody>
        </table>
      </article>
    </div>
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

const statusClass = (status: string) => {
  if (status === 'SETTLED') return 'is-revenue';
  if (status === 'OVERDUE') return 'is-expense';
  if (status === 'PARTIAL') return 'is-mixed';
  return 'is-muted';
};

const loadReport = async () => {
  await ensureAuth();
  const response = await api.get('/reports/payables', { params: filters.query });
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
