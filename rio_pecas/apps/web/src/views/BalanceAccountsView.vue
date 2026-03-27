<template>
  <section class="page">
    <div class="hero-card">
      <div class="hero-copy">
        <p class="eyebrow">Saldo Contas</p>
        <h3>Espelho da aba de saldo consolidado por data</h3>
        <p class="hero-text">Leitura direta da planilha para investimentos, saldo consolidado e posicoes de pagar e receber.</p>
      </div>
    </div>

    <div class="grid kpis" v-if="latest">
      <KpiCard label="Saldo" :value="currency(latest.saldo)" detail="Posicao consolidada" />
      <KpiCard label="A pagar" :value="currency(latest.aPagar)" detail="Compromissos da linha mais recente" />
      <KpiCard label="A receber" :value="currency(latest.aReceber)" detail="Entradas da linha mais recente" />
      <KpiCard label="Advogado" :value="currency(latest.aReceberAdvogado)" detail="A receber especifico" />
    </div>

    <article class="card table-card" v-if="report">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Workbook</p>
          <h3>Linhas de saldo</h3>
        </div>
        <div class="soft-badge">Aba SALDO CONTAS</div>
      </div>
      <table>
        <thead>
          <tr>
            <th>Data</th>
            <th>Investimentos Rio</th>
            <th>Investimento MC</th>
            <th>Saldo</th>
            <th>A Pagar</th>
            <th>A Receber</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in report.items" :key="String(item.date)">
            <td>{{ new Date(item.date).toLocaleDateString('pt-BR') }}</td>
            <td>{{ currency(item.investimentosRio) }}</td>
            <td>{{ currency(item.investimentoMc) }}</td>
            <td><strong>{{ currency(item.saldo) }}</strong></td>
            <td>{{ currency(item.aPagar) }}</td>
            <td>{{ currency(item.aReceber) }}</td>
          </tr>
        </tbody>
      </table>
    </article>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { api, ensureAuth } from '../lib/api';
import KpiCard from '../components/KpiCard.vue';

const report = ref<any>(null);
const latest = computed(() => report.value?.items?.[report.value.items.length - 1] ?? null);
const currency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

onMounted(async () => {
  await ensureAuth();
  const response = await api.get('/reports/balance-accounts');
  report.value = response.data;
});
</script>
