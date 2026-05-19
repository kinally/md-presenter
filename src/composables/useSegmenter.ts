import { ref, computed } from 'vue'
import type { ScriptSection, SegmenterState } from '@/types/script'

/**
 * 脚本分节逻辑
 */
export function useSegmenter() {
  const state = ref<SegmenterState>({
    rawText: '',
    sections: [],
    activeId: null,
  })

  /** 设置原始文本并生成默认分节 */
  function loadText(text: string): void {
    state.value.rawText = text

    // 按双换行默认分节
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim())
    state.value.sections = paragraphs.map((p, i) => ({
      id: `script-${i + 1}`,
      label: `第${i + 1}节`,
      text: p.trim(),
      preview: p.trim().slice(0, 50) + (p.trim().length > 50 ? '…' : ''),
    }))
  }

  /** 在指定位置分割 */
  function splitSection(sectionId: string, atCharIndex: number): void {
    const idx = state.value.sections.findIndex(s => s.id === sectionId)
    if (idx === -1) return

    const section = state.value.sections[idx]
    if (atCharIndex <= 0 || atCharIndex >= section.text.length) return

    const before = section.text.slice(0, atCharIndex).trim()
    const after = section.text.slice(atCharIndex).trim()
    if (!before || !after) return

    const newSections = [...state.value.sections]
    newSections.splice(idx, 1,
      {
        id: `${section.id}-a`,
        label: '',
        text: before,
        preview: before.slice(0, 50) + (before.length > 50 ? '…' : ''),
      },
      {
        id: `${section.id}-b`,
        label: '',
        text: after,
        preview: after.slice(0, 50) + (after.length > 50 ? '…' : ''),
      },
    )

    state.value.sections = renumber(newSections)
  }

  /** 合并两个相邻节 */
  function mergeSections(sectionId: string): void {
    const idx = state.value.sections.findIndex(s => s.id === sectionId)
    if (idx <= 0) return

    const mergedText = state.value.sections[idx - 1].text + '\n\n' + state.value.sections[idx].text
    const newSections = [...state.value.sections]
    newSections.splice(idx - 1, 2, {
      id: `script-merged-${Date.now()}`,
      label: '',
      text: mergedText,
      preview: mergedText.slice(0, 50) + (mergedText.length > 50 ? '…' : ''),
    })

    state.value.sections = renumber(newSections)
  }

  /** 重新编号 */
  function renumber(sections: ScriptSection[]): ScriptSection[] {
    return sections.map((s, i) => ({
      ...s,
      label: `第${i + 1}节`,
    }))
  }

  /** 获取分节后的段落文本列表（用于对齐编辑器） */
  const sectionTexts = computed(() =>
    state.value.sections.map(s => s.text)
  )

  return {
    state,
    loadText,
    splitSection,
    mergeSections,
    sectionTexts,
  }
}
