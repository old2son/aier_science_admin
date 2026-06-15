# TODO List

## Request / Axios

### 登录失效防重复处理

* [ ] 增加 `isRedirecting` 标识
* [ ] 防止多个接口同时登录失效时重复执行 `router.replace`
* [ ] 防止重复执行 `logout`
* [ ] 防止重复清除 Token

### 请求中断（后续优化）

* [ ] 登录失效后阻止新的请求继续发送
* [ ] 研究 Axios + AbortController
* [ ] 登录失效时取消所有未完成请求
* [ ] 页面切换时取消无效请求

---

## 用户模块

### Token 管理

* [ ] Token Key 统一管理
* [ ] 检查 logout 是否已负责清理 localStorage
* [ ] 避免多处直接操作 localStorage

### 权限管理

* [ ] 与后端确认权限模型
* [ ] 增加权限指令

---

## 表格模块

### 导出功能

* [ ] 统一导出字段配置

### 多人预约展示

* [ ] 优化随行人员 Popover UI
* [ ] 适配移动端展示
