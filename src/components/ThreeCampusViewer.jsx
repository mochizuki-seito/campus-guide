import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import { CAMPUS_3D_BUILDINGS } from '../data/campus3dData';

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

// 教室（壁とドアがある部屋）の接続・ドア開口ヘルパー
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
      const snapDist = 2.8;
      if (Math.abs(minZ - zone.minZ) <= snapDist) minZ = zone.minZ;
      if (Math.abs(maxZ - zone.maxZ) <= snapDist) maxZ = zone.maxZ;
      if (Math.abs(minX - zone.minX) <= snapDist) minX = zone.minX;
      if (Math.abs(maxX - zone.maxX) <= snapDist) maxX = zone.maxX;
    }

    return { ...r, minX, maxX, minZ, maxZ, zone };
  });

  // 隣室同士の微細な隙間を埋める
  for (let i = 0; i < boxes.length; i++) {
    for (let j = i + 1; j < boxes.length; j++) {
      const a = boxes[i];
      const b = boxes[j];
      if (a.zone && b.zone && a.zone !== b.zone) continue;

      const overlapZ = Math.min(a.maxZ, b.maxZ) - Math.max(a.minZ, b.minZ);
      if (overlapZ > 1.0) {
        const gapAB = b.minX - a.maxX;
        if (gapAB > 0.01 && gapAB <= 2.0) {
          const mid = (a.maxX + b.minX) / 2;
          a.maxX = mid;
          b.minX = mid;
        }
        const gapBA = a.minX - b.maxX;
        if (gapBA > 0.01 && gapBA <= 2.0) {
          const mid = (b.maxX + a.minX) / 2;
          b.maxX = mid;
          a.minX = mid;
        }
      }

      const overlapX = Math.min(a.maxX, b.maxX) - Math.max(a.minX, b.minX);
      if (overlapX > 1.0) {
        const gapAB = b.minZ - a.maxZ;
        if (gapAB > 0.01 && gapAB <= 2.0) {
          const mid = (a.maxZ + b.minZ) / 2;
          a.maxZ = mid;
          b.minZ = mid;
        }
        const gapBA = a.minZ - b.maxZ;
        if (gapBA > 0.01 && gapBA <= 2.0) {
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
      { side: 'south', px: x, pz: box.maxZ + 1.5, len: w },
      { side: 'north', px: x, pz: box.minZ - 1.5, len: w },
      { side: 'east', px: box.maxX + 1.5, pz: z, len: d },
      { side: 'west', px: box.minX - 1.5, pz: z, len: d },
    ];

    let bestSide = 'south';
    let bestScore = -999;

    for (const c of candidates) {
      let score = 0;
      const inIndoorZone = buildingZones.some(
        (zn) =>
          !zn.isOutdoor &&
          c.px >= zn.minX + 0.3 &&
          c.px <= zn.maxX - 0.3 &&
          c.pz >= zn.minZ + 0.3 &&
          c.pz <= zn.maxZ - 0.3
      );
      if (inIndoorZone) score += 15;

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
      <mesh position={[0, 1.2, 0]} castShadow>
        <cylinderGeometry args={[0.14, 0.22, 2.4, 8]} />
        <meshStandardMaterial color="#78350f" roughness={0.9} />
      </mesh>
      <mesh position={[0, 2.8, 0]} castShadow>
        <dodecahedronGeometry args={[1.1, 1]} />
        <meshStandardMaterial color={leafColor} roughness={0.8} />
      </mesh>
    </group>
  );
}

// 信号機オブジェクト
function TrafficSignal({ position, rotation = [0, 0, 0] }) {
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 2.2, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.1, 4.4, 8]} />
        <meshStandardMaterial color="#e2e8f0" />
      </mesh>
      <mesh position={[0.7, 3.8, 0]}>
        <boxGeometry args={[1.5, 0.08, 0.08]} />
        <meshStandardMaterial color="#e2e8f0" />
      </mesh>
      <mesh position={[1.1, 3.7, 0]}>
        <boxGeometry args={[0.9, 0.32, 0.25]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      <mesh position={[0.8, 3.7, 0.14]}>
        <sphereGeometry args={[0.09, 8, 8]} />
        <meshBasicMaterial color="#22c55e" />
      </mesh>
      <mesh position={[1.1, 3.7, 0.14]}>
        <sphereGeometry args={[0.09, 8, 8]} />
        <meshBasicMaterial color="#eab308" />
      </mesh>
      <mesh position={[1.4, 3.7, 0.14]}>
        <sphereGeometry args={[0.09, 8, 8]} />
        <meshBasicMaterial color="#ef4444" />
      </mesh>
    </group>
  );
}

// 案内板準拠のキャンパス道路・信号・モニュメント広場・駐輪場/駐車場・屋外階段B
function CampusScenery({ currentFloor }) {
  const floorNum = parseInt(currentFloor.replace('F', ''), 10) || 1;
  const groundY = -(floorNum - 1) * 3.4;

  return (
    <group>
      {/* 広大な緑地ベース */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-15, groundY - 0.18, 0]} receiveShadow>
        <planeGeometry args={[520, 520]} />
        <meshStandardMaterial color="#86efac" roughness={0.95} />
      </mesh>

      {/* 右側街区（1・2・3・6号館）敷地舗装 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[48, groundY - 0.1, 4]} receiveShadow>
        <planeGeometry args={[84, 128]} />
        <meshStandardMaterial color="#d6d3d1" roughness={0.85} />
      </mesh>

      {/* 左側街区（5・4号館）敷地舗装 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-66, groundY - 0.1, -31]} receiveShadow>
        <planeGeometry args={[108, 44]} />
        <meshStandardMaterial color="#d6d3d1" roughness={0.85} />
      </mesh>

      {/* 左側街区の南側ブロック（案内板左下のグレー区画） */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-66, groundY - 0.08, 22]} receiveShadow>
        <planeGeometry args={[104, 38]} />
        <meshStandardMaterial color="#64748b" roughness={0.9} />
      </mesh>

      {/* =================================================================== */}
      {/* 1. 道路・センタープロムナード・信号＆横断歩道（案内板準拠）          */}
      {/* =================================================================== */}
      {/* 北側 センタープロムナード（東西歩行者緑道） */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-15, groundY - 0.05, -62]} receiveShadow>
        <planeGeometry args={[216, 12]} />
        <meshStandardMaterial color="#e7e5e4" roughness={0.8} />
      </mesh>
      <Html position={[-30, groundY + 0.3, -62]} center distanceFactor={42}>
        <div className="bg-slate-800/80 text-white px-3 py-0.5 rounded-full text-xs font-bold tracking-wider pointer-events-none select-none whitespace-nowrap">
          センタープロムナード
        </div>
      </Html>

      {/* 中央の南北大通り（右側街区と左側街区の間：X=-10〜+8） */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-1, groundY - 0.06, 8]} receiveShadow>
        <planeGeometry args={[18, 130]} />
        <meshStandardMaterial color="#334155" roughness={0.9} />
      </mesh>

      {/* 左側街区（4・5号館）と南側区画の間の東西道路（Z=-6〜+2） */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-66, groundY - 0.06, -2]} receiveShadow>
        <planeGeometry args={[112, 8]} />
        <meshStandardMaterial color="#334155" roughness={0.9} />
      </mesh>

      {/* 【重要】5号館の目の前の横断歩道＆信号（X=-10〜+8, Z=-17） */}
      {[-3.5, -1.75, 0, 1.75, 3.5].map((zOff, i) => (
        <mesh key={`cw-main-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[-1, groundY - 0.02, -17 + zOff]}>
          <planeGeometry args={[16, 1.0]} />
          <meshBasicMaterial color="#f8fafc" />
        </mesh>
      ))}
      <TrafficSignal position={[-11, groundY, -12]} rotation={[0, Math.PI / 2, 0]} />
      <TrafficSignal position={[9, groundY, -22]} rotation={[0, -Math.PI / 2, 0]} />

      {/* 案内板下側の横断歩道2箇所（南東側・南西側） */}
      {[-3, -1, 1, 3].map((zOff, i) => (
        <mesh key={`cw-se-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[-13, groundY - 0.02, 8 + zOff]}>
          <planeGeometry args={[5, 0.9]} />
          <meshBasicMaterial color="#f8fafc" />
        </mesh>
      ))}
      {[-3, -1, 1, 3].map((zOff, i) => (
        <mesh key={`cw-sw-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[-116, groundY - 0.02, 8 + zOff]}>
          <planeGeometry args={[5, 0.9]} />
          <meshBasicMaterial color="#f8fafc" />
        </mesh>
      ))}

      {/* =================================================================== */}
      {/* 2. 中庭（パティオ）・モニュメント広場・屋外階段B・正門デッキ         */}
      {/* =================================================================== */}
      {/* 中庭のレンガ舗装 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[42, groundY - 0.03, 6]} receiveShadow>
        <planeGeometry args={[8, 44]} />
        <meshStandardMaterial color="#9a3412" roughness={0.85} />
      </mesh>

      {/* モニュメント広場（2号館北側〜正門下ピロティ通り道） */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[26, groundY - 0.02, -34]} receiveShadow>
        <planeGeometry args={[26, 36]} />
        <meshStandardMaterial color="#f5f5f4" roughness={0.75} />
      </mesh>
      {/* モニュメント（案内板の白い四角モニュメント） */}
      <mesh position={[23, groundY + 0.6, -34]} castShadow>
        <boxGeometry args={[4, 1.2, 4]} />
        <meshStandardMaterial color="#e2e8f0" />
      </mesh>
      <Html position={[23, groundY + 1.8, -34]} center distanceFactor={32}>
        <div className="bg-slate-800/85 text-white px-2 py-0.5 rounded text-[10px] font-bold pointer-events-none select-none">
          モニュメント広場
        </div>
      </Html>

      {/* 2F正門エントランスデッキ（1Fピロティ通り道の上部スラブ＆丸柱） */}
      <group position={[29, groundY, -36]}>
        <mesh position={[0, 3.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[30, 0.6, 36]} />
          <meshStandardMaterial color="#e7e5e4" transparent opacity={0.92} />
        </mesh>
        {[-11, 0, 11].map((px, i) => (
          <React.Fragment key={`pil-${i}`}>
            <mesh position={[px, 1.75, -14]} castShadow>
              <cylinderGeometry args={[0.3, 0.3, 3.5, 16]} />
              <meshStandardMaterial color="#f8fafc" />
            </mesh>
            <mesh position={[px, 1.75, 0]} castShadow>
              <cylinderGeometry args={[0.3, 0.3, 3.5, 16]} />
              <meshStandardMaterial color="#f8fafc" />
            </mesh>
            <mesh position={[px, 1.75, 14]} castShadow>
              <cylinderGeometry args={[0.3, 0.3, 3.5, 16]} />
              <meshStandardMaterial color="#f8fafc" />
            </mesh>
          </React.Fragment>
        ))}
      </group>

      {/* 屋外階段B（Z=-18から北Z=-32へ登り、1F中庭⇔2F正門デッキを接続） */}
      <group position={[40, groundY, -18]}>
        {Array.from({ length: 14 }).map((_, i) => {
          const stepY = (i + 0.5) * (3.5 / 14);
          const stepZ = -(i + 0.5) * (14 / 14);
          return (
            <mesh key={`stair-${i}`} position={[0, stepY, stepZ]} castShadow receiveShadow>
              <boxGeometry args={[7.2, 3.5 / 14, 14 / 14 + 0.15]} />
              <meshStandardMaterial color={i % 2 === 0 ? '#e7e5e4' : '#d6d3d1'} roughness={0.7} />
            </mesh>
          );
        })}
        <mesh position={[-3.8, 1.9, -7]} castShadow>
          <boxGeometry args={[0.4, 3.8, 14.2]} />
          <meshStandardMaterial color="#a8a29e" />
        </mesh>
      </group>

      {/* 1号館南側の駐輪場・駐車場（案内板右下） */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[21, groundY - 0.02, 59]} receiveShadow>
        <planeGeometry args={[14, 8]} />
        <meshStandardMaterial color="#cbd5e1" />
      </mesh>
      <Html position={[21, groundY + 0.4, 59]} center distanceFactor={34}>
        <div className="bg-slate-700/90 text-white px-2 py-0.5 rounded text-[10px] font-bold pointer-events-none select-none">
          駐輪場
        </div>
      </Html>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[65, groundY - 0.02, 59]} receiveShadow>
        <planeGeometry args={[26, 8]} />
        <meshStandardMaterial color="#94a3b8" />
      </mesh>
      <Html position={[65, groundY + 0.4, 59]} center distanceFactor={34}>
        <div className="bg-slate-700/90 text-white px-2 py-0.5 rounded text-[10px] font-bold pointer-events-none select-none">
          駐車場
        </div>
      </Html>

      {/* 街路樹 */}
      {[-45, -30, -5, 18, 40].map((z, i) => (
        <CampusTree key={`tree-road-${i}`} position={[10, groundY, z]} scale={1.0} leafColor="#4d7c0f" />
      ))}
    </group>
  );
}

// 建物の外周壁＋入口開口部（ドアゲート）を描画するコンポーネント
function BuildingPerimeterWalls({ zone, entrances, isCurrentFloor }) {
  const wallH = 3.1;
  const wallT = 0.28;
  const doorW = 3.6;

  // 各辺（north, south, east, west）にある入口を抽出
  const getSideEntrances = (side) =>
    entrances.filter(
      (e) =>
        e.side === side &&
        e.x >= zone.minX - 0.5 &&
        e.x <= zone.maxX + 0.5 &&
        e.z >= zone.minZ - 0.5 &&
        e.z <= zone.maxZ + 0.5
    );

  // 1辺の壁を入口開口部で分割して描画
  const renderEdgeWithDoors = (side, start, end, fixedCoord, isHorizontal) => {
    const sideEnts = getSideEntrances(side).sort((a, b) =>
      isHorizontal ? a.x - b.x : a.z - b.z
    );

    const segments = [];
    let cursor = start;

    for (const ent of sideEnts) {
      const center = isHorizontal ? ent.x : ent.z;
      const dStart = Math.max(start, center - doorW / 2);
      const dEnd = Math.min(end, center + doorW / 2);
      if (dStart > cursor + 0.2) {
        segments.push({ from: cursor, to: dStart });
      }
      cursor = dEnd;
    }
    if (end > cursor + 0.2) {
      segments.push({ from: cursor, to: end });
    }

    return segments.map((seg, idx) => {
      const len = seg.to - seg.from;
      const mid = (seg.from + seg.to) / 2;
      return isHorizontal ? (
        <mesh key={`${side}-${idx}`} position={[mid, wallH / 2, fixedCoord]} castShadow>
          <boxGeometry args={[len, wallH, wallT]} />
          <meshStandardMaterial color="#94a3b8" transparent opacity={isCurrentFloor ? 0.55 : 0.85} />
        </mesh>
      ) : (
        <mesh key={`${side}-${idx}`} position={[fixedCoord, wallH / 2, mid]} castShadow>
          <boxGeometry args={[wallT, wallH, len]} />
          <meshStandardMaterial color="#94a3b8" transparent opacity={isCurrentFloor ? 0.55 : 0.85} />
        </mesh>
      );
    });
  };

  return (
    <group>
      {renderEdgeWithDoors('north', zone.minX, zone.maxX, zone.minZ, true)}
      {renderEdgeWithDoors('south', zone.minX, zone.maxX, zone.maxZ, true)}
      {renderEdgeWithDoors('west', zone.minZ, zone.maxZ, zone.minX, false)}
      {renderEdgeWithDoors('east', zone.minZ, zone.maxZ, zone.maxX, false)}
    </group>
  );
}

// 入り口ゲートサイン（1F入口 / 2F入口）
function EntranceGateMarker({ entrance }) {
  const is2F = entrance.label.includes('2F');
  return (
    <group position={[entrance.x, 0, entrance.z]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
        <planeGeometry args={[3.4, 2.2]} />
        <meshBasicMaterial color={is2F ? '#0284c7' : '#d97706'} transparent opacity={0.45} />
      </mesh>
      <Html position={[0, 2.6, 0]} center distanceFactor={28} zIndexRange={[15, 0]}>
        <div
          className={`px-2 py-0.5 rounded text-[10px] font-extrabold whitespace-nowrap shadow-md border pointer-events-none select-none ${
            is2F
              ? 'bg-sky-700 text-white border-sky-300'
              : 'bg-amber-600 text-white border-amber-200'
          }`}
        >
          🚪 {entrance.label}
        </div>
      </Html>
    </group>
  );
}

// 教室・研究室・事務室（壁とドア付き）
function RoomBox({ room }) {
  const wallH = 2.7;
  const wallT = 0.22;
  const { w, d, doorSide, doorWidth } = room;

  const renderDoorWall = (totalLen, isHorizontal) => {
    const sideW = Math.max(0.15, (totalLen - doorWidth) / 2);
    const offset = doorWidth / 2 + sideW / 2;

    if (isHorizontal) {
      return (
        <>
          <mesh position={[-offset, wallH / 2, 0]} castShadow>
            <boxGeometry args={[sideW, wallH, wallT]} />
            <meshStandardMaterial color={room.color} transparent opacity={0.72} />
          </mesh>
          <mesh position={[offset, wallH / 2, 0]} castShadow>
            <boxGeometry args={[sideW, wallH, wallT]} />
            <meshStandardMaterial color={room.color} transparent opacity={0.72} />
          </mesh>
          <mesh position={[0, wallH - 0.35, 0]}>
            <boxGeometry args={[doorWidth, 0.7, wallT]} />
            <meshStandardMaterial color={room.color} transparent opacity={0.72} />
          </mesh>
        </>
      );
    }
    return (
      <>
        <mesh position={[0, wallH / 2, -offset]} castShadow>
          <boxGeometry args={[wallT, wallH, sideW]} />
          <meshStandardMaterial color={room.color} transparent opacity={0.72} />
        </mesh>
        <mesh position={[0, wallH / 2, offset]} castShadow>
          <boxGeometry args={[wallT, wallH, sideW]} />
          <meshStandardMaterial color={room.color} transparent opacity={0.72} />
        </mesh>
        <mesh position={[0, wallH - 0.35, 0]}>
          <boxGeometry args={[wallT, 0.7, doorWidth]} />
          <meshStandardMaterial color={room.color} transparent opacity={0.72} />
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
            <meshStandardMaterial color={room.color} transparent opacity={0.72} />
          </mesh>
        )}
      </group>

      <group position={[0, 0, d / 2]}>
        {doorSide === 'south' ? (
          renderDoorWall(w, true)
        ) : (
          <mesh position={[0, wallH / 2, 0]} castShadow>
            <boxGeometry args={[w, wallH, wallT]} />
            <meshStandardMaterial color={room.color} transparent opacity={0.72} />
          </mesh>
        )}
      </group>

      <group position={[-w / 2, 0, 0]}>
        {doorSide === 'west' ? (
          renderDoorWall(d, false)
        ) : (
          <mesh position={[0, wallH / 2, 0]} castShadow>
            <boxGeometry args={[wallT, wallH, d]} />
            <meshStandardMaterial color={room.color} transparent opacity={0.72} />
          </mesh>
        )}
      </group>

      <group position={[w / 2, 0, 0]}>
        {doorSide === 'east' ? (
          renderDoorWall(d, false)
        ) : (
          <mesh position={[0, wallH / 2, 0]} castShadow>
            <boxGeometry args={[wallT, wallH, d]} />
            <meshStandardMaterial color={room.color} transparent opacity={0.72} />
          </mesh>
        )}
      </group>

      <lineSegments position={[0, wallH / 2, 0]}>
        <edgesGeometry args={[new THREE.BoxGeometry(w, wallH, d)]} />
        <lineBasicMaterial color="#1e3a8a" />
      </lineSegments>

      <Html position={[0, 3.05, 0]} center distanceFactor={26} zIndexRange={[10, 0]}>
        <div className="bg-slate-900/90 text-white px-2 py-0.5 rounded text-[10px] font-bold whitespace-pre-line text-center shadow border border-blue-400 pointer-events-none select-none leading-tight">
          {room.name}
        </div>
      </Html>
    </group>
  );
}

// 教室ではない設備・オープンスペース（壁なし・通り抜け可）
function FacilityZone({ facility }) {
  return (
    <group position={[facility.x, 0, facility.z]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.025, 0]} receiveShadow>
        <planeGeometry args={[facility.w, facility.d]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.8} />
      </mesh>
      <lineSegments position={[0, 0.05, 0]}>
        <edgesGeometry args={[new THREE.BoxGeometry(facility.w, 0.08, facility.d)]} />
        <lineBasicMaterial color="#64748b" />
      </lineSegments>
      <Html position={[0, 1.4, 0]} center distanceFactor={28} zIndexRange={[5, 0]}>
        <div className="bg-slate-700/85 text-slate-100 px-2 py-0.5 rounded text-[10px] font-semibold whitespace-pre-line text-center border border-slate-400 pointer-events-none select-none">
          {facility.name}
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
  onFloorAutoSwitch,
  teleportTarget,
  isPortrait,
  rotationDeg,
}) {
  const playerRef = useRef();
  const controlsRef = useRef();
  const { camera } = useThree();

  const posRef = useRef(new THREE.Vector3(44, 0, 41));
  const rotYRef = useRef(0);
  const lastBldgRef = useRef('');
  const stairCooldownRef = useRef(0);

  useEffect(() => {
    camera.fov = isPortrait ? 56 : 45;
    camera.updateProjectionMatrix();
  }, [isPortrait, camera]);

  // 教室（rooms）の壁当たり判定
  const isBlockedByRoomWall = (px, pz, room) => {
    const halfW = room.w / 2;
    const halfD = room.d / 2;
    const wallThick = 0.34;
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

  // 建物の外周壁当たり判定（入口ゲート開口部は通過可能！）
  const isBlockedByBuildingPerimeter = (px, pz, zone, entrances) => {
    const wallThick = 0.36;
    const halfDoor = 1.9;

    const nearNorth = Math.abs(pz - zone.minZ) <= wallThick && px >= zone.minX - wallThick && px <= zone.maxX + wallThick;
    const nearSouth = Math.abs(pz - zone.maxZ) <= wallThick && px >= zone.minX - wallThick && px <= zone.maxX + wallThick;
    const nearWest = Math.abs(px - zone.minX) <= wallThick && pz >= zone.minZ - wallThick && pz <= zone.maxZ + wallThick;
    const nearEast = Math.abs(px - zone.maxX) <= wallThick && pz >= zone.minZ - wallThick && pz <= zone.maxZ + wallThick;

    if (!nearNorth && !nearSouth && !nearWest && !nearEast) return false;

    // 入口開口部にいる場合は通過OK
    for (const ent of entrances) {
      if (nearNorth && ent.side === 'north' && Math.abs(px - ent.x) <= halfDoor) return false;
      if (nearSouth && ent.side === 'south' && Math.abs(px - ent.x) <= halfDoor) return false;
      if (nearWest && ent.side === 'west' && Math.abs(pz - ent.z) <= halfDoor) return false;
      if (nearEast && ent.side === 'east' && Math.abs(pz - ent.z) <= halfDoor) return false;
    }

    return true;
  };

  const checkCollision = (nextX, nextZ) => {
    // 1Fはキャンパス敷地全体（道路・信号・中庭・館内）を自由に歩ける。2F以上は建物・デッキゾーン内のみ
    if (currentFloor !== '1F') {
      const isPointInAnyZone = (px, pz) =>
        unifiedFloorData.buildingZones?.some(
          (z) => px >= z.minX && px <= z.maxX && pz >= z.minZ && pz <= z.maxZ
        );
      const wallMargin = 0.35;
      if (
        !isPointInAnyZone(nextX, nextZ) ||
        !isPointInAnyZone(nextX - wallMargin, nextZ) ||
        !isPointInAnyZone(nextX + wallMargin, nextZ) ||
        !isPointInAnyZone(nextX, nextZ - wallMargin) ||
        !isPointInAnyZone(nextX, nextZ + wallMargin)
      ) {
        return true;
      }
    } else {
      // 1F外周の最大範囲制限
      if (nextX < -122 || nextX > 92 || nextZ < -72 || nextZ > 68) return true;
    }

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

    // 建物の外周壁判定（1F入口・2F入口のみ通過可）
    for (const z of unifiedFloorData.buildingZones || []) {
      if (!z.isOutdoor) {
        if (isBlockedByBuildingPerimeter(nextX, nextZ, z, unifiedFloorData.entrances || [])) {
          return true;
        }
      }
    }

    // 教室（rooms）の壁判定（※facilitiesは壁なしなので通り抜け可能）
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
    return [44, 41];
  };

  // ローカル座標をキャンパス回転角に応じてワールド座標へ変換するヘルパー
  const rotRad = (rotationDeg * Math.PI) / 180;
  const toWorld = (lx, lz) => ({
    wx: lx * Math.cos(rotRad) - lz * Math.sin(rotRad),
    wz: lx * Math.sin(rotRad) + lz * Math.cos(rotRad),
  });

  useEffect(() => {
    const rawTarget = teleportTarget ? teleportTarget.coords : [44, 41];
    const [safeX, safeZ] = resolveSafePosition(rawTarget[0], rawTarget[1]);

    posRef.current.set(safeX, 0, safeZ);
    const { wx, wz } = toWorld(safeX, safeZ);
    if (playerRef.current) {
      playerRef.current.position.set(safeX, 0, safeZ);
    }
    camera.position.set(wx, isPortrait ? 24 : 20, wz + (isPortrait ? 26 : 24));
    if (controlsRef.current) {
      controlsRef.current.target.set(wx, 1, wz);
      controlsRef.current.update();
    }
  }, [teleportTarget, camera, rotationDeg]);

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

      const worldMove = new THREE.Vector3()
        .addScaledVector(camDir, inputForward)
        .addScaledVector(camRight, inputRight)
        .normalize()
        .multiplyScalar(baseSpeed * inputMagnitude);

      // ワールド移動ベクトルをキャンパス回転逆変換でローカル移動ベクトルへ変換
      const cosR = Math.cos(-rotRad);
      const sinR = Math.sin(-rotRad);
      const localDx = worldMove.x * cosR - worldMove.z * sinR;
      const localDz = worldMove.x * sinR + worldMove.z * cosR;

      const nextX = posRef.current.x + localDx;
      const nextZ = posRef.current.z + localDz;

      let actualDx = 0;
      let actualDz = 0;
      if (!checkCollision(nextX, posRef.current.z)) {
        posRef.current.x = nextX;
        actualDx = localDx;
      }
      if (!checkCollision(posRef.current.x, nextZ)) {
        posRef.current.z = nextZ;
        actualDz = localDz;
      }

      rotYRef.current = Math.atan2(localDx, localDz);

      if (playerRef.current) {
        playerRef.current.position.copy(posRef.current);
        playerRef.current.rotation.y = rotYRef.current;
      }

      const wDx = actualDx * Math.cos(rotRad) - actualDz * Math.sin(rotRad);
      const wDz = actualDx * Math.sin(rotRad) + actualDz * Math.cos(rotRad);
      camera.position.x += wDx;
      camera.position.z += wDz;

      const { wx, wz } = toWorld(posRef.current.x, posRef.current.z);
      if (controlsRef.current) {
        controlsRef.current.target.set(wx, 1, wz);
      }
    }

    // 屋外階段B（X: 36.4〜43.6, Z: -32〜-18）での高さ追従＆1F⇔2F自動切替
    let playerY = 0;
    const px = posRef.current.x;
    const pz = posRef.current.z;

    if (currentFloor === '1F' && px >= 36.4 && px <= 43.6 && pz <= -18 && pz >= -32) {
      const progress = (-18 - pz) / 14;
      playerY = progress * 3.5;
      if (pz <= -31.2 && stairCooldownRef.current <= 0) {
        stairCooldownRef.current = 1.0;
        posRef.current.z = -33.5;
        onFloorAutoSwitch('2F');
      }
    } else if (currentFloor === '2F' && px >= 36.4 && px <= 43.6 && pz >= -32 && pz <= -29.5 && stairCooldownRef.current <= 0) {
      stairCooldownRef.current = 1.0;
      posRef.current.z = -29.5;
      onFloorAutoSwitch('1F');
    }

    if (playerRef.current) {
      playerRef.current.position.y = playerY;
    }

    const currentZone = unifiedFloorData.buildingZones?.find(
      (z) => px >= z.minX && px <= z.maxX && pz >= z.minZ && pz <= z.maxZ
    );
    let areaLabel = currentZone ? currentZone.name : '';
    if (!areaLabel && currentFloor === '1F') {
      if (px >= -10 && px <= 8) areaLabel = '大通り・信号（横断歩道）';
      else if (px > 8) areaLabel = '1・2・3・6号館 屋外広場';
      else areaLabel = '4・5号館 屋外歩道';
    }
    if (areaLabel && areaLabel !== lastBldgRef.current) {
      lastBldgRef.current = areaLabel;
      onCurrentBuildingChange(areaLabel);
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
      <group ref={playerRef} position={[44, 0, 41]}>
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
        maxDistance={95}
        maxPolarAngle={Math.PI / 2.02}
      />
    </>
  );
}

export default function ThreeCampusViewer({ onClose }) {
  const [currentFloor, setCurrentFloor] = useState('1F');
  const [currentSubBldg, setCurrentSubBldg] = useState('1号館');
  const [nearElevator, setNearElevator] = useState(null);
  const [teleportTarget, setTeleportTarget] = useState({ coords: [44, 41], ts: 1 });
  const [rotationDeg, setRotationDeg] = useState(0);

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

  // 全建物・入口・教室・設備を統合
  const unifiedFloorData = useMemo(() => {
    const f1236 = CAMPUS_3D_BUILDINGS['area-1236']?.floors?.[currentFloor];
    const f5 = CAMPUS_3D_BUILDINGS['area-5']?.floors?.[currentFloor];
    const f4 = CAMPUS_3D_BUILDINGS['area-4']?.floors?.[currentFloor];

    const buildingZones = [];
    const rawRooms = [];
    const facilities = [];
    const elevators = [];
    const voids = [];
    const entrances = [];

    [f1236, f5, f4].forEach((area) => {
      if (!area) return;
      area.buildingZones?.forEach((z) => buildingZones.push({ ...z }));
      area.rooms?.forEach((r) => rawRooms.push({ ...r }));
      area.facilities?.forEach((fac) => facilities.push({ ...fac }));
      area.elevators?.forEach((e) => elevators.push({ ...e }));
      area.voids?.forEach((v) => voids.push({ ...v }));
    });

    // 案内板準拠の 1F入口・2F入口 配置
    if (currentFloor === '1F') {
      entrances.push(
        // 1号館 1F入口（南側中央・駐輪場と駐車場の間）
        { label: '1号館 1F入口', x: 44, z: 52, side: 'south' },
        // 1号館中庭側 1F通り抜け入口
        { label: '1号館 中庭側1F入口', x: 44, z: 30, side: 'north' },
        // 2号館 1F入口（北面・赤いピン位置）
        { label: '2号館 1F入口', x: 24, z: -14, side: 'north' },
        // 3号館 1F入口（西面南寄り・屋外階段Bの横）
        { label: '3号館 1F入口', x: 44, z: -22, side: 'west' },
        // 6号館 1F入口（北面・3号館との間通路側 & 南面）
        { label: '6号館 北1F入口', x: 60, z: -12, side: 'north' },
        { label: '6号館 南1F入口', x: 54, z: 24, side: 'south' },
        // 5号館 1F入口（信号・横断歩道のすぐ目の前＝南東角！ ＋ 北側1F入口）
        { label: '5号館 1F入口（信号前）', x: -16, z: -18, side: 'east' },
        { label: '5号館 北1F入口', x: -32, z: -48, side: 'north' },
        // 4号館 1F入口（北面西寄り）
        { label: '4号館 1F入口', x: -98, z: -48, side: 'north' }
      );
    }

    if (currentFloor === '2F') {
      entrances.push(
        { label: '正門（Main Gate）', x: 30, z: -54, side: 'north' },
        { label: '1号館 2F入口', x: 44, z: 30, side: 'north' },
        { label: '2号館 2F入口', x: 36, z: 14, side: 'east' },
        { label: '3号館 2F入口', x: 44, z: -46, side: 'west' },
        { label: '6号館 北2F入口', x: 48, z: -6, side: 'west' },
        { label: '6号館 南2F入口', x: 48, z: 18, side: 'west' },
        { label: '5号館 2F入口', x: -44, z: -48, side: 'north' },
        { label: '4号館 2F入口', x: -76, z: -48, side: 'north' }
      );
    }

    const connectedRooms = buildConnectedRooms(rawRooms, buildingZones);

    return {
      buildingZones,
      rooms: connectedRooms,
      facilities,
      elevators,
      voids,
      entrances,
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

  const handleRotateCampus = () => {
    setRotationDeg((prev) => (prev + 90) % 360);
  };

  // クイック移動（ワープ）
  const handleQuickJump = (area) => {
    if (area === '1-2-3-6') {
      setTeleportTarget({ coords: [44, 41], ts: Date.now() });
    } else if (area === 'signal') {
      setCurrentFloor('1F');
      setTeleportTarget({ coords: [16, -18], ts: Date.now() });
    } else if (area === '5') {
      const targetFl = ['1F', '2F', '3F', '4F', '5F', '6F', '7F'].includes(currentFloor) ? currentFloor : '1F';
      setCurrentFloor(targetFl);
      setTeleportTarget({ coords: [-22, -18], ts: Date.now() });
    } else if (area === '4') {
      const targetFl = ['1F', '2F', '3F', '4F', '5F'].includes(currentFloor) ? currentFloor : '1F';
      setCurrentFloor(targetFl);
      setTeleportTarget({ coords: [-98, -42], ts: Date.now() });
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
              有明キャンパス 配置マップ
            </h2>
            <p className="text-[10px] sm:text-xs text-emerald-300 font-semibold truncate">
              現在地：{currentSubBldg} / {currentFloor}（回転: {rotationDeg}°）
            </p>
          </div>
        </div>

        {/* ワンクリック移動＆回転ボタン */}
        <div className="hidden md:flex items-center gap-1.5 bg-slate-800 px-2 py-1 rounded-lg border border-slate-700">
          <button
            onClick={() => handleQuickJump('1-2-3-6')}
            className="px-2 py-0.5 rounded bg-slate-700 hover:bg-blue-600 text-[11px] font-bold transition"
          >
            1・2・3・6号館
          </button>
          <button
            onClick={() => handleQuickJump('signal')}
            className="px-2 py-0.5 rounded bg-slate-700 hover:bg-amber-600 text-[11px] font-bold transition"
          >
            モニュメント広場・信号
          </button>
          <button
            onClick={() => handleQuickJump('5')}
            className="px-2 py-0.5 rounded bg-slate-700 hover:bg-blue-600 text-[11px] font-bold transition"
          >
            5号館（信号前入口）
          </button>
          <button
            onClick={() => handleQuickJump('4')}
            className="px-2 py-0.5 rounded bg-slate-700 hover:bg-blue-600 text-[11px] font-bold transition"
          >
            4号館
          </button>
          <button
            onClick={handleRotateCampus}
            className="px-2.5 py-0.5 rounded bg-indigo-600 hover:bg-indigo-500 text-[11px] font-bold transition ml-1"
          >
            🔄 90°回転 ({rotationDeg}°)
          </button>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {isMobile && (
            <>
              <button
                onClick={handleRotateCampus}
                className="px-2 py-1.5 rounded-lg bg-indigo-700 text-xs font-bold text-white"
              >
                🔄 {rotationDeg}°
              </button>
              <button
                onClick={() => setShowFloorMenu((prev) => !prev)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-600 text-xs font-bold text-slate-100 active:bg-slate-700"
              >
                階 ({currentFloor}) {showFloorMenu ? '▲' : '▼'}
              </button>
            </>
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
            onClick={() => handleQuickJump('signal')}
            className="flex-1 py-1 rounded bg-slate-700 active:bg-amber-600 text-[10px] text-white font-bold"
          >
            信号・横断歩道
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
        <Canvas shadows camera={{ position: [44, 20, 65], fov: 45 }}>
          <color attach="background" args={['#bae6fd']} />
          <fog attach="fog" args={['#bae6fd', 160, 360]} />

          <ambientLight intensity={0.85} />
          <directionalLight
            position={[60, 100, 60]}
            intensity={1.1}
            castShadow
            shadow-mapSize={[2048, 2048]}
          />

          {/* キャンパス全体（回転ボタンで90度ずつ回転可能） */}
          <group rotation={[0, (rotationDeg * Math.PI) / 180, 0]}>
            <CampusScenery currentFloor={currentFloor} />

            {/* 各棟の歩行可能床面と外周壁・入口開口 */}
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
                  {!zone.isOutdoor && (
                    <BuildingPerimeterWalls
                      zone={zone}
                      entrances={unifiedFloorData.entrances || []}
                      isCurrentFloor={true}
                    />
                  )}
                  <Html position={[zx, 0.15, zz]} center distanceFactor={40}>
                    <div className="text-slate-600/70 font-black text-sm tracking-widest pointer-events-none select-none whitespace-nowrap">
                      {zone.name}
                    </div>
                  </Html>
                </group>
              );
            })}

            {/* 1F入口・2F入口ゲートサイン */}
            {unifiedFloorData.entrances?.map((ent, idx) => (
              <EntranceGateMarker key={`ent-${idx}`} entrance={ent} />
            ))}

            {/* 吹き抜け */}
            {unifiedFloorData.voids?.map((v, idx) => (
              <VoidBox key={`void-${idx}`} voidArea={v} />
            ))}

            {/* 教室ではない設備・オープンスペース（壁なし） */}
            {unifiedFloorData.facilities?.map((fac) => (
              <FacilityZone key={fac.id} facility={fac} />
            ))}

            {/* 教室・研究室・事務室（壁とドア付き） */}
            {unifiedFloorData.rooms.map((room) => (
              <RoomBox key={room.id} room={room} />
            ))}

            {/* エレベーター */}
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
              onFloorAutoSwitch={(nextFl) => setCurrentFloor(nextFl)}
              teleportTarget={teleportTarget}
              isPortrait={isPortrait}
              rotationDeg={rotationDeg}
            />
          </group>
        </Canvas>

        {/* PC版：左上の操作ガイド & 階数クイック選択 */}
        {!isMobile && (
          <div className="absolute top-4 left-4 bg-slate-900/85 backdrop-blur-md text-white p-3.5 rounded-xl border border-slate-700 max-w-xs shadow-xl">
            <h3 className="text-xs font-bold text-blue-300 uppercase tracking-wider mb-1.5">
              操作方法
            </h3>
            <ul className="text-xs space-y-1 text-slate-200 mb-3">
              <li><span className="font-bold text-white">W A S D / 矢印キー</span>：移動</li>
              <li><span className="font-bold text-white">🚪 1F入口 / 2F入口</span>：建物の出入り口</li>
              <li><span className="font-bold text-white">青い枠の部屋</span>：教室・研究室・事務室</li>
              <li><span className="font-bold text-white">グレー床の表記</span>：トイレ・共用部（通過可）</li>
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