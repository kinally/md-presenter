<script setup lang="ts">
import { ref, onMounted } from 'vue'
import hljs from 'highlight.js'

const props = defineProps<{
  code: string
}>()

const codeRef = ref<HTMLElement>()

onMounted(() => {
  if (codeRef.value) {
    hljs.highlightElement(codeRef.value)
  }
})
</script>

<template>
  <div class="code-block">
    <pre><code ref="codeRef" class="code-content">{{ code }}</code></pre>
  </div>
</template>

<style scoped>
.code-block {
  width: 80%;
  max-height: 80%;
  overflow: auto;
}

.code-content {
  font-size: 1.1rem;
  line-height: 1.5;
  padding: 24px;
  border-radius: 8px;
  background: #1e1e2e;
  color: #cdd6f4;
}
</style>
