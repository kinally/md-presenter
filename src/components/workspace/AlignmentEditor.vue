<script setup lang="ts">
import { onMounted } from 'vue'
import { useAlignment } from '../../composables/useAlignment'
import { parseMarkdown } from '../../parser/markdownParser'
import { useSegmenter } from '../../composables/useSegmenter'
import type { AlignedPair } from '../../types/alignment'
import PairCard from './PairCard.vue'

const props = defineProps<{
  scriptText: string
  markdownText: string
}>()

const emit = defineEmits<{ done: [pairs: AlignedPair[]] }>()

const { state, setScriptSections, setSlideSections, dispatch, hasUnmatched } = useAlignment()
const { state: segState, loadText } = useSegmenter()

onMounted(() => {
  // 解析脚本
  loadText(props.scriptText)
  setScriptSections(segState.value.sections)

  // 解析 Markdown
  const parsed = parseMarkdown(props.markdownText)
  setSlideSections(parsed.sections)
})

function confirmAlignment() {
  if (hasUnmatched.value) {
    const confirm = window.confirm('还有未匹配的节，确定要跳过吗？')
    if (!confirm) return
  }
  emit('done', state.value.pairs)
}
</script>

<template>
  <div class="alignment-editor">
    <h2 class="section-title">🔗 对齐编辑</h2>
    <p class="section-desc">
      拖拽或点击建立脚本段落与 Markdown 节的对应关系。左侧有文字但无匹配 = 🔴，右侧同理。
    </p>

    <div class="alignment-columns">
      <!-- 左侧：脚本段落 -->
      <div class="col col-script">
        <h3 class="col-title">📄 脚本段落</h3>
        <div class="col-list">
          <div
            v-for="s in state.scriptSections"
            :key="s.id"
            :class="['script-item', { unmatched: state.unmatchedScriptIds.has(s.id) }]"
          >
            <span class="item-label">{{ s.label }}</span>
            <p class="item-text">{{ s.preview }}</p>
            <button
              v-for="ss in state.slideSections.filter(sl => state.unmatchedSlideIds.has(sl.id))"
              :key="ss.id"
              class="btn-match"
              @click="dispatch({ type: 'match', scriptId: s.id, slideSectionId: ss.id })"
            >
              对齐到「{{ ss.heading.slice(0, 10) }}」
            </button>
          </div>
        </div>
      </div>

      <!-- 中间：已对齐的对 -->
      <div class="col col-pairs">
        <h3 class="col-title">✅ 已对齐</h3>
        <div class="col-list">
          <PairCard
            v-for="pair in state.pairs"
            :key="pair.id"
            :pair="pair"
            @unmatch="dispatch({ type: 'unmatch', pairId: pair.id })"
            @split="dispatch({ type: 'splitSlide', slideSectionId: pair.slideSectionId, atIndex: $event })"
          />
        </div>
        <div class="insert-actions">
          <button
            class="btn-insert"
            @click="dispatch({ type: 'insertScriptBlank', afterIndex: state.pairs.length - 1 })"
          >
            + 插入空白脚本
          </button>
          <button
            class="btn-insert"
            @click="dispatch({ type: 'insertSlideBlank', afterIndex: state.pairs.length - 1 })"
          >
            + 插入空白幻灯片
          </button>
        </div>
      </div>

      <!-- 右侧：Markdown 节 -->
      <div class="col col-slide">
        <h3 class="col-title">🎨 Markdown 节</h3>
        <div class="col-list">
          <div
            v-for="s in state.slideSections"
            :key="s.id"
            :class="['slide-item', { unmatched: state.unmatchedSlideIds.has(s.id) }]"
          >
            <h4 class="item-heading">## {{ s.heading }}</h4>
            <p class="item-count">{{ s.slides.length }} 页</p>
            <button
              v-for="ss in state.scriptSections.filter(sc => state.unmatchedScriptIds.has(sc.id))"
              :key="ss.id"
              class="btn-match"
              @click="dispatch({ type: 'match', scriptId: ss.id, slideSectionId: s.id })"
            >
              对齐到「{{ ss.label }}」
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="alignment-actions">
      <button class="btn-primary" @click="confirmAlignment">
        完成对齐，进入播放
      </button>
    </div>
  </div>
</template>

<style scoped>
.alignment-editor {
  padding: 32px;
  height: calc(100vh - 140px);
  display: flex;
  flex-direction: column;
}

.section-title {
  margin: 0 0 4px;
  font-size: 20px;
  color: var(--text-primary);
}

.section-desc {
  margin: 0 0 16px;
  font-size: 13px;
  color: var(--text-secondary);
}

.alignment-columns {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 16px;
  overflow: hidden;
}

.col {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.col-title {
  margin: 0 0 8px;
  font-size: 14px;
  color: var(--text-primary);
}

.col-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-right: 4px;
}

.script-item,
.slide-item {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 12px;
}

.script-item.unmatched,
.slide-item.unmatched {
  border-color: #e74c3c;
  background: rgba(231, 76, 60, 0.05);
}

.item-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--accent);
  text-transform: uppercase;
}

.item-text {
  font-size: 13px;
  color: var(--text-primary);
  margin: 4px 0;
  line-height: 1.5;
}

.item-heading {
  font-size: 14px;
  margin: 0 0 4px;
  color: var(--text-primary);
}

.item-count {
  font-size: 12px;
  color: var(--text-secondary);
  margin: 0;
}

.btn-match {
  display: block;
  margin-top: 6px;
  padding: 4px 8px;
  border: 1px dashed var(--accent);
  border-radius: 4px;
  background: transparent;
  color: var(--accent);
  font-size: 11px;
  cursor: pointer;
}

.btn-match:hover {
  background: var(--accent);
  color: #fff;
}

.insert-actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.btn-insert {
  flex: 1;
  padding: 8px;
  border: 1px dashed var(--border-color);
  border-radius: 6px;
  background: transparent;
  color: var(--text-secondary);
  font-size: 12px;
  cursor: pointer;
}

.btn-insert:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.alignment-actions {
  text-align: center;
  margin-top: 16px;
  flex-shrink: 0;
}

.btn-primary {
  padding: 10px 32px;
  border: none;
  border-radius: 8px;
  background: var(--accent);
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.btn-primary:hover {
  opacity: 0.9;
}

@media (max-width: 900px) {
  .alignment-columns {
    grid-template-columns: 1fr;
  }
}
</style>
