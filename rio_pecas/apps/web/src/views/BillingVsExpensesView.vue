<template>
  <section class="page">
    <div class="hero-card">
      <div class="hero-copy">
        <p class="eyebrow">Aba da planilha</p>
        <h3>Faturamento x gastos</h3>
        <p class="hero-text">Comparativo mensal baseado no espelho da planilha original.</p>
      </div>
    </div>

    <article class="card table-card" v-if="report">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Resultado</p>
          <h3>Tendencia por mes</h3>
        </div>
      </div>
      <div class="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Mes</th>
              <th>Receita 2025</th>
              <th>Receita 2026</th>
              <th>Resultado 2025</th>
              <th>Resultado 2026</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in report.entries" :key="item.month">
              <td>{{ item.month }}</td>
              <td>{{ currency(item.revenue2025) }}</td>
              <td>{{ currency(item.revenue2026) }}</td>
              <td>{{ currency(item.result2025) }}</td>
              <td>{{ currency(item.result2026) }}</td>
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
  const response = await api.get('/reports/billing-vs-expenses');
  report.value = response.data;
});
</script>
