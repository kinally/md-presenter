import { ref, computed } from 'vue'
import type { AlignedPair } from '@/types/alignment'
import type { TTSProvider } from '@/services/tts'
import type { TTSConfig } from '@/types/ai'
import { TTSRegistry } from '@/services/ttsRegistry'

export type PlayerStatus = 'idle' | 'playing' | 'paused' | 'finished'

/**
 * 滚播状态机
 */
export function usePlayer() {
  const ttsRegistry = new TTSRegistry()
  // 读取 localStorage 中的 TTS 配置并激活用户选择的提供商
  const storedTtsConfig = localStorage.getItem('md-presenter-tts-config')
  if (storedTtsConfig) {
    try {
      const ttsConfig: TTSConfig = JSON.parse(storedTtsConfig)
      ttsRegistry.applyConfig(ttsConfig)
    } catch {
      // 配置解析失败则使用默认值
    }
  }

  const status = ref<PlayerStatus>('idle')
  const currentPairIndex = ref(0)
  const currentSlideIndex = ref(0)
  const pairs = ref<AlignedPair[]>([])

  /** 当前播放的 pair */
  const currentPair = computed<AlignedPair | null>(() =>
    pairs.value[currentPairIndex.value] ?? null
  )

  /** 当前显示的幻灯片 */
  const currentSlide = computed(() =>
    currentPair.value?.slides[currentSlideIndex.value] ?? null
  )

  /** 总进度 */
  const progress = computed(() => {
    if (pairs.value.length === 0) return 0
    return (currentPairIndex.value + 1) / pairs.value.length
  })

  /** 加载对齐结果并进入待播放状态 */
  function load(pairsList: AlignedPair[]): void {
    pairs.value = pairsList
    currentPairIndex.value = 0
    currentSlideIndex.value = 0
    status.value = 'idle'
  }

  /** 开始播放 */
  function play(): void {
    if (pairs.value.length === 0) return
    status.value = 'playing'
    playCurrent()
  }

  function playCurrent(): void {
    const pair = currentPair.value
    if (!pair) {
      status.value = 'finished'
      return
    }

    if (pair.scriptText) {
      // 有朗读文本 → TTS 朗读
      const tts = ttsRegistry.getActive()
      tts.speak(pair.scriptText, () => {
        nextPair()
      })
    } else {
      // 无朗读 → 停留后自动翻
      setTimeout(() => {
        nextPair()
      }, (pair.slides[0]?.holdSeconds || 3) * 1000)
    }
  }

  /** 下一对 */
  function nextPair(): void {
    if (currentPairIndex.value < pairs.value.length - 1) {
      currentPairIndex.value++
      currentSlideIndex.value = 0
      if (status.value === 'playing') {
        playCurrent()
      }
    } else {
      status.value = 'finished'
    }
  }

  /** 上一对 */
  function prevPair(): void {
    if (currentPairIndex.value > 0) {
      ttsRegistry.getActive().cancel()
      currentPairIndex.value--
      currentSlideIndex.value = 0
      if (status.value === 'playing') {
        playCurrent()
      }
    }
  }

  /** 跳到指定位置 */
  function jumpTo(index: number): void {
    if (index >= 0 && index < pairs.value.length) {
      ttsRegistry.getActive().cancel()
      currentPairIndex.value = index
      currentSlideIndex.value = 0
      if (status.value === 'playing') {
        playCurrent()
      }
    }
  }

  /** 暂停 */
  function pause(): void {
    if (status.value === 'playing') {
      ttsRegistry.getActive().pause()
      status.value = 'paused'
    }
  }

  /** 继续 */
  function resume(): void {
    if (status.value === 'paused') {
      ttsRegistry.getActive().resume()
      status.value = 'playing'
    }
  }

  /** 停止 */
  function stop(): void {
    ttsRegistry.getActive().cancel()
    status.value = 'idle'
    currentPairIndex.value = 0
    currentSlideIndex.value = 0
  }

  return {
    status,
    currentPair,
    currentPairIndex,
    currentSlide,
    currentSlideIndex,
    progress,
    pairs,
    ttsRegistry,
    load,
    play,
    pause,
    resume,
    stop,
    nextPair,
    prevPair,
    jumpTo,
  }
}
