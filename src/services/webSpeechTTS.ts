import type { TTSProvider } from './tts'

/**
 * Web Speech API TTS 实现
 * 所有现代浏览器内置，零依赖
 */
export class WebSpeechTTS implements TTSProvider {
  readonly name = '浏览器语音 (Web Speech)'
  readonly type = 'system' as const

  private utterance: SpeechSynthesisUtterance | null = null

  get isSupported(): boolean {
    return 'speechSynthesis' in window
  }

  speak(text: string, onEnd: () => void): void {
    if (!this.isSupported) return

    window.speechSynthesis.cancel()

    this.utterance = new SpeechSynthesisUtterance(text)
    this.utterance.lang = 'zh-CN'
    this.utterance.rate = 1.0
    this.utterance.onend = () => onEnd()
    this.utterance.onerror = () => onEnd()

    window.speechSynthesis.speak(this.utterance)
  }

  pause(): void {
    if (this.isSupported) {
      window.speechSynthesis.pause()
    }
  }

  resume(): void {
    if (this.isSupported) {
      window.speechSynthesis.resume()
    }
  }

  cancel(): void {
    if (this.isSupported) {
      window.speechSynthesis.cancel()
    }
    this.utterance = null
  }
}
