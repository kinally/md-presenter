<script setup lang="ts">
import { ref } from 'vue'
import ImportPanel from './components/workspace/ImportPanel.vue'
import ScriptSegmenter from './components/workspace/ScriptSegmenter.vue'
import AlignmentEditor from './components/workspace/AlignmentEditor.vue'
import SlidePlayer from './components/player/SlidePlayer.vue'
import AISettings from './components/common/AISettings.vue'
import ThemeSwitcher from './components/common/ThemeSwitcher.vue'
import type { AlignedPair } from './types/alignment'

type WorkflowStep = 'import' | 'segment' | 'align' | 'play'

const step = ref<WorkflowStep>('import')
const stepLabels: Record<WorkflowStep, string> = {
  import: '导入',
  segment: '分节',
  align: '对齐',
  play: '播放',
}

const scriptText = ref('')
const markdownText = ref('')
const alignedPairs = ref<AlignedPair[]>([])

function onScriptImported(text: string) {
  scriptText.value = text
  step.value = 'segment'
}

function onSegmentDone(text: string) {
  scriptText.value = text
  step.value = 'align'
}

function onMarkdownImported(text: string) {
  markdownText.value = text
}

function onAlignDone(pairs: AlignedPair[]) {
  alignedPairs.value = pairs
  step.value = 'play'
}

function onBackToAlign() {
  step.value = 'align'
}
</script>

<template>
  <div class="app">
    <header class="app-header">
      <h1 class="app-title">md-presenter</h1>
      <div class="app-actions">
        <ThemeSwitcher />
        <AISettings />
      </div>
    </header>

    <!-- 步骤导航 -->
    <nav class="step-nav">
      <button
        v-for="(label, key) in stepLabels"
        :key="key"
        :class="['step-btn', { active: step === key, done: step !== 'import' && ['import', 'segment', 'align'].indexOf(key as WorkflowStep) < ['import', 'segment', 'align', 'play'].indexOf(step) }]"
        @click="step = key as WorkflowStep"
      >
        {{ label }}
      </button>
    </nav>

    <main class="app-main">
      <ImportPanel
        v-if="step === 'import'"
        @script-imported="onScriptImported"
        @markdown-imported="onMarkdownImported"
      />
      <ScriptSegmenter
        v-else-if="step === 'segment'"
        :text="scriptText"
        @done="onSegmentDone"
      />
      <AlignmentEditor
        v-else-if="step === 'align'"
        :script-text="scriptText"
        :markdown-text="markdownText"
        @done="onAlignDone"
      />
      <SlidePlayer
        v-else-if="step === 'play'"
        :pairs="alignedPairs"
        @back="onBackToAlign"
      />
    </main>
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 24px;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-header);
}

.app-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.app-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.step-nav {
  display: flex;
  gap: 0;
  padding: 0 24px;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-nav);
}

.step-btn {
  padding: 10px 20px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 14px;
  color: var(--text-secondary);
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
}

.step-btn:hover {
  color: var(--text-primary);
  background: var(--bg-hover);
}

.step-btn.active {
  color: var(--accent);
  border-bottom-color: var(--accent);
  font-weight: 600;
}

.step-btn.done {
  color: var(--text-primary);
}

.app-main {
  flex: 1;
  overflow: auto;
}
</style>
