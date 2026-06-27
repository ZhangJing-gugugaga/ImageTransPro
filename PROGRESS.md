# ImageTransPro v1.1 重构进度

## 已完成
- [x] FR-01 拆分 App.jsx（2026-06-28）
  - 文件：src/constants.js, src/hooks/{useHistory,useViewTransform,useCanvasRenderer,useCanvasInteraction}.js, src/components/{UploadScreen,CanvasViewport,Toolbar,PropertyPanel,SymbolPalette}.jsx, src/utils/exportImage.js
  - 验证：build 通过（174 kB gzip 55 kB）
  - 提交：9553ab6

## 未开始
- [ ] FR-02 统一 Canvas 渲染函数
- [ ] FR-03 引入 Zustand 状态管理
- [ ] FR-04 修复 pushHistory 闭包
- [ ] FR-05 区域 ID 改用 crypto.randomUUID
- [ ] FR-06 历史上限 + UI 状态
- [ ] FR-07 Space + 拖拽平移优化
- [ ] FR-08 框选多区域
- [ ] FR-09 对齐辅助线
- [ ] FR-10 快捷键增强
- [ ] FR-11 导出用 dialog.showSaveDialog
- [ ] FR-12 保存 .imagetrans 项目
- [ ] FR-13 打开 .imagetrans 项目
- [ ] FR-14 最近文件列表
- [ ] FR-15 缓存 Image 对象
- [ ] FR-16 大图导出 toBlob
- [ ] FR-17 Error Boundary
- [ ] FR-18 图片加载失败提示
- [ ] M4 质量基建
- [ ] M5 验收 + Bug 修复
