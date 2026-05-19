import { ref, computed } from 'vue'
import type { AlignedPair, AlignmentState, AlignmentAction } from '@/types/alignment'
import type { ScriptSection } from '@/types/script'
import type { SlideSection } from '@/types/slide'

/**
 * 对齐编辑器状态管理
 */
export function useAlignment() {
  const state = ref<AlignmentState>({
    scriptSections: [],
    slideSections: [],
    pairs: [],
    unmatchedScriptIds: new Set(),
    unmatchedSlideIds: new Set(),
  })

  /** 设置脚本段落 */
  function setScriptSections(sections: ScriptSection[]): void {
    state.value.scriptSections = sections
    state.value.unmatchedScriptIds = new Set(sections.map(s => s.id))
  }

  /** 设置 Markdown 节 */
  function setSlideSections(sections: SlideSection[]): void {
    state.value.slideSections = sections
    state.value.unmatchedSlideIds = new Set(sections.map(s => s.id))
  }

  /** 执行对齐操作 */
  function dispatch(action: AlignmentAction): void {
    switch (action.type) {
      case 'match':
        doMatch(action.scriptId, action.slideSectionId)
        break
      case 'unmatch':
        doUnmatch(action.pairId)
        break
      case 'insertScriptBlank':
        doInsertScriptBlank(action.afterIndex)
        break
      case 'insertSlideBlank':
        doInsertSlideBlank(action.afterIndex)
        break
      case 'splitSlide':
        doSplitSlide(action.slideSectionId, action.atIndex)
        break
      case 'removePair':
        doRemovePair(action.pairId)
        break
      case 'reorder':
        doReorder(action.pairId, action.newIndex)
        break
    }
  }

  function doMatch(scriptId: string, slideSectionId: string): void {
    const script = state.value.scriptSections.find(s => s.id === scriptId)
    const slideSec = state.value.slideSections.find(s => s.id === slideSectionId)
    if (!script || !slideSec) return

    state.value.pairs.push({
      id: `pair-${Date.now()}`,
      scriptId,
      scriptText: script.text,
      slideSectionId,
      slides: slideSec.slides,
      isContinuedScript: false,
    })

    state.value.unmatchedScriptIds.delete(scriptId)
    state.value.unmatchedSlideIds.delete(slideSectionId)
  }

  function doUnmatch(pairId: string): void {
    const idx = state.value.pairs.findIndex(p => p.id === pairId)
    if (idx === -1) return
    const pair = state.value.pairs[idx]
    if (pair.scriptId) state.value.unmatchedScriptIds.add(pair.scriptId)
    state.value.unmatchedSlideIds.add(pair.slideSectionId)
    state.value.pairs.splice(idx, 1)
  }

  function doInsertScriptBlank(afterIndex: number): void {
    state.value.pairs.splice(afterIndex + 1, 0, {
      id: `pair-blank-${Date.now()}`,
      scriptId: null,
      scriptText: '',
      slideSectionId: '',
      slides: [],
      isContinuedScript: false,
    })
  }

  function doInsertSlideBlank(afterIndex: number): void {
    const slideSec = state.value.slideSections[0]
    const blankSlides = slideSec ? slideSec.slides.map(s => ({ ...s, content: '' })) : []
    state.value.pairs.splice(afterIndex + 1, 0, {
      id: `pair-blank-${Date.now()}`,
      scriptId: null,
      scriptText: '',
      slideSectionId: 'blank',
      slides: [{
        id: 'blank-slide',
        type: 'paragraph',
        content: '(空白页)',
        readable: false,
        holdSeconds: 2,
      }],
      isContinuedScript: false,
    })
  }

  function doSplitSlide(slideSectionId: string, atIndex: number): void {
    const pair = state.value.pairs.find(p => p.slideSectionId === slideSectionId)
    if (!pair) return

    const before = pair.slides.slice(0, atIndex)
    const after = pair.slides.slice(atIndex)
    if (before.length === 0 || after.length === 0) return

    pair.slides = before
    const newPair: AlignedPair = {
      id: `pair-split-${Date.now()}`,
      scriptId: pair.scriptId,
      scriptText: pair.scriptText,
      slideSectionId: `${slideSectionId}-split`,
      slides: after,
      isContinuedScript: true,
    }

    const idx = state.value.pairs.indexOf(pair)
    state.value.pairs.splice(idx + 1, 0, newPair)
  }

  function doRemovePair(pairId: string): void {
    const idx = state.value.pairs.findIndex(p => p.id === pairId)
    if (idx === -1) return
    const pair = state.value.pairs[idx]
    if (pair.scriptId) state.value.unmatchedScriptIds.add(pair.scriptId)
    state.value.unmatchedSlideIds.add(pair.slideSectionId)
    state.value.pairs.splice(idx, 1)
  }

  function doReorder(pairId: string, newIndex: number): void {
    const idx = state.value.pairs.findIndex(p => p.id === pairId)
    if (idx === -1) return
    const [pair] = state.value.pairs.splice(idx, 1)
    state.value.pairs.splice(newIndex, 0, pair)
  }

  /** 是否有未匹配项 */
  const hasUnmatched = computed(() =>
    state.value.unmatchedScriptIds.size > 0 || state.value.unmatchedSlideIds.size > 0
  )

  return {
    state,
    setScriptSections,
    setSlideSections,
    dispatch,
    hasUnmatched,
  }
}
