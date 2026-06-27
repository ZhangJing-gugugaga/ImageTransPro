import { useState, useRef, useEffect } from 'react'
import Toolbar from './components/Toolbar'
import UploadScreen from './components/UploadScreen'
import CanvasViewport from './components/CanvasViewport'
import PropertyPanel from './components/PropertyPanel'
import { useViewTransform } from './hooks/useViewTransform'
import { useCanvasRenderer } from './hooks/useCanvasRenderer'
import { useCanvasInteraction } from './hooks/useCanvasInteraction'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import { generateResult as exportImage } from './utils/exportImage'
import { saveProject, openProject, getRecentFiles } from './utils/projectIO'
import useStore from './store'

export default function App() {
  const { step, imageSrc, imgSize, regions, selectedRegionId, selectedRegionIds, toolMode } = useStore()
  const {
    setStep, setImageSrc, setImgSize, setRegions, setSelectedRegionId, setToolMode,
    pushHistory, undo, redo, canUndo, canRedo, resetHistory,
    updateRegionProperty, deleteRegion, insertSymbol, addRegion,
    toggleRegionSelect, setSelectedRegionIds, deleteSelectedRegions,
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
    selectedRegionIds, toggleRegionSelect, setSelectedRegionIds,
    pushHistory, updateRegionProperty,
    offscreenCanvasRef, imgSize, toolMode, setToolMode,
    onGuidesChange: setGuides, renderCanvas,
  })

  useKeyboardShortcuts({
    selectedRegionId, selectedRegionIds, regions, toolMode, setToolMode,
    setRegions, interactionState: interaction.interactionState,
    undo, redo, deleteRegion, deleteSelectedRegions, addRegion,
    viewportRef, step,
  })

  useEffect(() => { renderCanvas() }, [renderCanvas])

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
        setRegions([]); resetHistory(); setStep(2)
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

  const handleSave = () => saveProject({ imageSrc, imgSize, regions, transform })
  const handleOpen = async (filePath) => {
    const data = await openProject(filePath)
    if (!data) return
    setImageSrc(data.imageSrc); setImgSize(data.imgSize); setRegions(data.regions); setStep(2)
    if (data.transform) fitScreen(data.imgSize.width, data.imgSize.height)
  }

  return (
    <div className="flex flex-col h-screen bg-[#F8FAFC] text-slate-800 overflow-hidden font-sans">
      <Toolbar
        step={step} toolMode={toolMode} setToolMode={setToolMode}
        canUndo={canUndo()} canRedo={canRedo()}
        onUndo={undo} onRedo={redo}
        onExport={() => exportImage(imageSrc, regions, outputCanvasRef.current)}
        onSave={handleSave} onOpen={handleOpen}
      />
      <main className="flex-1 flex overflow-hidden">
        {step === 1 ? (
          <UploadScreen fileInputRef={fileInputRef} onFileChange={handleFileChange} error={loadError} />
        ) : (
          <>
            <CanvasViewport
              viewportRef={viewportRef} canvasRef={canvasRef}
              transform={transform} imgSize={imgSize} toolMode={toolMode}
              pickerInfo={interaction.pickerInfo}
              onZoom={zoom} onFitScreen={() => fitScreen()}
              onMouseDown={interaction.handleMouseDown}
              onMouseMove={interaction.handleMouseMove}
              onMouseUp={interaction.handleMouseUp}
              onWheel={handleWheel}
            />
            <PropertyPanel
              selectedRegionId={selectedRegionId} regions={regions}
              onUpdateProperty={updateRegionProperty}
              onDeleteRegion={deleteRegion} onInsertSymbol={insertSymbol}
              onActivateEyeDropper={interaction.activateEyeDropper}
              toolMode={toolMode}
              pushHistory={() => pushHistory(regions)}
              textAreaRef={textAreaRef}
              recentFiles={getRecentFiles()} onOpenRecent={handleOpen}
            />
            <canvas ref={offscreenCanvasRef} className="hidden" />
            <canvas ref={outputCanvasRef} width={imgSize.width} height={imgSize.height} className="hidden" />
          </>
        )}
      </main>
    </div>
  )
}
