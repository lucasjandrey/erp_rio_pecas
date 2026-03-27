<template>
  <section class="page">
    <div class="hero-card">
      <div class="hero-copy">
        <p class="eyebrow">Aba da planilha</p>
        <h3>Relatorio conta contabil</h3>
        <p class="hero-text">Leitura inicial da tabela contabil da planilha, com totais por conta e distribuicao mensal.</p>
      </div>
    </div>

    <article class="card table-card" v-if="report">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Contabil</p>
          <h3>Totais por conta</h3>
        </div>
        <div class="soft-badge">{{ report.entries.length }} linhas</div>
      </div>
      <div class="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Conta</th>
              <th v-for="month in report.months" :key="month">{{ month }}</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in report.entries" :key="item.account">
              <td>{{ item.account }}</td>
              <td v-for="month in item.monthlyValues" :key="`${item.account}-${month.month}`">{{ currency(month.value) }}</td>
              <td>{{ currency(item.total) }}</td>
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
  const response = await api.get('/reports/accounting-report');
  report.value = response.data;
});
</script>
