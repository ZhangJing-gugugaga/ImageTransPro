import { Upload } from 'lucide-react'

export default function UploadScreen({ fileInputRef, onFileChange }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-10 bg-slate-50">
      <div className="max-w-md w-full bg-white p-12 rounded-[2.5rem] shadow-2xl shadow-slate-200 text-center border border-slate-100">
        <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center mx-auto mb-8 animate-bounce">
          <Upload className="w-10 h-10 text-indigo-600" />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 mb-3">开始编辑</h2>
        <p className="text-slate-400 mb-10 leading-relaxed font-medium">
          支持 PNG, JPG。所有操作均在本地完成，保护您的隐私。
        </p>
        <button
          onClick={() => fileInputRef.current.click()}
          className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-lg shadow-xl shadow-indigo-100 transition-all hover:scale-[1.02] active:scale-95"
        >
          选择图片
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={onFileChange}
          className="hidden"
          accept="image/*"
        />
        <p className="text-xs text-slate-300 mt-4">
          或直接拖拽图片到窗口
        </p>
      </div>
    </div>
  )
}
