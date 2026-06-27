import { COMMON_SYMBOLS } from '../constants'

export default function SymbolPalette({ onInsertSymbol }) {
  return (
    <div className="space-y-3">
      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
        <span className="inline-block w-3 h-3 text-center text-xs font-bold">Σ</span> 符号库
      </label>
      <div className="grid grid-cols-6 gap-1.5 p-3 bg-slate-50 rounded-2xl border border-slate-100">
        {COMMON_SYMBOLS.map((sym) => (
          <button
            key={sym}
            onClick={() => onInsertSymbol(sym)}
            className="h-8 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-lg text-xs transition-all active:scale-90 font-sans"
          >
            {sym}
          </button>
        ))}
      </div>
    </div>
  )
}
