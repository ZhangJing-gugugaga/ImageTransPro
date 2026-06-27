# ImageTransPro v1.1 重构进度

## 已完成
- [x] FR-01 拆分 App.jsx（2026-06-28）
  - 文件：src/constants.js, src/hooks/{useHistory,useViewTransform,useCanvasRenderer,useCanvasInteraction}.js, src/components/{UploadScreen,CanvasViewport,Toolbar,PropertyPanel,SymbolPalette}.jsx, src/utils/exportImage.js
  - 验证：build 通过（174 kB gzip 55 kB）
  - 提交：9553ab6
- [x] FR-02 统一 Canvas 渲染函数（2026-06-28）
  - 文件：src/utils/canvasRenderer.js（新增）, src/hooks/useCanvasRenderer.js（简化）, src/utils/exportImage.js（简化）
  - 验证：build 通过（173.66 kB gzip 55.19 kB）
  - 提交：acbc588
- [x] FR-03 引入 Zustand 状态管理（2026-06-28）
  - 文件：src/store.js（新增）, src/App.jsx（144 行）
  - 验证：build 通过（174.78 kB gzip 55.57 kB）
  - 提交：72599e3
- [x] FR-04 修复 pushHistory 闭包（2026-06-28）— Zustand get() 已解决
- [x] FR-05 区域 ID 改用 crypto.randomUUID（2026-06-28）— 提交：8c91e27
- [x] FR-06 历史上限 + UI 状态（2026-06-28）— store.js MAX_HISTORY=50 + Toolbar 已显示
- [x] FR-15 缓存 Image 对象（2026-06-28）— 提交：4d43a75
- [x] FR-17 Error Boundary（2026-06-28）— 提交：87319d4
- [x] FR-18 图片加载失败提示（2026-06-28）— 提交：0e85c40
- [x] FR-07 Space + 拖拽平移优化（2026-06-28）— 提交：116b9ab
- [x] FR-10 快捷键增强（2026-06-28）— 提交：65079de
- [x] FR-09 对齐辅助线（2026-06-28）— 提交：32e98b0
- [x] FR-16 大图导出 toBlob（2026-06-28）— 提交：60e02f9
- [x] FR-11 导出用 dialog.showSaveDialog（2026-06-28）— 提交：5ebda97
- [x] FR-12 保存 .imagetrans 项目（2026-06-28）— 提交：e10ec6e
- [x] FR-13 打开 .imagetrans 项目（2026-06-28）— 提交：e10ec6e
- [x] FR-14 最近文件列表（2026-06-28）— 提交：462aba9
- [x] FR-08 框选多区域（2026-06-28）— 提交：a275dda

## 未开始
- [ ] M4 质量基建
- [ ] M5 验收 + Bug 修复