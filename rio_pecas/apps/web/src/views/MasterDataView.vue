<template>
  <section class="page">
    <div class="hero-card">
      <div class="hero-copy">
        <p class="eyebrow">Cadastros da planilha</p>
        <h3>Base operacional por empresa para substituir a planilha com mais seguranca</h3>
        <p class="hero-text">
          Todos os formularios desta tela respeitam a empresa ativa no topo. Antes de cadastrar qualquer item, o usuario
          precisa escolher a empresa para evitar gravacao errada no ERP consolidado.
        </p>
      </div>
      <div class="soft-badge is-green">Empresa ativa: {{ filters.selectedCompanyLabel }}</div>
    </div>

    <article v-if="!hasSelectedCompany" class="card danger-card">
      <p class="eyebrow">Selecao obrigatoria</p>
      <h3>Selecione uma empresa antes de iniciar qualquer cadastro</h3>
      <p class="hero-text">
        Este ERP integra Rio Pecas e MC Maquinas. Para impedir cadastro na empresa errada, os formularios so sao liberados
        quando a empresa estiver escolhida no topo da tela.
      </p>
    </article>

    <section class="grid kpis">
      <article class="card kpi-card">
        <div class="kpi-accent"></div>
        <p class="kpi-label">Clientes</p>
        <strong>{{ overview.clients }}</strong>
        <span class="kpi-detail">Base comercial vinculada a {{ filters.selectedCompanyLabel }}</span>
      </article>
      <article class="card kpi-card">
        <div class="kpi-accent"></div>
        <p class="kpi-label">Vendedores</p>
        <strong>{{ overview.vendors }}</strong>
        <span class="kpi-detail">Equipe comercial e responsaveis por operacao</span>
      </article>
      <article class="card kpi-card">
        <div class="kpi-accent"></div>
        <p class="kpi-label">Contas contabeis</p>
        <strong>{{ overview.accounts }}</strong>
        <span class="kpi-detail">Plano de contas aplicado aos lancamentos</span>
      </article>
      <article class="card kpi-card">
        <div class="kpi-accent"></div>
        <p class="kpi-label">Formas de pagamento</p>
        <strong>{{ overview.paymentMethods }}</strong>
        <span class="kpi-detail">Codigos e descricoes da base financeira</span>
      </article>
    </section>

    <article class="card">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Dominios base</p>
          <h3>Cadastros espelhados da aba Base Dados</h3>
        </div>
      </div>

      <div class="segment-control">
        <button
          v-for="section in sections"
          :key="section.id"
          type="button"
          class="segment-button"
          :class="{ active: activeSection === section.id }"
          @click="activeSection = section.id"
        >
          {{ section.label }}
        </button>
      </div>
    </article>

    <article v-if="activeSection === 'clients'" class="card">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Cadastro</p>
          <h3>Clientes da empresa selecionada</h3>
        </div>
        <div class="soft-badge">{{ clients.length }} registros</div>
      </div>

      <div class="master-layout">
        <form class="master-form" @submit.prevent="saveClient">
          <fieldset :disabled="!hasSelectedCompany">
            <label class="form-field">
              <span>Codigo do cliente</span>
              <input v-model="clientForm.code" required />
            </label>
            <label class="form-field">
              <span>Nome fantasia</span>
              <input v-model="clientForm.name" required />
            </label>
            <label class="form-field">
              <span>Razao social</span>
              <input v-model="clientForm.legalName" />
            </label>
            <label class="form-field">
              <span>Documento</span>
              <input v-model="clientForm.document" />
            </label>
            <div class="form-actions">
              <button class="button" type="submit">{{ clientEditingId ? 'Salvar cliente' : 'Criar cliente' }}</button>
              <button v-if="clientEditingId" class="ghost-button" type="button" @click="resetClientForm">Cancelar</button>
            </div>
          </fieldset>
        </form>

        <div class="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Codigo</th>
                <th>Nome</th>
                <th>Razao social</th>
                <th>Documento</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in clients" :key="item.id">
                <td>{{ item.code }}</td>
                <td>{{ item.name }}</td>
                <td>{{ item.legalName || '-' }}</td>
                <td>{{ item.document || '-' }}</td>
                <td><button class="ghost-button" type="button" @click="editClient(item)">Editar</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </article>

    <article v-if="activeSection === 'vendors'" class="card">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Cadastro</p>
          <h3>Vendedores da empresa selecionada</h3>
        </div>
        <div class="soft-badge">{{ vendors.length }} registros</div>
      </div>

      <div class="master-layout">
        <form class="master-form" @submit.prevent="saveVendor">
          <fieldset :disabled="!hasSelectedCompany">
            <label class="form-field">
              <span>Codigo do vendedor</span>
              <input v-model="vendorForm.code" required />
            </label>
            <label class="form-field">
              <span>Nome</span>
              <input v-model="vendorForm.name" required />
            </label>
            <div class="form-actions">
              <button class="button" type="submit">{{ vendorEditingId ? 'Salvar vendedor' : 'Criar vendedor' }}</button>
              <button v-if="vendorEditingId" class="ghost-button" type="button" @click="resetVendorForm">Cancelar</button>
            </div>
          </fieldset>
        </form>

        <div class="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Codigo</th>
                <th>Nome</th>
                <th>Empresa</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in vendors" :key="item.id">
                <td>{{ item.code }}</td>
                <td>{{ item.name }}</td>
                <td>{{ item.company?.name || '-' }}</td>
                <td><button class="ghost-button" type="button" @click="editVendor(item)">Editar</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </article>

    <article v-if="activeSection === 'categories'" class="card">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Cadastro</p>
          <h3>Categorias contabeis e grupos do DRE</h3>
        </div>
        <div class="soft-badge">{{ categories.length }} registros</div>
      </div>

      <div class="master-layout">
        <form class="master-form" @submit.prevent="saveCategory">
          <fieldset :disabled="!hasSelectedCompany">
            <label class="form-field">
              <span>Nome da categoria</span>
              <input v-model="categoryForm.name" required />
            </label>
            <label class="form-field">
              <span>Grupo DRE</span>
              <input v-model="categoryForm.dreGroup" />
            </label>
            <div class="form-actions">
              <button class="button" type="submit">{{ categoryEditingId ? 'Salvar categoria' : 'Criar categoria' }}</button>
              <button v-if="categoryEditingId" class="ghost-button" type="button" @click="resetCategoryForm">Cancelar</button>
            </div>
          </fieldset>
        </form>

        <div class="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Categoria</th>
                <th>Grupo DRE</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in categories" :key="item.id">
                <td>{{ item.name }}</td>
                <td>{{ item.dreGroup || '-' }}</td>
                <td><button class="ghost-button" type="button" @click="editCategory(item)">Editar</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </article>

    <article v-if="activeSection === 'accounts'" class="card">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Cadastro</p>
          <h3>Contas contabeis da empresa selecionada</h3>
        </div>
        <div class="soft-badge">{{ accounts.length }} registros</div>
      </div>

      <div class="master-layout">
        <form class="master-form" @submit.prevent="saveAccount">
          <fieldset :disabled="!hasSelectedCompany">
            <label class="form-field">
              <span>Codigo da conta</span>
              <input v-model="accountForm.code" required />
            </label>
            <label class="form-field">
              <span>Descricao</span>
              <input v-model="accountForm.description" required />
            </label>
            <label class="form-field">
              <span>Grupo contabil</span>
              <input v-model="accountForm.groupName" required />
            </label>
            <label class="form-field">
              <span>Tipo F ou V</span>
              <input v-model="accountForm.fixedOrVariable" maxlength="1" />
            </label>
            <label class="form-field">
              <span>Categoria</span>
              <select v-model="accountForm.categoryId">
                <option value="">Sem categoria</option>
                <option v-for="item in categories" :key="item.id" :value="item.id">{{ item.name }}</option>
              </select>
            </label>
            <div class="form-actions">
              <button class="button" type="submit">{{ accountEditingId ? 'Salvar conta' : 'Criar conta' }}</button>
              <button v-if="accountEditingId" class="ghost-button" type="button" @click="resetAccountForm">Cancelar</button>
            </div>
          </fieldset>
        </form>

        <div class="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Codigo</th>
                <th>Descricao</th>
                <th>Grupo</th>
                <th>Tipo</th>
                <th>Categoria</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in accounts" :key="item.id">
                <td>{{ item.code }}</td>
                <td>{{ item.description }}</td>
                <td>{{ item.groupName }}</td>
                <td>{{ item.fixedOrVariable || '-' }}</td>
                <td>{{ item.category?.name || '-' }}</td>
                <td><button class="ghost-button" type="button" @click="editAccount(item)">Editar</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </article>

    <article v-if="activeSection === 'paymentMethods'" class="card">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Cadastro</p>
          <h3>Formas de pagamento</h3>
        </div>
        <div class="soft-badge">{{ paymentMethods.length }} registros</div>
      </div>

      <div class="master-layout">
        <form class="master-form" @submit.prevent="savePaymentMethod">
          <fieldset :disabled="!hasSelectedCompany">
            <label class="form-field">
              <span>Codigo do pagamento</span>
              <input v-model="paymentMethodForm.code" required />
            </label>
            <label class="form-field">
              <span>Descricao do pagamento</span>
              <input v-model="paymentMethodForm.name" required />
            </label>
            <div class="form-actions">
              <button class="button" type="submit">
                {{ paymentMethodEditingId ? 'Salvar forma de pagamento' : 'Criar forma de pagamento' }}
              </button>
              <button v-if="paymentMethodEditingId" class="ghost-button" type="button" @click="resetPaymentMethodForm">
                Cancelar
              </button>
            </div>
          </fieldset>
        </form>

        <div class="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Codigo</th>
                <th>Descricao</th>
                <th>Empresa</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in paymentMethods" :key="item.id">
                <td>{{ item.code }}</td>
                <td>{{ item.name }}</td>
                <td>{{ item.company?.name || '-' }}</td>
                <td><button class="ghost-button" type="button" @click="editPaymentMethod(item)">Editar</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </article>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { api, ensureAuth } from '../lib/api';
import { useFiltersStore } from '../stores/filters';

const filters = useFiltersStore();
const activeSection = ref('clients');
const sections = [
  { id: 'clients', label: 'Clientes' },
  { id: 'vendors', label: 'Vendedores' },
  { id: 'categories', label: 'Categorias' },
  { id: 'accounts', label: 'Contas contabeis' },
  { id: 'paymentMethods', label: 'Formas de pagamento' },
];

const overview = reactive({
  clients: 0,
  vendors: 0,
  categories: 0,
  accounts: 0,
  paymentMethods: 0,
});

const clients = ref<any[]>([]);
const vendors = ref<any[]>([]);
const categories = ref<any[]>([]);
const accounts = ref<any[]>([]);
const paymentMethods = ref<any[]>([]);

const clientEditingId = ref('');
const vendorEditingId = ref('');
const categoryEditingId = ref('');
const accountEditingId = ref('');
const paymentMethodEditingId = ref('');

const clientForm = reactive({
  code: '',
  name: '',
  legalName: '',
  document: '',
});

const vendorForm = reactive({
  code: '',
  name: '',
});

const categoryForm = reactive({
  name: '',
  dreGroup: '',
});

const accountForm = reactive({
  code: '',
  description: '',
  groupName: '',
  fixedOrVariable: '',
  categoryId: '',
});

const paymentMethodForm = reactive({
  code: '',
  name: '',
});

const hasSelectedCompany = computed(() => Boolean(filters.companyCode));

const companyParams = computed(() => ({
  companyCode: filters.companyCode,
}));

async function loadMasterData() {
  await ensureAuth();

  if (!filters.companyCode) {
    clients.value = [];
    vendors.value = [];
    categories.value = [];
    accounts.value = [];
    paymentMethods.value = [];
    overview.clients = 0;
    overview.vendors = 0;
    overview.categories = 0;
    overview.accounts = 0;
    overview.paymentMethods = 0;
    return;
  }

  const [overviewResponse, clientsResponse, vendorsResponse, categoriesResponse, accountsResponse, paymentMethodsResponse] =
    await Promise.all([
      api.get('/master-data/overview', { params: companyParams.value }),
      api.get('/master-data/clients', { params: companyParams.value }),
      api.get('/master-data/vendors', { params: companyParams.value }),
      api.get('/master-data/account-categories', { params: companyParams.value }),
      api.get('/master-data/chart-of-accounts', { params: companyParams.value }),
      api.get('/master-data/payment-methods', { params: companyParams.value }),
    ]);

  Object.assign(overview, overviewResponse.data);
  clients.value = clientsResponse.data;
  vendors.value = vendorsResponse.data;
  categories.value = categoriesResponse.data;
  accounts.value = accountsResponse.data;
  paymentMethods.value = paymentMethodsResponse.data;
}

function resetClientForm() {
  clientEditingId.value = '';
  clientForm.code = '';
  clientForm.name = '';
  clientForm.legalName = '';
  clientForm.document = '';
}

function resetVendorForm() {
  vendorEditingId.value = '';
  vendorForm.code = '';
  vendorForm.name = '';
}

function resetCategoryForm() {
  categoryEditingId.value = '';
  categoryForm.name = '';
  categoryForm.dreGroup = '';
}

function resetAccountForm() {
  accountEditingId.value = '';
  accountForm.code = '';
  accountForm.description = '';
  accountForm.groupName = '';
  accountForm.fixedOrVariable = '';
  accountForm.categoryId = '';
}

function resetPaymentMethodForm() {
  paymentMethodEditingId.value = '';
  paymentMethodForm.code = '';
  paymentMethodForm.name = '';
}

function editClient(item: any) {
  clientEditingId.value = item.id;
  clientForm.code = item.code;
  clientForm.name = item.name;
  clientForm.legalName = item.legalName || '';
  clientForm.document = item.document || '';
}

function editVendor(item: any) {
  vendorEditingId.value = item.id;
  vendorForm.code = item.code;
  vendorForm.name = item.name;
}

function editCategory(item: any) {
  categoryEditingId.value = item.id;
  categoryForm.name = item.name;
  categoryForm.dreGroup = item.dreGroup || '';
}

function editAccount(item: any) {
  accountEditingId.value = item.id;
  accountForm.code = item.code;
  accountForm.description = item.description;
  accountForm.groupName = item.groupName;
  accountForm.fixedOrVariable = item.fixedOrVariable || '';
  accountForm.categoryId = item.categoryId || '';
}

function editPaymentMethod(item: any) {
  paymentMethodEditingId.value = item.id;
  paymentMethodForm.code = item.code;
  paymentMethodForm.name = item.name;
}

async function saveClient() {
  const payload = { companyCode: filters.companyCode, ...clientForm };
  if (clientEditingId.value) {
    await api.put(`/master-data/clients/${clientEditingId.value}`, payload);
  } else {
    await api.post('/master-data/clients', payload);
  }
  resetClientForm();
  await loadMasterData();
}

async function saveVendor() {
  const payload = { companyCode: filters.companyCode, ...vendorForm };
  if (vendorEditingId.value) {
    await api.put(`/master-data/vendors/${vendorEditingId.value}`, payload);
  } else {
    await api.post('/master-data/vendors', payload);
  }
  resetVendorForm();
  await loadMasterData();
}

async function saveCategory() {
  const payload = { companyCode: filters.companyCode, ...categoryForm };
  if (categoryEditingId.value) {
    await api.put(`/master-data/account-categories/${categoryEditingId.value}`, payload);
  } else {
    await api.post('/master-data/account-categories', payload);
  }
  resetCategoryForm();
  await loadMasterData();
}

async function saveAccount() {
  const payload = {
    companyCode: filters.companyCode,
    ...accountForm,
    categoryId: accountForm.categoryId || null,
    fixedOrVariable: accountForm.fixedOrVariable || null,
  };
  if (accountEditingId.value) {
    await api.put(`/master-data/chart-of-accounts/${accountEditingId.value}`, payload);
  } else {
    await api.post('/master-data/chart-of-accounts', payload);
  }
  resetAccountForm();
  await loadMasterData();
}

async function savePaymentMethod() {
  const payload = { companyCode: filters.companyCode, ...paymentMethodForm };
  if (paymentMethodEditingId.value) {
    await api.put(`/master-data/payment-methods/${paymentMethodEditingId.value}`, payload);
  } else {
    await api.post('/master-data/payment-methods', payload);
  }
  resetPaymentMethodForm();
  await loadMasterData();
}

onMounted(async () => {
  await filters.bootstrap();
  await loadMasterData();
});

watch(
  () => filters.companyCode,
  async () => {
    resetClientForm();
    resetVendorForm();
    resetCategoryForm();
    resetAccountForm();
    resetPaymentMethodForm();
    await loadMasterData();
  },
);
</script>
