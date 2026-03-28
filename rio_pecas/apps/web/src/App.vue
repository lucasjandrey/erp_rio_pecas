<template>
  <div class="shell" :class="{ 'shell-sidebar-open': isSidebarExpanded }">
    <aside
      class="sidebar"
      :class="{ 'is-collapsed': !isSidebarExpanded, 'is-expanded': isSidebarExpanded }"
      @mouseenter="isSidebarHovered = true"
      @mouseleave="isSidebarHovered = false"
    >
      <button
        type="button"
        class="sidebar-toggle"
        :aria-label="isSidebarPinned ? 'Recolher menu lateral' : 'Fixar menu lateral aberto'"
        @click="isSidebarPinned = !isSidebarPinned"
      >
        <span>{{ isSidebarPinned ? 'Recolher' : 'Expandir' }}</span>
      </button>

      <div class="brand-panel">
        <div class="brand-mark">
          <span>RIO</span>
          <span>PECAS</span>
        </div>
        <div class="sidebar-copy-block">
          <p class="eyebrow sidebar-eyebrow">Painel financeiro</p>
          <h1>ERP Financeiro</h1>
        </div>
      </div>
      <nav class="nav">
        <RouterLink v-for="item in navigationItems" :key="item.to" :to="item.to" :title="item.label">
          <span class="nav-icon">{{ item.short }}</span>
          <span class="nav-label">{{ item.label }}</span>
        </RouterLink>
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
import { computed, ref } from 'vue';
import { RouterLink, RouterView, useRoute } from 'vue-router';
import GlobalFilters from './components/GlobalFilters.vue';
import { useFiltersStore } from './stores/filters';

const route = useRoute();
const filters = useFiltersStore();
const isSidebarPinned = ref(false);
const isSidebarHovered = ref(false);
const isSidebarExpanded = computed(() => isSidebarPinned.value || isSidebarHovered.value);

const navigationItems = [
  { to: '/', label: 'Dashboard', short: 'DB' },
  { to: '/lancamentos', label: 'Lancamentos', short: 'LC' },
  { to: '/cadastros', label: 'Cadastros', short: 'CD' },
  { to: '/receber', label: 'A Receber', short: 'AR' },
  { to: '/pagar', label: 'A Pagar', short: 'AP' },
  { to: '/receber-pagar', label: 'Receber x Pagar', short: 'RP' },
  { to: '/dre', label: 'DRE', short: 'DR' },
  { to: '/vendas-comissoes', label: 'Vendas e Comissoes', short: 'VC' },
  { to: '/relatorio-conta-contabil', label: 'Relatorio Conta Contabil', short: 'RC' },
  { to: '/faturamento-gastos', label: 'Faturamento x Gastos', short: 'FG' },
  { to: '/recebido-pago-geral', label: 'Recebido / Pago Geral', short: 'PG' },
  { to: '/relatorio-geral', label: 'Relatorio Geral', short: 'RG' },
  { to: '/saldo-contas', label: 'Saldo Contas', short: 'SC' },
  { to: '/previsao-caixa', label: 'Previsao Caixa', short: 'PC' },
  { to: '/importacoes', label: 'Importacoes', short: 'IM' },
];

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
