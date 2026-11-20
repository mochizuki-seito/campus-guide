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

// 街路樹・公園の樹木オブジェクト
function CampusTree({ position, scale = 1, leafColor = '#4d7c0f' }) {
  return (
    <group position={position} scale={[scale, scale, scale]}>
      {/* 幹 */}
      <mesh position={[0, 1.3, 0]} castShadow>
        <cylinderGeometry args={[0.14, 0.22, 2.6, 8]} />
        <meshStandardMaterial color="#78350f" roughness={0.9} />
      </mesh>
      {/* 枝葉（自然な重なり） */}
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

// レンガ調アーチ回廊ユニット（写真1の1〜2F赤茶色アーチ表現）
function BrickArchFacade({ position, rotation = [0, 0, 0], count = 4, width = 3.5, height = 5.2 }) {
  const brickColor = '#9a3412';
  const trimColor = '#f5f5f4';
  const items = Array.from({ length: count });

  return (
    <group position={position} rotation={rotation}>
      {items.map((_, idx) => {
        const offsetX = (idx - (count - 1) / 2) * width;
        return (
          <group key={idx} position={[offsetX, 0, 0]}>
            {/* 左柱 */}
            <mesh position={[-width * 0.38, height / 2, 0]} castShadow receiveShadow>
              <boxGeometry args={[width * 0.24, height, 0.5]} />
              <meshStandardMaterial color={brickColor} roughness={0.75} />
            </mesh>
            {/* 右柱 */}
            <mesh position={[width * 0.38, height / 2, 0]} castShadow receiveShadow>
              <boxGeometry args={[width * 0.24, height, 0.5]} />
              <meshStandardMaterial color={brickColor} roughness={0.75} />
            </mesh>
            {/* 上部レンガ壁 */}
            <mesh position={[0, height - 0.55, 0]} castShadow>
              <boxGeometry args={[width, 1.1, 0.52]} />
              <meshStandardMaterial color={brickColor} roughness={0.75} />
            </mesh>
            {/* アーチ装飾リング */}
            <mesh position={[0, height - 1.2, 0]}>
              <torusGeometry args={[width * 0.32, 0.16, 8, 20, Math.PI]} />
              <meshStandardMaterial color={brickColor} roughness={0.7} />
            </mesh>
            {/* コーニス（白い水平モールディング） */}
            <mesh position={[0, height + 0.08, 0]}>
              <boxGeometry args={[width + 0.05, 0.18, 0.65]} />
              <meshStandardMaterial color={trimColor} roughness={0.5} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

// キャンパス外観・周辺街並み（写真1＆写真2の景色再現）
function CampusScenery({ areaId, currentFloor }) {
  const floorNum = parseInt(currentFloor.replace('F', ''), 10) || 1;
  // 現在の階に応じて地面（地上）の相対高さを下げることで高層階の眺望も再現
  const groundY = -(floorNum - 1) * 3.4;

  return (
    <group>
      {/* 広大な地面（ベース緑地・舗装） */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, groundY - 0.15, 0]} receiveShadow>
        <planeGeometry args={[520, 520]} />
        <meshStandardMaterial color="#86efac" roughness={0.95} />
      </mesh>

      {/* キャンパス敷地内の石畳・舗装ベース */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, groundY - 0.08, 0]} receiveShadow>
        <planeGeometry args={[110, 125]} />
        <meshStandardMaterial color="#d6d3d1" roughness={0.85} />
      </mesh>

      {areaId === 'area-1236' && (
        <>
          {/* =============================================================== */}
          {/* 1. 写真1の「1号館 象徴的ファサード（中央ガラスアトリウム＋レンガアーチ）」 */}
          {/* =============================================================== */}
          {/* 1号館 中央メインアーチゲート（Z=26の中庭正面） */}
          <group position={[-3, groundY, 26]}>
            {/* レンガの門構え左右柱 */}
            <mesh position={[-4.2, 3.6, 0]} castShadow>
              <boxGeometry args={[2.0, 7.2, 1.2]} />
              <meshStandardMaterial color="#9a3412" roughness={0.75} />
            </mesh>
            <mesh position={[4.2, 3.6, 0]} castShadow>
              <boxGeometry args={[2.0, 7.2, 1.2]} />
              <meshStandardMaterial color="#9a3412" roughness={0.75} />
            </mesh>
            {/* アーチ上部ヘッダー */}
            <mesh position={[0, 6.4, 0]} castShadow>
              <boxGeometry args={[10.4, 1.8, 1.25]} />
              <meshStandardMaterial color="#9a3412" roughness={0.75} />
            </mesh>
            <mesh position={[0, 4.9, 0]}>
              <torusGeometry args={[3.2, 0.35, 10, 24, Math.PI]} />
              <meshStandardMaterial color="#7c2d12" roughness={0.7} />
            </mesh>
            {/* 白いコーニス */}
            <mesh position={[0, 7.4, 0]}>
              <boxGeometry args={[10.8, 0.3, 1.4]} />
              <meshStandardMaterial color="#f5f5f4" />
            </mesh>
          </group>

          {/* 1号館 1〜2F 左右の連続レンガアーチ回廊（中庭側 Z=26） */}
          <BrickArchFacade position={[-22, groundY, 26]} count={7} width={3.6} height={6.2} />
          <BrickArchFacade position={[18, groundY, 26]} count={8} width={3.6} height={6.2} />

          {/* 2号館側（西側 X=-10）の連続レンガアーチ回廊 */}
          <BrickArchFacade
            position={[-10, groundY, 8]}
            rotation={[0, Math.PI / 2, 0]}
            count={9}
            width={3.6}
            height={6.2}
          />
          {/* 6号館側（東側 X=4）の連続レンガアーチ回廊 */}
          <BrickArchFacade
            position={[4, groundY, 8]}
            rotation={[0, -Math.PI / 2, 0]}
            count={9}
            width={3.6}
            height={6.2}
          />

          {/* 1号館 高層タワー外観（南側背面 Z=50.5 にそびえる13階建てアイボリー外壁＋中央ガラスアトリウム） */}
          <group position={[0, groundY, 50.6]}>
            {/* 左ウイング（アイボリー外壁） */}
            <mesh position={[-23, 21, 0]} castShadow>
              <boxGeometry args={[34, 42, 0.8]} />
              <meshStandardMaterial color="#f5f5f4" roughness={0.6} />
            </mesh>
            {/* 右ウイング（アイボリー外壁） */}
            <mesh position={[20, 21, 0]} castShadow>
              <boxGeometry args={[40, 42, 0.8]} />
              <meshStandardMaterial color="#f5f5f4" roughness={0.6} />
            </mesh>
            {/* 中央ガラスカーテンウォール（アトリウム） */}
            <mesh position={[-3, 23, -0.1]}>
              <boxGeometry args={[10, 34, 0.7]} />
              <meshStandardMaterial
                color="#7dd3fc"
                transparent
                opacity={0.72}
                roughness={0.15}
                metalness={0.3}
              />
            </mesh>
            {/* 中層（7F付近）と最上階（13F）の半円形キャノピー（庇） */}
            <mesh position={[-3, 22, -1.6]} rotation={[0, 0, 0]} castShadow>
              <cylinderGeometry args={[5.4, 5.4, 0.35, 24, 1, false, -Math.PI / 2, Math.PI]} />
              <meshStandardMaterial color="#e7e5e4" metalness={0.3} roughness={0.4} />
            </mesh>
            <mesh position={[-3, 41.5, -1.8]} rotation={[0, 0, 0]} castShadow>
              <cylinderGeometry args={[5.6, 5.6, 0.4, 24, 1, false, -Math.PI / 2, Math.PI]} />
              <meshStandardMaterial color="#e7e5e4" metalness={0.3} roughness={0.4} />
            </mesh>
            {/* 最上階コーニス装飾 */}
            <mesh position={[0, 42.2, 0]}>
              <boxGeometry args={[81, 0.7, 1.4]} />
              <meshStandardMaterial color="#e7e5e4" />
            </mesh>
          </group>

          {/* =============================================================== */}
          {/* 2. 中庭（パティオ）の並木道＆ベンチ（写真1の左右の樹木）          */}
          {/* =============================================================== */}
          {[-8, -1, 6, 13, 20].map((zPos, i) => (
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

          {/* 中庭の屋外ベンチ＆プランター */}
          {[-4, 10, 18].map((zPos, idx) => (
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

          {/* =============================================================== */}
          {/* 3. 写真2（航空写真）の東側大通り・歩行者デッキ・周辺ビル群         */}
          {/* =============================================================== */}
          {/* 東側を通る片側2車線の大通り（X = 56 付近を南北に縦断） */}
          <group position={[56, groundY - 0.05, 0]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[18, 280]} />
              <meshStandardMaterial color="#334155" roughness={0.9} />
            </mesh>
            {/* 中央分離帯の植栽 */}
            <mesh position={[0, 0.15, 0]}>
              <boxGeometry args={[1.4, 0.3, 280]} />
              <meshStandardMaterial color="#15803d" />
            </mesh>
            {/* 道路沿いの街路樹 */}
            {[-60, -40, -20, 0, 20, 40, 60].map((z, idx) => (
              <React.Fragment key={`road-tree-${idx}`}>
                <CampusTree position={[-10.5, 0, z]} scale={1.15} leafColor="#3f6212" />
                <CampusTree position={[10.5, 0, z]} scale={1.15} leafColor="#4d7c0f" />
              </React.Fragment>
            ))}
          </group>

          {/* 大通りをまたいで4号館・5号館側と繋がる歩行者デッキ（2F高さ Y=3.4） */}
          <group position={[56, groundY + 3.4, 24]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[36, 0.45, 7]} />
              <meshStandardMaterial color="#e2e8f0" roughness={0.6} />
            </mesh>
            {/* デッキの手すり */}
            <mesh position={[0, 0.65, 3.3]}>
              <boxGeometry args={[36, 0.9, 0.15]} />
              <meshStandardMaterial color="#94a3b8" />
            </mesh>
            <mesh position={[0, 0.65, -3.3]}>
              <boxGeometry args={[36, 0.9, 0.15]} />
              <meshStandardMaterial color="#94a3b8" />
            </mesh>
          </group>

          {/* 大通りの向こう側に見える4号館・5号館の遠景ビルシルエット */}
          <group position={[88, groundY, 24]}>
            <mesh position={[0, 8.5, 0]} castShadow>
              <boxGeometry args={[28, 17, 22]} />
              <meshStandardMaterial color="#f5f5f4" />
            </mesh>
            <mesh position={[0, 2.5, 0]}>
              <boxGeometry args={[28.4, 5, 22.4]} />
              <meshStandardMaterial color="#9a3412" />
            </mesh>
          </group>
          <group position={[92, groundY, -16]}>
            <mesh position={[0, 12, 0]} castShadow>
              <boxGeometry args={[26, 24, 24]} />
              <meshStandardMaterial color="#f5f5f4" />
            </mesh>
            {/* 5号館屋上緑化 */}
            <mesh position={[0, 24.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[22, 20]} />
              <meshStandardMaterial color="#4ade80" />
            </mesh>
          </group>

          {/* 3号館北側の芝生・公園エリア（写真2の左下・ロハスカフェ前の緑地） */}
          <group position={[0, groundY, -75]}>
            {[-25, -10, 5, 20, 32].map((x, i) => (
              <CampusTree key={`park-n-${i}`} position={[x, 0, -5 - (i % 2) * 8]} scale={1.3} leafColor="#15803d" />
            ))}
          </group>
        </>
      )}

      {/* 4号館・5号館エリア選択時の周辺景色 */}
      {(areaId === 'area-4' || areaId === 'area-5') && (
        <>
          {/* 西側の大通り */}
          <group position={[-42, groundY - 0.05, 0]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[18, 240]} />
              <meshStandardMaterial color="#334155" />
            </mesh>
            {[-45, -25, -5, 15, 35].map((z, idx) => (
              <CampusTree key={`w-tree-${idx}`} position={[10.5, 0, z]} scale={1.1} leafColor="#4d7c0f" />
            ))}
          </group>
          {/* 向かい側の1・2・3・6号館遠景 */}
          <group position={[-76, groundY, 10]}>
            <mesh position={[0, 18, 0]}>
              <boxGeometry args={[32, 36, 56]} />
              <meshStandardMaterial color="#f5f5f4" />
            </mesh>
            <mesh position={[0, 3, 0]}>
              <boxGeometry args={[32.4, 6, 56.4]} />
              <meshStandardMaterial color="#9a3412" />
            </mesh>
          </group>
          {/* 東側の公園・遊歩道 */}
          {[28, 34, 40].map((x, i) => (
            <React.Fragment key={`e-park-${i}`}>
              <CampusTree position={[x, groundY, -14 + i * 8]} scale={1.2} leafColor="#15803d" />
              <CampusTree position={[x + 4, groundY, 8 + i * 6]} scale={1.1} leafColor="#4d7c0f" />
            </React.Fragment>
          ))}
        </>
      )}
    </group>
  );
}

function RoomBox({ room }) {
  return (
    <group position={[room.x, 0, room.z]}>
      {/* 部屋の床 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]} receiveShadow>
        <planeGeometry args={[room.w, room.d]} />
        <meshStandardMaterial color={room.color} roughness={0.6} />
      </mesh>

      {/* 半透明のガラス調パーティション壁 */}
      <mesh position={[0, 1.4, 0]} castShadow>
        <boxGeometry args={[room.w, 2.8, room.d]} />
        <meshStandardMaterial
          color={room.color}
          transparent
          opacity={0.55}
          roughness={0.25}
        />
      </mesh>

      {/* 輪郭エッジ */}
      <lineSegments position={[0, 1.4, 0]}>
        <edgesGeometry args={[new THREE.BoxGeometry(room.w, 2.8, room.d)]} />
        <lineBasicMaterial color="#1e293b" />
      </lineSegments>

      {/* 部屋名ラベル */}
      <Html position={[0, 3.2, 0]} center distanceFactor={26} zIndexRange={[10, 0]}>
        <div className="bg-slate-900/90 text-white px-2 py-1 rounded text-[11px] font-bold whitespace-pre-line text-center shadow-md border border-slate-500 pointer-events-none select-none leading-tight">
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

function PortalGate({ portal, isNear }) {
  return (
    <group position={[portal.x, 0, portal.z]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
        <circleGeometry args={[1.8, 32]} />
        <meshBasicMaterial color={isNear ? '#2563eb' : '#3b82f6'} />
      </mesh>
      <Html position={[0, 2.5, 0]} center distanceFactor={26}>
        <div className="bg-blue-700 text-white px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap shadow-md pointer-events-none select-none">
          🚪 {portal.name}
        </div>
      </Html>
    </group>
  );
}

function PlayerController({
  floorData,
  activeZones,
  keysPressed,
  joystickInput,
  onNearElevatorChange,
  onNearPortalChange,
  onCurrentBuildingChange,
  teleportTarget,
  isPortrait,
}) {
  const playerRef = useRef();
  const controlsRef = useRef();
  const { camera } = useThree();

  const posRef = useRef(new THREE.Vector3(floorData.spawn[0], 0, floorData.spawn[1]));
  const rotYRef = useRef(0);
  const lastBldgRef = useRef('');

  useEffect(() => {
    camera.fov = isPortrait ? 56 : 45;
    camera.updateProjectionMatrix();
  }, [isPortrait, camera]);

  const checkCollision = (nextX, nextZ) => {
    // 隣接する建物・中庭ゾーンが繋がっていれば境界線をまたいで歩行可能
    const isPointInAnyZone = (px, pz) =>
      activeZones?.some(
        (z) => px >= z.minX && px <= z.maxX && pz >= z.minZ && pz <= z.maxZ
      );

    const wallMargin = 0.35;
    const isInsideBuilding =
      isPointInAnyZone(nextX, nextZ) &&
      isPointInAnyZone(nextX - wallMargin, nextZ) &&
      isPointInAnyZone(nextX + wallMargin, nextZ) &&
      isPointInAnyZone(nextX, nextZ - wallMargin) &&
      isPointInAnyZone(nextX, nextZ + wallMargin);

    if (!isInsideBuilding) return true;

    const margin = 0.45;

    if (floorData.voids) {
      for (const v of floorData.voids) {
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

    for (const room of floorData.rooms) {
      if (
        nextX > room.x - room.w / 2 - margin &&
        nextX < room.x + room.w / 2 + margin &&
        nextZ > room.z - room.d / 2 - margin &&
        nextZ < room.z + room.d / 2 + margin
      ) {
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
    return [floorData.spawn[0], floorData.spawn[1]];
  };

  useEffect(() => {
    const rawTarget = teleportTarget ? teleportTarget.coords : floorData.spawn;
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
  }, [floorData, teleportTarget, camera]);

  useFrame((_, delta) => {
    const baseSpeed = 15 * Math.min(delta, 0.05);
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

    if (activeZones) {
      const currentZone = activeZones.find(
        (z) =>
          posRef.current.x >= z.minX &&
          posRef.current.x <= z.maxX &&
          posRef.current.z >= z.minZ &&
          posRef.current.z <= z.maxZ
      );
      const bldgName = currentZone ? currentZone.name : '';
      if (bldgName && bldgName !== lastBldgRef.current) {
        lastBldgRef.current = bldgName;
        onCurrentBuildingChange(bldgName);
      }
    }

    let foundEv = null;
    for (const ev of floorData.elevators) {
      const dist = Math.hypot(posRef.current.x - ev.x, posRef.current.z - ev.z);
      if (dist < 2.8) {
        foundEv = ev;
        break;
      }
    }
    onNearElevatorChange(foundEv);

    let foundPortal = null;
    for (const pt of floorData.portals) {
      const dist = Math.hypot(posRef.current.x - pt.x, posRef.current.z - pt.z);
      if (dist < 2.8) {
        foundPortal = pt;
        break;
      }
    }
    onNearPortalChange(foundPortal);
  });

  return (
    <>
      <group ref={playerRef} position={[floorData.spawn[0], 0, floorData.spawn[1]]}>
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

      {/* maxPolarAngleを広げて、視点を下げて1号館を見上げるアングルも楽しめるように設定 */}
      <OrbitControls
        ref={controlsRef}
        enableDamping
        dampingFactor={0.08}
        minDistance={5}
        maxDistance={60}
        maxPolarAngle={Math.PI / 2.02}
      />
    </>
  );
}

export default function ThreeCampusViewer({ onClose }) {
  const [currentAreaId, setCurrentAreaId] = useState('area-1236');
  const [currentFloor, setCurrentFloor] = useState('1F');
  const [currentSubBldg, setCurrentSubBldg] = useState('1号館');
  const [nearElevator, setNearElevator] = useState(null);
  const [nearPortal, setNearPortal] = useState(null);
  const [teleportTarget, setTeleportTarget] = useState(null);

  const [isMobile, setIsMobile] = useState(false);
  const [isPortrait, setIsPortrait] = useState(false);
  const [isMobileFloorOpen, setIsMobileFloorOpen] = useState(false);

  const keysPressed = useRef({});
  const joystickInput = useRef({ x: 0, y: 0 });

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

  const currentArea = CAMPUS_3D_BUILDINGS[currentAreaId];
  const floorData = currentArea.floors[currentFloor] || Object.values(currentArea.floors)[0];
  const availableFloors = Object.keys(currentArea.floors);

  // 1Fでは中庭（パティオ）を歩けるゾーンとして追加し、2Fではデッキ接続を保証
  const activeZones = useMemo(() => {
    const baseZones = floorData.buildingZones || [];
    if (currentAreaId === 'area-1236' && currentFloor === '1F') {
      return [
        ...baseZones,
        {
          name: '中庭（パティオ）',
          minX: -10,
          maxX: 4,
          minZ: -14,
          maxZ: 26,
          floorColor: '#e7e5e4',
        },
      ];
    }
    if (currentAreaId === 'area-1236' && currentFloor === '2F') {
      return baseZones.map((z) =>
        z.name === 'キャンパスデッキ' ? { ...z, maxX: 16 } : z
      );
    }
    return baseZones;
  }, [floorData, currentAreaId, currentFloor]);

  const handleSelectArea = (areaId, targetFloor = null) => {
    const targetArea = CAMPUS_3D_BUILDINGS[areaId];
    const nextFloor = targetFloor || Object.keys(targetArea.floors)[0];
    setCurrentAreaId(areaId);
    setCurrentFloor(nextFloor);
    setNearElevator(null);
    setNearPortal(null);
    setTeleportTarget(null);
    setIsMobileFloorOpen(false);
  };

  const getQuickSpots1236 = () => {
    const floorNum = parseInt(currentFloor.replace('F', ''), 10);
    if (floorNum === 1) {
      return [
        { name: '1号館 エントランス', coords: [0, 40] },
        { name: '中庭（1号館見上げ）', coords: [-3, 4] },
        { name: '2号館 図書館前', coords: [-25, 16] },
        { name: '3号館 学生ホール・食堂', coords: [-2, -26] },
      ];
    }
    if (floorNum === 2) {
      return [
        { name: '1号館 2F廊下', coords: [0, 38] },
        { name: 'キャンパスデッキ', coords: [-3, 6] },
        { name: '6号館 2Fホール', coords: [11, 6] },
        { name: '3号館 ロハスカフェ前', coords: [12, -38] },
      ];
    }
    if (floorNum === 3) {
      return [
        { name: '1号館 3F廊下', coords: [0, 38] },
        { name: '2号館 ライブラリー', coords: [-28, 22] },
        { name: '6号館 3Fホール', coords: [14, 4] },
        { name: '3号館 3-301大教室前', coords: [11, -35] },
      ];
    }
    if (floorNum === 4 || floorNum === 5) {
      return [
        { name: `1号館 ${floorNum}F廊下`, coords: [0, 38] },
        { name: `2号館 ${floorNum}F通路`, coords: [-26, 8] },
        { name: `6号館 ${floorNum}Fホール`, coords: [15, 2] },
      ];
    }
    if (floorNum === 6) {
      return [
        { name: '1号館 6F管理フロア', coords: [0, 38] },
        { name: '2号館 屋上庭園', coords: [-26, 5] },
        { name: '6号館 屋上庭園', coords: [28, 5] },
      ];
    }
    if (floorNum >= 7 && floorNum <= 12) {
      return [
        { name: '1号館 西側エリア', coords: [-28, 38] },
        { name: '1号館 中央EV前', coords: [-12, 38] },
        { name: '1号館 東側エリア', coords: [25, 38] },
      ];
    }
    return [
      { name: '1-13A 会議室前', coords: [-18, 43] },
      { name: '1-13B 会議室前', coords: [18, 43] },
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
                onClick={() => setTeleportTarget({ coords: floorData.spawn, ts: Date.now() })}
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
            {Object.values(CAMPUS_3D_BUILDINGS).map((area) => (
              <button
                key={area.id}
                onClick={() => handleSelectArea(area.id)}
                className={`py-1.5 rounded-lg text-xs font-bold transition text-center ${
                  currentAreaId === area.id
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-slate-300 active:bg-slate-700'
                }`}
              >
                {area.name.replace('エリア', '')}
              </button>
            ))}
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
              WASD・矢印キーで移動 / ドラッグで視点回転（視点を下げると1号館を見上げられます）
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-800 p-1 rounded-xl border border-slate-700">
            {Object.values(CAMPUS_3D_BUILDINGS).map((area) => (
              <button
                key={area.id}
                onClick={() => handleSelectArea(area.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  currentAreaId === area.id
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-slate-300 hover:bg-slate-700'
                }`}
              >
                {area.name}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setTeleportTarget({ coords: floorData.spawn, ts: Date.now() })}
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
          {/* 爽やかな青空と遠景の自然な霞み */}
          <color attach="background" args={['#bae6fd']} />
          <fog attach="fog" args={['#e0f2fe', 85, 220]} />

          {/* 太陽光と空からの環境光 */}
          <hemisphereLight args={['#f0f9ff', '#bbf7d0', 0.85]} />
          <directionalLight
            position={[35, 65, 30]}
            intensity={1.15}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            shadow-camera-left={-60}
            shadow-camera-right={60}
            shadow-camera-top={60}
            shadow-camera-bottom={-60}
          />

          {/* キャンパス外観・中庭並木・大通り・歩行者デッキの景観 */}
          <CampusScenery areaId={currentAreaId} currentFloor={currentFloor} />

          {/* 建物の床ゾーン群 */}
          {activeZones?.map((zone) => {
            const zw = zone.maxX - zone.minX;
            const zd = zone.maxZ - zone.minZ;
            const zx = (zone.minX + zone.maxX) / 2;
            const zz = (zone.minZ + zone.maxZ) / 2;
            return (
              <group key={zone.name} position={[zx, 0, zz]}>
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
          {floorData.voids?.map((v, idx) => (
            <VoidBox key={idx} voidArea={v} />
          ))}

          {/* 部屋の立体建築生成 */}
          {floorData.rooms.map((room) => (
            <RoomBox key={room.id} room={room} />
          ))}

          {/* 連絡通路サイン */}
          {floorData.connectors?.map((conn, idx) => (
            <ConnectorSign key={idx} connector={conn} />
          ))}

          {/* エレベーター */}
          {floorData.elevators.map((ev) => (
            <ElevatorPad
              key={ev.id}
              ev={ev}
              isNear={nearElevator?.id === ev.id}
            />
          ))}

          {/* 他号館ポータル */}
          {floorData.portals.map((pt) => (
            <PortalGate
              key={pt.id}
              portal={pt}
              isNear={nearPortal?.id === pt.id}
            />
          ))}

          {/* プレイヤーキャラクター操作 */}
          <PlayerController
            floorData={floorData}
            activeZones={activeZones}
            keysPressed={keysPressed}
            joystickInput={joystickInput}
            onNearElevatorChange={(ev) => {
              if (ev?.id !== nearElevator?.id) setNearElevator(ev);
            }}
            onNearPortalChange={(pt) => {
              if (pt?.id !== nearPortal?.id) setNearPortal(pt);
            }}
            onCurrentBuildingChange={(bldg) => setCurrentSubBldg(bldg)}
            teleportTarget={teleportTarget}
            isPortrait={isPortrait}
          />
        </Canvas>

        {/* スマホ用操作UI（左下＝360度バーチャルスティック / 右下＝フロア移動） */}
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
                      🏢 {currentArea.name} フロア選択
                    </span>
                    <button
                      onClick={() => setIsMobileFloorOpen(false)}
                      className="text-xs text-slate-300 px-2 py-0.5 bg-slate-800 rounded-lg"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-2.5">
                    {availableFloors.map((fl) => (
                      <button
                        key={fl}
                        onClick={() => {
                          setCurrentFloor(fl);
                          setNearElevator(null);
                          setTeleportTarget(null);
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

                  {currentAreaId === 'area-1236' && (
                    <div className="border-t border-slate-700 pt-2">
                      <p className="text-[11px] font-bold text-slate-400 mb-1.5">
                        🚶 クイック移動（{currentFloor}）
                      </p>
                      <div className="grid grid-cols-2 gap-1.5">
                        {getQuickSpots1236().map((spot) => (
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
                  )}
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
          <div className="absolute bottom-5 left-5 bg-slate-900/90 backdrop-blur border border-slate-700 rounded-xl p-3 text-white shadow-xl z-10 flex flex-col gap-3 max-w-[270px]">
            <div>
              <p className="text-[11px] font-bold text-emerald-400 mb-1.5">
                🏢 {currentArea.name} フロア移動
              </p>
              <div className="flex flex-wrap gap-1.5">
                {availableFloors.map((fl) => (
                  <button
                    key={fl}
                    onClick={() => {
                      setCurrentFloor(fl);
                      setNearElevator(null);
                      setTeleportTarget(null);
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

            {currentAreaId === 'area-1236' && (
              <div className="border-t border-slate-700/80 pt-2.5">
                <p className="text-[11px] font-bold text-slate-400 mb-1.5">
                  🚶 クイック移動（{currentFloor}）
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {getQuickSpots1236().map((spot) => (
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
            )}
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
                    setTeleportTarget(null);
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

        {/* 中央下：他号館ゲート到達時UI */}
        {nearPortal && (
          <div
            className={`absolute left-1/2 -translate-x-1/2 bg-blue-950/95 border-2 border-blue-400 text-white rounded-2xl shadow-2xl z-20 text-center ${
              isMobile ? 'bottom-36 px-4 py-2.5 w-[85%] max-w-xs' : 'bottom-6 px-5 py-3.5'
            }`}
          >
            <p className="text-xs font-bold text-blue-300 mb-1.5">
              🚪 連絡通路に到着
            </p>
            <button
              onClick={() => handleSelectArea(nearPortal.targetArea, nearPortal.targetFloor)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs md:text-sm shadow-lg transition"
            >
              {nearPortal.name}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}