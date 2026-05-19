<script setup lang="ts">
defineProps<{
  html: string
}>()
</script>

<template>
  <div class="table-block" v-html="html"></div>
</template>

<style scoped>
.table-block {
  width: 80%;
  overflow: auto;
}

.table-block :deep(table) {
  width: 100%;
  border-collapse: collapse;
  color: #fff;
  font-size: 1.2rem;
}

.table-block :deep(th),
.table-block :deep(td) {
  padding: 12px 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  text-align: left;
}

.table-block :deep(th) {
  background: rgba(255, 255, 255, 0.1);
  font-weight: 600;
}
</style>
