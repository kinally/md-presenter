import type { TTSProviderType } from '@/types/ai'

/** TTS 提供者接口 — 所有朗读引擎统一实现此接口 */
export interface TTSProvider {
  /** 显示名称 */
  readonly name: string
  /** 提供者类型 */
  readonly type: TTSProviderType
  /** 开始朗读 */
  speak(text: string, onEnd: () => void): void
  /** 暂停 */
  pause(): void
  /** 恢复 */
  resume(): void
  /** 取消所有朗读 */
  cancel(): void
  /** 当前提供者是否可用 */
  get isSupported(): boolean
}
