import React, { useRef, useState, useEffect } from 'react';
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
    // 上方向を前進(+1)にするためY軸を反転
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
      className="relative w-28 h-28 rounded-full bg-slate-900/75 backdrop-blur-sm border-2 border-slate-500/70 shadow-2xl flex items-center justify-center touch-none select-none"
    >
      {/* 十字ガイド線 */}
      <div className="absolute inset-3 rounded-full border border-slate-600/40 pointer-events-none" />
      <span className="absolute top-1.5 text-[9px] text-slate-400 font-bold pointer-events-none">▲</span>
      <span className="absolute bottom-1.5 text-[9px] text-slate-400 font-bold pointer-events-none">▼</span>
      <span className="absolute left-2 text-[9px] text-slate-400 font-bold pointer-events-none">◀</span>
      <span className="absolute right-2 text-[9px] text-slate-400 font-bold pointer-events-none">▶</span>

      {/* スティックのつまみ（ノブ） */}
      <div
        style={{
          transform: `translate3d(${knobPos.x}px, ${knobPos.y}px, 0)`,
        }}
        className={`w-12 h-12 rounded-full shadow-lg border-2 pointer-events-none transition-colors ${
          active
            ? 'bg-blue-500 border-blue-200 scale-105'
            : 'bg-slate-700/90 border-slate-400'
        }`}
      />
    </div>
  );
}

function RoomBox({ room }) {
  return (
    <group position={[room.x, 0, room.z]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <planeGeometry args={[room.w, room.d]} />
        <meshStandardMaterial color={room.color} />
      </mesh>

      <mesh position={[0, 1.4, 0]}>
        <boxGeometry args={[room.w, 2.8, room.d]} />
        <meshStandardMaterial
          color={room.color}
          transparent
          opacity={0.48}
          roughness={0.2}
        />
      </mesh>

      <lineSegments position={[0, 1.4, 0]}>
        <edgesGeometry args={[new THREE.BoxGeometry(room.w, 2.8, room.d)]} />
        <lineBasicMaterial color="#334155" />
      </lineSegments>

      <Html position={[0, 3.2, 0]} center distanceFactor={26} zIndexRange={[10, 0]}>
        <div className="bg-slate-900/90 text-white px-2 py-1 rounded text-[11px] font-bold whitespace-pre-line text-center shadow-md border border-slate-600 pointer-events-none select-none leading-tight">
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
        <meshStandardMaterial color="#0f172a" />
      </mesh>
      <lineSegments position={[0, 0.6, 0]}>
        <edgesGeometry args={[new THREE.BoxGeometry(voidArea.w, 1.2, voidArea.d)]} />
        <lineBasicMaterial color="#38bdf8" />
      </lineSegments>
      <Html position={[0, 1.6, 0]} center distanceFactor={28}>
        <div className="bg-sky-950/90 text-sky-300 px-2.5 py-1 rounded text-[11px] font-bold border border-sky-500/60 pointer-events-none select-none">
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
        <meshBasicMaterial color="#94a3b8" transparent opacity={0.4} />
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
        <meshBasicMaterial color={isNear ? '#22c55e' : '#10b981'} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 1.5, 0]}>
        <cylinderGeometry args={[1.2, 1.2, 3, 24, 1, true]} />
        <meshStandardMaterial
          color="#10b981"
          transparent
          opacity={isNear ? 0.35 : 0.15}
          side={THREE.DoubleSide}
        />
      </mesh>
      <Html position={[0, 3.3, 0]} center distanceFactor={26}>
        <div className="bg-emerald-600 text-white px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap shadow-md pointer-events-none select-none">
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
        <meshBasicMaterial color={isNear ? '#3b82f6' : '#60a5fa'} />
      </mesh>
      <Html position={[0, 2.5, 0]} center distanceFactor={26}>
        <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap shadow-md pointer-events-none select-none">
          🚪 {portal.name}
        </div>
      </Html>
    </group>
  );
}

function PlayerController({
  floorData,
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
    // いずれかの建物・通路ゾーンの内部にいるか判定（境界線ぴったりでも接続）
    const isPointInAnyZone = (px, pz) =>
      floorData.buildingZones?.some(
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

    // PCキーボード入力（WASD / 矢印キー）
    if (keysPressed.current['KeyW'] || keysPressed.current['ArrowUp']) inputForward += 1;
    if (keysPressed.current['KeyS'] || keysPressed.current['ArrowDown']) inputForward -= 1;
    if (keysPressed.current['KeyD'] || keysPressed.current['ArrowRight']) inputRight += 1;
    if (keysPressed.current['KeyA'] || keysPressed.current['ArrowLeft']) inputRight -= 1;

    // キーボード入力がない場合はスマホのスティック入力を適用
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

    if (floorData.buildingZones) {
      const currentZone = floorData.buildingZones.find(
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
          <meshBasicMaterial color="#3b82f6" />
        </mesh>
      </group>

      <OrbitControls
        ref={controlsRef}
        enableDamping
        dampingFactor={0.08}
        minDistance={6}
        maxDistance={52}
        maxPolarAngle={Math.PI / 2.2}
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
        { name: '2号館 図書館前', coords: [-25, 16] },
        { name: '6号館 ホール', coords: [9, 12] },
        { name: '3号館 学生ホール・食堂', coords: [-2, -26] },
      ];
    }
    if (floorNum === 2) {
      return [
        { name: '1号館 2F廊下', coords: [0, 38] },
        { name: '2号館 図書館2F前', coords: [-26, 14] },
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
    <div className="fixed inset-0 bg-slate-950 z-50 flex flex-col font-sans select-none overflow-hidden touch-none">
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
              WASD・矢印キーで移動 / マウスドラッグで視点回転 / ホイールでズーム
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
          <color attach="background" args={['#0f172a']} />
          <ambientLight intensity={0.95} />
          <directionalLight position={[20, 40, 25]} intensity={1.1} />

          {/* 建物の床ゾーン群 */}
          {floorData.buildingZones?.map((zone) => {
            const zw = zone.maxX - zone.minX;
            const zd = zone.maxZ - zone.minZ;
            const zx = (zone.minX + zone.maxX) / 2;
            const zz = (zone.minZ + zone.maxZ) / 2;
            return (
              <group key={zone.name} position={[zx, 0, zz]}>
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
                  <planeGeometry args={[zw, zd]} />
                  <meshStandardMaterial color={zone.floorColor} />
                </mesh>
                <lineSegments position={[0, 0.02, 0]}>
                  <edgesGeometry args={[new THREE.BoxGeometry(zw, 0.04, zd)]} />
                  <lineBasicMaterial color="#64748b" />
                </lineSegments>
              </group>
            );
          })}

          <gridHelper
            args={[104, 42, '#334155', '#1e293b']}
            position={[0, -0.02, 0]}
          />

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

        {/* =============================================================== */}
        {/* スマホ用操作UI（左下＝360度バーチャルスティック / 右下＝フロア移動） */}
        {/* =============================================================== */}
        {isMobile ? (
          <>
            {/* 左下：アナログスティック */}
            <div className="absolute bottom-5 left-5 z-10">
              <VirtualJoystick joystickRef={joystickInput} />
            </div>

            {/* 右下：折りたたみ式フロア＆クイック移動メニュー */}
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
          /* =============================================================== */
          /* PCデスクトップ用レイアウト（WASD操作のため画面パッドは非表示）      */
          /* =============================================================== */
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