import type { SlideNode, SlideSection } from './slide'
import type { ScriptSection } from './script'

/** 对齐后的播放单元 — 驱动最终播放的数据 */
export interface AlignedPair {
  id: string
  /** 对应的脚本段落 ID，null 表示无朗读 */
  scriptId: string | null
  /** 要朗读的文本 */
  scriptText: string
  /** 对应的幻灯片节 ID */
  slideSectionId: string
  /** 该节包含的幻灯片页列表 */
  slides: SlideNode[]
  /** 是否由同一个 ScriptSection 拆分而来（同一段脚本跨多页） */
  isContinuedScript: boolean
}

/** 对齐编辑器状态 */
export interface AlignmentState {
  /** 脚本段落列表（左侧列） */
  scriptSections: ScriptSection[]
  /** Markdown 节列表（右侧列） */
  slideSections: SlideSection[]
  /** 已建立的对齐关系 */
  pairs: AlignedPair[]
  /** 未匹配的脚本段 ID 集合 */
  unmatchedScriptIds: Set<string>
  /** 未匹配的幻灯片节 ID 集合 */
  unmatchedSlideIds: Set<string>
}

/** 对齐操作类型 */
export type AlignmentAction =
  | { type: 'match'; scriptId: string; slideSectionId: string }
  | { type: 'unmatch'; pairId: string }
  | { type: 'insertScriptBlank'; afterIndex: number }
  | { type: 'insertSlideBlank'; afterIndex: number }
  | { type: 'splitSlide'; slideSectionId: string; atIndex: number }
  | { type: 'removePair'; pairId: string }
  | { type: 'reorder'; pairId: string; newIndex: number }
