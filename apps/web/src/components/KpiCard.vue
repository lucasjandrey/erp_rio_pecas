<template>
  <article class="card kpi-card">
    <div class="kpi-accent"></div>
    <p class="kpi-label">{{ label }}</p>
    <strong>{{ value }}</strong>
    <span class="kpi-detail">{{ detail }}</span>
  </article>
</template>

<script setup lang="ts">
defineProps<{ label: string; value: string; detail: string }>();
</script>
