<template>
  <section class="page">
    <div class="hero-card">
      <div class="hero-copy">
        <p class="eyebrow">Aba da planilha</p>
        <h3>Relatorio geral</h3>
        <p class="hero-text">Espelho do consolidado anual com estoque, contas, caixa, previsao e saldo.</p>
      </div>
      <div class="soft-badge is-green">Ano {{ report?.year || '-' }}</div>
    </div>

    <article class="card table-card" v-if="report">
      <div class="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Mes</th>
              <th v-for="header in report.headers" :key="header">{{ header }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in report.items" :key="item.month">
              <td>{{ item.month }}</td>
              <td v-for="header in report.headers" :key="`${item.month}-${header}`">{{ currency(Number(item[header] || 0)) }}</td>
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
  const response = await api.get('/reports/general-workbook');
  report.value = response.data;
});
</script>
