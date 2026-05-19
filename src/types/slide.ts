/** 单张幻灯片节点 */
export interface SlideNode {
  id: string
  type: 'title-slide' | 'section-header' | 'paragraph' | 'code' | 'list' | 'table' | 'image'
  /** 渲染用的原始 Markdown / 处理后的 HTML */
  content: string
  /** 是否需要朗读（代码块/表格不朗读） */
  readable: boolean
  /** 停留时长秒数，仅对不可读节点生效 */
  holdSeconds: number
}

/** Markdown 节 — 由 ## 标题划分 */
export interface SlideSection {
  id: string
  /** 来自 ## 标题文本 */
  heading: string
  /** 该标题下的所有幻灯片页 */
  slides: SlideNode[]
}

/** Markdown 解析结果 */
export interface ParseResult {
  sections: SlideSection[]
  /** 原始 Markdown 中未被解析的警告 */
  warnings: string[]
}
