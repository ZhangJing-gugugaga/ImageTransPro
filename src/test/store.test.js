import { describe, it, expect, beforeEach } from 'vitest'
import useStore from '../store'

describe('useStore', () => {
  beforeEach(() => {
    // 重置 store 状态
    const state = useStore.getState()
    state.resetHistory()
    state.setRegions([])
    state.setSelectedRegionId(null)
  })

  it('初始状态正确', () => {
    const state = useStore.getState()
    expect(state.step).toBe(1)
    expect(state.regions).toEqual([])
    expect(state.selectedRegionId).toBeNull()
    expect(state.toolMode).toBe('draw')
  })

  it('pushHistory 记录区域快照', () => {
    const { pushHistory } = useStore.getState()
    const regions = [{ id: 'r1', x: 10, y: 10, width: 100, height: 50 }]
    pushHistory(regions)
    expect(useStore.getState().regions).toEqual(regions)
    expect(useStore.getState().historyIndex).toBe(1)
  })

  it('undo/redo 恢复区域状态', () => {
    const { pushHistory, undo, redo } = useStore.getState()
    pushHistory([{ id: 'r1', x: 0, y: 0, width: 50, height: 50 }])
    pushHistory([{ id: 'r1', x: 10, y: 10, width: 50, height: 50 }])

    undo()
    expect(useStore.getState().regions[0].x).toBe(0)

    redo()
    expect(useStore.getState().regions[0].x).toBe(10)
  })

  it('canUndo/canRedo 正确报告', () => {
    const { pushHistory, undo, canUndo, canRedo } = useStore.getState()
    pushHistory([{ id: 'r1', x: 0, y: 0, width: 50, height: 50 }])
    expect(canUndo()).toBe(true)
    expect(canRedo()).toBe(false)

    undo()
    expect(canUndo()).toBe(false)
    expect(canRedo()).toBe(true)
  })

  it('updateRegionProperty 更新指定属性', () => {
    const { pushHistory, updateRegionProperty } = useStore.getState()
    pushHistory([{ id: 'r1', x: 0, y: 0, width: 50, height: 50, bgColor: '#fff' }])
    updateRegionProperty('r1', 'bgColor', '#000')
    expect(useStore.getState().regions[0].bgColor).toBe('#000')
  })

  it('deleteRegion 删除指定区域', () => {
    const { pushHistory, deleteRegion } = useStore.getState()
    pushHistory([
      { id: 'r1', x: 0, y: 0, width: 50, height: 50 },
      { id: 'r2', x: 100, y: 100, width: 50, height: 50 },
    ])
    deleteRegion('r1')
    expect(useStore.getState().regions).toHaveLength(1)
    expect(useStore.getState().regions[0].id).toBe('r2')
  })

  it('多选操作正确', () => {
    const { pushHistory, setSelectedRegionIds, deleteSelectedRegions } = useStore.getState()
    pushHistory([
      { id: 'r1', x: 0, y: 0, width: 50, height: 50 },
      { id: 'r2', x: 100, y: 100, width: 50, height: 50 },
      { id: 'r3', x: 200, y: 200, width: 50, height: 50 },
    ])
    setSelectedRegionIds(['r1', 'r3'])
    expect(useStore.getState().selectedRegionIds).toEqual(['r1', 'r3'])

    deleteSelectedRegions()
    expect(useStore.getState().regions).toHaveLength(1)
    expect(useStore.getState().regions[0].id).toBe('r2')
  })
})
