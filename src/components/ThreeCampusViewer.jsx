import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import { CAMPUS_3D_BUILDINGS } from '../data/campus3dData';

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
        <div className="bg-sky-950/90 text-sky-300 px-2.5 py-1 rounded text-[11px] font-bold border border-sky-500/60 pointer-events-none">
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
        <div className="bg-indigo-900/90 text-indigo-100 px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap shadow border border-indigo-400 pointer-events-none">
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
        <div className="bg-emerald-600 text-white px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap shadow-md pointer-events-none">
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
        <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap shadow-md pointer-events-none">
          🚪 {portal.name}
        </div>
      </Html>
    </group>
  );
}

function PlayerController({
  floorData,
  keysPressed,
  mobileInput,
  onNearElevatorChange,
  onNearPortalChange,
  onCurrentBuildingChange,
  teleportTarget,
}) {
  const playerRef = useRef();
  const controlsRef = useRef();
  const { camera } = useThree();

  const posRef = useRef(new THREE.Vector3(floorData.spawn[0], 0, floorData.spawn[1]));
  const rotYRef = useRef(0);
  const lastBldgRef = useRef('');

  const checkCollision = (nextX, nextZ) => {
    const isInsideBuilding = floorData.buildingZones?.some(
      (z) =>
        nextX >= z.minX + 0.5 &&
        nextX <= z.maxX - 0.5 &&
        nextZ >= z.minZ + 0.5 &&
        nextZ <= z.maxZ - 0.5
    );
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
    camera.position.set(safeX, 16, safeZ + 18);
    if (controlsRef.current) {
      controlsRef.current.target.set(safeX, 1, safeZ);
      controlsRef.current.update();
    }
  }, [floorData, teleportTarget, camera]);

  useFrame((_, delta) => {
    const speed = 15 * Math.min(delta, 0.05);
    let moveForward = 0;
    let moveRight = 0;

    if (keysPressed.current['KeyW'] || keysPressed.current['ArrowUp'] || mobileInput.current.up) moveForward += 1;
    if (keysPressed.current['KeyS'] || keysPressed.current['ArrowDown'] || mobileInput.current.down) moveForward -= 1;
    if (keysPressed.current['KeyD'] || keysPressed.current['ArrowRight'] || mobileInput.current.right) moveRight += 1;
    if (keysPressed.current['KeyA'] || keysPressed.current['ArrowLeft'] || mobileInput.current.left) moveRight -= 1;

    if (moveForward !== 0 || moveRight !== 0) {
      const camDir = new THREE.Vector3();
      camera.getWorldDirection(camDir);
      camDir.y = 0;
      camDir.normalize();

      const camRight = new THREE.Vector3();
      camRight.crossVectors(camDir, new THREE.Vector3(0, 1, 0)).normalize();

      const moveVec = new THREE.Vector3()
        .addScaledVector(camDir, moveForward)
        .addScaledVector(camRight, moveRight)
        .normalize()
        .multiplyScalar(speed);

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
        maxDistance={48}
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

  const keysPressed = useRef({});
  const mobileInput = useRef({ up: false, down: false, left: false, right: false });

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
  };

  // 全階層対応のクイック移動スポット
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
    <div className="fixed inset-0 bg-slate-950 z-50 flex flex-col font-sans select-none">
      {/* 上部ナビゲーションバー */}
      <div className="px-4 py-3 bg-slate-900/95 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 text-white z-20">
        <div>
          <h2 className="text-base md:text-lg font-bold flex items-center gap-2">
            <span className="bg-blue-600 text-xs px-2 py-0.5 rounded">3Dウォーク</span>
            <span className="text-amber-300">現在地: {currentSubBldg} {currentFloor}</span>
          </h2>
          <p className="text-[11px] text-slate-400">
            全階対応・配置図準拠 / WASD・矢印キー（または右下パッド）で移動
          </p>
        </div>

        {/* 号館エリア切替タブ */}
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

      {/* 3Dメインビューポート */}
      <div className="flex-1 relative">
        <Canvas shadows camera={{ position: [0, 16, 54], fov: 45 }}>
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
            mobileInput={mobileInput}
            onNearElevatorChange={(ev) => {
              if (ev?.id !== nearElevator?.id) setNearElevator(ev);
            }}
            onNearPortalChange={(pt) => {
              if (pt?.id !== nearPortal?.id) setNearPortal(pt);
            }}
            onCurrentBuildingChange={(bldg) => setCurrentSubBldg(bldg)}
            teleportTarget={teleportTarget}
          />
        </Canvas>

        {/* 左下：フロア移動（全階折り返し対応）＋ クイック移動パネル */}
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

        {/* 中央下：エレベーター到達時UI */}
        {nearElevator && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-emerald-950/95 border-2 border-emerald-400 text-white px-5 py-3.5 rounded-2xl shadow-2xl z-20 text-center max-w-md w-[90%]">
            <p className="text-xs font-bold text-emerald-300 mb-2">
              🛗 {nearElevator.name} に到着！移動する階を選択：
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
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                    currentFloor === fl
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-slate-800 hover:bg-emerald-600 text-white'
                  }`}
                >
                  {fl}へ
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 中央下：他号館ゲート到達時UI */}
        {nearPortal && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-blue-950/95 border-2 border-blue-400 text-white px-5 py-3.5 rounded-2xl shadow-2xl z-20 text-center">
            <p className="text-xs font-bold text-blue-300 mb-2">
              🚪 連絡通路に到着しました
            </p>
            <button
              onClick={() => handleSelectArea(nearPortal.targetArea, nearPortal.targetFloor)}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm shadow-lg transition"
            >
              {nearPortal.name}
            </button>
          </div>
        )}

        {/* 右下：方向パッド */}
        <div className="absolute bottom-5 right-5 grid grid-cols-3 gap-1.5 w-32 h-32 z-10">
          <div />
          <button
            onMouseDown={() => (mobileInput.current.up = true)}
            onMouseUp={() => (mobileInput.current.up = false)}
            onMouseLeave={() => (mobileInput.current.up = false)}
            onTouchStart={() => (mobileInput.current.up = true)}
            onTouchEnd={() => (mobileInput.current.up = false)}
            className="bg-slate-800/90 active:bg-blue-600 text-white rounded-xl border border-slate-600 flex items-center justify-center font-bold text-lg shadow"
          >
            ▲
          </button>
          <div />
          <button
            onMouseDown={() => (mobileInput.current.left = true)}
            onMouseUp={() => (mobileInput.current.left = false)}
            onMouseLeave={() => (mobileInput.current.left = false)}
            onTouchStart={() => (mobileInput.current.left = true)}
            onTouchEnd={() => (mobileInput.current.left = false)}
            className="bg-slate-800/90 active:bg-blue-600 text-white rounded-xl border border-slate-600 flex items-center justify-center font-bold text-lg shadow"
          >
            ◀
          </button>
          <div className="bg-slate-900/60 rounded-xl border border-slate-800 flex items-center justify-center text-[10px] text-slate-400">
            移動
          </div>
          <button
            onMouseDown={() => (mobileInput.current.right = true)}
            onMouseUp={() => (mobileInput.current.right = false)}
            onMouseLeave={() => (mobileInput.current.right = false)}
            onTouchStart={() => (mobileInput.current.right = true)}
            onTouchEnd={() => (mobileInput.current.right = false)}
            className="bg-slate-800/90 active:bg-blue-600 text-white rounded-xl border border-slate-600 flex items-center justify-center font-bold text-lg shadow"
          >
            ▶
          </button>
          <div />
          <button
            onMouseDown={() => (mobileInput.current.down = true)}
            onMouseUp={() => (mobileInput.current.down = false)}
            onMouseLeave={() => (mobileInput.current.down = false)}
            onTouchStart={() => (mobileInput.current.down = true)}
            onTouchEnd={() => (mobileInput.current.down = false)}
            className="bg-slate-800/90 active:bg-blue-600 text-white rounded-xl border border-slate-600 flex items-center justify-center font-bold text-lg shadow"
          >
            ▼
          </button>
          <div />
        </div>
      </div>
    </div>
  );
}