# ImageTransPro v1.1 产品需求文档（PRD）

## 1. 项目概述

**产品名称：** ImageTrans Pro v1.1  
**产品定位：** 本地优先的图片文本覆盖/翻译标注桌面应用  
**目标用户：** 翻译工作者、内容本地化团队、漫画/字幕爱好者、需要快速制作带注释图片的用户  
**核心价值：** 在本地完成图片上传、区域标注、样式编辑、导出，保护隐私，零上传。

## 2. 目标与范围

### 2.1 本期目标
- 解决 v1.0 单文件代码臃肿、状态管理脆弱、性能差的问题
- 提升核心交互体验（缩放、平移、多选、对齐、快捷键）
- 增加项目级能力（保存/打开项目、最近文件）
- 建立基础质量保障（Lint、单元测试、E2E）

### 2.2 不在本期范围
- OCR 自动识别
- 云端同步/协作
- AI 自动翻译

## 3. 用户故事

| 编号 | 作为 | 我想要 | 以便 |
|------|------|--------|------|
| US-01 | 翻译人员 | 一次性打开之前保存的项目 | 继续未完成的翻译工作 |
| US-02 | 用户 | 使用 Ctrl+Y / Ctrl+D 等快捷键 | 提升编辑效率 |
| US-03 | 用户 | 框选多个区域并批量移动/删除 | 快速调整布局 |
| US-04 | 用户 | 区域边缘出现吸附辅助线 | 对齐更精准 |
| US-05 | 用户 | 导出前确认文件名和路径 | 避免覆盖原文件 |
| US-06 | 用户 | 大图片也能流畅缩放和导出 | 不因内存不足崩溃 |

## 4. 功能需求

### 4.1 架构重构
- FR-01：将 `App.jsx` 拆分为独立组件与 Hooks
- FR-02：统一 Canvas 渲染函数，消除 `renderCanvas` 与 `generateResult` 重复代码
- FR-03：使用轻量级状态管理（Zustand）管理 regions、transform、history

### 4.2 状态与历史
- FR-04：修复 `pushHistory` 闭包问题，使用函数式更新
- FR-05：区域 ID 使用 `crypto.randomUUID()`
- FR-06：历史记录上限 50 步，并在 UI 显示 undo/redo 可用状态

### 4.3 交互增强
- FR-07：支持 Space + 拖拽平移，鼠标中键平移
- FR-08：支持框选多个区域
- FR-09：支持对齐辅助线（图片中心、边缘、其他区域边缘）
- FR-10：支持快捷键：Ctrl+Z / Ctrl+Shift+Z / Ctrl+Y / Ctrl+D / Delete / 方向键微移
- FR-11：导出时使用 Electron `dialog.showSaveDialog`

### 4.4 项目文件
- FR-12：保存项目为 `.imagetrans` JSON 文件
- FR-13：打开 `.imagetrans` 文件并恢复图片、区域、视图状态
- FR-14：最近打开文件列表（最多 10 个）

### 4.5 性能与健壮性
- FR-15：缓存加载后的 `Image` 对象
- FR-16：大图片导出使用 `canvas.toBlob` + `createObjectURL`
- FR-17：添加 Error Boundary，防止单点错误白屏
- FR-18：图片加载失败时显示友好错误提示

## 5. 非功能需求

| 编号 | 需求 | 验收标准 |
|------|------|---------|
| NFR-01 | 性能 | 1000×1000 图片缩放/平移 60fps |
| NFR-02 | 可维护性 | ESLint + Prettier 零错误提交 |
| NFR-03 | 可测试性 | 核心纯函数单元测试覆盖率 ≥ 70% |
| NFR-04 | 安全 | Electron CSP 配置生效，无 `nodeIntegration` |
| NFR-05 | 跨平台 | 代码在 Windows/macOS/Linux 均可构建 |

## 6. 技术方案

- **状态管理：** Zustand
- **测试：** Vitest（单元）+ Playwright（E2E）
- **质量：** ESLint + Prettier + Husky + lint-staged
- **CI/CD：** GitHub Actions（lint/test/build）
- **Electron IPC：** 通过 preload 暴露安全的 `saveProject`、`openProject`、`showSaveDialog` 等 API

## 7. UI/UX 要点

- 保持现有 Indigo/Slade 设计系统
- 工具栏增加「选择/平移/取色」状态指示
- 属性面板增加「最近文件」入口
- 画布添加对齐辅助线（虚线，1px，indigo-400）
- 导出时弹出原生保存对话框

## 8. 里程碑

| 阶段 | 周期 | 交付物 |
|------|------|--------|
| M1 | 1 周 | 架构拆分 + 状态重构 + 历史记录修复 |
| M2 | 1 周 | 交互增强（多选、对齐、快捷键） |
| M3 | 1 周 | 项目保存/打开 + 最近文件 |
| M4 | 3 天 | 测试 + Lint + CI/CD |
| M5 | 2 天 | 验收 + Bug 修复 |

## 9. 验收标准

- [ ] `App.jsx` 行数 ≤ 200
- [ ] `renderCanvas` 与 `generateResult` 不重复文字渲染逻辑
- [ ] Ctrl+Y 重做可用
- [ ] 可保存并重新打开项目，区域位置/样式/文本一致
- [ ] 大图片（≥ 5MB）导出不崩溃
- [ ] `npm run test` 通过
- [ ] `npm run lint` 通过

## 10. 风险与假设

- **风险：** 项目文件格式未来变更需做版本迁移
- **假设：** 用户主要使用 Windows，但代码保持跨平台兼容
