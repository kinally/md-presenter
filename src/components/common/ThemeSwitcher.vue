<script setup lang="ts">
import { ref, onMounted } from 'vue'

const currentTheme = ref('light')

function setTheme(theme: string) {
  currentTheme.value = theme
  document.documentElement.setAttribute('data-theme', theme)
  localStorage.setItem('md-presenter-theme', theme)
}

onMounted(() => {
  const saved = localStorage.getItem('md-presenter-theme')
  if (saved) {
    setTheme(saved)
  }
})
</script>

<template>
  <select
    class="theme-switcher"
    :value="currentTheme"
    @change="setTheme(($event.target as HTMLSelectElement).value)"
  >
    <option value="light">☀️ 浅色</option>
    <option value="dark">🌙 深色</option>
    <option value="minimal">📄 简约</option>
  </select>
</template>

<style scoped>
.theme-switcher {
  padding: 4px 8px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-input);
  color: var(--text-primary);
  font-size: 13px;
  cursor: pointer;
}
</style>
