import React, { useState } from 'react';
import campusMapImg from '../assets/campus-map.jpg';
import FloorViewer from './FloorViewer';

const BUILDINGS = [
  { id: 'bldg-1', name: '1号館', floors: ['1F', '2F', '3F', '4F', '5F', '6F', '7F', '8F', '9F', '10F', '11F', '12F', '13F'], note: '会議室・研究室' },
  { id: 'bldg-2', name: '2号館', floors: ['1F', '2F', '4F', '5F'], note: '図書館・クリエイティブラーニング' },
  { id: 'bldg-3', name: '3号館', floors: ['1F', '3F'], note: 'フードコート・ありあけ食堂' },
  { id: 'bldg-4', name: '4号館', floors: ['2F', '3F', '4F', '5F'], note: 'キャリアセンター・数理工学センター' },
  { id: 'bldg-5', name: '5号館', floors: ['1F', '2F', '3F', '4F', '5F', '6F', '7F'], note: 'アクティブラーニング教室・プレゼンホール' },
  { id: 'bldg-6', name: '6号館', floors: ['1F', '2F', '3F', '4F', '5F'], note: '大教室・ロハスカフェARIAKE・実習室' },
];

export default function CampusMap() {
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [selectedFloor, setSelectedFloor] = useState(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  const handleSelectBuilding = (bldg) => {
    setSelectedBuilding(bldg);
    setSelectedFloor(bldg.floors[0]);
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-slate-100 font-sans text-slate-800">
      
      {/* メインマップエリア */}
      <div className="flex-1 relative overflow-auto p-4 flex items-center justify-center">
        <div className="relative max-w-4xl w-full shadow-2xl rounded-2xl overflow-hidden bg-white">
          <img
            src={campusMapImg}
            alt="キャンパスマップ"
            className="w-full h-auto block select-none"
          />

          {/* クリックオーバーレイ */}
          <div className="absolute inset-0">
            <button
              onClick={() => handleSelectBuilding(BUILDINGS[0])}
              className={`absolute top-[10%] right-[35%] w-[25%] h-[35%] rounded-xl transition-all border-2 ${
                selectedBuilding?.id === 'bldg-1'
                  ? 'bg-blue-500/40 border-blue-600 scale-105'
                  : 'bg-white/10 hover:bg-blue-500/20 border-transparent hover:border-blue-400'
              }`}
              title="1号館"
            />
            <button
              onClick={() => handleSelectBuilding(BUILDINGS[5])}
              className={`absolute top-[18%] left-[30%] w-[18%] h-[25%] rounded-xl transition-all border-2 ${
                selectedBuilding?.id === 'bldg-6'
                  ? 'bg-emerald-500/40 border-emerald-600 scale-105'
                  : 'bg-white/10 hover:bg-emerald-500/20 border-transparent hover:border-emerald-400'
              }`}
              title="6号館"
            />
            <button
              onClick={() => handleSelectBuilding(BUILDINGS[4])}
              className={`absolute bottom-[20%] left-[45%] w-[18%] h-[25%] rounded-xl transition-all border-2 ${
                selectedBuilding?.id === 'bldg-5'
                  ? 'bg-purple-500/40 border-purple-600 scale-105'
                  : 'bg-white/10 hover:bg-purple-500/20 border-transparent hover:border-purple-400'
              }`}
              title="5号館"
            />
            <button
              onClick={() => handleSelectBuilding(BUILDINGS[3])}
              className={`absolute bottom-[20%] right-[15%] w-[22%] h-[30%] rounded-xl transition-all border-2 ${
                selectedBuilding?.id === 'bldg-4'
                  ? 'bg-amber-500/40 border-amber-600 scale-105'
                  : 'bg-white/10 hover:bg-amber-500/20 border-transparent hover:border-amber-400'
              }`}
              title="4号館"
            />
          </div>
        </div>
      </div>

      {/* サイドパネル */}
      <div className="w-full md:w-80 bg-white p-6 shadow-xl border-l border-slate-200 flex flex-col justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 border-b pb-3 mb-4">
            有明キャンパス 案内
          </h1>

          <div className="mb-6">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              号館を選択
            </p>
            <div className="grid grid-cols-3 gap-2">
              {BUILDINGS.map((bldg) => (
                <button
                  key={bldg.id}
                  onClick={() => handleSelectBuilding(bldg)}
                  className={`py-2 px-3 rounded-lg text-sm font-medium transition ${
                    selectedBuilding?.id === bldg.id
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {bldg.name}
                </button>
              ))}
            </div>
          </div>

          {selectedBuilding ? (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h2 className="text-lg font-bold text-blue-700">{selectedBuilding.name}</h2>
              <p className="text-xs text-slate-500 mb-4">{selectedBuilding.note}</p>

              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                フロアを選択
              </p>
              <div className="flex flex-wrap gap-1.5">
                {selectedBuilding.floors.map((fl) => (
                  <button
                    key={fl}
                    onClick={() => setSelectedFloor(fl)}
                    className={`px-3 py-1 text-xs rounded-md font-semibold transition ${
                      selectedFloor === fl
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {fl}
                  </button>
                ))}
              </div>

              {selectedFloor && (
                <div className="mt-4 pt-3 border-t border-slate-200">
                  <p className="text-sm font-semibold text-slate-800 mb-2">
                    選択中: <span className="text-blue-600">{selectedBuilding.name} {selectedFloor}</span>
                  </p>
                  <button
                    onClick={() => setIsViewerOpen(true)}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-sm shadow-md transition"
                  >
                    図面を表示する
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400 text-sm">
              マップ上の建物またはボタンを<br />タップして号館を選択してください
            </div>
          )}
        </div>
      </div>

      {/* 図面モーダルポップアップ */}
      {isViewerOpen && (
        <FloorViewer
          building={selectedBuilding}
          floor={selectedFloor}
          onClose={() => setIsViewerOpen(false)}
        />
      )}

    </div>
  );
}