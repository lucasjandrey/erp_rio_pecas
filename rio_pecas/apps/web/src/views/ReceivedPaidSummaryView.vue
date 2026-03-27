<template>
  <section class="page">
    <div class="hero-card">
      <div class="hero-copy">
        <p class="eyebrow">Aba da planilha</p>
        <h3>Recebido e pago geral</h3>
        <p class="hero-text">Resumo inicial das visoes de recebiveis por conta e fornecedores pagos/a pagar vindos da planilha.</p>
      </div>
    </div>

    <div class="grid charts" v-if="report">
      <article class="card table-card">
        <div class="section-heading">
          <div>
            <p class="eyebrow">A receber</p>
            <h3>Contas e receitas abertas</h3>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Descricao</th>
              <th>Total</th>
              <th>%</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in report.receivablesByAccount" :key="item.label">
              <td>{{ item.label }}</td>
              <td>{{ currency(item.total) }}</td>
              <td>{{ percent(item.percentage) }}</td>
            </tr>
          </tbody>
        </table>
      </article>

      <article class="card table-card">
        <div class="section-heading">
          <div>
            <p class="eyebrow">Pago / a pagar</p>
            <h3>Fornecedores e contas</h3>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Fornecedor</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in report.payablesSummary" :key="item.supplier">
              <td>{{ item.supplier }}</td>
              <td>{{ currency(item.total) }}</td>
            </tr>
          </tbody>
        </table>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { api, ensureAuth } from '../lib/api';

const report = ref<any>(null);
const currency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
const percent = (value: number) => `${(value * 100).toFixed(2)}%`;

onMounted(async () => {
  await ensureAuth();
  const response = await api.get('/reports/received-paid-summary');
  report.value = response.data;
});
</script>
