<template>
  <section class="page">
    <article class="card table-card">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Importador automatico</p>
          <h3>Lotes processados</h3>
        </div>
        <div class="soft-badge is-green">Worker ativo</div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Arquivo</th>
            <th>Versao</th>
            <th>Status</th>
            <th>Importados</th>
            <th>Duplicados</th>
            <th>Invalidos</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in imports" :key="item.id">
            <td>{{ item.sourceFileName }}</td>
            <td>{{ item.versionTag }}</td>
            <td><span class="row-badge" :class="importStatusClass(item.status)">{{ item.status }}</span></td>
            <td>{{ item.importedCount }}</td>
            <td>{{ item.duplicatesCount }}</td>
            <td>{{ item.invalidCount }}</td>
          </tr>
        </tbody>
      </table>
    </article>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { api, ensureAuth } from '../lib/api';

const imports = ref<any[]>([]);

const importStatusClass = (status: string) => {
  if (status === 'COMPLETED') return 'is-revenue';
  if (status === 'FAILED') return 'is-expense';
  if (status === 'PROCESSING') return 'is-mixed';
  return 'is-muted';
};

onMounted(async () => {
  await ensureAuth();
  const response = await api.get('/imports');
  imports.value = response.data;
});
</script>
