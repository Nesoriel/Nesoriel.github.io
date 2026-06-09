# Nesoriel 网站

Nesoriel 是一个基于 **Astro + TypeScript + Tailwind CSS + MDX** 构建的静态组织官网项目，用同一套代码同时生成两个正式站点：

- `https://nesoriel.com`：全球站，部署到 GitHub Pages
- `https://nesoriel.cn`：中国大陆站，部署到 EdgeOne Pages

这两个域名对应的是 **同一个 Nesoriel 官方网站**，必须共享相同的主内容、项目作品集、技术笔记与组织身份。`nesoriel.com` 的无前缀路径默认英文，`nesoriel.cn` 的无前缀路径默认简体中文；两个域名都同时生成 `/en/` 与 `/zh-cn/` 路径并支持语言切换。

---

## 1. 项目目标

本项目用于维护 Nesoriel 的官方静态网站，目标包括：

- 展示组织介绍、项目作品集、Notes 与 Nesoriel Pulse
- 通过 Astro Content Collections 管理结构化内容
- 通过脚本生成稳定的实验室活动数据
- 以纯静态方式输出页面、RSS、Sitemap 与搜索索引
- 静态生成英文与简体中文页面
- 在全球站与中国大陆站之间复用相同主内容
- 保持部署简单、构建稳定、长期可维护

本项目**不支持**以下模式：

- 不存在单独的“备案版内容站”
- 不存在单独的“技术笔记模式”
- 不允许仅在 `nesoriel.cn` 隐藏组织身份或移除项目作品集
- 不允许通过 IP、地区、User-Agent、URL 参数、localStorage 或隐藏开关做运行时内容切换

---

## 2. 技术栈

- **Astro**：静态站点生成
- **TypeScript**：类型安全与配置约束
- **Tailwind CSS**：样式系统
- **MDX**：内容编写
- **Astro Content Collections**：项目与笔记内容建模
- **pnpm**：依赖管理与脚本执行

设计原则：

- 静态优先
- 内容结构清晰
- JavaScript 最小化
- 双域名部署但单一主内容
- 易维护、易迁移、易审查

---

## 3. 目录与内容结构

典型内容结构如下：

```text
src/
  config/
    site.ts              # 站点统一配置入口
    pulse.ts             # Pulse 跟踪仓库配置（如项目已启用）
  data/
    pulse/               # Pulse 生成数据 JSON
  i18n/
    ui.ts                # 双语 UI 文案
  content/
    projects/            # 项目内容
    notes/               # Notes / 记录与决策内容
  views/                 # 复用的页面视图组件
scripts/
  collect-pulse.mjs      # 采集并生成 Pulse 数据
  pulse-repositories.mjs # Pulse 跟踪仓库清单
.github/
  workflows/
    collect-pulse.yml    # 定时/手动更新 Pulse 数据
```

推荐页面能力：

```text
/
/projects/
/projects/[slug]/
/notes/
/notes/[slug]/
/about/
/rss.xml
/sitemap-index.xml
/search.json
/en/
/en/projects/
/en/projects/[slug]/
/en/notes/
/en/notes/[slug]/
/en/about/
/en/search/
/en/rss.xml
/en/search.json
/zh-cn/
/zh-cn/projects/
/zh-cn/projects/[slug]/
/zh-cn/notes/
/zh-cn/notes/[slug]/
/zh-cn/about/
/zh-cn/search/
/zh-cn/rss.xml
/zh-cn/search.json
```

站点配置必须集中在：

```text
src/config/site.ts
```

不要在多个组件中散落读取 `process.env` 或 `import.meta.env`。

---

## 4. 本地开发

### 4.1 环境要求

- Node.js 22.12.0 或更高版本
- pnpm 10 或更高版本

### 4.2 安装依赖

```bash
pnpm install
```

### 4.3 启动开发环境

```bash
pnpm dev
```

默认会启动 Astro 本地开发服务器，用于预览页面、调试样式与检查内容路由。

### 4.4 常用命令

```bash
pnpm dev
pnpm build
pnpm build:github
pnpm build:edgeone
pnpm preview
pnpm check
pnpm lint
pnpm format
```

命令说明：

- `pnpm dev`：启动本地开发服务器
- `pnpm build`：执行默认静态构建
- `pnpm build:github`：按 GitHub Pages 目标构建并写入 `dist/CNAME`
- `pnpm build:edgeone`：按 EdgeOne Pages 目标构建
- `pnpm preview`：本地预览构建产物
- `pnpm check`：运行 Astro 类型与内容检查
- `pnpm lint`：运行代码规范检查
- `pnpm format`：格式化项目文件

---

## 5. 环境变量

本项目通过环境变量控制站点部署目标与合规信息，但**不用于切换主内容模式**。

推荐变量如下：

```env
SITE_URL=https://nesoriel.com
SITE_NAME=Nesoriel
SITE_DOMAIN=nesoriel.com
SITE_TARGET=global
ICP_RECORD=
PSB_RECORD=
```

### 5.1 全球站示例

```env
SITE_URL=https://nesoriel.com
SITE_NAME=Nesoriel
SITE_DOMAIN=nesoriel.com
SITE_TARGET=global
ICP_RECORD=
PSB_RECORD=
```

### 5.2 中国大陆站示例

```env
SITE_URL=https://nesoriel.cn
SITE_NAME=Nesoriel
SITE_DOMAIN=nesoriel.cn
SITE_TARGET=cn
ICP_RECORD=请替换为真实备案号
PSB_RECORD=请替换为真实公安备案号，可选
```

### 5.3 变量使用规则

- `SITE_URL`：用于 canonical、Open Graph、RSS、Sitemap 等绝对 URL 输出
- `SITE_NAME`：站点名称
- `SITE_DOMAIN`：域名标识与部署相关输出
- `SITE_TARGET`：**仅可用于元数据、部署输出、备案/合规信息展示，以及无前缀路径的默认语言**
- `ICP_RECORD`：ICP备案号，仅在需要展示时使用
- `PSB_RECORD`：公安备案号，可选

严格限制：

- 不要用 `SITE_TARGET` 控制项目列表、笔记列表或组织介绍内容
- 不要为 `cn` 目标创建单独内容源
- 不要让 `nesoriel.cn` 退化为“仅笔记站”
- 不要通过 IP、地区、User-Agent、localStorage 或隐藏开关切换语言或内容

---

## 6. 国际化

当前支持两种语言：

- `en`：英文
- `zh-cn`：简体中文

构建规则：

- `pnpm build:github` 使用 `SITE_TARGET=global`，无前缀路径默认英文
- `pnpm build:edgeone` 使用 `SITE_TARGET=cn`，无前缀路径默认简体中文
- 两个构建都会生成 `/en/` 与 `/zh-cn/` 的完整页面、RSS 和搜索索引
- 语言切换使用显式链接，不依赖运行时地域判断

内容规则：

- 同一个项目或笔记的双语条目应共享 `translationKey` 与 `slug`
- 不同语言可以有各自的标题、摘要、正文与分类文案
- 隐藏项目和草稿笔记规则对所有语言一致
- 不允许只在某一个部署目标移除某种语言或某类主内容

---

## 7. 内容管理

本项目通过 Astro Content Collections 和生成数据管理三类核心内容：

- Projects：项目作品集
- Notes：记录（Records）与决策（Decisions）
- Pulse：自动生成的实验室活动数据

这三类内容都应在两个域名站点中保持一致的主展示逻辑，只有草稿、隐藏项与合规信息可以按规则处理。

### 7.1 项目内容要求

推荐字段：

```ts
locale: "en" | "zh-cn"
translationKey: string
title: string
slug: string
description: string
longDescription?: string
status: "idea" | "active" | "paused" | "archived"
featured: boolean
tags: string[]
techStack: string[]
repoUrl?: string
demoUrl?: string
docsUrl?: string
cover?: string
startedAt?: Date
updatedAt?: Date
visibility: "public" | "hidden"
```

规则：

- `visibility: hidden` 的项目不应出现在公开列表和搜索索引中
- `featured: true` 的项目应在适当位置优先展示
- 项目详情页应展示状态、标签、技术栈与相关链接
- 双语项目条目应共享 `translationKey` 与 `slug`

### 7.2 Notes 内容要求

推荐字段：

```ts
locale: "en" | "zh-cn"
translationKey: string
title: string
slug: string
description: string
publishedAt: Date
updatedAt?: Date
tags: string[]
category: string
draft: boolean
featured: boolean
```

规则：

- `draft: true` 的笔记不应出现在生产构建结果中
- 笔记应支持目录、代码高亮、阅读时长与 RSS 输出
- 笔记列表与详情页都应参与静态生成
- 双语笔记条目应共享 `translationKey` 与 `slug`

定位说明：

- Notes 是手工维护的正式内容，定位为 Records / Decisions
- Notes 用于沉淀技术说明、方案取舍、部署记录与架构决策
- Notes 不是 Pulse 的替代物，也不应承担自动活动流的职责

### 7.3 Nesoriel Pulse

Pulse 是自动生成的实验室活动数据，不是手写博客、手写笔记，也不是单独的内容模式。

数据来源与生成方式：

- 数据源目录：`src/data/pulse/*.json`
- 生成脚本：`scripts/collect-pulse.mjs`
- 跟踪仓库清单：`scripts/pulse-repositories.mjs`
- 如项目启用了额外的 Pulse 站点配置，可在 `src/config/pulse.ts` 维护

维护规则：

- `src/data/pulse/*.json` 属于生成产物，应保持稳定、可审查、适合提交到仓库
- 生成数据不得包含敏感信息、访问令牌、私有凭据或不应公开的仓库细节
- Pulse 面向公开的实验室活动摘要，不替代 Projects、Notes 或组织介绍
- 如果某个时间窗口内没有活动，应生成明确的 no-activity summary，而不是制造伪造内容
- Pulse 在两个域名上的主内容必须保持一致，不能借此引入单独的中国站内容模式

### 7.4 如何新增或调整 Pulse 跟踪仓库

1. 修改 `scripts/pulse-repositories.mjs`，加入或移除需要跟踪的仓库
2. 如果当前实现还要求站点侧配置同步更新，则同时检查 `src/config/pulse.ts`
3. 确认新增仓库适合公开展示，且不会让生成结果暴露敏感信息
4. 运行 Pulse 采集脚本，更新 `src/data/pulse/*.json`
5. 审查生成 JSON，确保内容稳定、无敏感信息、无异常噪音

Pulse 的目标是反映自动采集到的 lab activity，不是补写文章，也不是把提交记录包装成手工博客。

---

## 8. 如何新增项目

1. 在 `src/content/projects/` 下新增一个项目内容文件
2. 为英文和简体中文各新增一条内容，或补齐缺失语言
3. 按项目集合 schema 填写 frontmatter
4. 确保同一项目的双语条目共享 `translationKey` 与 `slug`
5. 补充描述、标签、技术栈与相关链接
6. 如需在首页或列表中突出展示，设置 `featured: true`
7. 若暂不公开，使用 `visibility: hidden`
8. 运行检查命令验证内容无误

建议流程：

```bash
pnpm check
pnpm build
```

项目内容编写要求：

- 标题和描述保持真实、克制、技术导向
- 不使用营销化夸张措辞
- 技术栈与链接尽量完整
- 若项目已暂停或归档，应明确状态

---

## 9. 如何新增 Notes

1. 在 `src/content/notes/` 下新增笔记内容文件
2. 为英文和简体中文各新增一条内容，或补齐缺失语言
3. 填写 frontmatter，包括 `locale`、`translationKey`、标题、摘要、发布日期、标签与分类
4. 确保同一笔记的双语条目共享 `translationKey` 与 `slug`
5. 编写正文内容，必要时加入目录层级和代码示例
6. 若内容尚未准备完成，设置 `draft: true`
7. 完成后切换为正式发布状态
8. 运行检查与构建确认页面、RSS 与搜索索引正常生成

建议流程：

```bash
pnpm check
pnpm build
```

Notes 写作建议：

- 以技术说明和工程经验为主
- 摘要应准确说明主题与价值
- 标题避免空泛
- 标签与分类应稳定、可复用
- 优先承载记录与决策，而不是实时活动流水

---

## 10. Nesoriel Pulse 数据维护

Pulse 的更新应通过自动化流程完成，而不是手工逐条编辑。

### 10.1 数据与脚本

- 生成结果：`src/data/pulse/*.json`
- 采集脚本：`scripts/collect-pulse.mjs`
- 仓库清单：`scripts/pulse-repositories.mjs`
- 可选配置：`src/config/pulse.ts`

### 10.2 GitHub Actions 工作流

工作流文件：

```text
.github/workflows/collect-pulse.yml
```

要求：

- 支持定时触发：`schedule`
- 支持手动触发：`workflow_dispatch`
- 使用 `GITHUB_TOKEN` 访问 GitHub API 或仓库上下文
- 需要 `contents: write` 权限，以便提交更新后的 Pulse 生成数据

权限示例：

```yaml
permissions:
  contents: write
```

### 10.3 数据安全与稳定性

- 仅生成适合公开提交的稳定摘要数据
- 不写入 secrets、token、邮件地址、私有 issue 内容或其他敏感字段
- 生成格式应尽量稳定，减少无意义抖动，便于审查与版本管理
- 当没有可汇总活动时，应输出 no-activity summary

---

## 11. 搜索、RSS 与 Sitemap

本项目应保持纯静态输出，并生成：

- `search.json`
- `rss.xml`
- `sitemap-index.xml`

要求：

- 搜索索引应包含当前语言的项目与笔记
- 隐藏项目不得进入索引
- 草稿笔记不得进入索引
- RSS 与 Sitemap 中使用的 URL 必须基于 `SITE_URL`
- `/rss.xml` 与 `/search.json` 输出当前构建默认语言
- `/en/rss.xml`、`/zh-cn/rss.xml`、`/en/search.json`、`/zh-cn/search.json` 输出显式语言内容

---

## 12. GitHub Pages 部署与 CNB 同步

全球站部署目标：`https://nesoriel.com`

### 11.1 预期工作流

工作流文件：

```text
.github/workflows/deploy.yml
```

要求：

- 触发分支：`main`
- 支持手动触发：`workflow_dispatch`
- 使用 `pnpm`
- 构建命令：`pnpm build:github`
- 部署目录：`dist`
- GitHub Pages 构建成功后，将 `main` 分支同步推送到 CNB 仓库

推荐权限配置：

```yaml
permissions:
  contents: read
  pages: write
  id-token: write
```

### 11.2 GitHub 构建命令

```bash
pnpm build:github
```

该命令应完成：

- 以全球站变量执行 Astro 构建
- 无前缀路径默认英文
- 生成静态产物到 `dist`
- 写入 `dist/CNAME`

`dist/CNAME` 内容应为：

```text
nesoriel.com
```

### 11.3 同步到 CNB 仓库

GitHub 仓库是主仓库。`.github/workflows/deploy.yml` 在 `main` 分支 push 后会先完成 GitHub Pages 构建，然后把当前提交同步到 CNB 仓库。GitHub Pages 部署任务与 CNB 同步任务都依赖同一次构建结果：

```text
https://cnb.cool/Nesoriel/nesoriel.cn
```

同步要求在 GitHub 仓库配置 Actions Secret：

```text
CNB_TOKEN=<用于推送 CNB 仓库的 Token>
```

工作流会使用以下 Git 身份推送：

```text
Git Username: cnb
Git Email: cnb@users.noreply.github.com
```

注意：

- 不要把 CNB Token 写入仓库文件
- 同步任务只在 `push` 到 `main` 时执行，手动 `workflow_dispatch` 只用于 GitHub Pages 部署
- CNB 仓库接收到推送后，由 `.cnb.yml` 接管中国大陆站部署

---

## 13. EdgeOne Pages / CNB 部署

中国大陆站部署目标：`https://nesoriel.cn`

### 12.1 CNB 自动部署流程

CNB 仓库接收到 GitHub Actions 同步推送后，会通过 `.cnb.yml` 自动执行：

1. 导入 CNB 密钥仓库文件
2. 安装依赖
3. 执行 `pnpm build:edgeone`
4. 使用 EdgeOne CLI 将 `dist` 直接部署到 EdgeOne Pages production 环境

当前密钥导入文件：

```text
https://cnb.cool/Nesoriel/secret-prod/-/blob/main/cloud-providers/tencent-cloud.yml
```

该密钥文件需要提供环境变量：

```env
EDGEONE_PAGES_API_TOKEN=请在 CNB 密钥仓库中配置
```

`.cnb.yml` 默认使用的 EdgeOne Pages 项目名为：

```text
nesoriel-cn
```

如 EdgeOne Pages 控制台中的项目名不同，请修改 `.cnb.yml` 中的 `EDGEONE_PAGES_PROJECT_NAME`。

EdgeOne Pages 项目应为可通过 CLI 直接上传产物的项目。部署命令等价于：

```bash
npx edgeone pages deploy ./dist -n "$EDGEONE_PAGES_PROJECT_NAME" -e production -t "$EDGEONE_PAGES_API_TOKEN"
```

### 12.2 EdgeOne Pages 构建设置

如果不使用 CNB 自动部署，而是在 EdgeOne Pages 控制台中配置构建，可使用以下设置：

```text
Install command: pnpm install --frozen-lockfile
Build command: pnpm build:edgeone
Output directory: dist
```

### 12.3 EdgeOne 环境变量

建议设置：

```env
SITE_URL=https://nesoriel.cn
SITE_NAME=Nesoriel
SITE_DOMAIN=nesoriel.cn
SITE_TARGET=cn
ICP_RECORD=请替换为真实备案号
PSB_RECORD=请替换为真实公安备案号，可选
```

### 12.4 合规说明

中国大陆站允许的差异仅包括：

- canonical / sitemap / Open Graph 的 URL 指向 `nesoriel.cn`
- 无前缀路径默认简体中文
- 页脚展示 ICP / PSB 信息
- 部署平台相关输出差异

不允许的差异包括：

- 将站点改造成“Nesoriel 的技术笔记”
- 删除项目作品集
- 隐藏组织身份
- 根据访问来源进行运行时内容切换

---

## 14. ICP / PSB 备案配置

备案信息仅用于合规展示，不应改变站点主体内容。

### 13.1 ICP 备案号

通过环境变量配置：

```env
ICP_RECORD=请替换为真实备案号
```

### 13.2 公安备案号

通过环境变量配置：

```env
PSB_RECORD=请替换为真实公安备案号，可选
```

### 13.3 配置原则

- 备案号展示应集中在站点配置与页脚等合规位置
- 不应由备案信息触发页面结构级的内容分叉
- 若未提供备案号，相关展示可为空，但主内容仍保持一致

---

## 15. 维护规则

维护本项目时，请遵守以下规则：

### 14.1 内容一致性

- `nesoriel.com` 与 `nesoriel.cn` 必须共享相同主内容
- 两个域名都必须保留英文与简体中文路径
- 不为不同域名单独维护两套项目、Notes 或 Pulse 内容
- 若未来确需内容差异，必须显式记录原因与规则

### 14.2 配置集中化

- 站点级配置集中在 `src/config/site.ts`
- 不要在组件中散落环境变量读取
- 不要在多个文件硬编码 `nesoriel.com` 或 `nesoriel.cn`

### 14.3 静态优先

- 不引入数据库、后台服务或动态渲染依赖
- 不引入第三方搜索后端
- 搜索、RSS、Sitemap 均应在构建时生成
- Pulse 数据应通过脚本预生成并提交稳定 JSON，而不是依赖线上动态接口

### 14.4 内容质量

- 项目、Notes 与 Pulse 内容保持真实、可维护、可替换
- 避免 filler text、lorem ipsum 与空泛宣传文案
- 保持技术说明风格稳定、清晰、克制
- Notes 承担记录与决策，Pulse 承担自动实验室活动摘要

### 14.5 变更验证

修改内容、配置或部署脚本后，至少建议运行：

```bash
pnpm check
pnpm build:github
pnpm build:edgeone
```

确保：

- 构建成功
- 静态产物输出正常
- 两个站点共享相同主内容
- `SITE_TARGET` 仅影响元数据、部署和合规信息

---

## 16. 维护者检查清单

提交前建议确认：

- `pnpm install` 可正常执行
- `pnpm dev` 可正常启动
- `pnpm build:github` 成功
- `pnpm build:edgeone` 成功
- `dist` 为静态产物
- GitHub Pages 工作流存在且配置正确
- Pulse 采集工作流存在且配置正确
- EdgeOne Pages 设置文档保持准确
- 项目集合、Notes 与 Pulse 数据工作正常
- `/`、`/en/`、`/zh-cn/` 的默认语言与显式语言符合预期
- 搜索、RSS、Sitemap 正常生成
- 未引入任何单独的备案内容模式

---

## 17. 结语

Nesoriel 网站的核心不是做两个不同定位的站点，而是以一套稳定、清晰、静态优先的工程体系，为两个正式域名提供一致的官方内容输出。

维护本仓库时，请始终优先保证：

- 主内容一致
- 配置清晰
- 构建可复现
- 部署简单
- 合规差异最小化且显式化
