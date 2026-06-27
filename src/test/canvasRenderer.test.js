import { describe, it, expect } from 'vitest'
import { renderRegions } from '../utils/canvasRenderer'

// ponytail: mock canvas context
function mockCtx() {
  const calls = []
  return {
    canvas: { width: 800, height: 600 },
    clearRect: (...a) => calls.push(['clearRect', ...a]),
    drawImage: (...a) => calls.push(['drawImage', ...a]),
    fillRect: (...a) => calls.push(['fillRect', ...a]),
    fillText: (...a) => calls.push(['fillText', ...a]),
    strokeRect: (...a) => calls.push(['strokeRect', ...a]),
    measureText: (t) => ({ width: t.length * 8 }),
    beginPath: (...a) => calls.push(['beginPath', ...a]),
    moveTo: (...a) => calls.push(['moveTo', ...a]),
    lineTo: (...a) => calls.push(['lineTo', ...a]),
    rect: (...a) => calls.push(['rect', ...a]),
    fill: (...a) => calls.push(['fill', ...a]),
    stroke: (...a) => calls.push(['stroke', ...a]),
    save: (...a) => calls.push(['save', ...a]),
    restore: (...a) => calls.push(['restore', ...a]),
    setLineDash: (...a) => calls.push(['setLineDash', ...a]),
    set fillStyle(v) { calls.push(['fillStyle', v]) },
    set strokeStyle(v) { calls.push(['strokeStyle', v]) },
    set lineWidth(v) { calls.push(['lineWidth', v]) },
    set textBaseline(v) { calls.push(['textBaseline', v]) },
    set textAlign(v) { calls.push(['textAlign', v]) },
    set font(v) { calls.push(['font', v]) },
    calls,
  }
}

describe('renderRegions', () => {
  const img = { complete: true, width: 800, height: 600 }

  it('清除画布并绘制图片', () => {
    const ctx = mockCtx()
    renderRegions(ctx, img, [], null)
    expect(ctx.calls.some((c) => c[0] === 'clearRect')).toBe(true)
    expect(ctx.calls.some((c) => c[0] === 'drawImage')).toBe(true)
  })

  it('绘制区域背景', () => {
    const ctx = mockCtx()
    const regions = [{ id: 'r1', x: 10, y: 10, width: 100, height: 50, bgColor: '#ff0000', translatedText: '' }]
    renderRegions(ctx, img, regions, null)
    expect(ctx.calls.some((c) => c[0] === 'fillRect' && c[1] === 10 && c[2] === 10)).toBe(true)
  })

  it('绘制区域文字', () => {
    const ctx = mockCtx()
    const regions = [{
      id: 'r1', x: 0, y: 0, width: 200, height: 100,
      bgColor: '#fff', translatedText: '你好', textColor: '#000',
      fontFamily: 'Arial', autoScale: true,
    }]
    renderRegions(ctx, img, regions, null)
    expect(ctx.calls.some((c) => c[0] === 'fillText' && c[1] === '你好')).toBe(true)
  })

  it('选中区域绘制边框', () => {
    const ctx = mockCtx()
    const regions = [{ id: 'r1', x: 10, y: 10, width: 100, height: 50, bgColor: '#fff', translatedText: '' }]
    renderRegions(ctx, img, regions, 'r1', 1)
    expect(ctx.calls.some((c) => c[0] === 'strokeRect')).toBe(true)
  })

  it('guides 参数绘制辅助线', () => {
    const ctx = mockCtx()
    const guides = [{ type: 'v', pos: 400 }, { type: 'h', pos: 300 }]
    renderRegions(ctx, img, [], null, 1, guides)
    // 应该调用 save/restore 和 setLineDash
    expect(ctx.calls.some((c) => c[0] === 'setLineDash')).toBe(true)
  })
})
