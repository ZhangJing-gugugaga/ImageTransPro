import { Trash2, Type, Lock, Unlock, Bold, Italic, Underline, Info, Sigma, Pipette, MousePointer2 } from 'lucide-react'
import { FONT_FAMILIES } from '../constants'
import SymbolPalette from './SymbolPalette'

export default function PropertyPanel({
  selectedRegionId,
  regions,
  onUpdateProperty,
  onDeleteRegion,
  onInsertSymbol,
  onActivateEyeDropper,
  toolMode,
  pushHistory,
  textAreaRef,
}) {
  const selectedRegion = regions.find((r) => r.id === selectedRegionId)

  return (
    <aside className="w-80 bg-white border-l border-slate-200 flex flex-col z-20 shadow-[-10px_0_30px_rgba(0,0,0,0.02)]">
      <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <Info className="w-4 h-4 text-indigo-500" />
          编辑属性
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {selectedRegionId && selectedRegion ? (
          <>
            {/* 文本内容 */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">内容</label>
              <textarea
                ref={textAreaRef}
                rows={4}
                value={selectedRegion.translatedText || ''}
                onChange={(e) => onUpdateProperty(selectedRegionId, 'translatedText', e.target.value)}
                onBlur={() => pushHistory(regions)}
                placeholder="输入文本内容..."
                className="w-full text-sm border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 p-4 resize-none transition-all outline-none leading-relaxed"
              />
            </div>

            {/* 字体样式 */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Type className="w-3 h-3" /> 字体与缩放
                </label>
                <button
                  onClick={() => onUpdateProperty(selectedRegionId, 'autoScale', !selectedRegion.autoScale, true)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all border ${
                    selectedRegion.autoScale !== false
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-600'
                      : 'bg-slate-100 border-slate-200 text-slate-500'
                  }`}
                >
                  {selectedRegion.autoScale !== false ? (
                    <Lock className="w-2.5 h-2.5" />
                  ) : (
                    <Unlock className="w-2.5 h-2.5" />
                  )}
                  {selectedRegion.autoScale !== false ? '自动字号' : '手动控制'}
                </button>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl space-y-4 border border-slate-100">
                <div className="grid grid-cols-3 gap-2">
                  <select
                    value={selectedRegion.fontFamily || ''}
                    onChange={(e) => onUpdateProperty(selectedRegionId, 'fontFamily', e.target.value, true)}
                    className="col-span-2 text-xs border border-slate-200 rounded-lg h-10 px-2 bg-white"
                  >
                    {FONT_FAMILIES.map((f) => (
                      <option key={f.name} value={f.value}>{f.name}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    disabled={selectedRegion.autoScale !== false}
                    value={selectedRegion.fontSize || 24}
                    onChange={(e) => onUpdateProperty(selectedRegionId, 'fontSize', parseInt(e.target.value))}
                    onBlur={() => pushHistory(regions)}
                    className="w-full h-10 text-xs border border-slate-200 rounded-lg text-center bg-white disabled:opacity-50"
                  />
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex gap-1 bg-white p-1 rounded-lg border border-slate-100">
                    {[
                      { key: 'isBold', icon: Bold },
                      { key: 'isItalic', icon: Italic },
                      { key: 'isUnderline', icon: Underline },
                    ].map((style) => {
                      const active = selectedRegion[style.key]
                      return (
                        <button
                          key={style.key}
                          onClick={() => onUpdateProperty(selectedRegionId, style.key, !active, true)}
                          className={`p-2 rounded-md transition-colors ${active ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-slate-50 text-slate-500'}`}
                        >
                          <style.icon className="w-3.5 h-3.5" />
                        </button>
                      )
                    })}
                  </div>

                  <div className="flex gap-3">
                    {/* 文字颜色 */}
                    <div className="flex flex-col items-center gap-1">
                      <div className="relative w-8 h-8 rounded-full border-2 border-white shadow-md overflow-hidden ring-1 ring-slate-200 cursor-pointer" title="文字颜色">
                        <input
                          type="color"
                          className="absolute inset-0 w-16 h-16 -translate-x-1/4 -translate-y-1/4 cursor-pointer"
                          value={selectedRegion.textColor || '#000000'}
                          onChange={(e) => onUpdateProperty(selectedRegionId, 'textColor', e.target.value)}
                          onBlur={() => pushHistory(regions)}
                        />
                      </div>
                      <span className="text-[8px] font-bold text-slate-400">文字</span>
                    </div>

                    {/* 背景颜色 */}
                    <div className="flex flex-col items-center gap-1">
                      <div className="flex items-center gap-1.5">
                        <div className="relative w-8 h-8 rounded-full border-2 border-white shadow-md overflow-hidden ring-1 ring-slate-200 cursor-pointer" title="背景颜色">
                          <input
                            type="color"
                            className="absolute inset-0 w-16 h-16 -translate-x-1/4 -translate-y-1/4 cursor-pointer"
                            value={selectedRegion.bgColor || '#ffffff'}
                            onChange={(e) => onUpdateProperty(selectedRegionId, 'bgColor', e.target.value)}
                            onBlur={() => pushHistory(regions)}
                          />
                        </div>
                        <button
                          onClick={onActivateEyeDropper}
                          className={`p-2 rounded-full border transition-all ${toolMode === 'picker' ? 'bg-indigo-600 border-indigo-600 text-white animate-pulse' : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-500 hover:text-indigo-600'}`}
                          title="从图片吸取背景色"
                        >
                          <Pipette className="w-4 h-4" />
                        </button>
                      </div>
                      <span className="text-[8px] font-bold text-slate-400">背景与吸色</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 符号面板 */}
            <SymbolPalette onInsertSymbol={onInsertSymbol} />

            <button
              onClick={() => onDeleteRegion(selectedRegionId)}
              className="w-full py-3 mt-4 text-red-500 bg-red-50 hover:bg-red-100 border border-red-100 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all"
            >
              <Trash2 className="w-4 h-4" /> 删除此区域
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-300 py-20 text-center px-4">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-6">
              <MousePointer2 className="w-8 h-8 opacity-20" />
            </div>
            <h4 className="text-slate-900 font-bold mb-1">未选中区域</h4>
            <p className="text-xs font-medium leading-relaxed">
              在图片上点击并拖拽
              <br />
              即可创建新的文本框
            </p>
          </div>
        )}
      </div>

      <div className="p-5 text-[9px] text-slate-400 border-t border-slate-100 text-center font-medium">
        按住{' '}
        <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">Space</span>{' '}
        拖动视图 •{' '}
        <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">Scroll</span>{' '}
        缩放
      </div>
    </aside>
  )
}
