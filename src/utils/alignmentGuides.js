// 计算对齐辅助线
// 当拖拽区域的边与其他区域或图片中心/边缘对齐时，返回辅助线坐标
const SNAP_THRESHOLD = 5 // 像素容差

export function getAlignmentGuides(draggedRegion, allRegions, imgSize) {
  const guides = [] // { type: 'h'|'v', pos: number }
  const snaps = { x: null, y: null } // 吸附目标

  const { x, y, width, height } = draggedRegion
  const cx = x + width / 2
  const cy = y + height / 2
  const right = x + width
  const bottom = y + height

  // 参考线集合：图片中心和边缘
  const vRefs = [0, imgSize.width / 2, imgSize.width] // 垂直参考线（x 坐标）
  const hRefs = [0, imgSize.height / 2, imgSize.height] // 水平参考线（y 坐标）

  // 其他区域的边
  for (const r of allRegions) {
    if (r.id === draggedRegion.id) continue
    vRefs.push(r.x, r.x + r.width / 2, r.x + r.width)
    hRefs.push(r.y, r.y + r.height / 2, r.y + r.height)
  }

  // 被拖拽区域需要检查的控制点
  const vChecks = [
    { val: x, label: 'left' },
    { val: cx, label: 'center' },
    { val: right, label: 'right' },
  ]
  const hChecks = [
    { val: y, label: 'top' },
    { val: cy, label: 'center' },
    { val: bottom, label: 'bottom' },
  ]

  // 检查垂直对齐
  for (const check of vChecks) {
    for (const ref of vRefs) {
      if (Math.abs(check.val - ref) < SNAP_THRESHOLD) {
        guides.push({ type: 'v', pos: ref })
        if (!snaps.x || Math.abs(check.val - ref) < Math.abs(check.val - snaps.x)) {
          snaps.x = { target: ref, label: check.label, delta: ref - check.val }
        }
      }
    }
  }

  // 检查水平对齐
  for (const check of hChecks) {
    for (const ref of hRefs) {
      if (Math.abs(check.val - ref) < SNAP_THRESHOLD) {
        guides.push({ type: 'h', pos: ref })
        if (!snaps.y || Math.abs(check.val - ref) < Math.abs(check.val - snaps.y)) {
          snaps.y = { target: ref, label: check.label, delta: ref - check.val }
        }
      }
    }
  }

  // 去重
  const unique = []
  const seen = new Set()
  for (const g of guides) {
    const key = `${g.type}-${g.pos}`
    if (!seen.has(key)) {
      seen.add(key)
      unique.push(g)
    }
  }

  return { guides: unique, snaps }
}
