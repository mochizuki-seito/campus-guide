import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import { CAMPUS_3D_BUILDINGS } from '../data/campus3dData';

// 4号館・5号館のワールド座標オフセット（2号館側＝西側の大通り向こうに配置）
const BLDG4_OFFSET = { x: -116, z: 18 };
const BLDG5_OFFSET = { x: -116, z: -26 };

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

// 教室を外壁・隣室とピタッと密着させ、廊下側に入り口（ドア）を設定するヘルパー
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

  // 隣り合う教室同士の小さな隙間を埋めて密着させる
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

  // 廊下に面している辺を判定してドア開口を設定
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

// キャンパス外観・中庭・屋外大階段・2号館側大通り・4号館＆5号館シルエット
// ※プレイヤーが建物の中に入ると、その建物の外壁は自動で非表示になる！
function CampusScenery({ currentFloor, insideGroup }) {
  const floorNum = parseInt(currentFloor.replace('F', ''), 10) || 1;
  const groundY = -(floorNum - 1) * 3.4;

  const show1236Walls = insideGroup !== '1236';
  const show4Walls = insideGroup !== '4';
  const show5Walls = insideGroup !== '5';

  return (
    <group>
      {/* 広大な緑地ベース */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-45, groundY - 0.18, 0]} receiveShadow>
        <planeGeometry args={[560, 560]} />
        <meshStandardMaterial color="#86efac" roughness={0.95} />
      </mesh>

      {/* メインキャンパス（1・2・3・6号館）敷地舗装 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-5, groundY - 0.1, 0]} receiveShadow>
        <planeGeometry args={[102, 118]} />
        <meshStandardMaterial color="#d6d3d1" roughness={0.85} />
      </mesh>

      {/* 西側キャンパス（4・5号館）敷地舗装（2号館側・大通りの向こう） */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-116, groundY - 0.1, -4]} receiveShadow>
        <planeGeometry args={[68, 108]} />
        <meshStandardMaterial color="#d6d3d1" roughness={0.85} />
      </mesh>

      {/* =================================================================== */}
      {/* 1. 中庭（パティオ）のレンガ舗装遊歩道＆屋外大階段                    */}
      {/* =================================================================== */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-3, groundY - 0.03, 7]} receiveShadow>
        <planeGeometry args={[8.5, 38]} />
        <meshStandardMaterial color="#9a3412" roughness={0.85} />
      </mesh>

      {/* 中庭奥の屋外大階段（X=-9〜-1, Z=-14〜-2） */}
      <group position={[-5, groundY, -2]}>
        {Array.from({ length: 14 }).map((_, i) => {
          const stepY = (i + 0.5) * (3.4 / 14);
          const stepZ = -(i + 0.5) * (12 / 14);
          return (
            <mesh key={`stair-${i}`} position={[0, stepY, stepZ]} castShadow receiveShadow>
              <boxGeometry args={[7.8, 3.4 / 14, 12 / 14 + 0.15]} />
              <meshStandardMaterial color={i % 2 === 0 ? '#e7e5e4' : '#d6d3d1'} roughness={0.7} />
            </mesh>
          );
        })}
        <mesh position={[-4.0, 2.0, -6]} rotation={[0.275, 0, 0]}>
          <boxGeometry args={[0.35, 1.1, 12.6]} />
          <meshStandardMaterial color="#a8a29e" />
        </mesh>
        <mesh position={[4.0, 2.0, -6]} rotation={[0.275, 0, 0]}>
          <boxGeometry args={[0.35, 1.1, 12.6]} />
          <meshStandardMaterial color="#a8a29e" />
        </mesh>
      </group>

      {/* 中庭の並木道＆ベンチ */}
      {[-6, 1, 8, 15, 21].map((zPos, i) => (
        <React.Fragment key={`patio-tree-${i}`}>
          <CampusTree
            position={[-8.6, groundY, zPos]}
            scale={0.95}
            leafColor={i % 2 === 0 ? '#65a30d' : '#ca8a04'}
          />
          <CampusTree
            position={[2.6, groundY, zPos]}
            scale={0.95}
            leafColor={i % 2 === 0 ? '#4d7c0f' : '#a16207'}
          />
        </React.Fragment>
      ))}
      {[-2, 11, 19].map((zPos, idx) => (
        <group key={`bench-${idx}`} position={[-3, groundY, zPos]}>
          <mesh position={[-3.2, 0.25, 0]}>
            <boxGeometry args={[1.4, 0.5, 0.7]} />
            <meshStandardMaterial color="#78716c" />
          </mesh>
          <mesh position={[3.2, 0.25, 0]}>
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
          <group position={[-3, groundY, 26]}>
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
          <BrickArchFacade position={[-22, groundY, 26]} count={7} width={3.6} height={6.2} />
          <BrickArchFacade position={[18, groundY, 26]} count={8} width={3.6} height={6.2} />

          {/* 2号館・6号館の中庭側レンガアーチ回廊 */}
          <BrickArchFacade
            position={[-10, groundY, 8]}
            rotation={[0, Math.PI / 2, 0]}
            count={9}
            width={3.6}
            height={6.2}
          />
          <BrickArchFacade
            position={[4, groundY, 8]}
            rotation={[0, -Math.PI / 2, 0]}
            count={9}
            width={3.6}
            height={6.2}
          />

          {/* 屋外大階段の右隣の2連レンガアーチファサード */}
          <BrickArchFacade position={[7.5, groundY, -14]} count={3} width={3.6} height={6.2} />
          <mesh position={[7.5, groundY + 8.6, -14]}>
            <boxGeometry args={[11, 4.5, 0.5]} />
            <meshStandardMaterial color="#f5f5f4" />
          </mesh>

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
            <mesh position={[-3, 23, -0.1]}>
              <boxGeometry args={[10, 34, 0.6]} />
              <meshStandardMaterial color="#7dd3fc" transparent opacity={0.75} roughness={0.15} />
            </mesh>
            <mesh position={[-3, 22, -1.6]} castShadow>
              <cylinderGeometry args={[5.4, 5.4, 0.35, 24, 1, false, -Math.PI / 2, Math.PI]} />
              <meshStandardMaterial color="#e7e5e4" />
            </mesh>
            <mesh position={[-3, 41.5, -1.8]} castShadow>
              <cylinderGeometry args={[5.6, 5.6, 0.4, 24, 1, false, -Math.PI / 2, Math.PI]} />
              <meshStandardMaterial color="#e7e5e4" />
            </mesh>
          </group>
        </group>
      )}

      {/* =================================================================== */}
      {/* 3. 2号館側（西側 X=-68）の大通り・横断歩道・2F空中歩行者デッキ        */}
      {/* =================================================================== */}
      <group position={[-68, groundY - 0.05, 0]}>
        {/* 片側2車線の大通り（X = -77 〜 -59） */}
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[18, 280]} />
          <meshStandardMaterial color="#334155" roughness={0.9} />
        </mesh>
        {/* 中央分離帯（横断歩道部分は途切れさせる） */}
        <mesh position={[0, 0.15, -75]}>
          <boxGeometry args={[1.4, 0.3, 100]} />
          <meshStandardMaterial color="#15803d" />
        </mesh>
        <mesh position={[0, 0.15, 85]}>
          <boxGeometry args={[1.4, 0.3, 105]} />
          <meshStandardMaterial color="#15803d" />
        </mesh>

        {/* 1F地上徒歩ルート：4号館方面 横断歩道（Z=22） */}
        {[-6, -3, 0, 3, 6].map((zOff, i) => (
          <mesh key={`cw1-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 22 + zOff]}>
            <planeGeometry args={[16, 1.3]} />
            <meshBasicMaterial color="#f8fafc" />
          </mesh>
        ))}

        {/* 1F地上徒歩ルート：5号館方面 横断歩道（Z=-14） */}
        {[-4, -1.5, 1, 3.5].map((zOff, i) => (
          <mesh key={`cw2-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, -14 + zOff]}>
            <planeGeometry args={[16, 1.2]} />
            <meshBasicMaterial color="#f8fafc" />
          </mesh>
        ))}

        {/* 道路沿いの街路樹 */}
        {[-65, -45, -28, 4, 42, 62].map((z, idx) => (
          <React.Fragment key={`road-tree-${idx}`}>
            <CampusTree position={[-10.5, 0, z]} scale={1.15} leafColor="#3f6212" />
            <CampusTree position={[10.5, 0, z]} scale={1.15} leafColor="#4d7c0f" />
          </React.Fragment>
        ))}
      </group>

      {/* 2F高さ（groundY + 3.4）で大通りをまたぐ空中歩行者デッキ（2号館 2F 正門デッキ ⇔ 4号館 2F） */}
      <group position={[-64, groundY + 3.4, 21]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[48, 0.4, 12]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.65, 5.8]}>
          <boxGeometry args={[48, 0.9, 0.15]} />
          <meshStandardMaterial color="#94a3b8" />
        </mesh>
        <mesh position={[0, 0.65, -5.8]}>
          <boxGeometry args={[48, 0.9, 0.15]} />
          <meshStandardMaterial color="#94a3b8" />
        </mesh>
      </group>

      {/* =================================================================== */}
      {/* 4. 4号館の外観（屋外にいるときのみ表示・4号館に入ると自動で消える）      */}
      {/* =================================================================== */}
      {show4Walls && (
        <group position={[BLDG4_OFFSET.x, groundY, BLDG4_OFFSET.z]}>
          {/* 4号館 南側外壁（5階建て） */}
          <mesh position={[0, 8.5, 18.2]} castShadow>
            <boxGeometry args={[56, 17, 0.6]} />
            <meshStandardMaterial color="#f5f5f4" />
          </mesh>
          <mesh position={[0, 3.0, 18.3]}>
            <boxGeometry args={[56.2, 6.0, 0.65]} />
            <meshStandardMaterial color="#9a3412" />
          </mesh>
          {/* 4号館 西側外壁 */}
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

      {/* =================================================================== */}
      {/* 5. 5号館の外観（屋外にいるときのみ表示・5号館に入ると自動で消える）      */}
      {/* =================================================================== */}
      {show5Walls && (
        <group position={[BLDG5_OFFSET.x, groundY, BLDG5_OFFSET.z]}>
          {/* 5号館 北・西の外壁（7階建て） */}
          <mesh position={[0, 12, -22.2]} castShadow>
            <boxGeometry args={[44, 24, 0.6]} />
            <meshStandardMaterial color="#f5f5f4" />
          </mesh>
          <mesh position={[-22.2, 12, 0]} castShadow>
            <boxGeometry args={[0.6, 24, 44]} />
            <meshStandardMaterial color="#f5f5f4" />
          </mesh>
          <mesh position={[0, 3.0, -22.3]}>
            <boxGeometry args={[44.2, 6.0, 0.65]} />
            <meshStandardMaterial color="#9a3412" />
          </mesh>
        </group>
      )}

      {/* 周囲の公園・緑地（3号館北側・6号館東側水の科学館方面） */}
      {[-25, -10, 5, 20, 32].map((x, i) => (
        <CampusTree key={`park-n-${i}`} position={[x, groundY, -72 - (i % 2) * 7]} scale={1.3} leafColor="#15803d" />
      ))}
      {[-38, -20, -2, 16, 34].map((z, i) => (
        <CampusTree key={`park-e-${i}`} position={[56 + (i % 2) * 5, groundY, z]} scale={1.25} leafColor="#15803d" />
      ))}
    </group>
  );
}

// 入り口（ドア開口）付きの部屋立体モデル（中に入って歩き回れる）
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

    // 1F中庭の屋外大階段での高さ追従＆1F⇔2F自動切替
    let playerY = 0;
    const px = posRef.current.x;
    const pz = posRef.current.z;

    if (currentFloor === '1F' && px >= -9 && px <= -1 && pz <= -2 && pz >= -14) {
      const progress = (-2 - pz) / 12;
      playerY = progress * 3.4;
      if (pz <= -13.4 && stairCooldownRef.current <= 0) {
        stairCooldownRef.current = 1.0;
        posRef.current.z = -15.2;
        onFloorAutoSwitch('2F');
      }
    } else if (currentFloor === '2F' && px >= -9 && px <= -1 && pz >= -14 && pz <= -11.5 && stairCooldownRef.current <= 0) {
      stairCooldownRef.current = 1.0;
      posRef.current.z = -11.5;
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
  const [isMobileFloorOpen, setIsMobileFloorOpen] = useState(false);

  const keysPressed = useRef({});
  const joystickInput = useRef({ x: 0, y: 0 });

  const allFloors = ['1F', '2F', '3F', '4F', '5F', '6F', '7F', '8F', '9F', '10F', '11F', '12F', '13F'];

  useEffect(() => {
    const checkViewport = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const isTouch = window.matchMedia('(pointer: coarse)').matches;
      setIsMobile(isTouch || w < 768);
      setIsPortrait(h > w);
    };

    checkViewport();
    window.addEventListener('resize', checkViewport);
    window.addEventListener('orientationchange', checkViewport);
    return () => {
      window.removeEventListener('resize', checkViewport);
      window.removeEventListener('orientationchange', checkViewport);
    };
  }, []);

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

  // 全号館（1・2・3・6号館 ＋ 2号館側の4号館・5号館 ＋ 屋外通路・歩行者デッキ）を1つの空間に統合
  const unifiedFloorData = useMemo(() => {
    const d1236 = CAMPUS_3D_BUILDINGS['area-1236'].floors[currentFloor];
    const d4 = CAMPUS_3D_BUILDINGS['area-4'].floors[currentFloor];
    const d5 = CAMPUS_3D_BUILDINGS['area-5'].floors[currentFloor];

    const zones = [];
    const rawRooms = [];
    const voids = [];
    const connectors = [];
    const elevators = [];

    // 1. 1・2・3・6号館のデータ統合
    if (d1236) {
      d1236.buildingZones?.forEach((z) => {
        zones.push({ ...z, bldgGroup: '1236', isOutdoor: z.name === 'キャンパスデッキ' });
      });
      d1236.rooms?.forEach((r) => rawRooms.push({ ...r }));
      d1236.voids?.forEach((v) => voids.push({ ...v }));
      d1236.connectors?.forEach((c) => connectors.push({ ...c }));
      d1236.elevators?.forEach((ev) => elevators.push({ ...ev }));
    }

    // 2. 4号館のデータ統合（2号館側＝西側へ配置）
    if (d4) {
      d4.buildingZones?.forEach((z) =>
        zones.push({
          ...z,
          minX: z.minX + BLDG4_OFFSET.x,
          maxX: z.maxX + BLDG4_OFFSET.x,
          minZ: z.minZ + BLDG4_OFFSET.z,
          maxZ: z.maxZ + BLDG4_OFFSET.z,
          bldgGroup: '4',
          isOutdoor: false,
        })
      );
      d4.rooms?.forEach((r) =>
        rawRooms.push({ ...r, x: r.x + BLDG4_OFFSET.x, z: r.z + BLDG4_OFFSET.z })
      );
      d4.elevators?.forEach((ev) =>
        elevators.push({ ...ev, x: ev.x + BLDG4_OFFSET.x, z: ev.z + BLDG4_OFFSET.z })
      );
    } else if (currentFloor === '1F') {
      // 4号館 1F地上エントランス（横断歩道から4号館EVへ徒歩接続）
      zones.push({
        name: '4号館 1Fエントランス',
        minX: -132,
        maxX: -88,
        minZ: 14,
        maxZ: 32,
        floorColor: '#fef3c7',
        bldgGroup: '4',
        isOutdoor: false,
      });
      elevators.push({
        id: 'ev-4-1f',
        name: '4号館 EV（2F〜5F）',
        x: -113,
        z: 14,
        targets: ['2F', '3F', '4F', '5F'],
      });
    }

    // 3. 5号館のデータ統合（4号館の北側・3号館の西側へ配置）
    if (d5) {
      d5.buildingZones?.forEach((z) =>
        zones.push({
          ...z,
          minX: z.minX + BLDG5_OFFSET.x,
          maxX: z.maxX + BLDG5_OFFSET.x,
          minZ: z.minZ + BLDG5_OFFSET.z,
          maxZ: z.maxZ + BLDG5_OFFSET.z,
          bldgGroup: '5',
          isOutdoor: false,
        })
      );
      d5.rooms?.forEach((r) =>
        rawRooms.push({ ...r, x: r.x + BLDG5_OFFSET.x, z: r.z + BLDG5_OFFSET.z })
      );
      d5.voids?.forEach((v) =>
        voids.push({ ...v, x: v.x + BLDG5_OFFSET.x, z: v.z + BLDG5_OFFSET.z })
      );
      d5.elevators?.forEach((ev) =>
        elevators.push({ ...ev, x: ev.x + BLDG5_OFFSET.x, z: ev.z + BLDG5_OFFSET.z })
      );
    }

    // 4. 屋外徒歩ルート・中庭・2号館側大通り横断歩道・2F空中歩行者デッキ
    if (currentFloor === '1F') {
      zones.push(
        // 1F中庭＆屋外大階段ゾーン
        {
          name: '中庭（パティオ）・屋外大階段',
          minX: -12,
          maxX: 6,
          minZ: -16,
          maxZ: 26,
          floorColor: '#e7e5e4',
          bldgGroup: null,
          isOutdoor: true,
        },
        // 2号館西側歩道
        {
          name: '2号館西側遊歩道',
          minX: -59,
          maxX: -40,
          minZ: -20,
          maxZ: 34,
          floorColor: '#e2e8f0',
          bldgGroup: null,
          isOutdoor: true,
        },
        // 4号館方面への横断歩道（Z=16〜28）
        {
          name: '大通り横断歩道（4号館方面）',
          minX: -88,
          maxX: -59,
          minZ: 16,
          maxZ: 28,
          floorColor: '#cbd5e1',
          bldgGroup: null,
          isOutdoor: true,
        },
        // 5号館方面への横断歩道（Z=-20〜-8）
        {
          name: '大通り横断歩道（5号館方面）',
          minX: -94,
          maxX: -59,
          minZ: -20,
          maxZ: -8,
          floorColor: '#cbd5e1',
          bldgGroup: null,
          isOutdoor: true,
        },
        // 西側キャンパス（4号館⇔5号館の連絡遊歩道）
        {
          name: '西側キャンパス遊歩道',
          minX: -108,
          maxX: -86,
          minZ: -20,
          maxZ: 22,
          floorColor: '#e2e8f0',
          bldgGroup: null,
          isOutdoor: true,
        }
      );

      connectors.push(
        { name: '▲ 屋外大階段（2Fデッキへ）', x: -5, z: -3 },
        { name: '◀ 横断歩道で4号館・5号館へ徒歩移動', x: -46, z: 22 },
        { name: '1・2・3・6号館方面 ▶', x: -88, z: 22 }
      );
    }

    if (currentFloor === '2F') {
      zones.push(
        // 2号館2F エントランスデッキ・正門から大通りを渡って4号館2Fへ直結する空中歩行者デッキ
        {
          name: 'エントランスデッキ・歩行者デッキ（4号館連絡）',
          minX: -88,
          maxX: -40,
          minZ: 15,
          maxZ: 27,
          floorColor: '#e0f2fe',
          bldgGroup: null,
          isOutdoor: true,
        }
      );
      connectors.push(
        { name: '▼ 屋外大階段（1F中庭へ下りる）', x: -5, z: -13 },
        { name: '◀ 正門・歩行者デッキで4号館 2Fへ徒歩移動', x: -45, z: 21 },
        { name: '2号館・1号館方面 ▶', x: -86, z: 21 }
      );
    }

    const connectedRooms = buildConnectedRooms(rawRooms, zones);

    return {
      buildingZones: zones,
      rooms: connectedRooms,
      voids,
      connectors,
      elevators,
    };
  }, [currentFloor]);

  // 上部エリアボタン（ワンタップ移動）
  const handleJumpToBuilding = (group) => {
    setIsMobileFloorOpen(false);
    setNearElevator(null);
    if (group === '1236') {
      setTeleportTarget({ coords: [0, 38], ts: Date.now() });
    } else if (group === '4') {
      if (currentFloor === '1F' || parseInt(currentFloor, 10) > 5) {
        setCurrentFloor('2F');
      }
      setTeleportTarget({ coords: [BLDG4_OFFSET.x + 16, BLDG4_OFFSET.z + 8], ts: Date.now() });
    } else if (group === '5') {
      if (parseInt(currentFloor, 10) > 7) {
        setCurrentFloor('1F');
      }
      setTeleportTarget({ coords: [BLDG5_OFFSET.x - 12, BLDG5_OFFSET.z + 8], ts: Date.now() });
    }
  };

  // フロアごとのクイック移動スポット
  const getQuickSpots = () => {
    const floorNum = parseInt(currentFloor.replace('F', ''), 10);
    if (floorNum === 1) {
      return [
        { name: '1号館 エントランス', coords: [0, 38] },
        { name: '中庭・屋外大階段前', coords: [-5, 4] },
        { name: '2号館 図書館前', coords: [-26, 20] },
        { name: '3号館 学生ホール・食堂', coords: [4, -34] },
        { name: '横断歩道（2号館側→4・5号館）', coords: [-46, 22] },
        { name: '4号館 1Fエントランス', coords: [-104, 22] },
        { name: '5号館 1F学生ホール', coords: [BLDG5_OFFSET.x - 12, BLDG5_OFFSET.z + 8] },
      ];
    }
    if (floorNum === 2) {
      return [
        { name: '1号館 2F廊下', coords: [0, 38] },
        { name: 'キャンパスデッキ', coords: [-3, 6] },
        { name: '正門・歩行者デッキ', coords: [-64, 21] },
        { name: '4号館 学生ホール', coords: [BLDG4_OFFSET.x + 16, BLDG4_OFFSET.z + 8] },
        { name: '5号館 2Fホール', coords: [BLDG5_OFFSET.x, BLDG5_OFFSET.z - 10] },
        { name: '3号館 ロハスカフェ前', coords: [14, -42] },
      ];
    }
    if (floorNum <= 5) {
      return [
        { name: `1号館 ${floorNum}F廊下`, coords: [0, 38] },
        { name: `2号館 ${floorNum}F通路`, coords: [-26, 8] },
        { name: `6号館 ${floorNum}Fホール`, coords: [15, 2] },
        { name: `4号館 ${floorNum}F`, coords: [BLDG4_OFFSET.x, BLDG4_OFFSET.z + 4] },
        { name: `5号館 ${floorNum}F`, coords: [BLDG5_OFFSET.x, BLDG5_OFFSET.z - 10] },
      ];
    }
    if (floorNum <= 7) {
      return [
        { name: `1号館 ${floorNum}F`, coords: [0, 38] },
        { name: `5号館 ${floorNum}F`, coords: [BLDG5_OFFSET.x, BLDG5_OFFSET.z - 8] },
      ];
    }
    return [
      { name: '1号館 西側エリア', coords: [-28, 38] },
      { name: '1号館 中央EV前', coords: [4, 38] },
      { name: '1号館 東側エリア', coords: [25, 38] },
    ];
  };

  return (
    <div className="fixed inset-0 bg-sky-200 z-50 flex flex-col font-sans select-none overflow-hidden touch-none">
      {/* 上部ナビゲーションバー */}
      {isMobile ? (
        <div className="bg-slate-900/95 border-b border-slate-800 px-3 py-2 flex flex-col gap-2 text-white z-20">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="bg-blue-600 text-[11px] px-2 py-0.5 rounded font-bold shrink-0">
                3D
              </span>
              <span className="text-amber-300 font-bold text-sm truncate">
                {currentSubBldg} {currentFloor}
              </span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => setTeleportTarget({ coords: [0, 38], ts: Date.now() })}
                className="px-2.5 py-1 bg-slate-800 active:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700"
              >
                初期位置
              </button>
              <button
                onClick={onClose}
                className="px-2.5 py-1 bg-rose-600 active:bg-rose-700 text-white text-xs font-bold rounded-lg"
              >
                2Dへ戻る ✕
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700">
            <button
              onClick={() => handleJumpToBuilding('4')}
              className={`py-1.5 rounded-lg text-xs font-bold transition text-center ${
                insideGroup === '4'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-300 active:bg-slate-700'
              }`}
            >
              4号館（西側）
            </button>
            <button
              onClick={() => handleJumpToBuilding('5')}
              className={`py-1.5 rounded-lg text-xs font-bold transition text-center ${
                insideGroup === '5'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-300 active:bg-slate-700'
              }`}
            >
              5号館（西側）
            </button>
            <button
              onClick={() => handleJumpToBuilding('1236')}
              className={`py-1.5 rounded-lg text-xs font-bold transition text-center ${
                insideGroup === '1236'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-300 active:bg-slate-700'
              }`}
            >
              1・2・3・6号館
            </button>
          </div>
        </div>
      ) : (
        <div className="px-4 py-3 bg-slate-900/95 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 text-white z-20">
          <div>
            <h2 className="text-base md:text-lg font-bold flex items-center gap-2">
              <span className="bg-blue-600 text-xs px-2 py-0.5 rounded">3Dウォーク</span>
              <span className="text-amber-300">現在地: {currentSubBldg} {currentFloor}</span>
            </h2>
            <p className="text-[11px] text-slate-400">
              WASDキーで移動 / 入り口から教室入室可 / 2号館側の歩行者デッキ・横断歩道で4・5号館へ徒歩移動可
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-800 p-1 rounded-xl border border-slate-700">
            <button
              onClick={() => handleJumpToBuilding('4')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                insideGroup === '4'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-300 hover:bg-slate-700'
              }`}
            >
              4号館（西側）
            </button>
            <button
              onClick={() => handleJumpToBuilding('5')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                insideGroup === '5'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-300 hover:bg-slate-700'
              }`}
            >
              5号館（西側）
            </button>
            <button
              onClick={() => handleJumpToBuilding('1236')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                insideGroup === '1236'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-300 hover:bg-slate-700'
              }`}
            >
              1・2・3・6号館
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setTeleportTarget({ coords: [0, 38], ts: Date.now() })}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg border border-slate-700"
            >
              初期位置へ
            </button>
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition"
            >
              2Dマップへ戻る ✕
            </button>
          </div>
        </div>
      )}

      {/* 3Dメインビューポート */}
      <div className="flex-1 relative touch-none">
        <Canvas shadows camera={{ position: [0, 16, 54], fov: isPortrait ? 56 : 45 }}>
          <color attach="background" args={['#bae6fd']} />
          <fog attach="fog" args={['#e0f2fe', 110, 260]} />

          <hemisphereLight args={['#f0f9ff', '#bbf7d0', 0.85]} />
          <directionalLight
            position={[35, 65, 30]}
            intensity={1.15}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            shadow-camera-left={-150}
            shadow-camera-right={80}
            shadow-camera-top={80}
            shadow-camera-bottom={-80}
          />

          {/* キャンパス外観・中庭・屋外大階段・2号館側大通り・歩行者デッキ（建物内では外壁が自動消去） */}
          <CampusScenery currentFloor={currentFloor} insideGroup={insideGroup} />

          {/* 床ゾーン群 */}
          {unifiedFloorData.buildingZones?.map((zone, idx) => {
            const zw = zone.maxX - zone.minX;
            const zd = zone.maxZ - zone.minZ;
            const zx = (zone.minX + zone.maxX) / 2;
            const zz = (zone.minZ + zone.maxZ) / 2;
            return (
              <group key={`${zone.name}-${idx}`} position={[zx, 0, zz]}>
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
                  <planeGeometry args={[zw, zd]} />
                  <meshStandardMaterial color={zone.floorColor} roughness={0.75} />
                </mesh>
                <lineSegments position={[0, 0.02, 0]}>
                  <edgesGeometry args={[new THREE.BoxGeometry(zw, 0.04, zd)]} />
                  <lineBasicMaterial color="#64748b" />
                </lineSegments>
              </group>
            );
          })}

          {/* 吹き抜けエリア */}
          {unifiedFloorData.voids?.map((v, idx) => (
            <VoidBox key={idx} voidArea={v} />
          ))}

          {/* 入り口（ドア）付きの密着教室群 */}
          {unifiedFloorData.rooms.map((room) => (
            <RoomBox key={room.id} room={room} />
          ))}

          {/* 連絡通路サイン */}
          {unifiedFloorData.connectors?.map((conn, idx) => (
            <ConnectorSign key={idx} connector={conn} />
          ))}

          {/* エレベーター */}
          {unifiedFloorData.elevators.map((ev) => (
            <ElevatorPad
              key={ev.id}
              ev={ev}
              isNear={nearElevator?.id === ev.id}
            />
          ))}

          {/* プレイヤーキャラクター操作 */}
          <PlayerController
            currentFloor={currentFloor}
            unifiedFloorData={unifiedFloorData}
            keysPressed={keysPressed}
            joystickInput={joystickInput}
            onNearElevatorChange={(ev) => {
              if (ev?.id !== nearElevator?.id) setNearElevator(ev);
            }}
            onCurrentBuildingChange={(bldg) => setCurrentSubBldg(bldg)}
            onInsideGroupChange={(grp) => setInsideGroup(grp)}
            onFloorAutoSwitch={(nextFl) => setCurrentFloor(nextFl)}
            teleportTarget={teleportTarget}
            isPortrait={isPortrait}
          />
        </Canvas>

        {/* スマホ用操作UI */}
        {isMobile ? (
          <>
            <div className="absolute bottom-5 left-5 z-10">
              <VirtualJoystick joystickRef={joystickInput} />
            </div>

            <div className="absolute bottom-5 right-5 z-20 flex flex-col items-end">
              {isMobileFloorOpen && (
                <div className="mb-2.5 bg-slate-900/95 backdrop-blur border border-slate-600 rounded-2xl p-3 text-white shadow-2xl w-72 max-w-[85vw] max-h-[55vh] overflow-y-auto">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-emerald-400">
                      🏢 フロア選択
                    </span>
                    <button
                      onClick={() => setIsMobileFloorOpen(false)}
                      className="text-xs text-slate-300 px-2 py-0.5 bg-slate-800 rounded-lg"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-2.5">
                    {allFloors.map((fl) => (
                      <button
                        key={fl}
                        onClick={() => {
                          setCurrentFloor(fl);
                          setNearElevator(null);
                          setIsMobileFloorOpen(false);
                        }}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-bold ${
                          currentFloor === fl
                            ? 'bg-emerald-500 text-slate-950'
                            : 'bg-slate-800 text-slate-200'
                        }`}
                      >
                        {fl}
                      </button>
                    ))}
                  </div>

                  <div className="border-t border-slate-700 pt-2">
                    <p className="text-[11px] font-bold text-slate-400 mb-1.5">
                      🚶 クイック移動（{currentFloor}）
                    </p>
                    <div className="grid grid-cols-2 gap-1.5">
                      {getQuickSpots().map((spot) => (
                        <button
                          key={spot.name}
                          onClick={() => {
                            setTeleportTarget({ coords: spot.coords, ts: Date.now() });
                            setIsMobileFloorOpen(false);
                          }}
                          className="px-2 py-1.5 rounded-lg text-[11px] font-bold bg-slate-800 active:bg-blue-600 text-slate-200 text-left leading-tight"
                        >
                          {spot.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={() => setIsMobileFloorOpen((prev) => !prev)}
                className="px-3.5 py-3 bg-slate-900/90 active:bg-slate-800 text-white border border-emerald-500/80 rounded-2xl shadow-xl text-xs font-bold flex items-center gap-1.5"
              >
                <span>🏢 {currentFloor} / フロア</span>
                <span>{isMobileFloorOpen ? '▼' : '▲'}</span>
              </button>
            </div>
          </>
        ) : (
          /* PCデスクトップ用レイアウト */
          <div className="absolute bottom-5 left-5 bg-slate-900/90 backdrop-blur border border-slate-700 rounded-xl p-3 text-white shadow-xl z-10 flex flex-col gap-3 max-w-[280px]">
            <div>
              <p className="text-[11px] font-bold text-emerald-400 mb-1.5">
                🏢 全号館フロア切替
              </p>
              <div className="flex flex-wrap gap-1.5">
                {allFloors.map((fl) => (
                  <button
                    key={fl}
                    onClick={() => {
                      setCurrentFloor(fl);
                      setNearElevator(null);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                      currentFloor === fl
                        ? 'bg-emerald-500 text-slate-950 shadow'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                    }`}
                  >
                    {fl}
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-slate-700/80 pt-2.5">
              <p className="text-[11px] font-bold text-slate-400 mb-1.5">
                🚶 クイック移動（{currentFloor}）
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                {getQuickSpots().map((spot) => (
                  <button
                    key={spot.name}
                    onClick={() => setTeleportTarget({ coords: spot.coords, ts: Date.now() })}
                    className="px-2 py-1.5 rounded-lg text-[10px] font-bold bg-slate-800 hover:bg-blue-600 text-slate-200 hover:text-white transition text-left leading-tight"
                  >
                    {spot.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 中央下：エレベーター到達時UI */}
        {nearElevator && (
          <div
            className={`absolute left-1/2 -translate-x-1/2 bg-emerald-950/95 border-2 border-emerald-400 text-white rounded-2xl shadow-2xl z-20 text-center ${
              isMobile ? 'bottom-36 px-3.5 py-2.5 w-[90%] max-w-sm' : 'bottom-6 px-5 py-3.5 max-w-md w-[90%]'
            }`}
          >
            <p className="text-xs font-bold text-emerald-300 mb-1.5">
              🛗 {nearElevator.name}：移動階を選択
            </p>
            <div className="flex flex-wrap justify-center gap-1.5">
              {nearElevator.targets.map((fl) => (
                <button
                  key={fl}
                  onClick={() => {
                    setCurrentFloor(fl);
                    setNearElevator(null);
                  }}
                  className={`rounded-lg font-bold transition ${
                    isMobile ? 'px-2.5 py-1 text-xs' : 'px-3 py-1 text-xs'
                  } ${
                    currentFloor === fl
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-slate-800 hover:bg-emerald-600 text-white'
                  }`}
                >
                  {fl}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}