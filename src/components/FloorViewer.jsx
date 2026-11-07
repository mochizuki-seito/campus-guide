import React from 'react';

export default function FloorViewer({ building, floor, onClose }) {
  if (!building || !floor) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-100">
        
        {/* ヘッダー */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              {building.name} - <span className="text-blue-600">{floor}</span> フロア配置図
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">{building.note}</p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 font-bold flex items-center justify-center transition"
          >
            ✕
          </button>
        </div>

        {/* 図面表示エリア */}
        <div className="flex-1 overflow-auto p-6 bg-slate-100 flex items-center justify-center">
          <div className="bg-white p-4 rounded-xl shadow-inner max-w-full text-center">
            {/* 
              ※後で各階の実際の図面画像（例: `/assets/floors/${building.id}-${floor}.jpg`）
              を読み込めるように設計しています。
            */}
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-12 text-slate-400">
              <p className="text-lg font-bold text-slate-600 mb-2">
                {building.name} {floor} の図面エリア
              </p>
              <p className="text-xs text-slate-500">
                ここにPDFから取り出した各階の図面画像を表示します。
              </p>
            </div>
          </div>
        </div>

        {/* フッター */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 text-right">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-700 hover:bg-slate-800 text-white text-sm font-medium rounded-lg transition"
          >
            閉じる
          </button>
        </div>

      </div>
    </div>
  );
}