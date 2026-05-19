<script setup lang="ts">
const props = defineProps<{
  current: number
  total: number
  progress: number
}>()

const emit = defineEmits<{
  seek: [index: number]
}>()

function onClick(e: MouseEvent, index: number) {
  emit('seek', index)
}
</script>

<template>
  <div class="progress-bar">
    <div class="progress-track">
      <button
        v-for="i in total"
        :key="i"
        :class="['progress-dot', { active: i - 1 === current }]"
        @click="onClick($event, i - 1)"
        :title="`第 ${i} 页`"
      ></button>
    </div>
  </div>
</template>

<style scoped>
.progress-bar {
  padding: 8px 24px;
  background: rgba(0, 0, 0, 0.8);
}

.progress-track {
  display: flex;
  gap: 4px;
  justify-content: center;
}

.progress-dot {
  width: 12px;
  height: 4px;
  border-radius: 2px;
  border: none;
  background: rgba(255, 255, 255, 0.3);
  cursor: pointer;
  transition: background 0.2s, width 0.2s;
}

.progress-dot.active {
  background: var(--accent, #818cf8);
  width: 24px;
}

.progress-dot:hover {
  background: rgba(255, 255, 255, 0.6);
}
</style>
