<script setup lang="ts">
import type { PlayerStatus } from '../../composables/usePlayer'

defineProps<{
  status: PlayerStatus
  hasPrev: boolean
  hasNext: boolean
}>()

const emit = defineEmits<{
  play: []
  pause: []
  resume: []
  stop: []
  prev: []
  next: []
  back: []
}>()
</script>

<template>
  <div class="control-bar">
    <button class="ctrl-btn" @click="emit('back')" title="返回编辑">
      ← 返回
    </button>

    <div class="ctrl-group">
      <button
        class="ctrl-btn"
        :disabled="!hasPrev"
        @click="emit('prev')"
        title="上一页 (←)"
      >
        ⏮
      </button>

      <button
        v-if="status === 'idle' || status === 'finished'"
        class="ctrl-btn ctrl-play"
        @click="emit('play')"
      >
        ▶ {{ status === 'finished' ? '重播' : '播放' }}
      </button>
      <button
        v-else-if="status === 'playing'"
        class="ctrl-btn ctrl-play"
        @click="emit('pause')"
      >
        ⏸ 暂停
      </button>
      <button
        v-else-if="status === 'paused'"
        class="ctrl-btn ctrl-play"
        @click="emit('resume')"
      >
        ▶ 继续
      </button>

      <button
        class="ctrl-btn"
        :disabled="!hasNext"
        @click="emit('next')"
        title="下一页 (→)"
      >
        ⏭
      </button>
    </div>

    <button
      v-if="status !== 'idle'"
      class="ctrl-btn ctrl-stop"
      @click="emit('stop')"
      title="停止"
    >
      ⏹
    </button>

    <span class="ctrl-hint">空格暂停/继续 · ← → 翻页 · F 全屏</span>
  </div>
</template>

<style scoped>
.control-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 24px;
  background: rgba(0, 0, 0, 0.8);
  color: #fff;
}

.ctrl-group {
  display: flex;
  gap: 8px;
  align-items: center;
}

.ctrl-btn {
  padding: 6px 12px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 6px;
  background: transparent;
  color: #fff;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.2s;
}

.ctrl-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.1);
}

.ctrl-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.ctrl-play {
  padding: 8px 24px;
  font-size: 15px;
  font-weight: 600;
  border-color: var(--accent, #818cf8);
  color: var(--accent, #818cf8);
}

.ctrl-stop {
  color: #f87171;
  border-color: #f87171;
}

.ctrl-hint {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
}
</style>
