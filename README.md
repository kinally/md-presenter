# md-presenter

> 把你的文稿变成自动朗读的 PPT 风格 HTML 演示页——全程在浏览器里完成，AI 能力你自己带。

## 这是什么

一个纯前端的 Web 工具，帮你把两样东西对齐成一场自动播放的演示：

| 你准备 | 用途 |
|--------|------|
| 📄 **脚本**（纯文本） | TTS 朗读的完整叙述内容 |
| 🎨 **Markdown**（视觉内容） | 画面上显示的 PPT 风格幻灯片 |

你用可视化编辑器把两者对齐，系统自动生成全屏 HTML 演示页，**一边显示幻灯片，一边朗读对应的脚本，读完自动翻页**。

---

## 工作流程

```
① 导入脚本 → ② 点选分节 → ③ 导入 Markdown → ④ 对齐编辑 → ⑤ 自动播放
                                                          ↓
                                                    (也可导出视频)
```

全程图形界面操作，不需要写代码。

---

## AI 集成说明

本工具**不自带 AI**，但允许你接入自己的 AI API。

### 为什么是「自带 AI」

- 省去后端部署和维护成本
- 你的数据不经过第三方服务器
- 想用什么模型你自己决定

### 支持的能力

| 能力 | 说明 |
|------|------|
| 🧩 文本→Markdown | 将纯文本稿子自动转为带标题结构的 Markdown |
| ✂️ 智能分节 | AI 辅助识别脚本中的语义段落，自动插入分节标记 |
| 🎨 Markdown→幻灯片 | 根据 Markdown 内容自动生成精简的 PPT 风幻灯片内容 |
| 🌐 翻译/润色 | 可选的辅助功能 |

### 配置方式

在页面设置中填入：
- **API Base URL**（如 `https://api.openai.com/v1` 或任意兼容的 API）
- **API Key**
- 系统自动拉取可用模型列表，你从中选择要用的

所有 AI 请求直接由浏览器发到你配置的地址，工具本身不中转数据。

---

## 本地运行

```bash
# 克隆
git clone <repo-url>
cd md-presenter

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

构建产物在 `dist/` 目录，可直接部署到任何静态托管服务（GitHub Pages、Vercel、Netlify 等）。

---

## 技术栈

| 层面 | 选型 |
|------|------|
| 框架 | Vue 3 (Composition API) |
| 构建 | Vite |
| Markdown 解析 | marked |
| 代码高亮 | highlight.js |
| TTS | Web Speech API（默认；预留 SAPI / Siri 接口） |
| 部署 | 纯静态，任意静态托管 |

---

## 项目结构

```
md-presenter/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── README.md
├── ARCHITECTURE.md          ← 详细架构文档
│
├── src/
│   ├── main.ts
│   ├── App.vue
│   │
│   ├── types/               ← 类型定义
│   ├── parser/              ← Markdown 解析
│   ├── services/            ← TTS 服务
│   ├── composables/         ← 状态管理
│   ├── components/          ← 组件
│   │   ├── workspace/       ← 工作区（导入→分节→对齐）
│   │   ├── player/          ← 播放器
│   │   └── common/          ← 通用组件
│   └── styles/              ← 主题样式
│
└── public/
```

---

## 开发状态

当前处于规划阶段。见 [ARCHITECTURE.md](./ARCHITECTURE.md) 了解完整设计。

**MVP 范围：**
- [x] 架构设计完成
- [ ] 脚本导入 + 点选分节
- [ ] Markdown 导入 + 解析
- [ ] 双列对齐编辑器
- [ ] 幻灯片渲染 + 自动滚播
- [ ] 主题切换
- [ ] AI API 配置面板

---

## License

MIT
