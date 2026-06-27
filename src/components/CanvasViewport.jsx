import { ZoomIn, ZoomOut, Minimize } from 'lucide-react'

export default function CanvasViewport({
  viewportRef,
  canvasRef,
  transform,
  imgSize,
  toolMode,
  pickerInfo,
  onZoom,
  onFitScreen,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onWheel,
  children,
}) {
  return (
    <div
      ref={viewportRef}
      className="flex-1 relative bg-slate-200 overflow-hidden select-none"
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onWheel={onWheel}
    >
      {/* 核心画布堆栈 */}
      <div
        style={{
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
          transformOrigin: '0 0',
          width: imgSize.width,
          height: imgSize.height,
          position: 'absolute',
          top: 0,
          left: 0,
        }}
      >
        <canvas
          ref={canvasRef}
          width={imgSize.width}
          height={imgSize.height}
          className="block shadow-2xl"
        />
      </div>

      {/* 取色器实时预览提示 */}
      {toolMode === 'picker' && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-md text-white px-6 py-2 rounded-full text-xs font-bold flex items-center gap-3 z-50 border border-white/20">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
          点击图片取色，按 ESC 退出
        </div>
      )}

      {/* 自定义取色器光标预览 */}
      {toolMode === 'picker' && pickerInfo.visible && (
        <div
          className="pointer-events-none fixed z-50 flex flex-col items-center"
          style={{ left: pickerInfo.x, top: pickerInfo.y }}
        >
          <div
            className="w-16 h-16 rounded-full border-4 border-white shadow-xl overflow-hidden flex items-center justify-center relative"
            style={{
              backgroundColor: pickerInfo.color,
              transform: 'translate(-50%, -120%)',
            }}
          >
            <div className="w-full h-full border border-black/10 rounded-full flex items-center justify-center">
              <div className="w-1 h-1 bg-white mix-blend-difference rounded-full"></div>
            </div>
          </div>
          <div className="bg-white/90 backdrop-blur px-2 py-0.5 rounded text-[10px] font-mono font-bold shadow-md -translate-y-full mt-1 border border-slate-200">
            {pickerInfo.color.toUpperCase()}
          </div>
        </div>
      )}

      {/* 底部控制条 */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-xl border border-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-6 z-20">
        <div className="flex items-center gap-1">
          <button onClick={() => onZoom(1)} className="p-2 hover:bg-slate-100 rounded-lg">
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono font-bold w-12 text-center">
            {Math.round(transform.scale * 100)}%
          </span>
          <button onClick={() => onZoom(-1)} className="p-2 hover:bg-slate-100 rounded-lg">
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>
        <div className="w-px h-6 bg-slate-300/50"></div>
        <button
          onClick={onFitScreen}
          className="p-2 hover:bg-slate-100 rounded-lg"
          title="适应屏幕"
        >
          <Minimize className="w-4 h-4" />
        </button>
      </div>

      {children}
    </div>
  )
}
