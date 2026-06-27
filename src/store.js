import { create } from 'zustand'

const MAX_HISTORY = 50

const useStore = create((set, get) => ({
  // 图片状态
  step: 1,
  imageSrc: null,
  imgSize: { width: 0, height: 0 },

  // 区域状态
  regions: [],
  selectedRegionId: null,
  selectedRegionIds: [], // 多选

  // 工具模式
  toolMode: 'draw',

  // 历史记录
  history: [[]],
  historyIndex: 0,

  // --- Actions ---
  setStep: (step) => set({ step }),
  setImageSrc: (imageSrc) => set({ imageSrc }),
  setImgSize: (imgSize) => set({ imgSize }),
  setRegions: (regions) => set({ regions }),
  setSelectedRegionId: (id) => set({ selectedRegionId: id, selectedRegionIds: id ? [id] : [] }),
  setToolMode: (mode) => set({ toolMode: mode }),

  // 多选操作
  toggleRegionSelect: (id) => {
    const { selectedRegionIds } = get()
    const idx = selectedRegionIds.indexOf(id)
    const next = idx >= 0
      ? selectedRegionIds.filter((i) => i !== id)
      : [...selectedRegionIds, id]
    set({ selectedRegionIds: next, selectedRegionId: next.length > 0 ? next[next.length - 1] : null })
  },

  setSelectedRegionIds: (ids) => set({
    selectedRegionIds: ids,
    selectedRegionId: ids.length > 0 ? ids[ids.length - 1] : null,
  }),

  clearSelection: () => set({ selectedRegionId: null, selectedRegionIds: [] }),

  // 批量移动选中区域
  moveSelectedRegions: (dx, dy) => {
    const { regions, selectedRegionIds } = get()
    const ids = new Set(selectedRegionIds)
    set({
      regions: regions.map((r) => ids.has(r.id) ? { ...r, x: r.x + dx, y: r.y + dy } : r),
    })
  },

  // 批量删除选中区域
  deleteSelectedRegions: () => {
    const { regions, selectedRegionIds, pushHistory } = get()
    const ids = new Set(selectedRegionIds)
    const newRegions = regions.filter((r) => !ids.has(r.id))
    pushHistory(newRegions)
    set({ selectedRegionId: null, selectedRegionIds: [] })
  },

  // 历史操作
  pushHistory: (newRegions) => {
    const { history, historyIndex } = get()
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(JSON.parse(JSON.stringify(newRegions)))
    if (newHistory.length > MAX_HISTORY) newHistory.shift()
    set({ history: newHistory, historyIndex: newHistory.length - 1, regions: newRegions })
  },

  undo: () => {
    const { history, historyIndex } = get()
    if (historyIndex <= 0) return
    const newIndex = historyIndex - 1
    set({
      historyIndex: newIndex,
      regions: JSON.parse(JSON.stringify(history[newIndex])),
      selectedRegionId: null,
    })
  },

  redo: () => {
    const { history, historyIndex } = get()
    if (historyIndex >= history.length - 1) return
    const newIndex = historyIndex + 1
    set({
      historyIndex: newIndex,
      regions: JSON.parse(JSON.stringify(history[newIndex])),
      selectedRegionId: null,
    })
  },

  resetHistory: () => set({ history: [[]], historyIndex: 0, regions: [] }),

  canUndo: () => get().historyIndex > 0,
  canRedo: () => get().historyIndex < get().history.length - 1,

  // 区域操作
  updateRegionProperty: (id, prop, value, shouldPush = false) => {
    const { regions, pushHistory } = get()
    const next = regions.map((r) => (r.id === id ? { ...r, [prop]: value } : r))
    if (shouldPush) {
      pushHistory(next)
    } else {
      set({ regions: next })
    }
  },

  deleteRegion: (id) => {
    const { regions, pushHistory } = get()
    const newRegions = regions.filter((r) => r.id !== id)
    pushHistory(newRegions)
    set({ selectedRegionId: null })
  },

  addRegion: (region) => {
    const { regions, pushHistory } = get()
    const newRegions = [...regions, region]
    pushHistory(newRegions)
    set({ selectedRegionId: region.id })
  },

  insertSymbol: (symbol) => {
    const { selectedRegionId, regions } = get()
    if (!selectedRegionId) return
    const newRegions = regions.map((r) =>
      r.id === selectedRegionId ? { ...r, translatedText: r.translatedText + symbol } : r,
    )
    get().pushHistory(newRegions)
  },
}))

export default useStore
