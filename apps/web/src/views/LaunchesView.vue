<template>
  <section class="page">
    <div class="hero-card">
      <div class="hero-copy">
        <p class="eyebrow">Tela de lancamentos</p>
        <h3>Listagem operacional com leitura mais clara entre receitas e despesas</h3>
        <p class="hero-text">Tabela inicial com filtros globais por empresa, ano, mes e status aplicados diretamente pela API.</p>
      </div>
    </div>

    <article class="card table-card">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Operacao</p>
          <h3>Movimentacoes recentes</h3>
        </div>
        <div class="soft-badge">API ao vivo</div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Data</th>
            <th>Empresa</th>
            <th>Cliente</th>
            <th>Conta</th>
            <th>Tipo</th>
            <th>Valor</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in launches" :key="item.id">
            <td>{{ new Date(item.launchDate).toLocaleDateString('pt-BR') }}</td>
            <td>{{ item.company.name }}</td>
            <td>{{ item.client?.name || '-' }}</td>
            <td>{{ item.account?.description }}</td>
            <td><span class="row-badge" :class="typeClass(item)">{{ entryType(item) }}</span></td>
            <td>{{ currency(entryValue(item)) }}</td>
            <td><span class="row-badge" :class="statusClass(item.financialStatus)">{{ item.financialStatus }}</span></td>
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

const launches = ref<any[]>([]);
const filters = useFiltersStore();
const currency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const entryValue = (item: any) => {
  const revenue = Number(item.revenueAmount || 0);
  const expense = Number(item.expenseAmount || 0);
  return revenue > 0 ? revenue : expense;
};

const entryType = (item: any) => {
  const revenue = Number(item.revenueAmount || 0);
  const expense = Number(item.expenseAmount || 0);
  if (revenue > 0 && expense <= 0) return 'Receita';
  if (expense > 0 && revenue <= 0) return 'Despesa';
  if (revenue > 0 && expense > 0) return 'Misto';
  return 'Sem valor';
};

const typeClass = (item: any) => {
  const type = entryType(item);
  if (type === 'Receita') return 'is-revenue';
  if (type === 'Despesa') return 'is-expense';
  if (type === 'Misto') return 'is-mixed';
  return 'is-muted';
};

const statusClass = (status: string) => {
  if (status === 'SETTLED') return 'is-revenue';
  if (status === 'OVERDUE') return 'is-expense';
  if (status === 'PARTIAL') return 'is-mixed';
  return 'is-muted';
};

const loadLaunches = async () => {
  await ensureAuth();
  const response = await api.get('/financial-launches', { params: filters.query });
  launches.value = response.data.items;
};

onMounted(async () => {
  await filters.bootstrap();
  await loadLaunches();
});

watch(
  () => ({ ...filters.query }),
  () => {
    void loadLaunches();
  },
);
</script>
