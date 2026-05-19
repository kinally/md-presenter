<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  scriptImported: [text: string]
  markdownImported: [text: string]
}>()

const scriptInput = ref('')
const mdInput = ref('')
const scriptDragOver = ref(false)
const mdDragOver = ref(false)

function importScript() {
  if (scriptInput.value.trim()) {
    emit('scriptImported', scriptInput.value.trim())
  }
}

function importMarkdown() {
  if (mdInput.value.trim()) {
    emit('markdownImported', mdInput.value.trim())
  }
}

function handleScriptPaste(e: ClipboardEvent) {
  const text = e.clipboardData?.getData('text') || ''
  if (text) {
    scriptInput.value = text
  }
}

function handleMDPaste(e: ClipboardEvent) {
  const text = e.clipboardData?.getData('text') || ''
  if (text) {
    mdInput.value = text
  }
}
</script>

<template>
  <div class="import-panel">
    <div class="import-columns">
      <!-- 脚本导入 -->
      <div
        :class="['import-card', { 'drag-over': scriptDragOver }]"
        @dragover.prevent="scriptDragOver = true"
        @dragleave="scriptDragOver = false"
        @drop.prevent="scriptDragOver = false; const f = $event.dataTransfer?.files[0]; if(f) f.text().then(emit('scriptImported', $event))"
      >
        <h2 class="card-title">📄 导入脚本</h2>
        <p class="card-desc">粘贴你的文稿内容（TTS 朗读用）</p>
        <textarea
          v-model="scriptInput"
          class="import-textarea"
          placeholder="在此粘贴脚本内容……"
          rows="12"
          @paste="handleScriptPaste"
        ></textarea>
        <button
          class="btn-primary"
          :disabled="!scriptInput.trim()"
          @click="importScript"
        >
          确认导入脚本
        </button>
      </div>

      <!-- Markdown 导入 -->
      <div
        :class="['import-card', { 'drag-over': mdDragOver }]"
        @dragover.prevent="mdDragOver = true"
        @dragleave="mdDragOver = false"
      >
        <h2 class="card-title">🎨 导入 Markdown</h2>
        <p class="card-desc">粘贴你的幻灯片视觉内容</p>
        <textarea
          v-model="mdInput"
          class="import-textarea"
          placeholder="在此粘贴 Markdown 内容……"
          rows="12"
          @paste="handleMDPaste"
        ></textarea>
        <button
          class="btn-primary"
          :disabled="!mdInput.trim()"
          @click="importMarkdown"
        >
          确认导入 Markdown
        </button>
      </div>
    </div>

    <p class="import-hint">
      也可以直接 <strong>拖拽 .txt / .md 文件</strong> 到对应区域
    </p>
  </div>
</template>

<style scoped>
.import-panel {
  padding: 32px;
  max-width: 1200px;
  margin: 0 auto;
}

.import-columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.import-card {
  background: var(--bg-card);
  border: 2px dashed var(--border-color);
  border-radius: 12px;
  padding: 24px;
  transition: border-color 0.2s, background 0.2s;
}

.import-card.drag-over {
  border-color: var(--accent);
  background: var(--bg-hover);
}

.card-title {
  font-size: 18px;
  margin: 0 0 4px;
  color: var(--text-primary);
}

.card-desc {
  font-size: 13px;
  color: var(--text-secondary);
  margin: 0 0 16px;
}

.import-textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-input);
  color: var(--text-primary);
  font-size: 14px;
  line-height: 1.6;
  resize: vertical;
  font-family: inherit;
  box-sizing: border-box;
}

.import-textarea:focus {
  outline: none;
  border-color: var(--accent);
}

.btn-primary {
  margin-top: 12px;
  padding: 10px 24px;
  border: none;
  border-radius: 8px;
  background: var(--accent);
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn-primary:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btn-primary:not(:disabled):hover {
  opacity: 0.9;
}

.import-hint {
  text-align: center;
  margin-top: 24px;
  font-size: 13px;
  color: var(--text-secondary);
}
</style>
