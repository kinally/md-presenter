/** AI API 配置 */
export interface AIConfig {
  /** API 基础地址，如 https://api.openai.com/v1 */
  baseUrl: string
  /** API Key */
  apiKey: string
  /** 选中的模型 ID */
  modelId: string
  /** 是否启用 AI 辅助 */
  enabled: boolean
}

/** AI API 返回的模型信息 */
export interface AIModelInfo {
  id: string
  name?: string
  /** 是否支持 TTS */
  supportsTTS?: boolean
}

/** AI 服务能力标志 */
export interface AICapabilities {
  /** 支持文本生成（用于分节建议、MD 转换） */
  chat: boolean
  /** 支持 TTS */
  tts: boolean
  /** 可用模型列表 */
  models: AIModelInfo[]
}

/** TTS 提供者类型 */
export type TTSProviderType = 'system' | 'api' | 'local'

/** TTS 语音配置 */
export interface TTSConfig {
  providerType: TTSProviderType
  /** AI API 语音（当 providerType === 'api' 时） */
  apiVoice?: string
  /** 本地 TTS 服务地址（当 providerType === 'local' 时） */
  localEndpoint?: string
  /** 本地 TTS 说话人 ID */
  localSpeakerId?: string
  /** 语速 0.5~2.0 */
  speed: number
}
