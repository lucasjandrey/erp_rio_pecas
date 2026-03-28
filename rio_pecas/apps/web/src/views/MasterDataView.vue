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
      <div class="inline-company-picker">
        <label class="form-field inline-select">
          <span>Empresa para cadastro</span>
          <select v-model="filters.companyCode">
            <option value="">Escolha uma empresa</option>
            <option v-for="company in filters.companies" :key="company.code" :value="company.code">
              {{ company.name }}
            </option>
          </select>
        </label>
        <div class="quick-company-actions">
          <button
            v-for="company in filters.companies"
            :key="company.code"
            type="button"
            class="segment-button"
            @click="filters.companyCode = company.code"
          >
            Usar {{ company.name }}
          </button>
        </div>
      </div>
    </article>

    <section v-if="hasSelectedCompany" class="grid kpis">
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

    <article v-if="hasSelectedCompany" class="card">
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

    <article v-if="hasSelectedCompany && activeSection === 'clients'" class="card table-card">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Cadastro</p>
          <h3>Clientes da empresa selecionada</h3>
        </div>
        <div class="soft-badge">{{ clients.length }} registros</div>
      </div>

      <div class="table-filters">
        <label class="form-field">
          <span>Filtrar por nome</span>
          <input v-model="clientFilters.name" placeholder="Digite o nome do cliente" />
        </label>
        <label class="form-field">
          <span>Filtrar por CNPJ / documento</span>
          <input v-model="clientFilters.document" placeholder="Digite o CNPJ ou CPF" />
        </label>
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
                <th>Acoes</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in pagedClients" :key="item.id">
                <td>{{ item.code }}</td>
                <td>{{ item.name }}</td>
                <td>{{ item.legalName || '-' }}</td>
                <td>{{ item.document || '-' }}</td>
                <td class="row-actions">
                  <button class="ghost-button" type="button" @click="editClient(item)">Editar</button>
                  <button class="ghost-button danger-button" type="button" @click="removeClient(item)">Excluir</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-if="showPagination(filteredClients)" class="pagination-bar">
          <button class="ghost-button" type="button" :disabled="pages.clients === 1" @click="pages.clients -= 1">Anterior</button>
          <span class="pagination-label">Pagina {{ pages.clients }} de {{ totalPages(filteredClients) }}</span>
          <button class="ghost-button" type="button" :disabled="pages.clients >= totalPages(filteredClients)" @click="pages.clients += 1">Proxima</button>
        </div>
      </div>
    </article>

    <article v-if="hasSelectedCompany && activeSection === 'vendors'" class="card table-card">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Cadastro</p>
          <h3>Vendedores da empresa selecionada</h3>
        </div>
        <div class="soft-badge">{{ vendors.length }} registros</div>
      </div>

      <div class="table-filters">
        <label class="form-field">
          <span>Filtrar por codigo</span>
          <input v-model="vendorFilters.code" placeholder="Digite o codigo" />
        </label>
        <label class="form-field">
          <span>Filtrar por nome</span>
          <input v-model="vendorFilters.name" placeholder="Digite o nome do vendedor" />
        </label>
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
                <th>Acoes</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in pagedVendors" :key="item.id">
                <td>{{ item.code }}</td>
                <td>{{ item.name }}</td>
                <td>{{ item.company?.name || '-' }}</td>
                <td class="row-actions">
                  <button class="ghost-button" type="button" @click="editVendor(item)">Editar</button>
                  <button class="ghost-button danger-button" type="button" @click="removeVendor(item)">Excluir</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-if="showPagination(filteredVendors)" class="pagination-bar">
          <button class="ghost-button" type="button" :disabled="pages.vendors === 1" @click="pages.vendors -= 1">Anterior</button>
          <span class="pagination-label">Pagina {{ pages.vendors }} de {{ totalPages(filteredVendors) }}</span>
          <button class="ghost-button" type="button" :disabled="pages.vendors >= totalPages(filteredVendors)" @click="pages.vendors += 1">Proxima</button>
        </div>
      </div>
    </article>

    <article v-if="hasSelectedCompany && activeSection === 'categories'" class="card table-card">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Cadastro</p>
          <h3>Categorias contabeis e grupos do DRE</h3>
        </div>
        <div class="soft-badge">{{ categories.length }} registros</div>
      </div>

      <div class="table-filters">
        <label class="form-field">
          <span>Filtrar por categoria</span>
          <input v-model="categoryFilters.name" placeholder="Digite a categoria" />
        </label>
        <label class="form-field">
          <span>Filtrar por grupo DRE</span>
          <input v-model="categoryFilters.dreGroup" placeholder="Digite o grupo DRE" />
        </label>
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
                <th>Acoes</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in pagedCategories" :key="item.id">
                <td>{{ item.name }}</td>
                <td>{{ item.dreGroup || '-' }}</td>
                <td class="row-actions">
                  <button class="ghost-button" type="button" @click="editCategory(item)">Editar</button>
                  <button class="ghost-button danger-button" type="button" @click="removeCategory(item)">Excluir</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-if="showPagination(filteredCategories)" class="pagination-bar">
          <button class="ghost-button" type="button" :disabled="pages.categories === 1" @click="pages.categories -= 1">Anterior</button>
          <span class="pagination-label">Pagina {{ pages.categories }} de {{ totalPages(filteredCategories) }}</span>
          <button class="ghost-button" type="button" :disabled="pages.categories >= totalPages(filteredCategories)" @click="pages.categories += 1">Proxima</button>
        </div>
      </div>
    </article>

    <article v-if="hasSelectedCompany && activeSection === 'accounts'" class="card table-card">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Cadastro</p>
          <h3>Contas contabeis da empresa selecionada</h3>
        </div>
        <div class="soft-badge">{{ accounts.length }} registros</div>
      </div>

      <div class="table-filters table-filters-wide">
        <label class="form-field">
          <span>Filtrar por codigo</span>
          <input v-model="accountFilters.code" placeholder="Digite o codigo da conta" />
        </label>
        <label class="form-field">
          <span>Filtrar por descricao</span>
          <input v-model="accountFilters.description" placeholder="Digite a descricao da conta" />
        </label>
        <label class="form-field">
          <span>Filtrar por grupo</span>
          <input v-model="accountFilters.groupName" placeholder="Digite o grupo contabil" />
        </label>
        <label class="form-field">
          <span>Filtrar por categoria</span>
          <input v-model="accountFilters.category" placeholder="Digite a categoria" />
        </label>
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
                <th>Acoes</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in pagedAccounts" :key="item.id">
                <td>{{ item.code }}</td>
                <td>{{ item.description }}</td>
                <td>{{ item.groupName }}</td>
                <td>{{ item.fixedOrVariable || '-' }}</td>
                <td>{{ item.category?.name || '-' }}</td>
                <td class="row-actions">
                  <button class="ghost-button" type="button" @click="editAccount(item)">Editar</button>
                  <button class="ghost-button danger-button" type="button" @click="removeAccount(item)">Excluir</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-if="showPagination(filteredAccounts)" class="pagination-bar">
          <button class="ghost-button" type="button" :disabled="pages.accounts === 1" @click="pages.accounts -= 1">Anterior</button>
          <span class="pagination-label">Pagina {{ pages.accounts }} de {{ totalPages(filteredAccounts) }}</span>
          <button class="ghost-button" type="button" :disabled="pages.accounts >= totalPages(filteredAccounts)" @click="pages.accounts += 1">Proxima</button>
        </div>
      </div>
    </article>

    <article v-if="hasSelectedCompany && activeSection === 'paymentMethods'" class="card table-card">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Cadastro</p>
          <h3>Formas de pagamento</h3>
        </div>
        <div class="soft-badge">{{ paymentMethods.length }} registros</div>
      </div>

      <div class="table-filters">
        <label class="form-field">
          <span>Filtrar por codigo</span>
          <input v-model="paymentMethodFilters.code" placeholder="Digite o codigo" />
        </label>
        <label class="form-field">
          <span>Filtrar por descricao</span>
          <input v-model="paymentMethodFilters.name" placeholder="Digite a forma de pagamento" />
        </label>
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
                <th>Acoes</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in pagedPaymentMethods" :key="item.id">
                <td>{{ item.code }}</td>
                <td>{{ item.name }}</td>
                <td>{{ item.company?.name || '-' }}</td>
                <td class="row-actions">
                  <button class="ghost-button" type="button" @click="editPaymentMethod(item)">Editar</button>
                  <button class="ghost-button danger-button" type="button" @click="removePaymentMethod(item)">Excluir</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-if="showPagination(filteredPaymentMethods)" class="pagination-bar">
          <button class="ghost-button" type="button" :disabled="pages.paymentMethods === 1" @click="pages.paymentMethods -= 1">Anterior</button>
          <span class="pagination-label">Pagina {{ pages.paymentMethods }} de {{ totalPages(filteredPaymentMethods) }}</span>
          <button class="ghost-button" type="button" :disabled="pages.paymentMethods >= totalPages(filteredPaymentMethods)" @click="pages.paymentMethods += 1">Proxima</button>
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
const pageSize = 12;
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

const clientFilters = reactive({
  name: '',
  document: '',
});

const vendorFilters = reactive({
  code: '',
  name: '',
});

const categoryFilters = reactive({
  name: '',
  dreGroup: '',
});

const accountFilters = reactive({
  code: '',
  description: '',
  groupName: '',
  category: '',
});

const paymentMethodFilters = reactive({
  code: '',
  name: '',
});

const pages = reactive({
  clients: 1,
  vendors: 1,
  categories: 1,
  accounts: 1,
  paymentMethods: 1,
});

const hasSelectedCompany = computed(() => Boolean(filters.companyCode));
const paginate = <T>(items: T[], page: number) => items.slice((page - 1) * pageSize, page * pageSize);
const filteredClients = computed(() => {
  const name = clientFilters.name.trim().toLowerCase();
  const document = clientFilters.document.trim().toLowerCase();

  return clients.value.filter((item) => {
    const matchesName = !name || String(item.name || '').toLowerCase().includes(name) || String(item.legalName || '').toLowerCase().includes(name);
    const matchesDocument = !document || String(item.document || '').toLowerCase().includes(document);
    return matchesName && matchesDocument;
  });
});
const pagedClients = computed(() => paginate(filteredClients.value, pages.clients));
const filteredVendors = computed(() => {
  const code = vendorFilters.code.trim().toLowerCase();
  const name = vendorFilters.name.trim().toLowerCase();
  return vendors.value.filter((item) => {
    const matchesCode = !code || String(item.code || '').toLowerCase().includes(code);
    const matchesName = !name || String(item.name || '').toLowerCase().includes(name);
    return matchesCode && matchesName;
  });
});
const filteredCategories = computed(() => {
  const name = categoryFilters.name.trim().toLowerCase();
  const dreGroup = categoryFilters.dreGroup.trim().toLowerCase();
  return categories.value.filter((item) => {
    const matchesName = !name || String(item.name || '').toLowerCase().includes(name);
    const matchesDreGroup = !dreGroup || String(item.dreGroup || '').toLowerCase().includes(dreGroup);
    return matchesName && matchesDreGroup;
  });
});
const filteredAccounts = computed(() => {
  const code = accountFilters.code.trim().toLowerCase();
  const description = accountFilters.description.trim().toLowerCase();
  const groupName = accountFilters.groupName.trim().toLowerCase();
  const category = accountFilters.category.trim().toLowerCase();
  return accounts.value.filter((item) => {
    const matchesCode = !code || String(item.code || '').toLowerCase().includes(code);
    const matchesDescription = !description || String(item.description || '').toLowerCase().includes(description);
    const matchesGroup = !groupName || String(item.groupName || '').toLowerCase().includes(groupName);
    const matchesCategory = !category || String(item.category?.name || '').toLowerCase().includes(category);
    return matchesCode && matchesDescription && matchesGroup && matchesCategory;
  });
});
const filteredPaymentMethods = computed(() => {
  const code = paymentMethodFilters.code.trim().toLowerCase();
  const name = paymentMethodFilters.name.trim().toLowerCase();
  return paymentMethods.value.filter((item) => {
    const matchesCode = !code || String(item.code || '').toLowerCase().includes(code);
    const matchesName = !name || String(item.name || '').toLowerCase().includes(name);
    return matchesCode && matchesName;
  });
});
const pagedVendors = computed(() => paginate(filteredVendors.value, pages.vendors));
const pagedCategories = computed(() => paginate(filteredCategories.value, pages.categories));
const pagedAccounts = computed(() => paginate(filteredAccounts.value, pages.accounts));
const pagedPaymentMethods = computed(() => paginate(filteredPaymentMethods.value, pages.paymentMethods));

const companyParams = computed(() => ({
  companyCode: filters.companyCode,
}));

function totalPages<T>(items: { value: T[] } | T[]) {
  const source = Array.isArray(items) ? items : items.value;
  return Math.max(1, Math.ceil(source.length / pageSize));
}

function showPagination<T>(items: { value: T[] } | T[]) {
  const source = Array.isArray(items) ? items : items.value;
  return source.length > pageSize;
}

function resetPages() {
  pages.clients = 1;
  pages.vendors = 1;
  pages.categories = 1;
  pages.accounts = 1;
  pages.paymentMethods = 1;
}

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
    clientFilters.name = '';
    clientFilters.document = '';
    vendorFilters.code = '';
    vendorFilters.name = '';
    categoryFilters.name = '';
    categoryFilters.dreGroup = '';
    accountFilters.code = '';
    accountFilters.description = '';
    accountFilters.groupName = '';
    accountFilters.category = '';
    paymentMethodFilters.code = '';
    paymentMethodFilters.name = '';
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
  resetPages();
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

async function removeClient(item: any) {
  if (!window.confirm(`Excluir o cliente "${item.name}"?`)) return;
  await api.delete(`/master-data/clients/${item.id}`);
  if (clientEditingId.value === item.id) resetClientForm();
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

async function removeVendor(item: any) {
  if (!window.confirm(`Excluir o vendedor "${item.name}"?`)) return;
  await api.delete(`/master-data/vendors/${item.id}`);
  if (vendorEditingId.value === item.id) resetVendorForm();
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

async function removeCategory(item: any) {
  if (!window.confirm(`Excluir a categoria "${item.name}"?`)) return;
  await api.delete(`/master-data/account-categories/${item.id}`);
  if (categoryEditingId.value === item.id) resetCategoryForm();
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

async function removeAccount(item: any) {
  if (!window.confirm(`Excluir a conta "${item.description}"?`)) return;
  await api.delete(`/master-data/chart-of-accounts/${item.id}`);
  if (accountEditingId.value === item.id) resetAccountForm();
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

async function removePaymentMethod(item: any) {
  if (!window.confirm(`Excluir a forma de pagamento "${item.name}"?`)) return;
  await api.delete(`/master-data/payment-methods/${item.id}`);
  if (paymentMethodEditingId.value === item.id) resetPaymentMethodForm();
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

watch(
  () => [clientFilters.name, clientFilters.document],
  () => {
    pages.clients = 1;
  },
);

watch(
  () => [vendorFilters.code, vendorFilters.name],
  () => {
    pages.vendors = 1;
  },
);

watch(
  () => [categoryFilters.name, categoryFilters.dreGroup],
  () => {
    pages.categories = 1;
  },
);

watch(
  () => [accountFilters.code, accountFilters.description, accountFilters.groupName, accountFilters.category],
  () => {
    pages.accounts = 1;
  },
);

watch(
  () => [paymentMethodFilters.code, paymentMethodFilters.name],
  () => {
    pages.paymentMethods = 1;
  },
);
</script>
