import { useState, useCallback, useRef } from 'react'
import { getAlignmentGuides } from '../utils/alignmentGuides'

export function useCanvasInteraction({
  viewportRef,
  transform,
  setTransform,
  screenToImage,
  regions,
  setRegions,
  selectedRegionId,
  setSelectedRegionId,
  pushHistory,
  updateRegionProperty,
  offscreenCanvasRef,
  imgSize,
  toolMode,
  setToolMode,
  onGuidesChange,
  renderCanvas,
}) {
  const [interactionState, setInteractionState] = useState('idle')
  const [pickerInfo, setPickerInfo] = useState({ x: 0, y: 0, color: '#ffffff', visible: false })

  const dragStartRef = useRef({ x: 0, y: 0 })
  const activeRegionIdRef = useRef(null)
  const resizeHandleRef = useRef(null)
  const initialRectRef = useRef(null)
  const initialTransformRef = useRef(null)

  const getResizeHandle = useCallback((imgPos, region) => {
    if (!region) return null
    const handleSize = 12 / transform.scale
    const { x, y, width, height } = region
    const handles = {
      nw: { x: x, y: y },
      ne: { x: x + width, y: y },
      sw: { x: x, y: y + height },
      se: { x: x + width, y: y + height },
    }
    for (const [key, hPos] of Object.entries(handles)) {
      if (Math.abs(imgPos.x - hPos.x) < handleSize && Math.abs(imgPos.y - hPos.y) < handleSize) {
        return key
      }
    }
    return null
  }, [transform.scale])

  const getColorAtPixel = useCallback((ix, iy) => {
    if (!offscreenCanvasRef.current) return '#ffffff'
    const ctx = offscreenCanvasRef.current.getContext('2d')
    if (ix < 0 || iy < 0 || ix >= imgSize.width || iy >= imgSize.height) return null
    const data = ctx.getImageData(Math.floor(ix), Math.floor(iy), 1, 1).data
    const r = data[0].toString(16).padStart(2, '0')
    const g = data[1].toString(16).padStart(2, '0')
    const b = data[2].toString(16).padStart(2, '0')
    return `#${r}${g}${b}`
  }, [offscreenCanvasRef, imgSize])

  const activateEyeDropper = useCallback(async () => {
    if (window.EyeDropper) {
      const eyeDropper = new window.EyeDropper()
      try {
        const result = await eyeDropper.open()
        if (selectedRegionId) {
          updateRegionProperty(selectedRegionId, 'bgColor', result.sRGBHex, true)
        }
      } catch (e) {
        // 取色器取消
      }
    } else {
      setToolMode('picker')
    }
  }, [selectedRegionId, updateRegionProperty, setToolMode])

  const handleMouseDown = useCallback((e) => {
    const rect = viewportRef.current.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    const imgPos = screenToImage(mouseX, mouseY)

    // 中键或空格平移
    if (e.button === 1 || e.getModifierState('Space')) {
      setInteractionState('panning')
      dragStartRef.current = { x: mouseX, y: mouseY }
      initialTransformRef.current = { ...transform }
      return
    }

    // 取色模式
    if (toolMode === 'picker') {
      const color = getColorAtPixel(imgPos.x, imgPos.y)
      if (color && selectedRegionId) {
        updateRegionProperty(selectedRegionId, 'bgColor', color, true)
        setToolMode('draw')
      }
      return
    }

    // 拖动工具模式
    if (toolMode === 'pan') {
      setInteractionState('panning')
      dragStartRef.current = { x: mouseX, y: mouseY }
      initialTransformRef.current = { ...transform }
      return
    }

    // 调整选区大小
    if (selectedRegionId) {
      const selectedRegion = regions.find((r) => r.id === selectedRegionId)
      const handle = getResizeHandle(imgPos, selectedRegion)
      if (handle) {
        setInteractionState('resizing_region')
        resizeHandleRef.current = handle
        activeRegionIdRef.current = selectedRegionId
        dragStartRef.current = imgPos
        initialRectRef.current = { ...selectedRegion }
        return
      }
    }

    // 选中或移动选区
    const clickedRegion = [...regions].reverse().find(
      (r) => imgPos.x >= r.x && imgPos.x <= r.x + r.width && imgPos.y >= r.y && imgPos.y <= r.y + r.height,
    )

    if (clickedRegion) {
      setSelectedRegionId(clickedRegion.id)
      setInteractionState('moving_region')
      activeRegionIdRef.current = clickedRegion.id
      dragStartRef.current = imgPos
      initialRectRef.current = { ...clickedRegion }
    } else {
      setSelectedRegionId(null)
      setInteractionState('drawing')
      dragStartRef.current = imgPos
    }
  }, [viewportRef, transform, toolMode, selectedRegionId, regions, screenToImage, setSelectedRegionId, setToolMode, updateRegionProperty, getResizeHandle, getColorAtPixel])

  const handleMouseMove = useCallback((e) => {
    const rect = viewportRef.current.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    const imgPos = screenToImage(mouseX, mouseY)

    // 更新取色预览
    if (toolMode === 'picker') {
      const color = getColorAtPixel(imgPos.x, imgPos.y)
      setPickerInfo({ x: mouseX, y: mouseY, color: color || '#ffffff', visible: true })
    } else {
      setPickerInfo((prev) => ({ ...prev, visible: false }))
    }

    if (interactionState === 'panning') {
      const dx = mouseX - dragStartRef.current.x
      const dy = mouseY - dragStartRef.current.y
      const init = initialTransformRef.current
      setTransform({ ...init, x: init.x + dx, y: init.y + dy })
    } else if (interactionState === 'moving_region') {
      const dx = imgPos.x - dragStartRef.current.x
      const dy = imgPos.y - dragStartRef.current.y
      const init = initialRectRef.current
      const moved = { ...init, x: init.x + dx, y: init.y + dy }
      setRegions(regions.map((r) =>
        r.id === activeRegionIdRef.current ? moved : r,
      ))
      // 计算对齐辅助线
      if (onGuidesChange) {
        const { guides } = getAlignmentGuides(moved, regions, imgSize)
        onGuidesChange(guides)
        if (renderCanvas) renderCanvas()
      }
    } else if (interactionState === 'resizing_region') {
      const dx = imgPos.x - dragStartRef.current.x
      const dy = imgPos.y - dragStartRef.current.y
      const init = initialRectRef.current
      const handle = resizeHandleRef.current
      let newRect = { ...init }
      if (handle.includes('e')) newRect.width = Math.max(10, init.width + dx)
      if (handle.includes('s')) newRect.height = Math.max(10, init.height + dy)
      if (handle.includes('w')) {
        const finalWidth = Math.max(10, init.width - dx)
        newRect.x = init.x + (init.width - finalWidth)
        newRect.width = finalWidth
      }
      if (handle.includes('n')) {
        const finalHeight = Math.max(10, init.height - dy)
        newRect.y = init.y + (init.height - finalHeight)
        newRect.height = finalHeight
      }
      const resized = { ...r, ...newRect }
      setRegions(regions.map((r) => (r.id === activeRegionIdRef.current ? resized : r)))
      // 计算对齐辅助线
      if (onGuidesChange) {
        const { guides } = getAlignmentGuides(resized, regions, imgSize)
        onGuidesChange(guides)
        if (renderCanvas) renderCanvas()
      }
    }

    // 更新鼠标样式
    if (interactionState === 'idle') {
      if (toolMode === 'picker') {
        viewportRef.current.style.cursor = 'none'
      } else if (e.getModifierState('Space') || toolMode === 'pan') {
        viewportRef.current.style.cursor = 'grab'
      } else if (selectedRegionId && getResizeHandle(imgPos, regions.find((r) => r.id === selectedRegionId))) {
        viewportRef.current.style.cursor = 'nwse-resize'
      } else if ([...regions].reverse().find((r) => imgPos.x >= r.x && imgPos.x <= r.x + r.width && imgPos.y >= r.y && imgPos.y <= r.y + r.height)) {
        viewportRef.current.style.cursor = 'move'
      } else {
        viewportRef.current.style.cursor = 'crosshair'
      }
    } else if (interactionState === 'panning') {
      viewportRef.current.style.cursor = 'grabbing'
    }
  }, [viewportRef, toolMode, interactionState, selectedRegionId, regions, screenToImage, transform, setTransform, setRegions, getColorAtPixel, getResizeHandle])

  const handleMouseUp = useCallback((e) => {
    // 清除对齐辅助线
    if (onGuidesChange) onGuidesChange([])

    if (interactionState === 'moving_region' || interactionState === 'resizing_region') {
      pushHistory(regions)
    } else if (interactionState === 'drawing') {
      const rect = viewportRef.current.getBoundingClientRect()
      const imgPos = screenToImage(e.clientX - rect.left, e.clientY - rect.top)

      const width = Math.abs(imgPos.x - dragStartRef.current.x)
      const height = Math.abs(imgPos.y - dragStartRef.current.y)

      if (width > 5 && height > 5) {
        const newRegion = {
          id: crypto.randomUUID(),
          x: Math.min(imgPos.x, dragStartRef.current.x),
          y: Math.min(imgPos.y, dragStartRef.current.y),
          width,
          height,
          translatedText: '',
          bgColor: '#ffffff',
          textColor: '#000000',
          fontSize: 24,
          fontFamily: '"Microsoft YaHei", sans-serif',
          isBold: false,
          isItalic: false,
          isUnderline: false,
          autoScale: true,
        }
        const newRegions = [...regions, newRegion]
        pushHistory(newRegions)
        setRegions(newRegions)
        setSelectedRegionId(newRegion.id)
      }
    }

    setInteractionState('idle')
    activeRegionIdRef.current = null
    initialRectRef.current = null
    initialTransformRef.current = null
    resizeHandleRef.current = null
  }, [interactionState, regions, viewportRef, screenToImage, pushHistory, setRegions, setSelectedRegionId])

  return {
    interactionState,
    pickerInfo,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    activateEyeDropper,
  }
}
