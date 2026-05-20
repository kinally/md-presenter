# md-presenter 部署指南

> 纯前端 SPA，零后端依赖。放哪都能跑。

---

## 📦 第一步：推到 GitHub

在你**有网络的机器**上操作。

### 1.1 创建仓库

去 [github.com/new](https://github.com/new) 创建一个空仓库（不要勾选初始化 README）。

### 1.2 推送代码

```bash
# 如果这是你第一次从这台机器推代码，先配一下 git 身份
git config --global user.name "你的昵称"
git config --global user.email "你注册GitHub用的邮箱"

# 进入项目目录
cd md-presenter

# 初始化并推送
git init
git add -A
git commit -m "🎬 初始提交：md-presenter 项目骨架"
git branch -M main
git remote add origin https://github.com/你的用户名/你的仓库名.git
git push -u origin main
```

> 如果提示 `git` 命令找不到，先去 [git-scm.com](https://git-scm.com/) 装一个 Git。

---

## ☁️ 第二步：部署（三选一）

### 方案 A：Cloudflare Pages ✅ 推荐

1. 登录 [dash.cloudflare.com](https://dash.cloudflare.com) → **Workers & Pages**
2. 点 **创建** → **Pages** → **连接到 Git**
3. 授权 GitHub，选刚才推的仓库
4. 构建设置：

   | 字段 | 填什么 |
   |------|--------|
   | 框架预设 | **Vue**（会自动填好下面两项） |
   | 构建命令 | `npm install && npm run build` |
   | 构建输出目录 | `dist` |

5. 点 **保存并部署**，等一两分钟
6. 部署成功后你会得到一个 `xxxx.pages.dev` 的地址，直接打开就能用

**后续更新：** 每次往 main 分支 `git push`，CF 自动重新构建部署。

---

### 方案 B：GitHub Pages

1. 在仓库里建一个 Actions 工作流文件。

   在项目根目录创建 `.github/workflows/deploy.yml`：

   ```yaml
   name: Deploy to GitHub Pages

   on:
     push:
       branches: [main]

   permissions:
     contents: read
     pages: write
     id-token: write

   jobs:
     deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - uses: actions/setup-node@v4
           with:
             node-version: 20
         - run: npm ci
         - run: npm run build
         - uses: peaceiris/actions-gh-pages@v3
           with:
             github_token: ${{ secrets.GITHUB_TOKEN }}
             publish_dir: ./dist
   ```

2. 推上去：

   ```bash
   git add -A
   git commit -m "添加 GitHub Pages 部署工作流"
   git push
   ```

3. 去仓库 **Settings** → **Pages**，Source 选 **GitHub Actions**。

4. 等 Actions 跑完（绿勾），你的站点就在 `https://你的用户名.github.io/仓库名/` 了。

> ⚠️ GitHub Pages 路径特殊处理：因为站点在子路径（`/仓库名/`）下，项目已经默认在 `vite.config.ts` 里加了 `base: './'`，所以构建产物中的资源引用是相对路径，可以正常工作。

---

### 方案 C：Vercel / Netlify（简述）

| 平台 | 关键步骤 |
|------|----------|
| **Vercel** | `vercel.com` → Import Git Repo → Framework 选 **Vite** → Deploy |
| **Netlify** | `netlify.com` → Import from Git → Build command 填 `npm run build` → Publish directory 填 `dist` → Deploy |

两个平台都支持自动检测框架，基本一键完成。

---

## ⚙️ 第三步：部署后配置

打开部署好的站点，右上角点击 **⚙️ AI 设置**，填入你的 AI API 信息：

| 字段 | 示例 | 说明 |
|------|------|------|
| API Base URL | `https://api.openai.com/v1` | 任意兼容 OpenAI 格式的 API |
| API Key | `sk-xxxxxxxx` | 你的 API 密钥 |

点 **拉取模型列表** → 选一个模型 → **保存**。

朗读方式也可以在这里选：

| 方式 | 需要什么 | 特点 |
|------|----------|------|
| 浏览器内置语音 | 啥都不用 | 免费，离线可用，音质一般 |
| AI API 语音 | 上面填的 API 支持 TTS | 音质好，走你的 API 额度 |
| 本地模型 | 自己跑一个 TTS 服务端 | 适合有 N 卡的用户 |

---

## 🔧 常见问题

### 部署后页面白屏 / 404

- **Cloudflare Pages：** 不需要额外配置
- **GitHub Pages：** 确认 `vite.config.ts` 里 `base` 字段是 `'./'`（相对路径），项目里已经设好了
- 如果用了自定义域名，确保 DNS 解析正确

### AI API 连不上

- 检查 API Base URL 末尾不要漏 `/v1`（有些服务是 `/v1`，有些不是）
- 如果 API 有 IP 白名单，把 CF/GitHub Pages 的出口 IP 加进去
- 某些 API 需要设置请求头 `Authorization: Bearer sk-xxx`，工具会自动加

### TTS 没声音

- **浏览器内置语音：** 检查浏览器是否静音，或者 `speechSynthesis` 是否被浏览器策略限制（Chrome 需要用户先点击一下页面）
- **AI API 语音：** 确认你的 API 套餐包含 TTS 配额
- **本地模型：** 确认本地服务已启动，地址填写正确

### 我想改域名

- **Cloudflare Pages：** 可以在 CF Dashboard 绑定自定义域名
- **GitHub Pages：** 仓库 Settings → Pages → Custom domain，同时在仓库根目录放一个 `CNAME` 文件（内容写你的域名）

---

## 📄 LICENSE

MIT
