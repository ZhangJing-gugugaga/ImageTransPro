import { useState, useRef, useEffect } from 'react'
import Toolbar from './components/Toolbar'
import UploadScreen from './components/UploadScreen'
import CanvasViewport from './components/CanvasViewport'
import PropertyPanel from './components/PropertyPanel'
import { useViewTransform } from './hooks/useViewTransform'
import { useCanvasRenderer } from './hooks/useCanvasRenderer'
import { useCanvasInteraction } from './hooks/useCanvasInteraction'
import { generateResult as exportImage } from './utils/exportImage'
import useStore from './store'

export default function App() {
  const { step, imageSrc, imgSize, regions, selectedRegionId, toolMode } = useStore()
  const {
    setStep, setImageSrc, setImgSize, setRegions, setSelectedRegionId, setToolMode,
    pushHistory, undo, redo, canUndo, canRedo, resetHistory,
    updateRegionProperty, deleteRegion, insertSymbol, addRegion,
  } = useStore()

  const [loadError, setLoadError] = useState(null)

  const viewportRef = useRef(null)
  const fileInputRef = useRef(null)
  const textAreaRef = useRef(null)
  const offscreenCanvasRef = useRef(null)
  const outputCanvasRef = useRef(null)

  const { transform, setTransform, fitScreen, zoom, handleWheel, screenToImage } = useViewTransform(viewportRef)
  const { canvasRef, renderCanvas, setGuides } = useCanvasRenderer(imageSrc, regions, selectedRegionId, transform.scale)

  const interaction = useCanvasInteraction({
    viewportRef, transform, setTransform, screenToImage,
    regions, setRegions, selectedRegionId, setSelectedRegionId,
    pushHistory, updateRegionProperty,
    offscreenCanvasRef, imgSize, toolMode, setToolMode,
    onGuidesChange: setGuides,
    renderCanvas,
  })

  // 渲染画布
  useEffect(() => { renderCanvas() }, [renderCanvas])

  // Space 键切换 grab 光标（按住即生效，无需移动鼠标）
  useEffect(() => {
    if (step !== 2) return
    const onDown = (e) => {
      if (e.code === 'Space' && viewportRef.current && interaction.interactionState === 'idle') {
        e.preventDefault()
        viewportRef.current.style.cursor = 'grab'
      }
    }
    const onUp = (e) => {
      if (e.code === 'Space' && viewportRef.current && interaction.interactionState === 'idle') {
        viewportRef.current.style.cursor = 'crosshair'
      }
    }
    window.addEventListener('keydown', onDown)
    window.addEventListener('keyup', onUp)
    return () => { window.removeEventListener('keydown', onDown); window.removeEventListener('keyup', onUp) }
  }, [step, interaction.interactionState])

  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e) => {
      const isInput = document.activeElement.tagName === 'TEXTAREA' || document.activeElement.tagName === 'INPUT'
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault()
        e.shiftKey ? redo() : undo()
        return
      }
      // Ctrl+Y: 重做
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault()
        redo()
        return
      }
      // Ctrl+D: 复制选中区域
      if ((e.ctrlKey || e.metaKey) && e.key === 'd' && selectedRegionId && !isInput) {
        e.preventDefault()
        const src = regions.find((r) => r.id === selectedRegionId)
        if (src) {
          const newRegion = { ...src, id: crypto.randomUUID(), x: src.x + 10, y: src.y + 10 }
          addRegion(newRegion)
        }
        return
      }
      // 方向键微移
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key) && selectedRegionId && !isInput) {
        e.preventDefault()
        const step = e.shiftKey ? 10 : 1
        const src = regions.find((r) => r.id === selectedRegionId)
        if (!src) return
        const dx = e.key === 'ArrowLeft' ? -step : e.key === 'ArrowRight' ? step : 0
        const dy = e.key === 'ArrowUp' ? -step : e.key === 'ArrowDown' ? step : 0
        setRegions(regions.map((r) => r.id === selectedRegionId ? { ...r, x: src.x + dx, y: src.y + dy } : r))
        return
      }
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedRegionId && interaction.interactionState === 'idle' && !isInput) {
        deleteRegion(selectedRegionId)
      }
      if (e.key === 'Escape' && toolMode === 'picker') setToolMode('draw')
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedRegionId, toolMode, regions, interaction.interactionState, undo, redo, deleteRegion, setToolMode, addRegion, setRegions])

  // 拖拽上传
  useEffect(() => {
    const handleDragOver = (e) => { e.preventDefault(); e.stopPropagation() }
    const handleDrop = (e) => {
      e.preventDefault(); e.stopPropagation()
      const file = e.dataTransfer?.files?.[0]
      if (file && file.type.startsWith('image/')) handleFileChange({ target: { files: [file] } })
    }
    window.addEventListener('dragover', handleDragOver)
    window.addEventListener('drop', handleDrop)
    return () => { window.removeEventListener('dragover', handleDragOver); window.removeEventListener('drop', handleDrop) }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setLoadError(null)
    const reader = new FileReader()
    reader.onerror = () => setLoadError('文件读取失败，请检查文件是否损坏')
    reader.onload = (event) => {
      const img = new Image()
      img.onerror = () => setLoadError('图片加载失败，请尝试其他格式（PNG/JPG）')
      img.onload = () => {
        setImageSrc(img.src)
        setImgSize({ width: img.width, height: img.height })
        setRegions([])
        resetHistory()
        setStep(2)
        if (offscreenCanvasRef.current) {
          const offCtx = offscreenCanvasRef.current.getContext('2d')
          offscreenCanvasRef.current.width = img.width
          offscreenCanvasRef.current.height = img.height
          offCtx.drawImage(img, 0, 0)
        }
        setTimeout(() => fitScreen(img.width, img.height), 100)
      }
      img.src = event.target.result
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="flex flex-col h-screen bg-[#F8FAFC] text-slate-800 overflow-hidden font-sans">
      <Toolbar
        step={step}
        toolMode={toolMode}
        setToolMode={setToolMode}
        canUndo={canUndo()}
        canRedo={canRedo()}
        onUndo={undo}
        onRedo={redo}
        onExport={() => exportImage(imageSrc, regions, outputCanvasRef.current)}
      />
      <main className="flex-1 flex overflow-hidden">
        {step === 1 ? (
          <UploadScreen fileInputRef={fileInputRef} onFileChange={handleFileChange} error={loadError} />
        ) : (
          <>
            <CanvasViewport
              viewportRef={viewportRef}
              canvasRef={canvasRef}
              transform={transform}
              imgSize={imgSize}
              toolMode={toolMode}
              pickerInfo={interaction.pickerInfo}
              onZoom={zoom}
              onFitScreen={() => fitScreen()}
              onMouseDown={interaction.handleMouseDown}
              onMouseMove={interaction.handleMouseMove}
              onMouseUp={interaction.handleMouseUp}
              onWheel={handleWheel}
            />
            <PropertyPanel
              selectedRegionId={selectedRegionId}
              regions={regions}
              onUpdateProperty={updateRegionProperty}
              onDeleteRegion={deleteRegion}
              onInsertSymbol={insertSymbol}
              onActivateEyeDropper={interaction.activateEyeDropper}
              toolMode={toolMode}
              pushHistory={() => pushHistory(regions)}
              textAreaRef={textAreaRef}
            />
            <canvas ref={offscreenCanvasRef} className="hidden" />
            <canvas ref={outputCanvasRef} width={imgSize.width} height={imgSize.height} className="hidden" />
          </>
        )}
      </main>
    </div>
  )
}
