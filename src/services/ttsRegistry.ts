import type { TTSProvider } from './tts'
import type { TTSConfig, TTSProviderType } from '@/types/ai'
import { WebSpeechTTS } from './webSpeechTTS'
import { AiApiTTS } from './aiTTS'
import { LocalModelTTS } from './localModelTTS'

/**
 * TTS 提供者注册表
 * 管理所有可用的 TTS 引擎，提供统一切换
 */
export class TTSRegistry {
  private providers: Map<TTSProviderType, TTSProvider> = new Map()
  private active: TTSProviderType = 'system'

  constructor() {
    // 注册 WebSpeech（始终可用）
    this.register(new WebSpeechTTS())
  }

  /** 注册或更新一个 TTS 提供者 */
  register(provider: TTSProvider): void {
    this.providers.set(provider.type, provider)
  }

  /** 获取当前启用的提供者 */
  getActive(): TTSProvider {
    const p = this.providers.get(this.active)
    if (p && p.isSupported) return p
    // 降级到 WebSpeech
    const fallback = this.providers.get('system')
    if (fallback && fallback.isSupported) return fallback
    throw new Error('没有可用的 TTS 提供者')
  }

  /** 切换提供者 */
  setActive(type: TTSProviderType): boolean {
    const p = this.providers.get(type)
    if (p && p.isSupported) {
      // 先取消当前的
      this.getActive().cancel()
      this.active = type
      return true
    }
    return false
  }

  /** 获取所有已注册的提供者（用于 UI 列表） */
  getAvailable(): { type: TTSProviderType; name: string; isSupported: boolean }[] {
    const list: { type: TTSProviderType; name: string; isSupported: boolean }[] = []
    for (const [type, provider] of this.providers) {
      list.push({ type, name: provider.name, isSupported: provider.isSupported })
    }
    return list
  }

  /** 根据配置更新提供者列表 */
  applyConfig(config: TTSConfig): void {
    if (config.providerType === 'api') {
      this.register(new AiApiTTS(config))
    }
    if (config.providerType === 'local' && config.localEndpoint) {
      this.register(new LocalModelTTS(config))
    }
  }
}
