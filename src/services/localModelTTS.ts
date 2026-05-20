import type { TTSProvider } from './tts'
import type { TTSConfig } from '@/types/ai'

/**
 * 本地模型 TTS 实现
 * 对接用户本地运行的 TTS 推理服务（GPT-SoVITS、RVC、xTTS 等）
 */
export class LocalModelTTS implements TTSProvider {
  readonly name = '本地模型'
  readonly type = 'local' as const

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
    return typeof AudioContext !== 'undefined'
  }

  private lastText = ''
  private lastOnEnd: (() => void) | null = null

  async speak(text: string, onEnd: () => void): Promise<void> {
    this.lastText = text
    this.lastOnEnd = onEnd
    if (!this.isSupported) return
    this.cancel()

    try {
      const audioBlob = await this.fetchLocalTTS(text)
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

  private async fetchLocalTTS(text: string): Promise<Blob> {
    const endpoint = this.config.localEndpoint || 'http://localhost:9880'
    const resp = await fetch(`${endpoint}/tts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        speaker_id: this.config.localSpeakerId || 'default',
        speed: this.config.speed || 1.0,
      }),
    })

    if (!resp.ok) {
      throw new Error(`本地 TTS 服务返回 ${resp.status}`)
    }

    return await resp.blob()
  }

  pause(): void {
    if (this.audioContext && this.currentSource) {
      this.isPaused = true
      this.pauseOffset = this.audioContext.currentTime - this.startTime
      try { this.currentSource.stop() } catch { /* ignore */ }
    }
  }

  resume(): void {
    if (this.isPaused && this.lastText) {
      this.isPaused = false
      this.speak(this.lastText, this.lastOnEnd || (() => {}))
    }
  }

  cancel(): void {
    this.isPaused = false
    this.pauseOffset = 0
    this.cleanup()
  }

  private cleanup(): void {
    try { this.currentSource?.stop() } catch { /* ignore */ }
    this.currentSource?.disconnect()
    this.currentSource = null
    this.audioContext?.close().catch(() => {})
    this.audioContext = null
  }
}
