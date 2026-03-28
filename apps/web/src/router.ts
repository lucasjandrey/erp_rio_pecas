import { createRouter, createWebHistory } from 'vue-router';
import DashboardView from './views/DashboardView.vue';
import LaunchesView from './views/LaunchesView.vue';
import ReportsView from './views/ReportsView.vue';
import ImportsView from './views/ImportsView.vue';
import DreView from './views/DreView.vue';
import MasterDataView from './views/MasterDataView.vue';
import ReceivablesView from './views/ReceivablesView.vue';
import PayablesView from './views/PayablesView.vue';
import BalanceAccountsView from './views/BalanceAccountsView.vue';
import CashflowPlanView from './views/CashflowPlanView.vue';
import SalesCommissionsView from './views/SalesCommissionsView.vue';
import AccountingReportView from './views/AccountingReportView.vue';
import BillingVsExpensesView from './views/BillingVsExpensesView.vue';
import GeneralWorkbookReportView from './views/GeneralWorkbookReportView.vue';
import ReceivedPaidSummaryView from './views/ReceivedPaidSummaryView.vue';

export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: DashboardView },
    { path: '/lancamentos', component: LaunchesView },
    { path: '/cadastros', component: MasterDataView },
    { path: '/receber', component: ReceivablesView },
    { path: '/pagar', component: PayablesView },
    { path: '/receber-pagar', component: ReportsView },
    { path: '/dre', component: DreView },
    { path: '/vendas-comissoes', component: SalesCommissionsView },
    { path: '/relatorio-conta-contabil', component: AccountingReportView },
    { path: '/faturamento-gastos', component: BillingVsExpensesView },
    { path: '/recebido-pago-geral', component: ReceivedPaidSummaryView },
    { path: '/relatorio-geral', component: GeneralWorkbookReportView },
    { path: '/saldo-contas', component: BalanceAccountsView },
    { path: '/previsao-caixa', component: CashflowPlanView },
    { path: '/importacoes', component: ImportsView },
  ],
});
