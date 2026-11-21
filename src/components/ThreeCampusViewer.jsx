import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import { CAMPUS_3D_BUILDINGS } from '../data/campus3dData';

// 案内板準拠：大通りの西側に5号館、そのさらに西隣に4号館を配置
const BLDG5_OFFSET = { x: -94, z: -26 };
const BLDG4_OFFSET = { x: -152, z: -26 };

// スマホ用 360度バーチャルスティック
function VirtualJoystick({ joystickRef }) {
  const containerRef = useRef(null);
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });
  const [active, setActive] = useState(false);
  const maxRadius = 38;

  const updateStick = (clientX, clientY) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    let dx = clientX - centerX;
    let dy = clientY - centerY;
    const dist = Math.hypot(dx, dy);

    if (dist > maxRadius) {
      dx = (dx / dist) * maxRadius;
      dy = (dy / dist) * maxRadius;
    }

    setKnobPos({ x: dx, y: dy });
    joystickRef.current = {
      x: dx / maxRadius,
      y: -dy / maxRadius,
    };
  };

  const handlePointerDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    setActive(true);
    updateStick(e.clientX, e.clientY);
  };

  const handlePointerMove = (e) => {
    if (!active) return;
    e.preventDefault();
    updateStick(e.clientX, e.clientY);
  };

  const handlePointerEnd = (e) => {
    if (!active) return;
    e.preventDefault();
    setActive(false);
    setKnobPos({ x: 0, y: 0 });
    joystickRef.current = { x: 0, y: 0 };
  };

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
      className="relative w-28 h-28 rounded-full bg-slate-900/75 backdrop-blur-sm border-2 border-white/60 shadow-2xl flex items-center justify-center touch-none select-none"
    >
      <div className="absolute inset-3 rounded-full border border-white/30 pointer-events-none" />
      <span className="absolute top-1.5 text-[9px] text-slate-200 font-bold pointer-events-none">▲</span>
      <span className="absolute bottom-1.5 text-[9px] text-slate-200 font-bold pointer-events-none">▼</span>
      <span className="absolute left-2 text-[9px] text-slate-200 font-bold pointer-events-none">◀</span>
      <span className="absolute right-2 text-[9px] text-slate-200 font-bold pointer-events-none">▶</span>

      <div
        style={{
          transform: `translate3d(${knobPos.x}px, ${knobPos.y}px, 0)`,
        }}
        className={`w-12 h-12 rounded-full shadow-lg border-2 pointer-events-none transition-colors ${
          active
            ? 'bg-blue-500 border-blue-200 scale-105'
            : 'bg-slate-700/90 border-slate-300'
        }`}
      />
    </div>
  );
}

// 教室を外壁・隣室と密着させ、廊下側に入り口（ドア）を設定するヘルパー
function buildConnectedRooms(rawRooms, buildingZones) {
  if (!rawRooms || rawRooms.length === 0) return [];

  const boxes = rawRooms.map((r) => {
    let minX = r.x - r.w / 2;
    let maxX = r.x + r.w / 2;
    let minZ = r.z - r.d / 2;
    let maxZ = r.z + r.d / 2;

    const zone = buildingZones.find(
      (z) =>
        !z.isOutdoor &&
        r.x >= z.minX - 1 &&
        r.x <= z.maxX + 1 &&
        r.z >= z.minZ - 1 &&
        r.z <= z.maxZ + 1
    );

    if (zone) {
      const snapDist = 3.2;
      if (Math.abs(minZ - zone.minZ) <= snapDist) minZ = zone.minZ;
      if (Math.abs(maxZ - zone.maxZ) <= snapDist) maxZ = zone.maxZ;
      if (Math.abs(minX - zone.minX) <= snapDist) minX = zone.minX;
      if (Math.abs(maxX - zone.maxX) <= snapDist) maxX = zone.maxX;
    }

    return { ...r, minX, maxX, minZ, maxZ, zone };
  });

  for (let i = 0; i < boxes.length; i++) {
    for (let j = i + 1; j < boxes.length; j++) {
      const a = boxes[i];
      const b = boxes[j];
      if (a.zone && b.zone && a.zone !== b.zone) continue;

      const overlapZ = Math.min(a.maxZ, b.maxZ) - Math.max(a.minZ, b.minZ);
      if (overlapZ > 1.0) {
        const gapAB = b.minX - a.maxX;
        if (gapAB > 0.01 && gapAB <= 2.3) {
          const mid = (a.maxX + b.minX) / 2;
          a.maxX = mid;
          b.minX = mid;
        }
        const gapBA = a.minX - b.maxX;
        if (gapBA > 0.01 && gapBA <= 2.3) {
          const mid = (b.maxX + a.minX) / 2;
          b.maxX = mid;
          a.minX = mid;
        }
      }

      const overlapX = Math.min(a.maxX, b.maxX) - Math.max(a.minX, b.minX);
      if (overlapX > 1.0) {
        const gapAB = b.minZ - a.maxZ;
        if (gapAB > 0.01 && gapAB <= 2.3) {
          const mid = (a.maxZ + b.minZ) / 2;
          a.maxZ = mid;
          b.minZ = mid;
        }
        const gapBA = a.minZ - b.maxZ;
        if (gapBA > 0.01 && gapBA <= 2.3) {
          const mid = (b.maxZ + a.minZ) / 2;
          b.maxZ = mid;
          a.minZ = mid;
        }
      }
    }
  }

  return boxes.map((box, idx) => {
    const x = (box.minX + box.maxX) / 2;
    const z = (box.minZ + box.maxZ) / 2;
    const w = box.maxX - box.minX;
    const d = box.maxZ - box.minZ;

    const candidates = [
      { side: 'south', px: x, pz: box.maxZ + 1.6, len: w },
      { side: 'north', px: x, pz: box.minZ - 1.6, len: w },
      { side: 'east', px: box.maxX + 1.6, pz: z, len: d },
      { side: 'west', px: box.minX - 1.6, pz: z, len: d },
    ];

    let bestSide = 'south';
    let bestScore = -999;

    for (const c of candidates) {
      let score = 0;
      const inZone = buildingZones.some(
        (zn) => c.px >= zn.minX + 0.3 && c.px <= zn.maxX - 0.3 && c.pz >= zn.minZ + 0.3 && c.pz <= zn.maxZ - 0.3
      );
      if (inZone) score += 10;

      const blockedByOtherRoom = boxes.some(
        (other, oIdx) =>
          oIdx !== idx &&
          c.px >= other.minX - 0.2 &&
          c.px <= other.maxX + 0.2 &&
          c.pz >= other.minZ - 0.2 &&
          c.pz <= other.maxZ + 0.2
      );
      if (!blockedByOtherRoom) score += 20;
      score += Math.min(c.len, 6) * 0.2;

      if (score > bestScore) {
        bestScore = score;
        bestSide = c.side;
      }
    }

    const sideLen = bestSide === 'north' || bestSide === 'south' ? w : d;
    const doorWidth = Math.min(2.2, Math.max(1.2, sideLen * 0.55));

    return {
      ...box,
      x,
      z,
      w,
      d,
      doorSide: bestSide,
      doorWidth,
    };
  });
}

// 樹木オブジェクト
function CampusTree({ position, scale = 1, leafColor = '#4d7c0f' }) {
  return (
    <group position={position} scale={[scale, scale, scale]}>
      <mesh position={[0, 1.3, 0]} castShadow>
        <cylinderGeometry args={[0.14, 0.22, 2.6, 8]} />
        <meshStandardMaterial color="#78350f" roughness={0.9} />
      </mesh>
      <mesh position={[0, 3.1, 0]} castShadow>
        <dodecahedronGeometry args={[1.15, 1]} />
        <meshStandardMaterial color={leafColor} roughness={0.8} />
      </mesh>
      <mesh position={[0.5, 2.6, 0.3]} castShadow>
        <dodecahedronGeometry args={[0.8, 1]} />
        <meshStandardMaterial color="#65a30d" roughness={0.8} />
      </mesh>
      <mesh position={[-0.45, 2.7, -0.3]} castShadow>
        <dodecahedronGeometry args={[0.75, 1]} />
        <meshStandardMaterial color="#3f6212" roughness={0.8} />
      </mesh>
    </group>
  );
}

// レンガ調アーチ回廊ユニット
function BrickArchFacade({ position, rotation = [0, 0, 0], count = 4, width = 3.5, height = 5.4 }) {
  const brickColor = '#9a3412';
  const trimColor = '#f5f5f4';
  const items = Array.from({ length: count });

  return (
    <group position={position} rotation={rotation}>
      {items.map((_, idx) => {
        const offsetX = (idx - (count - 1) / 2) * width;
        return (
          <group key={idx} position={[offsetX, 0, 0]}>
            <mesh position={[-width * 0.38, height / 2, 0]} castShadow receiveShadow>
              <boxGeometry args={[width * 0.24, height, 0.45]} />
              <meshStandardMaterial color={brickColor} roughness={0.75} />
            </mesh>
            <mesh position={[width * 0.38, height / 2, 0]} castShadow receiveShadow>
              <boxGeometry args={[width * 0.24, height, 0.45]} />
              <meshStandardMaterial color={brickColor} roughness={0.75} />
            </mesh>
            <mesh position={[0, height - 0.55, 0]} castShadow>
              <boxGeometry args={[width, 1.1, 0.48]} />
              <meshStandardMaterial color={brickColor} roughness={0.75} />
            </mesh>
            <mesh position={[0, height - 1.2, 0]}>
              <torusGeometry args={[width * 0.32, 0.16, 8, 20, Math.PI]} />
              <meshStandardMaterial color={brickColor} roughness={0.7} />
            </mesh>
            <mesh position={[0, height + 0.08, 0]}>
              <boxGeometry args={[width + 0.05, 0.18, 0.6]} />
              <meshStandardMaterial color={trimColor} roughness={0.5} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

// キャンパス外観・中庭・屋外階段B・ピロティ通り道・大通り・5号館＆4号館
function CampusScenery({ currentFloor, insideGroup }) {
  const floorNum = parseInt(currentFloor.replace('F', ''), 10) || 1;
  const groundY = -(floorNum - 1) * 3.4;

  const show1236Walls = insideGroup !== '1236';
  const show4Walls = insideGroup !== '4';
  const show5Walls = insideGroup !== '5';

  return (
    <group>
      {/* 広大な緑地ベース */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-65, groundY - 0.18, 0]} receiveShadow>
        <planeGeometry args={[560, 560]} />
        <meshStandardMaterial color="#86efac" roughness={0.95} />
      </mesh>

      {/* メインキャンパス（1・2・3・6号館）敷地舗装 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-3, groundY - 0.1, 0]} receiveShadow>
        <planeGeometry args={[94, 114]} />
        <meshStandardMaterial color="#d6d3d1" roughness={0.85} />
      </mesh>

      {/* 西側キャンパス（5・4号館）敷地舗装（案内板準拠） */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-126, groundY - 0.1, -24]} receiveShadow>
        <planeGeometry args={[124, 62]} />
        <meshStandardMaterial color="#d6d3d1" roughness={0.85} />
      </mesh>

      {/* =================================================================== */}
      {/* 1. 中庭（パティオ）のレンガ舗装・点字ブロック＆屋外階段B・ピロティ     */}
      {/* =================================================================== */}
      {/* 中庭中央の赤茶色レンガタイル遊歩道 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-4, groundY - 0.03, 6]} receiveShadow>
        <planeGeometry args={[10, 40]} />
        <meshStandardMaterial color="#9a3412" roughness={0.85} />
      </mesh>

      {/* 現地写真準拠：ピロティ通り道〜モニュメント広場〜横断歩道への白タイル＆誘導点字ブロック */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-22, groundY - 0.02, -26]} receiveShadow>
        <planeGeometry args={[42, 22]} />
        <meshStandardMaterial color="#f5f5f4" roughness={0.75} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-25, groundY + 0.005, -26]}>
        <planeGeometry args={[36, 0.55]} />
        <meshBasicMaterial color="#e2e8f0" />
      </mesh>

      {/* 2F正門エントランスデッキ（ピロティ橋桁＆白い丸柱：現地写真1・3準拠） */}
      <group position={[-18, groundY, -24]}>
        {/* 2Fデッキ橋桁スラブ */}
        <mesh position={[0, 3.55, 0]} castShadow receiveShadow>
          <boxGeometry args={[46, 0.85, 18]} />
          <meshStandardMaterial color="#e7e5e4" />
        </mesh>
        {/* 2Fデッキ手すり（現地写真3の格子手すり） */}
        <mesh position={[0, 4.45, 8.8]}>
          <boxGeometry args={[46, 0.95, 0.15]} />
          <meshStandardMaterial color="#334155" />
        </mesh>
        <mesh position={[0, 4.45, -8.8]}>
          <boxGeometry args={[46, 0.95, 0.15]} />
          <meshStandardMaterial color="#334155" />
        </mesh>
        {/* ピロティの白い丸柱 */}
        {[-18, -6, 6].map((px, idx) => (
          <React.Fragment key={`piloti-${idx}`}>
            <mesh position={[px, 1.75, -7.2]} castShadow>
              <cylinderGeometry args={[0.32, 0.32, 3.5, 16]} />
              <meshStandardMaterial color="#f8fafc" />
            </mesh>
            <mesh position={[px, 1.75, 7.2]} castShadow>
              <cylinderGeometry args={[0.32, 0.32, 3.5, 16]} />
              <meshStandardMaterial color="#f8fafc" />
            </mesh>
          </React.Fragment>
        ))}
      </group>

      {/* 屋外階段B（現地写真3準拠：Z=-14から北Z=-26へ登り、右側に学友会室・左側にピロティ通り道） */}
      <group position={[1, groundY, -14]}>
        {Array.from({ length: 14 }).map((_, i) => {
          const stepY = (i + 0.5) * (3.55 / 14);
          const stepZ = -(i + 0.5) * (12 / 14);
          return (
            <mesh key={`stair-${i}`} position={[0, stepY, stepZ]} castShadow receiveShadow>
              <boxGeometry args={[7.6, 3.55 / 14, 12 / 14 + 0.15]} />
              <meshStandardMaterial color={i % 2 === 0 ? '#e7e5e4' : '#d6d3d1'} roughness={0.7} />
            </mesh>
          );
        })}
        {/* 西側コンクリート擁壁（階段とピロティ通り道の境界壁・現地写真3のアート壁面） */}
        <mesh position={[-4.0, 2.0, -6]} castShadow>
          <boxGeometry args={[0.45, 4.0, 12.2]} />
          <meshStandardMaterial color="#a8a29e" />
        </mesh>
        {/* 東側手すり壁（学友会室側） */}
        <mesh position={[4.0, 2.2, -6]} rotation={[0.285, 0, 0]}>
          <boxGeometry args={[0.35, 1.1, 12.6]} />
          <meshStandardMaterial color="#64748b" />
        </mesh>
      </group>

      {/* 中庭の並木道＆ベンチ */}
      {[-5, 2, 9, 16, 22].map((zPos, i) => (
        <React.Fragment key={`patio-tree-${i}`}>
          <CampusTree
            position={[-10.5, groundY, zPos]}
            scale={0.95}
            leafColor={i % 2 === 0 ? '#65a30d' : '#ca8a04'}
          />
          <CampusTree
            position={[3.2, groundY, zPos]}
            scale={0.95}
            leafColor={i % 2 === 0 ? '#4d7c0f' : '#a16207'}
          />
        </React.Fragment>
      ))}
      {[-1, 12, 20].map((zPos, idx) => (
        <group key={`bench-${idx}`} position={[-4, groundY, zPos]}>
          <mesh position={[-3.5, 0.25, 0]}>
            <boxGeometry args={[1.4, 0.5, 0.7]} />
            <meshStandardMaterial color="#78716c" />
          </mesh>
          <mesh position={[3.5, 0.25, 0]}>
            <boxGeometry args={[1.4, 0.5, 0.7]} />
            <meshStandardMaterial color="#78716c" />
          </mesh>
        </group>
      ))}

      {/* =================================================================== */}
      {/* 2. 1・2・3・6号館の外壁（建物に入ると自動で消える）                  */}
      {/* =================================================================== */}
      {show1236Walls && (
        <group>
          {/* 1号館 中央メインアーチゲート（Z=26） */}
          <group position={[-4, groundY, 26]}>
            <mesh position={[-4.2, 3.6, 0]} castShadow>
              <boxGeometry args={[2.0, 7.2, 1.1]} />
              <meshStandardMaterial color="#9a3412" roughness={0.75} />
            </mesh>
            <mesh position={[4.2, 3.6, 0]} castShadow>
              <boxGeometry args={[2.0, 7.2, 1.1]} />
              <meshStandardMaterial color="#9a3412" roughness={0.75} />
            </mesh>
            <mesh position={[0, 6.4, 0]} castShadow>
              <boxGeometry args={[10.4, 1.8, 1.15]} />
              <meshStandardMaterial color="#9a3412" roughness={0.75} />
            </mesh>
            <mesh position={[0, 4.9, 0]}>
              <torusGeometry args={[3.2, 0.35, 10, 24, Math.PI]} />
              <meshStandardMaterial color="#7c2d12" roughness={0.7} />
            </mesh>
            <mesh position={[0, 7.4, 0]}>
              <boxGeometry args={[10.8, 0.3, 1.3]} />
              <meshStandardMaterial color="#f5f5f4" />
            </mesh>
          </group>

          {/* 1号館 1〜2F 左右レンガアーチ回廊 */}
          <BrickArchFacade position={[-23, groundY, 26]} count={7} width={3.6} height={6.2} />
          <BrickArchFacade position={[18, groundY, 26]} count={8} width={3.6} height={6.2} />

          {/* 2号館・6号館の中庭側レンガアーチ回廊 */}
          <BrickArchFacade
            position={[-12, groundY, 7]}
            rotation={[0, Math.PI / 2, 0]}
            count={9}
            width={3.6}
            height={6.2}
          />
          <BrickArchFacade
            position={[4.5, groundY, 7]}
            rotation={[0, -Math.PI / 2, 0]}
            count={9}
            width={3.6}
            height={6.2}
          />

          {/* 1号館 高層タワー外観（13階建てアイボリー外壁＋ガラスアトリウム） */}
          <group position={[0, groundY, 50.4]}>
            <mesh position={[-23, 21, 0]} castShadow>
              <boxGeometry args={[34, 42, 0.7]} />
              <meshStandardMaterial color="#f5f5f4" roughness={0.6} />
            </mesh>
            <mesh position={[20, 21, 0]} castShadow>
              <boxGeometry args={[40, 42, 0.7]} />
              <meshStandardMaterial color="#f5f5f4" roughness={0.6} />
            </mesh>
            <mesh position={[-4, 23, -0.1]}>
              <boxGeometry args={[10, 34, 0.6]} />
              <meshStandardMaterial color="#7dd3fc" transparent opacity={0.75} roughness={0.15} />
            </mesh>
            <mesh position={[-4, 22, -1.6]} castShadow>
              <cylinderGeometry args={[5.4, 5.4, 0.35, 24, 1, false, -Math.PI / 2, Math.PI]} />
              <meshStandardMaterial color="#e7e5e4" />
            </mesh>
            <mesh position={[-4, 41.5, -1.8]} castShadow>
              <cylinderGeometry args={[5.6, 5.6, 0.4, 24, 1, false, -Math.PI / 2, Math.PI]} />
              <meshStandardMaterial color="#e7e5e4" />
            </mesh>
          </group>
        </group>
      )}

      {/* =================================================================== */}
      {/* 3. 大通り・横断歩道（5号館正面直結）・センタープロムナード・2Fデッキ   */}
      {/* =================================================================== */}
      <group position={[-53, groundY - 0.05, 0]}>
        {/* 片側2車線の大通り（X = -62 〜 -44） */}
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[18, 280]} />
          <meshStandardMaterial color="#334155" roughness={0.9} />
        </mesh>
        {/* 中央分離帯（横断歩道 Z=-26 部分は途切れさせる） */}
        <mesh position={[0, 0.15, -88]}>
          <boxGeometry args={[1.4, 0.3, 108]} />
          <meshStandardMaterial color="#15803d" />
        </mesh>
        <mesh position={[0, 0.15, 45]}>
          <boxGeometry args={[1.4, 0.3, 126]} />
          <meshStandardMaterial color="#15803d" />
        </mesh>

        {/* 1F地上徒歩ルート：モニュメント広場から5号館正面入口への横断歩道（Z=-26） */}
        {[-5, -2.5, 0, 2.5, 5].map((zOff, i) => (
          <mesh key={`cw-bldg5-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, -26 + zOff]}>
            <planeGeometry args={[16, 1.2]} />
            <meshBasicMaterial color="#f8fafc" />
          </mesh>
        ))}

        {/* 道路沿いの街路樹 */}
        {[-70, -52, -40, -10, 12, 34, 54].map((z, idx) => (
          <React.Fragment key={`road-tree-${idx}`}>
            <CampusTree position={[-10.5, 0, z]} scale={1.15} leafColor="#3f6212" />
            <CampusTree position={[10.5, 0, z]} scale={1.15} leafColor="#4d7c0f" />
          </React.Fragment>
        ))}
      </group>

      {/* 案内板上部「センタープロムナード」（5号館・4号館の北側を東西に走る歩行者専用緑道） */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-122, groundY - 0.03, -53]} receiveShadow>
        <planeGeometry args={[124, 10]} />
        <meshStandardMaterial color="#e7e5e4" roughness={0.8} />
      </mesh>

      {/* 2F高さ（groundY + 3.55）で大通りをまたぐ空中歩行者デッキ（正門デッキ ⇔ 5号館・4号館 2F） */}
      <group position={[-57, groundY + 3.55, -26]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[32, 0.45, 12]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.65, 5.8]}>
          <boxGeometry args={[32, 0.9, 0.15]} />
          <meshStandardMaterial color="#94a3b8" />
        </mesh>
        <mesh position={[0, 0.65, -5.8]}>
          <boxGeometry args={[32, 0.9, 0.15]} />
          <meshStandardMaterial color="#94a3b8" />
        </mesh>
      </group>

      {/* =================================================================== */}
      {/* 4. 5号館の外観（大通り横断歩道の正面・縦ルーバー外観）                 */}
      {/* =================================================================== */}
      {show5Walls && (
        <group position={[BLDG5_OFFSET.x, groundY, BLDG5_OFFSET.z]}>
          <mesh position={[0, 12, -22.2]} castShadow>
            <boxGeometry args={[44, 24, 0.6]} />
            <meshStandardMaterial color="#f5f5f4" />
          </mesh>
          <mesh position={[0, 12, 22.2]} castShadow>
            <boxGeometry args={[44, 24, 0.6]} />
            <meshStandardMaterial color="#f5f5f4" />
          </mesh>
          {/* 東側（大通り面）の縦ルーバーフィン */}
          {[-14, -8, -2, 4, 10, 16].map((zOff, i) => (
            <mesh key={`fin-${i}`} position={[22.3, 13.5, zOff]} castShadow>
              <boxGeometry args={[0.9, 19, 0.35]} />
              <meshStandardMaterial color="#f8fafc" />
            </mesh>
          ))}
        </group>
      )}

      {/* =================================================================== */}
      {/* 5. 4号館の外観（5号館の西隣に配置・案内板準拠）                       */}
      {/* =================================================================== */}
      {show4Walls && (
        <group position={[BLDG4_OFFSET.x, groundY, BLDG4_OFFSET.z]}>
          <mesh position={[0, 8.5, 18.2]} castShadow>
            <boxGeometry args={[56, 17, 0.6]} />
            <meshStandardMaterial color="#f5f5f4" />
          </mesh>
          <mesh position={[0, 3.0, 18.3]}>
            <boxGeometry args={[56.2, 6.0, 0.65]} />
            <meshStandardMaterial color="#9a3412" />
          </mesh>
          <mesh position={[-28.2, 8.5, 1]} castShadow>
            <boxGeometry args={[0.6, 17, 34]} />
            <meshStandardMaterial color="#f5f5f4" />
          </mesh>
          <mesh position={[-28.3, 3.0, 1]}>
            <boxGeometry args={[0.65, 6.0, 34.2]} />
            <meshStandardMaterial color="#9a3412" />
          </mesh>
        </group>
      )}

      {/* 周囲の公園・緑地 */}
      {[-25, -10, 5, 20, 32].map((x, i) => (
        <CampusTree key={`park-n-${i}`} position={[x, groundY, -72 - (i % 2) * 7]} scale={1.3} leafColor="#15803d" />
      ))}
      {[-38, -20, -2, 16, 34].map((z, i) => (
        <CampusTree key={`park-e-${i}`} position={[56 + (i % 2) * 5, groundY, z]} scale={1.25} leafColor="#15803d" />
      ))}
    </group>
  );
}

// 入り口（ドア開口）付きの部屋立体モデル
function RoomBox({ room }) {
  const wallH = 2.8;
  const wallT = 0.24;
  const { w, d, doorSide, doorWidth } = room;

  const renderDoorWall = (totalLen, isHorizontal) => {
    const sideW = Math.max(0.15, (totalLen - doorWidth) / 2);
    const offset = doorWidth / 2 + sideW / 2;

    if (isHorizontal) {
      return (
        <>
          <mesh position={[-offset, wallH / 2, 0]} castShadow>
            <boxGeometry args={[sideW, wallH, wallT]} />
            <meshStandardMaterial color={room.color} transparent opacity={0.68} />
          </mesh>
          <mesh position={[offset, wallH / 2, 0]} castShadow>
            <boxGeometry args={[sideW, wallH, wallT]} />
            <meshStandardMaterial color={room.color} transparent opacity={0.68} />
          </mesh>
          <mesh position={[0, wallH - 0.35, 0]}>
            <boxGeometry args={[doorWidth, 0.7, wallT]} />
            <meshStandardMaterial color={room.color} transparent opacity={0.68} />
          </mesh>
        </>
      );
    }
    return (
      <>
        <mesh position={[0, wallH / 2, -offset]} castShadow>
          <boxGeometry args={[wallT, wallH, sideW]} />
          <meshStandardMaterial color={room.color} transparent opacity={0.68} />
        </mesh>
        <mesh position={[0, wallH / 2, offset]} castShadow>
          <boxGeometry args={[wallT, wallH, sideW]} />
          <meshStandardMaterial color={room.color} transparent opacity={0.68} />
        </mesh>
        <mesh position={[0, wallH - 0.35, 0]}>
          <boxGeometry args={[wallT, 0.7, doorWidth]} />
          <meshStandardMaterial color={room.color} transparent opacity={0.68} />
        </mesh>
      </>
    );
  };

  return (
    <group position={[room.x, 0, room.z]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]} receiveShadow>
        <planeGeometry args={[w, d]} />
        <meshStandardMaterial color={room.color} roughness={0.6} />
      </mesh>

      <group position={[0, 0, -d / 2]}>
        {doorSide === 'north' ? (
          renderDoorWall(w, true)
        ) : (
          <mesh position={[0, wallH / 2, 0]} castShadow>
            <boxGeometry args={[w, wallH, wallT]} />
            <meshStandardMaterial color={room.color} transparent opacity={0.68} />
          </mesh>
        )}
      </group>

      <group position={[0, 0, d / 2]}>
        {doorSide === 'south' ? (
          renderDoorWall(w, true)
        ) : (
          <mesh position={[0, wallH / 2, 0]} castShadow>
            <boxGeometry args={[w, wallH, wallT]} />
            <meshStandardMaterial color={room.color} transparent opacity={0.68} />
          </mesh>
        )}
      </group>

      <group position={[-w / 2, 0, 0]}>
        {doorSide === 'west' ? (
          renderDoorWall(d, false)
        ) : (
          <mesh position={[0, wallH / 2, 0]} castShadow>
            <boxGeometry args={[wallT, wallH, d]} />
            <meshStandardMaterial color={room.color} transparent opacity={0.68} />
          </mesh>
        )}
      </group>

      <group position={[w / 2, 0, 0]}>
        {doorSide === 'east' ? (
          renderDoorWall(d, false)
        ) : (
          <mesh position={[0, wallH / 2, 0]} castShadow>
            <boxGeometry args={[wallT, wallH, d]} />
            <meshStandardMaterial color={room.color} transparent opacity={0.68} />
          </mesh>
        )}
      </group>

      <lineSegments position={[0, wallH / 2, 0]}>
        <edgesGeometry args={[new THREE.BoxGeometry(w, wallH, d)]} />
        <lineBasicMaterial color="#334155" />
      </lineSegments>

      <Html position={[0, 3.15, 0]} center distanceFactor={26} zIndexRange={[10, 0]}>
        <div className="bg-slate-900/90 text-white px-2 py-0.5 rounded text-[10px] font-bold whitespace-pre-line text-center shadow border border-slate-500 pointer-events-none select-none leading-tight">
          {room.name}
        </div>
      </Html>
    </group>
  );
}

function VoidBox({ voidArea }) {
  return (
    <group position={[voidArea.x, 0, voidArea.z]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <planeGeometry args={[voidArea.w, voidArea.d]} />
        <meshStandardMaterial color="#334155" />
      </mesh>
      <lineSegments position={[0, 0.6, 0]}>
        <edgesGeometry args={[new THREE.BoxGeometry(voidArea.w, 1.2, voidArea.d)]} />
        <lineBasicMaterial color="#0284c7" />
      </lineSegments>
      <Html position={[0, 1.6, 0]} center distanceFactor={28}>
        <div className="bg-sky-900/90 text-sky-100 px-2.5 py-1 rounded text-[11px] font-bold border border-sky-400 pointer-events-none select-none">
          {voidArea.name}
        </div>
      </Html>
    </group>
  );
}

function ConnectorSign({ connector }) {
  return (
    <group position={[connector.x, 0, connector.z]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.025, 0]}>
        <planeGeometry args={[4, 2]} />
        <meshBasicMaterial color="#64748b" transparent opacity={0.35} />
      </mesh>
      <Html position={[0, 2.2, 0]} center distanceFactor={28}>
        <div className="bg-indigo-900/90 text-indigo-100 px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap shadow border border-indigo-400 pointer-events-none select-none">
          {connector.name}
        </div>
      </Html>
    </group>
  );
}

function ElevatorPad({ ev, isNear }) {
  return (
    <group position={[ev.x, 0, ev.z]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
        <ringGeometry args={[1.2, 1.8, 32]} />
        <meshBasicMaterial color={isNear ? '#16a34a' : '#10b981'} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 1.5, 0]}>
        <cylinderGeometry args={[1.2, 1.2, 3, 24, 1, true]} />
        <meshStandardMaterial
          color="#10b981"
          transparent
          opacity={isNear ? 0.35 : 0.18}
          side={THREE.DoubleSide}
        />
      </mesh>
      <Html position={[0, 3.3, 0]} center distanceFactor={26}>
        <div className="bg-emerald-700 text-white px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap shadow-md pointer-events-none select-none">
          🛗 {ev.name}
        </div>
      </Html>
    </group>
  );
}

function PlayerController({
  currentFloor,
  unifiedFloorData,
  keysPressed,
  joystickInput,
  onNearElevatorChange,
  onCurrentBuildingChange,
  onInsideGroupChange,
  onFloorAutoSwitch,
  teleportTarget,
  isPortrait,
}) {
  const playerRef = useRef();
  const controlsRef = useRef();
  const { camera } = useThree();

  const posRef = useRef(new THREE.Vector3(0, 0, 38));
  const rotYRef = useRef(0);
  const lastBldgRef = useRef('');
  const lastGroupRef = useRef(null);
  const stairCooldownRef = useRef(0);

  useEffect(() => {
    camera.fov = isPortrait ? 56 : 45;
    camera.updateProjectionMatrix();
  }, [isPortrait, camera]);

  const isBlockedByRoomWall = (px, pz, room) => {
    const halfW = room.w / 2;
    const halfD = room.d / 2;
    const wallThick = 0.36;
    const halfDoor = room.doorWidth / 2;

    const minX = room.x - halfW;
    const maxX = room.x + halfW;
    const minZ = room.z - halfD;
    const maxZ = room.z + halfD;

    if (px < minX - wallThick || px > maxX + wallThick || pz < minZ - wallThick || pz > maxZ + wallThick) {
      return false;
    }

    if (px > minX + wallThick && px < maxX - wallThick && pz > minZ + wallThick && pz < maxZ - wallThick) {
      return false;
    }

    if (Math.abs(pz - minZ) <= wallThick && px >= minX - wallThick && px <= maxX + wallThick) {
      if (room.doorSide === 'north' && Math.abs(px - room.x) <= halfDoor) return false;
      return true;
    }
    if (Math.abs(pz - maxZ) <= wallThick && px >= minX - wallThick && px <= maxX + wallThick) {
      if (room.doorSide === 'south' && Math.abs(px - room.x) <= halfDoor) return false;
      return true;
    }
    if (Math.abs(px - minX) <= wallThick && pz >= minZ - wallThick && pz <= maxZ + wallThick) {
      if (room.doorSide === 'west' && Math.abs(pz - room.z) <= halfDoor) return false;
      return true;
    }
    if (Math.abs(px - maxX) <= wallThick && pz >= minZ - wallThick && pz <= maxZ + wallThick) {
      if (room.doorSide === 'east' && Math.abs(pz - room.z) <= halfDoor) return false;
      return true;
    }

    return false;
  };

  const checkCollision = (nextX, nextZ) => {
    const isPointInAnyZone = (px, pz) =>
      unifiedFloorData.buildingZones?.some(
        (z) => px >= z.minX && px <= z.maxX && pz >= z.minZ && pz <= z.maxZ
      );

    const wallMargin = 0.35;
    const isInsideWalkable =
      isPointInAnyZone(nextX, nextZ) &&
      isPointInAnyZone(nextX - wallMargin, nextZ) &&
      isPointInAnyZone(nextX + wallMargin, nextZ) &&
      isPointInAnyZone(nextX, nextZ - wallMargin) &&
      isPointInAnyZone(nextX, nextZ + wallMargin);

    if (!isInsideWalkable) return true;

    const margin = 0.45;
    if (unifiedFloorData.voids) {
      for (const v of unifiedFloorData.voids) {
        if (
          nextX > v.x - v.w / 2 - margin &&
          nextX < v.x + v.w / 2 + margin &&
          nextZ > v.z - v.d / 2 - margin &&
          nextZ < v.z + v.d / 2 + margin
        ) {
          return true;
        }
      }
    }

    for (const room of unifiedFloorData.rooms) {
      if (isBlockedByRoomWall(nextX, nextZ, room)) {
        return true;
      }
    }
    return false;
  };

  const resolveSafePosition = (targetX, targetZ) => {
    if (!checkCollision(targetX, targetZ)) return [targetX, targetZ];
    for (let radius = 1; radius <= 25; radius += 1) {
      for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 8) {
        const testX = targetX + Math.cos(angle) * radius;
        const testZ = targetZ + Math.sin(angle) * radius;
        if (!checkCollision(testX, testZ)) return [testX, testZ];
      }
    }
    return [0, 38];
  };

  useEffect(() => {
    const rawTarget = teleportTarget ? teleportTarget.coords : [0, 38];
    const [safeX, safeZ] = resolveSafePosition(rawTarget[0], rawTarget[1]);

    posRef.current.set(safeX, 0, safeZ);
    if (playerRef.current) {
      playerRef.current.position.set(safeX, 0, safeZ);
    }
    camera.position.set(safeX, isPortrait ? 19 : 16, safeZ + (isPortrait ? 20 : 18));
    if (controlsRef.current) {
      controlsRef.current.target.set(safeX, 1, safeZ);
      controlsRef.current.update();
    }
  }, [teleportTarget, camera]);

  useFrame((_, delta) => {
    if (stairCooldownRef.current > 0) {
      stairCooldownRef.current -= delta;
    }

    const baseSpeed = 16 * Math.min(delta, 0.05);
    let inputForward = 0;
    let inputRight = 0;

    if (keysPressed.current['KeyW'] || keysPressed.current['ArrowUp']) inputForward += 1;
    if (keysPressed.current['KeyS'] || keysPressed.current['ArrowDown']) inputForward -= 1;
    if (keysPressed.current['KeyD'] || keysPressed.current['ArrowRight']) inputRight += 1;
    if (keysPressed.current['KeyA'] || keysPressed.current['ArrowLeft']) inputRight -= 1;

    if (inputForward === 0 && inputRight === 0 && joystickInput.current) {
      inputRight = joystickInput.current.x;
      inputForward = joystickInput.current.y;
    }

    const inputMagnitude = Math.min(1, Math.hypot(inputForward, inputRight));

    if (inputMagnitude > 0.05) {
      const camDir = new THREE.Vector3();
      camera.getWorldDirection(camDir);
      camDir.y = 0;
      camDir.normalize();

      const camRight = new THREE.Vector3();
      camRight.crossVectors(camDir, new THREE.Vector3(0, 1, 0)).normalize();

      const moveVec = new THREE.Vector3()
        .addScaledVector(camDir, inputForward)
        .addScaledVector(camRight, inputRight)
        .normalize()
        .multiplyScalar(baseSpeed * inputMagnitude);

      const nextX = posRef.current.x + moveVec.x;
      const nextZ = posRef.current.z + moveVec.z;

      let movedX = 0;
      let movedZ = 0;
      if (!checkCollision(nextX, posRef.current.z)) {
        posRef.current.x = nextX;
        movedX = moveVec.x;
      }
      if (!checkCollision(posRef.current.x, nextZ)) {
        posRef.current.z = nextZ;
        movedZ = moveVec.z;
      }

      const targetAngle = Math.atan2(moveVec.x, moveVec.z);
      rotYRef.current = targetAngle;

      if (playerRef.current) {
        playerRef.current.position.copy(posRef.current);
        playerRef.current.rotation.y = rotYRef.current;
      }

      camera.position.x += movedX;
      camera.position.z += movedZ;
      if (controlsRef.current) {
        controlsRef.current.target.set(posRef.current.x, 1, posRef.current.z);
      }
    }

    // 屋外階段B（X: -3〜+5, Z: -26〜-14）での高さ追従＆1F⇔2F正門デッキ自動切替
    let playerY = 0;
    const px = posRef.current.x;
    const pz = posRef.current.z;

    if (currentFloor === '1F' && px >= -3 && px <= 5 && pz <= -14 && pz >= -26) {
      const progress = (-14 - pz) / 12;
      playerY = progress * 3.55;
      if (pz <= -25.4 && stairCooldownRef.current <= 0) {
        stairCooldownRef.current = 1.0;
        posRef.current.z = -27.5;
        onFloorAutoSwitch('2F');
      }
    } else if (currentFloor === '2F' && px >= -3 && px <= 5 && pz >= -26 && pz <= -23.5 && stairCooldownRef.current <= 0) {
      stairCooldownRef.current = 1.0;
      posRef.current.z = -23.5;
      onFloorAutoSwitch('1F');
    }

    if (playerRef.current) {
      playerRef.current.position.y = playerY;
    }

    const currentZone = unifiedFloorData.buildingZones?.find(
      (z) => px >= z.minX && px <= z.maxX && pz >= z.minZ && pz <= z.maxZ
    );
    const bldgName = currentZone ? currentZone.name : '';
    if (bldgName && bldgName !== lastBldgRef.current) {
      lastBldgRef.current = bldgName;
      onCurrentBuildingChange(bldgName);
    }

    const insideGroup = currentZone && !currentZone.isOutdoor ? currentZone.bldgGroup : null;
    if (insideGroup !== lastGroupRef.current) {
      lastGroupRef.current = insideGroup;
      onInsideGroupChange(insideGroup);
    }

    let foundEv = null;
    for (const ev of unifiedFloorData.elevators) {
      const dist = Math.hypot(px - ev.x, pz - ev.z);
      if (dist < 2.8) {
        foundEv = ev;
        break;
      }
    }
    onNearElevatorChange(foundEv);
  });

  return (
    <>
      <group ref={playerRef} position={[0, 0, 38]}>
        <mesh position={[0, 0.85, 0]} castShadow>
          <capsuleGeometry args={[0.35, 0.7, 8, 16]} />
          <meshStandardMaterial color="#2563eb" />
        </mesh>
        <mesh position={[0, 1.75, 0]} castShadow>
          <sphereGeometry args={[0.32, 16, 16]} />
          <meshStandardMaterial color="#fde68a" />
        </mesh>
        <mesh position={[0, 1.78, 0.25]}>
          <boxGeometry args={[0.36, 0.14, 0.15]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
          <ringGeometry args={[0.45, 0.6, 24]} />
          <meshBasicMaterial color="#2563eb" />
        </mesh>
      </group>

      <OrbitControls
        ref={controlsRef}
        enableDamping
        dampingFactor={0.08}
        minDistance={5}
        maxDistance={75}
        maxPolarAngle={Math.PI / 2.02}
      />
    </>
  );
}

export default function ThreeCampusViewer({ onClose }) {
  const [currentFloor, setCurrentFloor] = useState('1F');
  const [currentSubBldg, setCurrentSubBldg] = useState('1号館');
  const [insideGroup, setInsideGroup] = useState('1236');
  const [nearElevator, setNearElevator] = useState(null);
  const [teleportTarget, setTeleportTarget] = useState({ coords: [0, 38], ts: 1 });

  const [isMobile, setIsMobile] = useState(false);
  const [isPortrait, setIsPortrait] = useState(false);
  const [showFloorMenu, setShowFloorMenu] = useState(false);

  const keysPressed = useRef({});
  const joystickInput = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const checkViewport = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      setIsMobile(w < 768 || 'ontouchstart' in window);
      setIsPortrait(h > w);
    };
    checkViewport();
    window.addEventListener('resize', checkViewport);
    return () => window.removeEventListener('resize', checkViewport);
  }, []);

  const allFloors = ['1F', '2F', '3F', '4F', '5F', '6F', '7F', '8F', '9F', '10F', '11F', '12F', '13F'];

  // 全建物・中庭・ピロティ通り道・モニュメント広場・大通り横断歩道・5号館・4号館を連続空間に統合
  const unifiedFloorData = useMemo(() => {
    const f1236 = CAMPUS_3D_BUILDINGS['area-1236']?.floors?.[currentFloor];
    const f4 = CAMPUS_3D_BUILDINGS['area-4']?.floors?.[currentFloor];
    const f5 = CAMPUS_3D_BUILDINGS['area-5']?.floors?.[currentFloor];

    const buildingZones = [];
    const rawRooms = [];
    const elevators = [];
    const connectors = [];
    const voids = [];

    if (f1236) {
      f1236.buildingZones?.forEach((z) => buildingZones.push({ ...z, bldgGroup: '1236' }));
      f1236.rooms?.forEach((r) => rawRooms.push({ ...r, bldgGroup: '1236' }));
      f1236.elevators?.forEach((e) => elevators.push({ ...e }));
      f1236.connectors?.forEach((c) => connectors.push({ ...c }));
      f1236.voids?.forEach((v) => voids.push({ ...v }));
    }

    // 1F：屋外中庭 ＋ 屋外階段B ＋ 左側ピロティ通り道 ＋ モニュメント広場 ＋ 横断歩道（5号館正面直結）
    if (currentFloor === '1F') {
      // 中庭（パティオ）＋屋外階段Bの階段部分
      buildingZones.push({
        name: '中庭（パティオ）・屋外階段B',
        minX: -14,
        maxX: 6,
        minZ: -26,
        maxZ: 26,
        floorColor: '#e7e5e4',
        isOutdoor: true,
      });
      // 屋外階段Bの西側（階段上から1号館を向いて右側）のピロティ通り道
      buildingZones.push({
        name: '正門デッキ下ピロティ通り道',
        minX: -14,
        maxX: -3,
        minZ: -34,
        maxZ: -12,
        floorColor: '#f5f5f4',
        isOutdoor: true,
      });
      // モニュメント広場（2号館北側〜大通りまで開放）
      buildingZones.push({
        name: 'モニュメント広場（5号館・4号館方面）',
        minX: -44,
        maxX: -14,
        minZ: -44,
        maxZ: -12,
        floorColor: '#f5f5f4',
        isOutdoor: true,
      });
      // 大通り横断歩道（モニュメント広場から5号館正面入口へ直結：Z = -32〜-20）
      buildingZones.push({
        name: '大通り横断歩道（5号館正面）',
        minX: -66,
        maxX: -44,
        minZ: -32,
        maxZ: -20,
        floorColor: '#475569',
        isOutdoor: true,
      });
      // 大通り西側歩道（5号館前）
      buildingZones.push({
        name: '西側歩道（5号館前）',
        minX: -72,
        maxX: -62,
        minZ: -56,
        maxZ: -4,
        floorColor: '#d6d3d1',
        isOutdoor: true,
      });
      // 5号館と4号館の間の通路（案内板準拠）
      buildingZones.push({
        name: '5号館・4号館 間通路',
        minX: -124,
        maxX: -116,
        minZ: -56,
        maxZ: -4,
        floorColor: '#d6d3d1',
        isOutdoor: true,
      });
      // 北側センタープロムナード歩道（5号館・4号館それぞれの1F入口へ直結）
      buildingZones.push({
        name: 'センタープロムナード歩道',
        minX: -182,
        maxX: -62,
        minZ: -56,
        maxZ: -46,
        floorColor: '#e7e5e4',
        isOutdoor: true,
      });

      connectors.push(
        { name: '屋外階段B（2F正門デッキへ）', x: 1, z: -15 },
        { name: 'ピロティ通り道（5号館方面へ）', x: -8.5, z: -22 },
        { name: '横断歩道（5号館正面入口）', x: -53, z: -26 }
      );
    }

    // 2F：正門エントランスデッキから大通りをまたぐ空中歩行者デッキ（5号館・4号館 2Fへ直結）
    if (currentFloor === '2F') {
      buildingZones.push({
        name: '空中歩行者デッキ（正門デッキ ⇔ 5号館・4号館）',
        minX: -72,
        maxX: -42,
        minZ: -32,
        maxZ: -20,
        floorColor: '#cbd5e1',
        isOutdoor: true,
      });
      buildingZones.push({
        name: '2F連絡デッキ（5号館 ⇔ 4号館）',
        minX: -124,
        maxX: -116,
        minZ: -34,
        maxZ: -22,
        floorColor: '#cbd5e1',
        isOutdoor: true,
      });
      connectors.push({
        name: '空中歩行者デッキ（5号館・4号館 2F直結）',
        x: -57,
        z: -26,
      });
    }

    // 5号館
    if (f5) {
      f5.buildingZones?.forEach((z) =>
        buildingZones.push({
          ...z,
          minX: z.minX + BLDG5_OFFSET.x,
          maxX: z.maxX + BLDG5_OFFSET.x,
          minZ: z.minZ + BLDG5_OFFSET.z,
          maxZ: z.maxZ + BLDG5_OFFSET.z,
          bldgGroup: '5',
        })
      );
      f5.rooms?.forEach((r) =>
        rawRooms.push({
          ...r,
          x: r.x + BLDG5_OFFSET.x,
          z: r.z + BLDG5_OFFSET.z,
          bldgGroup: '5',
        })
      );
      f5.elevators?.forEach((e) =>
        elevators.push({
          ...e,
          x: e.x + BLDG5_OFFSET.x,
          z: e.z + BLDG5_OFFSET.z,
        })
      );
      f5.voids?.forEach((v) =>
        voids.push({
          ...v,
          x: v.x + BLDG5_OFFSET.x,
          z: v.z + BLDG5_OFFSET.z,
        })
      );
    }

    // 4号館
    if (f4) {
      f4.buildingZones?.forEach((z) =>
        buildingZones.push({
          ...z,
          minX: z.minX + BLDG4_OFFSET.x,
          maxX: z.maxX + BLDG4_OFFSET.x,
          minZ: z.minZ + BLDG4_OFFSET.z,
          maxZ: z.maxZ + BLDG4_OFFSET.z,
          bldgGroup: '4',
        })
      );
      f4.rooms?.forEach((r) =>
        rawRooms.push({
          ...r,
          x: r.x + BLDG4_OFFSET.x,
          z: r.z + BLDG4_OFFSET.z,
          bldgGroup: '4',
        })
      );
      f4.elevators?.forEach((e) =>
        elevators.push({
          ...e,
          x: e.x + BLDG4_OFFSET.x,
          z: e.z + BLDG4_OFFSET.z,
        })
      );
    }

    const connectedRooms = buildConnectedRooms(rawRooms, buildingZones);

    return {
      buildingZones,
      rooms: connectedRooms,
      elevators,
      connectors,
      voids,
    };
  }, [currentFloor]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      keysPressed.current[e.code] = true;
    };
    const handleKeyUp = (e) => {
      keysPressed.current[e.code] = false;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const handleSelectFloor = (targetFloor) => {
    setCurrentFloor(targetFloor);
    setNearElevator(null);
    setShowFloorMenu(false);
  };

  // クイック移動（ワープ）：クリックした館・エリアへ瞬時に移動
  const handleQuickJump = (area) => {
    if (area === '1-2-3-6') {
      setTeleportTarget({ coords: [0, 38], ts: Date.now() });
    } else if (area === 'patio') {
      setCurrentFloor('1F');
      setTeleportTarget({ coords: [-3, -10], ts: Date.now() });
    } else if (area === '5') {
      const targetFl = ['1F', '2F', '3F', '4F', '5F', '6F', '7F'].includes(currentFloor) ? currentFloor : '1F';
      setCurrentFloor(targetFl);
      setTeleportTarget({ coords: [BLDG5_OFFSET.x + 14, BLDG5_OFFSET.z], ts: Date.now() });
    } else if (area === '4') {
      const targetFl = ['2F', '3F', '4F', '5F'].includes(currentFloor) ? currentFloor : '2F';
      setCurrentFloor(targetFl);
      setTeleportTarget({ coords: [BLDG4_OFFSET.x + 16, BLDG4_OFFSET.z + 8], ts: Date.now() });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-sky-200 flex flex-col select-none overflow-hidden">
      {/* トップバー */}
      <div className="bg-slate-900/95 backdrop-blur-md text-white px-3 py-2 flex items-center justify-between border-b border-slate-700 z-10 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="bg-blue-600 text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full shrink-0">
            3D
          </span>
          <div className="truncate">
            <h2 className="font-bold text-xs sm:text-sm truncate">
              有明キャンパス 全館シームレス探索
            </h2>
            <p className="text-[10px] sm:text-xs text-emerald-300 font-semibold truncate">
              現在地：{currentSubBldg} / {currentFloor}
            </p>
          </div>
        </div>

        {/* ワンクリック移動ボタン */}
        <div className="hidden md:flex items-center gap-1.5 bg-slate-800 px-2 py-1 rounded-lg border border-slate-700">
          <span className="text-[10px] text-slate-400 mr-1">移動先:</span>
          <button
            onClick={() => handleQuickJump('1-2-3-6')}
            className="px-2 py-0.5 rounded bg-slate-700 hover:bg-blue-600 text-[11px] font-bold transition"
          >
            1・2・3・6号館
          </button>
          <button
            onClick={() => handleQuickJump('patio')}
            className="px-2 py-0.5 rounded bg-slate-700 hover:bg-amber-600 text-[11px] font-bold transition"
          >
            屋外階段B・5号館通路
          </button>
          <button
            onClick={() => handleQuickJump('5')}
            className="px-2 py-0.5 rounded bg-slate-700 hover:bg-blue-600 text-[11px] font-bold transition"
          >
            5号館
          </button>
          <button
            onClick={() => handleQuickJump('4')}
            className="px-2 py-0.5 rounded bg-slate-700 hover:bg-blue-600 text-[11px] font-bold transition"
          >
            4号館
          </button>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {isMobile && (
            <button
              onClick={() => setShowFloorMenu((prev) => !prev)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-600 text-xs font-bold text-slate-100 active:bg-slate-700"
            >
              階 ({currentFloor}) {showFloorMenu ? '▲' : '▼'}
            </button>
          )}
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-xs font-bold transition shadow"
          >
            ✕ 戻る
          </button>
        </div>
      </div>

      {/* スマホ用：ワープボタンバー */}
      {isMobile && (
        <div className="bg-slate-800/95 border-b border-slate-700 px-2 py-1.5 flex items-center justify-around gap-1 z-10">
          <button
            onClick={() => handleQuickJump('1-2-3-6')}
            className="flex-1 py-1 rounded bg-slate-700 active:bg-blue-600 text-[10px] text-white font-bold"
          >
            1・2・3・6号館
          </button>
          <button
            onClick={() => handleQuickJump('patio')}
            className="flex-1 py-1 rounded bg-slate-700 active:bg-amber-600 text-[10px] text-white font-bold"
          >
            階段B・通路
          </button>
          <button
            onClick={() => handleQuickJump('5')}
            className="flex-1 py-1 rounded bg-slate-700 active:bg-blue-600 text-[10px] text-white font-bold"
          >
            5号館
          </button>
          <button
            onClick={() => handleQuickJump('4')}
            className="flex-1 py-1 rounded bg-slate-700 active:bg-blue-600 text-[10px] text-white font-bold"
          >
            4号館
          </button>
        </div>
      )}

      {/* スマホ用 階数切り替えパネル */}
      {isMobile && showFloorMenu && (
        <div className="bg-slate-900/95 border-b border-slate-700 px-3 py-2.5 z-20 shadow-xl">
          <div className="flex flex-wrap gap-1.5">
            {allFloors.map((fl) => (
              <button
                key={fl}
                onClick={() => handleSelectFloor(fl)}
                className={`px-2.5 py-1.5 rounded text-xs font-bold transition ${
                  currentFloor === fl
                    ? 'bg-emerald-600 text-white shadow'
                    : 'bg-slate-800 text-slate-300 border border-slate-700'
                }`}
              >
                {fl}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 3D キャンバス */}
      <div className="relative flex-1 w-full h-full touch-none">
        <Canvas shadows camera={{ position: [0, 16, 56], fov: 45 }}>
          <color attach="background" args={['#bae6fd']} />
          <fog attach="fog" args={['#bae6fd', 150, 340]} />

          <ambientLight intensity={0.85} />
          <directionalLight
            position={[60, 100, 60]}
            intensity={1.1}
            castShadow
            shadow-mapSize={[2048, 2048]}
          />

          <CampusScenery currentFloor={currentFloor} insideGroup={insideGroup} />

          {/* 各棟・デッキ・通路の歩行可能床面 */}
          {unifiedFloorData.buildingZones?.map((zone, idx) => {
            const zw = zone.maxX - zone.minX;
            const zd = zone.maxZ - zone.minZ;
            const zx = (zone.minX + zone.maxX) / 2;
            const zz = (zone.minZ + zone.maxZ) / 2;
            return (
              <group key={`zone-${idx}`}>
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[zx, 0, zz]} receiveShadow>
                  <planeGeometry args={[zw, zd]} />
                  <meshStandardMaterial color={zone.floorColor || '#e2e8f0'} roughness={0.8} />
                </mesh>
                <gridHelper
                  args={[Math.max(zw, zd), Math.round(Math.max(zw, zd) / 4), '#94a3b8', '#cbd5e1']}
                  position={[zx, 0.01, zz]}
                />
                <Html position={[zx, 0.15, zone.minZ + 2]} center distanceFactor={36}>
                  <div className="text-slate-600/80 font-extrabold text-xs sm:text-sm tracking-widest pointer-events-none select-none whitespace-nowrap">
                    {zone.name}
                  </div>
                </Html>
              </group>
            );
          })}

          {unifiedFloorData.voids?.map((v, idx) => (
            <VoidBox key={`void-${idx}`} voidArea={v} />
          ))}

          {unifiedFloorData.connectors?.map((c, idx) => (
            <ConnectorSign key={`conn-${idx}`} connector={c} />
          ))}

          {unifiedFloorData.rooms.map((room) => (
            <RoomBox key={room.id} room={room} />
          ))}

          {unifiedFloorData.elevators.map((ev) => (
            <ElevatorPad key={ev.id} ev={ev} isNear={nearElevator?.id === ev.id} />
          ))}

          <PlayerController
            currentFloor={currentFloor}
            unifiedFloorData={unifiedFloorData}
            keysPressed={keysPressed}
            joystickInput={joystickInput}
            onNearElevatorChange={setNearElevator}
            onCurrentBuildingChange={setCurrentSubBldg}
            onInsideGroupChange={setInsideGroup}
            onFloorAutoSwitch={(nextFl) => setCurrentFloor(nextFl)}
            teleportTarget={teleportTarget}
            isPortrait={isPortrait}
          />
        </Canvas>

        {/* PC版：左上の操作ガイド & 階数クイック選択 */}
        {!isMobile && (
          <div className="absolute top-4 left-4 bg-slate-900/85 backdrop-blur-md text-white p-3.5 rounded-xl border border-slate-700 max-w-xs shadow-xl">
            <h3 className="text-xs font-bold text-blue-300 uppercase tracking-wider mb-1.5">
              操作方法
            </h3>
            <ul className="text-xs space-y-1 text-slate-200 mb-3">
              <li><span className="font-bold text-white">W A S D / 矢印キー</span>：移動（ドアから入室可）</li>
              <li><span className="font-bold text-white">マウスドラッグ</span>：視点回転</li>
              <li><span className="font-bold text-white">1F 屋外階段B</span>：歩くと自動で2F正門デッキへ</li>
              <li><span className="font-bold text-white">ピロティ通り道</span>：モニュメント広場→5号館直通</li>
            </ul>
            <div className="pt-2 border-t border-slate-700">
              <span className="text-[11px] text-slate-400 block mb-1.5">階数ダイレクト切替</span>
              <div className="flex flex-wrap gap-1">
                {allFloors.map((fl) => (
                  <button
                    key={fl}
                    onClick={() => handleSelectFloor(fl)}
                    className={`px-2 py-0.5 rounded text-xs font-bold transition ${
                      currentFloor === fl
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {fl}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* スマホ版：左下のバーチャルスティック */}
        {isMobile && (
          <div className="absolute bottom-6 left-5 z-20">
            <VirtualJoystick joystickRef={joystickInput} />
          </div>
        )}

        {/* エレベーター到達時の行き先選択パネル */}
        {nearElevator && (
          <div
            className={`z-30 bg-slate-900/95 backdrop-blur-md text-white border-2 border-emerald-500 shadow-2xl ${
              isMobile
                ? 'fixed bottom-4 left-3 right-3 p-3.5 rounded-2xl'
                : 'absolute bottom-8 left-1/2 -translate-x-1/2 p-4 rounded-2xl max-w-md w-full'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">🛗</span>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-emerald-300">
                    {nearElevator.name}
                  </h4>
                  <p className="text-[10px] sm:text-xs text-slate-300">
                    移動先の階をタップしてください
                  </p>
                </div>
              </div>
              <span className="text-[11px] bg-slate-800 px-2 py-0.5 rounded text-slate-300">
                現在 {currentFloor}
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5 mt-2">
              {nearElevator.targets.map((targetFl) => {
                const isCurrent = targetFl === currentFloor;
                return (
                  <button
                    key={targetFl}
                    disabled={isCurrent}
                    onClick={() => handleSelectFloor(targetFl)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      isCurrent
                        ? 'bg-slate-700 text-slate-400 cursor-default'
                        : 'bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white shadow'
                    }`}
                  >
                    {targetFl}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}