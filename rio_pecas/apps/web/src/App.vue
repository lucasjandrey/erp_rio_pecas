<template>
  <div class="shell">
    <aside class="sidebar">
      <div class="brand-panel">
        <div class="brand-mark">
          <span>RIO</span>
          <span>PECAS</span>
        </div>
        <div>
          <p class="eyebrow sidebar-eyebrow">Painel financeiro</p>
          <h1>ERP Financeiro</h1>
        </div>
      </div>
      <nav class="nav">
        <RouterLink to="/">Dashboard</RouterLink>
        <RouterLink to="/lancamentos">Lancamentos</RouterLink>
        <RouterLink to="/cadastros">Cadastros</RouterLink>
        <RouterLink to="/receber">A Receber</RouterLink>
        <RouterLink to="/pagar">A Pagar</RouterLink>
        <RouterLink to="/receber-pagar">Receber x Pagar</RouterLink>
        <RouterLink to="/dre">DRE</RouterLink>
        <RouterLink to="/vendas-comissoes">Vendas e Comissoes</RouterLink>
        <RouterLink to="/relatorio-conta-contabil">Relatorio Conta Contabil</RouterLink>
        <RouterLink to="/faturamento-gastos">Faturamento x Gastos</RouterLink>
        <RouterLink to="/recebido-pago-geral">Recebido / Pago Geral</RouterLink>
        <RouterLink to="/relatorio-geral">Relatorio Geral</RouterLink>
        <RouterLink to="/saldo-contas">Saldo Contas</RouterLink>
        <RouterLink to="/previsao-caixa">Previsao Caixa</RouterLink>
        <RouterLink to="/importacoes">Importacoes</RouterLink>
      </nav>
    </aside>

    <main class="content">
      <header class="topbar">
        <div>
          <p class="eyebrow">Consolidado Rio Pecas + MC Maquinas</p>
          <h2>{{ pageTitle }}</h2>
          <div class="company-alert">
            Empresa selecionada:
            <strong>{{ filters.selectedCompanyLabel }}</strong>
          </div>
        </div>
        <div class="topbar-actions">
          <div class="topbar-badge">Dados financeiros centralizados</div>
        </div>
      </header>
      <GlobalFilters />
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink, RouterView, useRoute } from 'vue-router';
import GlobalFilters from './components/GlobalFilters.vue';
import { useFiltersStore } from './stores/filters';

const route = useRoute();
const filters = useFiltersStore();

const pageTitle = computed(() => {
  const map: Record<string, string> = {
    '/': 'Painel gerencial',
    '/lancamentos': 'Lancamentos financeiros',
    '/cadastros': 'Cadastros base',
    '/receber': 'Contas a receber',
    '/pagar': 'Contas a pagar',
    '/receber-pagar': 'Receber x pagar',
    '/dre': 'DRE financeiro',
    '/vendas-comissoes': 'Vendas e comissoes',
    '/relatorio-conta-contabil': 'Relatorio conta contabil',
    '/faturamento-gastos': 'Faturamento x gastos',
    '/recebido-pago-geral': 'Recebido e pago geral',
    '/relatorio-geral': 'Relatorio geral',
    '/saldo-contas': 'Saldo de contas',
    '/previsao-caixa': 'Previsao de caixa',
    '/importacoes': 'Centro de importacoes',
  };

  return map[route.path] ?? 'ERP Financeiro';
});
</script>
