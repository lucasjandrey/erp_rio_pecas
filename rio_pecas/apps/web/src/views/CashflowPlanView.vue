<template>
  <section class="page">
    <div class="hero-card">
      <div class="hero-copy">
        <p class="eyebrow">Previsao Caixa</p>
        <h3>Custos recorrentes e tabela mensal da aba original</h3>
        <p class="hero-text">Leitura direta da planilha para despesas previstas e comportamento mensal das contas recorrentes.</p>
      </div>
    </div>

    <div class="grid kpis" v-if="report">
      <KpiCard label="Custos fixos" :value="currency(totalFixed)" detail="Soma dos itens fixos principais" />
      <KpiCard label="Itens base" :value="String(report.fixedCosts.length)" detail="Linhas recorrentes mapeadas" />
      <KpiCard label="Meses" :value="String(report.months.length)" detail="Colunas mensais da aba" />
    </div>

    <div class="grid charts" v-if="report">
      <article class="card table-card">
        <div class="section-heading">
          <div>
            <p class="eyebrow">Custos base</p>
            <h3>Valores recorrentes</h3>
          </div>
          <div class="soft-badge is-green">Resumo</div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Valor</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in report.fixedCosts" :key="item.label">
              <td>{{ item.label }}</td>
              <td><strong>{{ currency(item.value) }}</strong></td>
            </tr>
          </tbody>
        </table>
      </article>

      <article class="card table-card">
        <div class="section-heading">
          <div>
            <p class="eyebrow">Workbook</p>
            <h3>Tabela mensal</h3>
          </div>
          <div class="soft-badge">Aba Previsao Caixa</div>
        </div>
        <div class="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Conta</th>
                <th v-for="month in report.months" :key="month">{{ month }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in report.monthlyRows.slice(0, 12)" :key="item.label">
                <td>{{ item.label }}</td>
                <td v-for="(value, index) in item.values" :key="`${item.label}-${index}`">{{ currency(value) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { api, ensureAuth } from '../lib/api';
import KpiCard from '../components/KpiCard.vue';

const report = ref<any>(null);
const totalFixed = computed(() => report.value?.fixedCosts?.reduce((sum: number, item: any) => sum + item.value, 0) ?? 0);
const currency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

onMounted(async () => {
  await ensureAuth();
  const response = await api.get('/reports/cashflow-plan');
  report.value = response.data;
});
</script>
