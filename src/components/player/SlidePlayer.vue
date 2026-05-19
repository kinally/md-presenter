<script setup lang="ts">
import { onMounted, onUnmounted, watch } from 'vue'
import { usePlayer } from '../../composables/usePlayer'
import type { AlignedPair } from '../../types/alignment'
import SlidePage from './SlidePage.vue'
import ProgressBar from './ProgressBar.vue'
import ControlBar from './ControlBar.vue'

const props = defineProps<{ pairs: AlignedPair[] }>()
const emit = defineEmits<{ back: [] }>()

const {
  status,
  currentSlide,
  currentSlideIndex,
  currentPairIndex,
  progress,
  load,
  play,
  pause,
  resume,
  stop,
  nextPair,
  prevPair,
  jumpTo,
} = usePlayer()

onMounted(() => {
  load(props.pairs)
})

// 全屏快捷键
function onKeydown(e: KeyboardEvent) {
  if (e.key === ' ' || e.key === 'Space') {
    e.preventDefault()
    if (status.value === 'playing') pause()
    else if (status.value === 'paused') resume()
    else if (status.value === 'idle') play()
  }
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') nextPair()
  if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') prevPair()
  if (e.key === 'f' || e.key === 'F') {
    document.fullscreenElement
      ? document.exitFullscreen()
      : document.documentElement.requestFullscreen()
  }
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <div class="player">
    <!-- 幻灯片区域 -->
    <div class="player-stage" @click="status === 'idle' ? play() : null">
      <SlidePage
        v-if="currentSlide"
        :slide="currentSlide"
        :slide-index="currentSlideIndex"
        :pair-index="currentPairIndex"
      />
      <div v-else-if="status === 'idle'" class="player-start">
        <button class="btn-start" @click="play">▶ 开始播放</button>
      </div>
      <div v-else class="player-empty">
        <p>没有可显示的内容</p>
      </div>
    </div>

    <!-- 进度条 -->
    <ProgressBar
      :current="currentPairIndex"
      :total="pairs.length"
      :progress="progress"
      @seek="jumpTo"
    />

    <!-- 控制栏 -->
    <ControlBar
      :status="status"
      :has-prev="currentPairIndex > 0"
      :has-next="currentPairIndex < pairs.length - 1"
      @play="play"
      @pause="pause"
      @resume="resume"
      @stop="stop"
      @prev="prevPair"
      @next="nextPair"
      @back="emit('back')"
    />
  </div>
</template>

<style scoped>
.player {
  height: calc(100vh - 100px);
  display: flex;
  flex-direction: column;
  background: #000;
}

.player-stage {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.player-start,
.player-empty {
  text-align: center;
  color: #fff;
}

.btn-start {
  padding: 16px 48px;
  border: 2px solid #fff;
  border-radius: 12px;
  background: transparent;
  color: #fff;
  font-size: 20px;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-start:hover {
  background: rgba(255, 255, 255, 0.1);
}
</style>
