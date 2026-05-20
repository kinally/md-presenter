<script setup lang="ts">
import type { AlignedPair } from '../../types/alignment'

const props = defineProps<{
  pair: AlignedPair
}>()

const emit = defineEmits<{
  unmatch: []
  split: [atIndex: number]
}>()
</script>

<template>
  <div class="pair-card">
    <div class="pair-header">
      <span class="pair-label" v-if="pair.scriptId">
        📖 {{ pair.scriptId }}
      </span>
      <span class="pair-label" v-else>
        🔇 无朗读
      </span>
      <span class="pair-count">{{ pair.slides.length }} 页</span>
    </div>

    <p class="pair-script" v-if="pair.scriptText">
      {{ pair.scriptText.slice(0, 80) }}{{ pair.scriptText.length > 80 ? '…' : '' }}
    </p>

    <div class="pair-actions">
      <button
        class="btn-action"
        @click="emit('unmatch')"
        title="取消对齐"
      >
        解除
      </button>
      <button
        v-if="pair.slides.length > 1"
        class="btn-action"
        @click="emit('split', Math.ceil(pair.slides.length / 2))"
        title="拆分为多页"
      >
        拆页
      </button>
    </div>
  </div>
</template>

<style scoped>
.pair-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 12px;
}

.pair-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.pair-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--accent);
}

.pair-count {
  font-size: 11px;
  color: var(--text-secondary);
}

.pair-script {
  font-size: 12px;
  color: var(--text-secondary);
  margin: 0 0 8px;
  line-height: 1.5;
}

.pair-actions {
  display: flex;
  gap: 6px;
}

.btn-action {
  padding: 3px 8px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-input);
  color: var(--text-secondary);
  font-size: 11px;
  cursor: pointer;
}

.btn-action:hover {
  border-color: var(--accent);
  color: var(--accent);
}
</style>
