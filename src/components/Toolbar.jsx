import { Edit3, Download, Undo2, Redo2, MousePointer2, Hand } from 'lucide-react'

export default function Toolbar({ step, toolMode, setToolMode, canUndo, canRedo, onUndo, onRedo, onExport }) {
  return (
    <header className="h-14 bg-white border-b border-slate-200 px-6 flex justify-between items-center z-30 shrink-0">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-1.5 rounded-lg">
            <Edit3 className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight">
            ImageTrans <span className="text-indigo-500">Pro</span>
          </span>
        </div>

        {step === 2 && (
          <div className="flex items-center gap-1 border-l border-slate-200 pl-4 ml-2">
            <button
              onClick={onUndo}
              disabled={!canUndo}
              className="p-2 hover:bg-slate-100 rounded-md disabled:opacity-30 transition-colors"
              title="撤销 (Ctrl+Z)"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              onClick={onRedo}
              disabled={!canRedo}
              className="p-2 hover:bg-slate-100 rounded-md disabled:opacity-30 transition-colors"
              title="重做 (Ctrl+Shift+Z)"
            >
              <Redo2 className="w-4 h-4" />
            </button>
            <div className="w-px h-4 bg-slate-200 mx-2"></div>
            <div className="flex bg-slate-100 p-1 rounded-lg gap-1">
              <button
                onClick={() => setToolMode('draw')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all ${toolMode === 'draw' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <MousePointer2 className="w-3.5 h-3.5" /> 选区
              </button>
              <button
                onClick={() => setToolMode('pan')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all ${toolMode === 'pan' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <Hand className="w-3.5 h-3.5" /> 视图
              </button>
            </div>
          </div>
        )}
      </div>

      {step === 2 && (
        <button
          onClick={onExport}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-full text-sm font-bold flex items-center gap-2 shadow-lg shadow-indigo-200 transition-all active:scale-95"
        >
          <Download className="w-4 h-4" /> 导出结果
        </button>
      )}
    </header>
  )
}
