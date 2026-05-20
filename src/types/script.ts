/** 脚本段落 — 由用户导入纯文本后点选分节产生 */
export interface ScriptSection {
  id: string
  /** 自动编号，如 "第1节" */
  label: string
  /** 该节的完整文本 */
  text: string
  /** 预览片段（前 50 字） */
  preview: string
}

/** 脚本分节编辑器的状态 */
export interface SegmenterState {
  /** 原始文本 */
  rawText: string
  /** 分节后的段落 */
  sections: ScriptSection[]
  /** 当前正在编辑的节 ID */
  activeId: string | null
}
