import type { AIConfig, AIModelInfo, AICapabilities } from '@/types/ai'

/**
 * AI 服务层
 * 管理 AI API 的配置、模型列表拉取、文本生成调用
 * 所有请求直接从浏览器发到用户配置的 API
 */
export class AIService {
  private config: AIConfig | null = null

  /** 保存配置 */
  setConfig(config: AIConfig): void {
    this.config = config
    localStorage.setItem('md-presenter-ai-config', JSON.stringify(config))
  }

  /** 读取配置 */
  getConfig(): AIConfig | null {
    if (this.config) return this.config
    const stored = localStorage.getItem('md-presenter-ai-config')
    if (stored) {
      try {
        this.config = JSON.parse(stored)
        return this.config
      } catch { /* ignore */ }
    }
    return null
  }

  /** 拉取可用模型列表 */
  async fetchModels(): Promise<AIModelInfo[]> {
    const cfg = this.getConfig()
    if (!cfg) return []

    try {
      const resp = await fetch(`${cfg.baseUrl}/models`, {
        headers: {
          'Authorization': `Bearer ${cfg.apiKey}`,
        },
      })
      if (!resp.ok) return []

      const data = await resp.json()
      return (data.data || []).map((m: any) => ({
        id: m.id,
        name: m.id,
        supportsTTS: m.id.includes('tts'),
      }))
    } catch {
      return []
    }
  }

  /** 探测 API 能力 */
  async detectCapabilities(): Promise<AICapabilities> {
    const models = await this.fetchModels()
    return {
      chat: models.length > 0,
      tts: models.some(m => m.supportsTTS),
      models,
    }
  }

  /** 调用 AI 聊天补全（用于分节建议、MD 转换等） */
  async chat(messages: { role: 'system' | 'user' | 'assistant'; content: string }[]): Promise<string> {
    const cfg = this.getConfig()
    if (!cfg) throw new Error('AI 未配置')

    const resp = await fetch(`${cfg.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${cfg.apiKey}`,
      },
      body: JSON.stringify({
        model: cfg.modelId,
        messages,
        stream: false,
      }),
    })

    if (!resp.ok) {
      const text = await resp.text().catch(() => '')
      throw new Error(`AI API 错误 (${resp.status}): ${text}`)
    }

    const data = await resp.json()
    return data.choices?.[0]?.message?.content || ''
  }

  /** 给脚本分节建议 */
  async suggestSegments(rawText: string): Promise<string[]> {
    const prompt = `请将以下文稿按语义分成段落，每段用 --- 分隔。只返回分节后的文本，不要额外解释。\n\n${rawText}`
    const result = await this.chat([
      { role: 'system', content: '你是一个文本分节助手。请将文本按语义分成有意义的段落。' },
      { role: 'user', content: prompt },
    ])
    return result.split('---').map(s => s.trim()).filter(Boolean)
  }

  /** 将纯文本转为 Markdown（带标题结构） */
  async textToMarkdown(rawText: string): Promise<string> {
    const prompt = `请将以下文稿转为带标题结构的 Markdown 格式，适合用作 PPT 演示的视觉内容。保留关键数据，精简文字。\n\n${rawText}`
    return await this.chat([
      { role: 'system', content: '你是一个 Markdown 格式化助手。输出简洁的 Markdown，用 ## 和 ### 组织层级。' },
      { role: 'user', content: prompt },
    ])
  }
}

/** 全局单例 */
export const aiService = new AIService()
