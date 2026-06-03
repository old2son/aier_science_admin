# Aier Admin — 后台管理系统

> 爱尔科技后台管理平台，基于 Vue 3 + TypeScript + Element Plus 构建的单页应用（SPA）。

---

## 技术栈

| 类别 | 技术 / 版本 |
|------|------------|
| 前端框架 | Vue 3.5（Composition API + `<script setup>`） |
| 构建工具 | **Vite 8**（基于 Rolldown 统一打包引擎） |
| 开发语言 | TypeScript 5.6（严格模式） |
| 路由 | Vue Router 4（Web History 模式） |
| 状态管理 | Pinia 2（Composition API 风格） |
| UI 组件库 | Element Plus 2.9 + @element-plus/icons-vue |
| CSS 框架 | Tailwind CSS 3.4 + PostCSS + autoprefixer |
| HTTP 请求 | Axios 1.7（封装请求/响应拦截） |
| 代码检查 | vue-tsc 严格类型检查 |

---

## 快速开始

### 环境要求

- **Node.js ≥ 20.19**（或 ≥ 22.12），Vite 8 要求原生支持 `require(esm)` 的版本
- npm / pnpm / yarn

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

开发服务器默认运行在 `http://localhost:5173`，同时监听 `0.0.0.0`，可通过局域网 IP 访问。

### 构建生产包

```bash
npm run build
```

构建前会自动执行 TypeScript 类型检查（`vue-tsc -b`），通过后再调用 `vite build`。

### 预览生产包

```bash
npm run preview
```

### 仅做类型检查

```bash
npm run typecheck
```

---

## 目录结构

```
aier-science-admin/
├── index.html                  # HTML 入口，挂载点 #app，标题 Aier Admin
├── vite.config.ts              # Vite 8 配置（@ 别名、Dev Server，Rolldown 引擎）
├── tailwind.config.js          # Tailwind 主题配置（brand 品牌色）
├── postcss.config.js           # PostCSS 配置
├── tsconfig.json               # TypeScript 项目引用入口
├── tsconfig.app.json           # 应用侧 TS 配置（strict, ES2020, paths）
├── package.json
└── src/
    ├── main.ts                 # 应用入口：注册 Pinia / Router / ElementPlus
    ├── App.vue                 # 根组件（仅 <RouterView />）
    ├── vite-env.d.ts           # Vite 环境变量类型声明
    ├── styles/
    │   └── index.css           # 全局样式（Tailwind 三层 + 公共工具类）
    ├── router/
    │   ├── index.ts            # 路由表 + 全局导航守卫
    │   └── types.d.ts          # RouteMeta 类型扩展
    ├── stores/
    │   ├── index.ts            # Pinia 实例创建与注册
    │   └── modules/
    │       └── user.ts         # 用户 Store（token、userInfo、login/logout）
    ├── utils/
    │   └── request.ts          # Axios 封装（Bearer Token、统一错误提示）
    ├── layouts/
    │   └── AdminLayout.vue     # 管理后台主布局（侧边栏 + Header + RouterView）
    └── views/
        ├── login/
        │   └── index.vue       # 登录页
        ├── session-config/
        │   └── index.vue       # 科普馆场次配置（默认首页）
        ├── users/
        │   └── index.vue       # 用户管理
        └── settings/
            └── index.vue       # 系统设置
```

---

## 路由设计

| 路径 | 名称 | 说明 | 是否需要登录 |
|------|------|------|:-----------:|
| `/login` | Login | 登录页 | ✗ |
| `/session-config` | SessionConfig | 科普馆场次配置 | ✔ |
| `/users` | Users | 用户管理 | ✔ |
| `/settings` | Settings | 系统设置 | ✔ |
| `/*` | — | 未匹配路由，重定向至 `/session-config` | — |

**路由鉴权逻辑**：全局 `beforeEach` 守卫检查 `meta.public`。未标记 `public` 的路由要求用户已登录（`userStore.isLoggedIn`），否则重定向至 `/login?redirect=<原路径>`，登录成功后自动跳回原页面。

---

## 布局说明

项目采用经典三段式管理后台布局：

```
┌──────────────────────────────────────────────────────────┐
│  Header（当前页面标题 + 用户头像 / 退出登录）              │
├──────────────┬───────────────────────────────────────────┤
│              │                                           │
│  Sidebar     │   主内容区 <RouterView />                  │
│  （可折叠）   │                                           │
│  - 科普馆场次配置  │                                           │
│  - 用户管理  │                                           │
│  - 系统设置  │                                           │
│              │                                           │
└──────────────┴───────────────────────────────────────────┘
```

- 侧边栏支持折叠/展开，菜单从路由表动态生成，无需手动维护
- Header 右上角用户下拉菜单包含退出登录操作

---

## 状态管理

使用 **Pinia**（Composition API 风格）管理全局状态，当前包含以下 Store：

### `useUserStore`

| 属性 / 方法 | 类型 | 说明 |
|------------|------|------|
| `token` | `Ref<string>` | 登录 Token，持久化至 `localStorage`（key: `aier_admin_token`） |
| `userInfo` | `Ref<UserInfo>` | 用户信息（id、name、role、avatar） |
| `isLoggedIn` | `ComputedRef<boolean>` | 登录状态（`token` 非空即为已登录） |
| `login(username, password)` | `Promise` | 登录，写入 token 与 userInfo |
| `logout()` | `void` | 登出，清除 token |

> **注意**：当前登录为 Mock 实现，任意用户名 + 任意密码均可登录（`admin` 账号角色为「系统管理员」，其他账号角色为「运营人员」）。

---

## HTTP 请求封装

`src/utils/request.ts` 对 Axios 做了统一封装：

- **基础 URL**：读取环境变量 `VITE_API_BASE_URL`
- **超时时间**：12000ms
- **请求拦截**：自动在 Header 注入 `Authorization: Bearer <token>`
- **响应拦截**：直接返回 `response.data`；错误时用 `ElMessage.error` 弹出提示，并 `Promise.reject`

---

## 环境变量

在项目根目录创建 `.env.development` / `.env.production` 配置环境变量：

```env
# API 接口基础地址
VITE_API_BASE_URL=https://api.example.com
```

> Vite 中只有以 `VITE_` 开头的变量才会暴露给客户端代码。

---

## 样式规范

### Tailwind 品牌色

项目扩展了 `brand` 色阶（蓝色系）：

| Token | HEX | 用途 |
|-------|-----|------|
| `brand-50` | `#eef7ff` | 浅背景、hover 背景 |
| `brand-100` | `#d9ecff` | 浅色标签、tag |
| `brand-500` | `#2775f5` | 主色调、按钮、链接 |
| `brand-600` | `#1d5fd6` | 主色 hover 状态 |
| `brand-700` | `#194eae` | 主色 active 状态 |

### 全局工具类

| 类名 | 说明 |
|------|------|
| `.admin-page` | 页面容器（浅灰背景 + 内边距，响应式） |
| `.page-panel` | 白色卡片面板（圆角 + 边框 + 阴影） |

---

## 当前页面功能

### 科普馆场次配置 `/session-config`

- 顶部「添加场次」按钮
- 表格展示场次列表：日期 / 开始时间 / 结束时间 / 总号数 / 余号（颜色 Tag） / 创建时间 / 操作人 / 操作
- 操作列包含：团队预约 / 编辑 / 删除

### 用户管理 `/users`

- 搜索框 + 新增按钮
- 表格展示用户列表（ID / 姓名 / 部门 / 角色 / 状态 / 操作）
- 状态用 `el-tag` 区分启用 / 停用

### 系统设置 `/settings`

- 系统名称、审计日志开关、分页数量、系统公告等配置项
- 保存 / 重置操作

---

## 开发约定

- 所有组件使用 `<script setup lang="ts">` + Composition API 风格
- 路径别名 `@` 映射 `src/` 目录，禁止使用相对路径 `../../`
- TypeScript 严格模式开启，禁止未使用变量/参数
- 新增路由页面需同步在 `router/index.ts` 注册，并配置 `meta.title` 和 `meta.icon`
- 侧边栏菜单由路由表自动生成，无需手动维护菜单配置
- HTTP 请求统一使用 `src/utils/request.ts`，禁止直接 import axios

---

## 后续开发计划

- [ ] 对接真实登录接口，替换 Mock 实现
- [ ] 科普馆场次配置页接入 CRUD 接口
- [ ] 用户管理页接入 CRUD 接口
- [ ] 系统设置页接入保存接口
- [ ] 按需引入 Element Plus（减小包体积）
- [ ] 添加权限控制（按钮级别 / 菜单级别）
- [ ] 路由过渡动画
- [ ] 暗色主题支持

---

## License

Internal project — 爱尔科技内部使用
