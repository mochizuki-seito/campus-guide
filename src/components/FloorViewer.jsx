import React, { useState } from 'react';

function getFloorImagePath(bldgId, floor) {
  const floorNum = parseInt(floor.replace('F', ''), 10);
  let fileName = '';

  if (['bldg-1', 'bldg-2', 'bldg-3', 'bldg-6'].includes(bldgId)) {
    if (floorNum >= 1 && floorNum <= 4) {
      fileName = `bldg-1-2-3-6-${floor}.jpg`;
    } else if (['bldg-1', 'bldg-2', 'bldg-6'].includes(bldgId) && (floorNum === 5 || floorNum === 6)) {
      fileName = `bldg-1-2-6-${floor}.jpg`;
    } else if (bldgId === 'bldg-1' && floorNum >= 7 && floorNum <= 13) {
      fileName = `bldg-1-${floor}.jpg`;
    }
  } else if (bldgId === 'bldg-4') {
    fileName = `bldg-4-${floor}.jpg`;
  } else if (bldgId === 'bldg-5') {
    fileName = `bldg-5-${floor}.jpg`;
  }

  return fileName ? `/floors/${fileName}` : null;
}

export default function FloorViewer({ building, floor, onClose }) {
  if (!building || !floor) return null;

  const imageSrc = getFloorImagePath(building.id, floor);

  // ズーム・位置の状態管理
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // ズーム変更
  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.3, 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.3, 0.8));
  const handleResetZoom = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  // ドラッグ操作（位置の移動）
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        
        {/* ヘッダー */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              {building.name} - <span className="text-blue-600">{floor}</span> 配置図
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

        {/* 図面エリア（拡大・ドラッグ移動対応） */}
        <div
          className="flex-1 overflow-hidden bg-slate-100 relative cursor-grab active:cursor-grabbing flex items-center justify-center"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {imageSrc ? (
            <div
              className="transition-transform duration-75 select-none"
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
              }}
            >
              <img
                src={imageSrc}
                alt={`${building.name} ${floor} 配置図`}
                className="max-w-[80vw] max-h-[70vh] object-contain shadow-md rounded-lg bg-white pointer-events-none"
              />
            </div>
          ) : (
            <div className="text-center p-8 text-slate-400">
              <p className="text-base font-semibold">該当する図面画像が見つかりませんでした</p>
            </div>
          )}

          {/* ズームコントローラー（右下に配置） */}
          <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur rounded-xl shadow-lg border border-slate-200 p-1.5 flex items-center gap-1">
            <button
              onClick={handleZoomIn}
              className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-lg flex items-center justify-center transition"
              title="拡大"
            >
              ＋
            </button>
            <button
              onClick={handleZoomOut}
              className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-lg flex items-center justify-center transition"
              title="縮小"
            >
              －
            </button>
            <button
              onClick={handleResetZoom}
              className="px-2.5 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center transition"
              title="位置とサイズをリセット"
            >
              リセット
            </button>
          </div>
        </div>

        {/* フッター */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>※ 画像ドラッグで移動、＋/－ボタンで拡大縮小できます</span>
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