import type { TTSProvider } from './tts'
import type { TTSConfig } from '@/types/ai'

/**
 * AI API TTS 实现
 * 调用 OpenAI 兼容的 /v1/audio/speech 端点
 */
export class AiApiTTS implements TTSProvider {
  readonly name = 'AI API 语音'
  readonly type = 'api' as const

  private audioContext: AudioContext | null = null
  private currentSource: AudioBufferSourceNode | null = null
  private isPaused = false
  private pauseOffset = 0
  private startTime = 0
  private config: TTSConfig

  constructor(config: TTSConfig) {
    this.config = config
  }

  get isSupported(): boolean {
    // 只要有 AudioContext 就标记为支持
    // 实际可用性取决于 API 是否支持 TTS
    return typeof AudioContext !== 'undefined'
  }

  async speak(text: string, onEnd: () => void): Promise<void> {
    if (!this.isSupported) return
    this.cancel()

    try {
      const audioBlob = await this.fetchAudio(text)
      const arrayBuffer = await audioBlob.arrayBuffer()

      this.audioContext = new AudioContext()
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer)

      this.currentSource = this.audioContext.createBufferSource()
      this.currentSource.buffer = audioBuffer
      this.currentSource.connect(this.audioContext.destination)

      this.startTime = this.audioContext.currentTime
      this.currentSource.start(0, this.pauseOffset)

      this.currentSource.onended = () => {
        if (!this.isPaused) {
          this.cleanup()
          onEnd()
        }
      }
    } catch {
      this.cleanup()
      onEnd()
    }
  }

  private async fetchAudio(text: string): Promise<Blob> {
    // 从 localStorage 读取当前 AI 配置
    const stored = localStorage.getItem('md-presenter-ai-config')
    const config = stored ? JSON.parse(stored) : {}
    const baseUrl = config.baseUrl || ''
    const apiKey = config.apiKey || ''

    const resp = await fetch(`${baseUrl}/audio/speech`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: config.modelId || 'tts-1',
        input: text,
        voice: this.config.apiVoice || 'alloy',
        response_format: 'mp3',
      }),
    })

    if (!resp.ok) {
      throw new Error(`TTS API 返回 ${resp.status}`)
    }

    return await resp.blob()
  }

  pause(): void {
    if (this.audioContext && this.currentSource) {
      this.isPaused = true
      this.pauseOffset = this.audioContext.currentTime - this.startTime
      try {
        this.currentSource.stop()
      } catch {
        // already stopped
      }
    }
  }

  resume(): void {
    if (this.isPaused && this.lastText) {
      this.isPaused = false
      this.speak(this.lastText, this.lastOnEnd || (() => {}))
    }
  }

  private lastText = ''
  private lastOnEnd: (() => void) | null = null

  private originalSpeak = this.speak
  // Override speak to capture last text
  speak = async (text: string, onEnd: () => void): Promise<void> => {
    this.lastText = text
    this.lastOnEnd = onEnd
    await this.originalSpeak.call(this, text, onEnd)
  }

  cancel(): void {
    this.isPaused = false
    this.pauseOffset = 0
    this.cleanup()
  }

  private cleanup(): void {
    try {
      this.currentSource?.stop()
    } catch {
      // ignore
    }
    this.currentSource?.disconnect()
    this.currentSource = null
    this.audioContext?.close().catch(() => {})
    this.audioContext = null
  }
}
