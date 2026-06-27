import { describe, it, expect } from 'vitest'
import { getAlignmentGuides } from '../utils/alignmentGuides'

describe('getAlignmentGuides', () => {
  const imgSize = { width: 800, height: 600 }

  it('区域对齐图片中心时返回辅助线', () => {
    const region = { id: 'r1', x: 350, y: 250, width: 100, height: 100 }
    const { guides } = getAlignmentGuides(region, [region], imgSize)
    const vGuide = guides.find((g) => g.type === 'v' && g.pos === 400)
    const hGuide = guides.find((g) => g.type === 'h' && g.pos === 300)
    expect(vGuide).toBeTruthy()
    expect(hGuide).toBeTruthy()
  })

  it('区域对齐图片边缘时返回辅助线', () => {
    const region = { id: 'r1', x: 1, y: 1, width: 100, height: 100 }
    const { guides } = getAlignmentGuides(region, [region], imgSize)
    expect(guides.some((g) => g.type === 'v' && g.pos === 0)).toBe(true)
    expect(guides.some((g) => g.type === 'h' && g.pos === 0)).toBe(true)
  })

  it('区域对齐其他区域边缘时返回辅助线', () => {
    const r1 = { id: 'r1', x: 100, y: 100, width: 50, height: 50 }
    const r2 = { id: 'r2', x: 102, y: 200, width: 50, height: 50 }
    const { guides } = getAlignmentGuides(r2, [r1, r2], imgSize)
    expect(guides.some((g) => g.type === 'v' && g.pos === 100)).toBe(true)
  })

  it('远离任何参考线时无辅助线', () => {
    const region = { id: 'r1', x: 123, y: 456, width: 30, height: 30 }
    const { guides } = getAlignmentGuides(region, [region], imgSize)
    // 可能仍有 0 边缘或中心对齐，但 123/456 远离中心和边缘
    // 检查没有意外的参考线
    expect(guides.length).toBe(0)
  })
})
