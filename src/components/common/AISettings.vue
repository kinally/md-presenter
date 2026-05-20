<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { aiService } from '../../services/aiService'

const showPanel = ref(false)

const baseUrl = ref('')
const apiKey = ref('')
const modelId = ref('')
const availableModels = ref<{ id: string; name?: string }[]>([])
const ttsProvider = ref<'system' | 'api' | 'local'>('system')
const localEndpoint = ref('http://localhost:9880')
const localSpeakerId = ref('default')

onMounted(() => {
  const cfg = aiService.getConfig()
  if (cfg) {
    baseUrl.value = cfg.baseUrl
    apiKey.value = cfg.apiKey
    modelId.value = cfg.modelId
  }
})

async function fetchModels() {
  aiService.setConfig({
    baseUrl: baseUrl.value,
    apiKey: apiKey.value,
    modelId: modelId.value || '',
    enabled: true,
  })
  availableModels.value = await aiService.fetchModels()
}

function saveConfig() {
  aiService.setConfig({
    baseUrl: baseUrl.value,
    apiKey: apiKey.value,
    modelId: modelId.value,
    enabled: true,
  })

  // 保存 TTS 配置
  localStorage.setItem('md-presenter-tts-config', JSON.stringify({
    providerType: ttsProvider.value,
    localEndpoint: localEndpoint.value,
    localSpeakerId: localSpeakerId.value,
    speed: 1.0,
  }))

  showPanel.value = false
}
</script>

<template>
  <div class="ai-settings">
    <button class="settings-btn" @click="showPanel = !showPanel">
      ⚙️ AI 设置
    </button>

    <div v-if="showPanel" class="settings-panel">
      <h3>AI 配置</h3>

      <label class="field">
        <span>API Base URL</span>
        <input v-model="baseUrl" placeholder="https://api.openai.com/v1" />
      </label>

      <label class="field">
        <span>API Key</span>
        <input v-model="apiKey" type="password" placeholder="sk-..." />
      </label>

      <button class="btn-small" @click="fetchModels">拉取模型列表</button>

      <label class="field" v-if="availableModels.length > 0">
        <span>选择模型</span>
        <select v-model="modelId">
          <option value="">-- 请选择 --</option>
          <option
            v-for="m in availableModels"
            :key="m.id"
            :value="m.id"
          >
            {{ m.name || m.id }}
          </option>
        </select>
      </label>

      <h3 style="margin-top: 16px">朗读设置</h3>

      <label class="field">
        <span>TTS 方式</span>
        <select v-model="ttsProvider">
          <option value="system">浏览器内置语音</option>
          <option value="api">AI API 语音</option>
          <option value="local">本地模型 (N 卡)</option>
        </select>
      </label>

      <label class="field" v-if="ttsProvider === 'local'">
        <span>本地服务地址</span>
        <input v-model="localEndpoint" placeholder="http://localhost:9880" />
      </label>

      <label class="field" v-if="ttsProvider === 'local'">
        <span>说话人 ID</span>
        <input v-model="localSpeakerId" placeholder="default" />
      </label>

      <div class="panel-actions">
        <button class="btn-primary" @click="saveConfig">保存</button>
        <button class="btn-cancel" @click="showPanel = false">取消</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ai-settings {
  position: relative;
}

.settings-btn {
  padding: 4px 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-input);
  color: var(--text-primary);
  font-size: 13px;
  cursor: pointer;
}

.settings-panel {
  position: absolute;
  top: 100%;
  right: 0;
  width: 340px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 20px;
  margin-top: 8px;
  z-index: 100;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.settings-panel h3 {
  margin: 0 0 12px;
  font-size: 15px;
  color: var(--text-primary);
}

.field {
  display: block;
  margin-bottom: 12px;
}

.field span {
  display: block;
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 4px;
}

.field input,
.field select {
  width: 100%;
  padding: 8px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-input);
  color: var(--text-primary);
  font-size: 13px;
  box-sizing: border-box;
}

.btn-small {
  padding: 4px 12px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-input);
  color: var(--text-primary);
  font-size: 12px;
  cursor: pointer;
  margin-bottom: 12px;
}

.panel-actions {
  display: flex;
  gap: 8px;
  margin-top: 16px;
}

.btn-primary {
  flex: 1;
  padding: 8px;
  border: none;
  border-radius: 6px;
  background: var(--accent);
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.btn-cancel {
  flex: 1;
  padding: 8px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: transparent;
  color: var(--text-secondary);
  font-size: 13px;
  cursor: pointer;
}
</style>
