<script setup lang="ts">
import { computed } from 'vue'
import type { SlideNode } from '../../types/slide'
import CodeBlock from './CodeBlock.vue'
import TableBlock from './TableBlock.vue'

const props = defineProps<{
  slide: SlideNode
  slideIndex: number
  pairIndex: number
}>()

/** 渲染主体内容 */
const renderedContent = computed(() => {
  const s = props.slide
  switch (s.type) {
    case 'code':
      // CodeBlock 组件自行渲染
      return ''
    case 'table':
      // TableBlock 组件自行渲染
      return ''
    case 'list':
      return s.content
    default:
      // 普通段落，将 Markdown 风格的加粗/斜体转为 HTML
      return s.content
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/`(.+?)`/g, '<code>$1</code>')
        .replace(/\n/g, '<br>')
  }
})
</script>

<template>
  <div class="slide-page">
    <CodeBlock v-if="slide.type === 'code'" :code="slide.content" />
    <TableBlock v-else-if="slide.type === 'table'" :html="slide.content" />
    <div
      v-else
      class="slide-content"
      v-html="renderedContent"
    ></div>
  </div>
</template>

<style scoped>
.slide-page {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 64px;
  box-sizing: border-box;
  animation: fadeIn 0.4s ease-out;
}

.slide-content {
  font-size: 2rem;
  line-height: 1.6;
  color: #fff;
  text-align: center;
  max-width: 80%;
}

.slide-content :deep(strong) {
  color: var(--accent, #818cf8);
}

.slide-content :deep(code) {
  background: rgba(255, 255, 255, 0.1);
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.85em;
}

.slide-content :deep(ul),
.slide-content :deep(ol) {
  text-align: left;
  display: inline-block;
}

.slide-content :deep(li) {
  margin: 8px 0;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
