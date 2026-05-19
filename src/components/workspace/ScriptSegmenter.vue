<script setup lang="ts">
import { ref, computed } from 'vue'
import { useSegmenter } from '../../composables/useSegmenter'

const props = defineProps<{ text: string }>()
const emit = defineEmits<{ done: [text: string] }>()

const { state, loadText, splitSection, mergeSections } = useSegmenter()

// 加载文本
loadText(props.text)

/** 确认分节，将分节结果以 --- 分隔的文本回传 */
function confirmSegments() {
  const result = state.value.sections.map(s => s.text).join('\n\n---\n\n')
  emit('done', result)
}
</script>

<template>
  <div class="segmenter">
    <h2 class="section-title">✂️ 调整脚本分节</h2>
    <p class="section-desc">
      在段落间点击「分割」或「合并」来调整分节。每节将对应一个幻灯片段落。
    </p>

    <div class="sections-list">
      <div
        v-for="(section, idx) in state.sections"
        :key="section.id"
        class="section-block"
      >
        <div class="section-label">{{ section.label }}</div>
        <div class="section-preview">{{ section.text }}</div>

        <!-- 合并按钮（在非第一个节前显示） -->
        <button
          v-if="idx > 0"
          class="btn-merge"
          title="与上一节合并"
          @click="mergeSections(section.id)"
        >
          ↑ 合并到上一节
        </button>
      </div>
    </div>

    <div class="segmenter-actions">
      <button class="btn-primary" @click="confirmSegments">
        确认分节，进入对齐
      </button>
    </div>
  </div>
</template>

<style scoped>
.segmenter {
  padding: 32px;
  max-width: 800px;
  margin: 0 auto;
}

.section-title {
  margin: 0 0 4px;
  font-size: 20px;
  color: var(--text-primary);
}

.section-desc {
  margin: 0 0 24px;
  font-size: 14px;
  color: var(--text-secondary);
}

.sections-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.section-block {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 16px;
  position: relative;
}

.section-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--accent);
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.section-preview {
  font-size: 14px;
  line-height: 1.6;
  color: var(--text-primary);
  white-space: pre-wrap;
}

.btn-merge {
  margin-top: 8px;
  padding: 4px 12px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-input);
  color: var(--text-secondary);
  font-size: 12px;
  cursor: pointer;
}

.btn-merge:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.segmenter-actions {
  margin-top: 24px;
  text-align: center;
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
</style>
