// 有明キャンパス 3Dウォークスルー用 全館・全フロア統合データ（5号館1F平面図・実測写真準拠）

const UNIFIED_ROOM_COLOR = '#60a5fa';

// 1号館 10F・11F・12F 共通の研究室グリッド生成ヘルパー
function createBldg1LabFloor(floorNum, centerNorthRoom, south1005Room, hasVoid = false) {
  const f = floorNum;
  const rooms = [
    { id: `1-${f}13`, name: `1-${f}13 研究室`, x: 15.0, z: 33, w: 5.0, d: 6, color: UNIFIED_ROOM_COLOR },
    { id: `1-${f}14`, name: `1-${f}14 研究室`, x: 20.0, z: 33, w: 5.0, d: 6, color: UNIFIED_ROOM_COLOR },
    { id: `1-${f}15`, name: `1-${f}15 研究室`, x: 25.0, z: 33, w: 5.0, d: 6, color: UNIFIED_ROOM_COLOR },
    { id: `1-${f}16`, name: `1-${f}16 研究室`, x: 30.0, z: 33, w: 5.0, d: 6, color: UNIFIED_ROOM_COLOR },
    { id: `1-${f}17`, name: `1-${f}17 研究室`, x: 35.0, z: 33, w: 5.0, d: 6, color: UNIFIED_ROOM_COLOR },
    { id: `1-${f}18`, name: `1-${f}18 研究室`, x: 40.0, z: 33, w: 5.0, d: 6, color: UNIFIED_ROOM_COLOR },
    { id: `1-${f}19`, name: `1-${f}19 研究室`, x: 45.0, z: 33, w: 5.0, d: 6, color: UNIFIED_ROOM_COLOR },
    { id: `1-${f}20`, name: `1-${f}20 研究室`, x: 50.0, z: 33, w: 5.0, d: 6, color: UNIFIED_ROOM_COLOR },
    { id: `1-${f}21`, name: `1-${f}21 研究室`, x: 55.0, z: 33, w: 5.0, d: 6, color: UNIFIED_ROOM_COLOR },
    { id: `1-${f}22`, name: `1-${f}22 研究室`, x: 60.0, z: 33, w: 5.0, d: 6, color: UNIFIED_ROOM_COLOR },
  ];

  if (centerNorthRoom) {
    rooms.push({
      id: centerNorthRoom.id,
      name: centerNorthRoom.name,
      x: 65.5,
      z: 33,
      w: 5.0,
      d: 6,
      color: UNIFIED_ROOM_COLOR,
    });
  }

  for (let i = 0; i < 6; i++) {
    const num = 23 + i;
    rooms.push({
      id: `1-${f}${num}`,
      name: `1-${f}${num} 研究室`,
      x: 69.5 + i * 2.2,
      z: 33,
      w: 2.2,
      d: 6,
      color: UNIFIED_ROOM_COLOR,
    });
  }

  rooms.push(
    { id: `1-${f}12`, name: `1-${f}12 研究室`, x: 15.5, z: 48, w: 5.5, d: 7, color: UNIFIED_ROOM_COLOR },
    { id: `1-${f}11`, name: `1-${f}11 研究室`, x: 21.0, z: 48, w: 5.5, d: 7, color: UNIFIED_ROOM_COLOR },
    { id: `1-${f}10`, name: `1-${f}10 研究室`, x: 26.5, z: 48, w: 5.5, d: 7, color: UNIFIED_ROOM_COLOR },
    { id: `1-${f}09`, name: `1-${f}09 研究室`, x: 32.0, z: 48, w: 5.0, d: 7, color: UNIFIED_ROOM_COLOR },
    { id: `1-${f}08`, name: `1-${f}08 研究室`, x: 37.0, z: 48, w: 5.0, d: 7, color: UNIFIED_ROOM_COLOR },
    { id: `1-${f}07`, name: `1-${f}07 研究室`, x: 42.0, z: 48, w: 5.0, d: 7, color: UNIFIED_ROOM_COLOR },
    {
      id: `1-${f}05`,
      name: south1005Room || `1-${f}05 研究室`,
      x: 56.0,
      z: 48,
      w: 6.0,
      d: 7,
      color: UNIFIED_ROOM_COLOR,
    },
    { id: `1-${f}04`, name: `1-${f}04 研究室`, x: 62.0, z: 48, w: 5.0, d: 7, color: UNIFIED_ROOM_COLOR },
    { id: `1-${f}02`, name: `1-${f}02 研究室`, x: 74.0, z: 48, w: 5.0, d: 7, color: UNIFIED_ROOM_COLOR },
    { id: `1-${f}01`, name: `1-${f}01 研究室`, x: 79.5, z: 48, w: 5.5, d: 7, color: UNIFIED_ROOM_COLOR }
  );

  const facilities = [
    { id: `wc-${f}`, name: 'トイレ (M / W)', x: 68.0, z: 48, w: 6.0, d: 7 },
  ];

  return {
    buildingZones: [
      { name: '1号館', minX: 12, maxX: 84, minZ: 30, maxZ: 52, floorColor: '#e2e8f0' },
    ],
    voids: hasVoid ? [{ name: '吹き抜け', x: 65.5, z: 33, w: 5.0, d: 6 }] : [],
    rooms,
    facilities,
    elevators: [
      { id: `ev-1-${f}f`, name: '1号館 中央EV', x: 48, z: 45, targets: ['1F', '2F', '3F', '4F', '5F', '6F', '7F', '8F', '9F', '10F', '11F', '12F', '13F'] },
    ],
  };
}

export const CAMPUS_3D_BUILDINGS = {
  // =========================================================================
  // 右側街区：1号館・2号館・3号館・6号館
  // =========================================================================
  'area-1236': {
    id: 'area-1236',
    name: '1・2・3・6号館エリア',
    floors: {
      '1F': {
        spawn: [44, 41],
        buildingZones: [
          { name: '1号館', minX: 12, maxX: 84, minZ: 30, maxZ: 52, floorColor: '#e2e8f0' },
          { name: '2号館', minX: 14, maxX: 36, minZ: -14, maxZ: 24, floorColor: '#e2e8f0' },
          { name: '6号館', minX: 48, maxX: 80, minZ: -12, maxZ: 24, floorColor: '#e2e8f0' },
          { name: '3号館', minX: 44, maxX: 78, minZ: -54, maxZ: -18, floorColor: '#e2e8f0' },
        ],
        rooms: [
          // --- 1号館 1F ---
          { id: '1-health', name: '健康管理センター\n(保健室・学生相談室)', x: 18, z: 46, w: 11, d: 10, color: UNIFIED_ROOM_COLOR },
          { id: '1-1a', name: '1-1A 会議室', x: 26, z: 34, w: 9, d: 7, color: UNIFIED_ROOM_COLOR },
          { id: '1-1b', name: '1-1B ミーティング\nカンファ拠点', x: 34.5, z: 34, w: 8, d: 7, color: UNIFIED_ROOM_COLOR },
          { id: '1-nyushi', name: '入試課・入試広報課', x: 41.5, z: 34, w: 6, d: 7, color: UNIFIED_ROOM_COLOR },
          { id: '1-kanri', name: '管理センター', x: 56, z: 47, w: 8, d: 9, color: UNIFIED_ROOM_COLOR },
          { id: '1-shien', name: '学生支援課', x: 65, z: 47, w: 9, d: 9, color: UNIFIED_ROOM_COLOR },
          { id: '1-kyomu', name: '教務課・学務課\n教育DX支援課', x: 57, z: 34, w: 11, d: 7, color: UNIFIED_ROOM_COLOR },
          { id: '1-gakubu', name: '学部事務課\n研究推進支援課', x: 67.5, z: 34, w: 9, d: 7, color: UNIFIED_ROOM_COLOR },
          { id: '1-kikaku', name: '教育企画課\n社会共創センター', x: 77.5, z: 34, w: 10, d: 7, color: UNIFIED_ROOM_COLOR },

          // --- 2号館 1F ---
          { id: '2-prayer', name: 'prayer room', x: 31, z: -9, w: 8, d: 8, color: UNIFIED_ROOM_COLOR },
          { id: '2-lib1', name: '図書館', x: 20, z: 8, w: 11, d: 20, color: UNIFIED_ROOM_COLOR },
          { id: '2-cls', name: 'クリエイティブ・ラーニング\nスクエア', x: 30.5, z: 7, w: 10, d: 18, color: UNIFIED_ROOM_COLOR },
          { id: '2-read', name: '閲覧コーナー', x: 29, z: 20, w: 12, d: 6, color: UNIFIED_ROOM_COLOR },

          // --- 6号館 1F ---
          { id: '6-101', name: '6-101 教室', x: 56, z: 18, w: 13, d: 10, color: UNIFIED_ROOM_COLOR },
          { id: '6-ext', name: '学外学修推進\nセンター事務課', x: 71.5, z: 19, w: 14, d: 9, color: UNIFIED_ROOM_COLOR },
          { id: '6-102', name: '6-102 教室', x: 73, z: 6, w: 11, d: 14, color: UNIFIED_ROOM_COLOR },
          { id: '6-103', name: '6-103 教室', x: 68, z: -7, w: 16, d: 10, color: UNIFIED_ROOM_COLOR },

          // --- 3号館 1F ---
          { id: '3-gakuyu', name: '学友会室', x: 48.5, z: -22, w: 7, d: 6, color: UNIFIED_ROOM_COLOR },
          { id: '3-hall', name: '学生ホール\n自学自修スペース', x: 50, z: -35, w: 10, d: 16, color: UNIFIED_ROOM_COLOR },
          { id: '3-shop', name: 'カレッジショップ\nありあけ館(売店)', x: 50, z: -49, w: 10, d: 8, color: UNIFIED_ROOM_COLOR },
          { id: '3-shokudo', name: 'ありあけ食堂\n印刷・ブックセンター', x: 66, z: -49, w: 20, d: 8, color: UNIFIED_ROOM_COLOR },
          { id: '3-food', name: 'フードコート\n(大学食堂)', x: 66, z: -32, w: 20, d: 20, color: UNIFIED_ROOM_COLOR },
        ],
        facilities: [
          { id: '1-vend', name: '自販機コーナー', x: 17, z: 33, w: 7, d: 5 },
          { id: '1-wc1', name: 'トイレ (W / M)', x: 34, z: 47, w: 8, d: 9 },
          { id: '1-locker1', name: '更衣室・給湯室', x: 76, z: 47, w: 12, d: 9 },
          { id: '2-wc1', name: 'トイレ (W / M)', x: 19, z: -9, w: 9, d: 8 },
          { id: '6-core1', name: '階段・トイレ (W / M)', x: 61, z: 5, w: 9, d: 11 },
          { id: '3-soko', name: '倉庫（屋外階段B下）', x: 48.5, z: -27, w: 7, d: 4 },
        ],
        elevators: [
          { id: 'ev-1-1f', name: '1号館 中央EV', x: 46, z: 46, targets: ['1F', '2F', '3F', '4F', '5F', '6F', '7F', '8F', '9F', '10F', '11F', '12F', '13F'] },
          { id: 'ev-2-1f', name: '2号館 EV', x: 25, z: -9, targets: ['1F', '2F', '3F', '4F', '5F', '6F'] },
          { id: 'ev-6-1f', name: '6号館 EV', x: 54, z: 3, targets: ['1F', '2F', '3F', '4F', '5F', '6F'] },
          { id: 'ev-3-1f', name: '3号館 EV', x: 58, z: -43, targets: ['1F', '2F', '3F'] },
        ],
      },

      '2F': {
        spawn: [44, 41],
        buildingZones: [
          { name: '1号館', minX: 12, maxX: 84, minZ: 30, maxZ: 52, floorColor: '#e2e8f0' },
          { name: '2号館', minX: 14, maxX: 36, minZ: -14, maxZ: 24, floorColor: '#e2e8f0' },
          { name: '中庭デッキ（2F連絡通路）', minX: 36, maxX: 48, minZ: -18, maxZ: 30, floorColor: '#e0f2fe' },
          { name: '正門・エントランスデッキ', minX: 14, maxX: 44, minZ: -54, maxZ: -18, floorColor: '#e0f2fe' },
          { name: '6号館', minX: 48, maxX: 80, minZ: -12, maxZ: 24, floorColor: '#e2e8f0' },
          { name: '3号館', minX: 44, maxX: 78, minZ: -54, maxZ: -18, floorColor: '#e2e8f0' },
        ],
        voids: [
          { name: '1号館 吹き抜け', x: 45, z: 34, w: 6, d: 7 },
          { name: '3号館 吹き抜け（食堂上部）', x: 65, z: -29, w: 16, d: 14 },
        ],
        rooms: [
          { id: '1-205', name: '1-205 教室', x: 17, z: 47, w: 9, d: 9, color: UNIFIED_ROOM_COLOR },
          { id: '1-204', name: '1-204 教室', x: 27, z: 47, w: 11, d: 9, color: UNIFIED_ROOM_COLOR },
          { id: '1-203', name: '1-203 教室', x: 38, z: 47, w: 11, d: 9, color: UNIFIED_ROOM_COLOR },
          { id: '1-206', name: '1-206 教室', x: 21, z: 34, w: 16, d: 7, color: UNIFIED_ROOM_COLOR },
          { id: '1-202', name: '1-202 教室', x: 56, z: 47, w: 9, d: 9, color: UNIFIED_ROOM_COLOR },
          { id: '1-201', name: '1-201 教室', x: 76, z: 47, w: 13, d: 9, color: UNIFIED_ROOM_COLOR },
          { id: '1-207', name: '1-207 教室', x: 60, z: 34, w: 14, d: 7, color: UNIFIED_ROOM_COLOR },
          { id: '1-208', name: '1-208 教室', x: 75, z: 34, w: 15, d: 7, color: UNIFIED_ROOM_COLOR },

          { id: '2-common', name: 'コモンエリア', x: 19, z: 18, w: 10, d: 10, color: UNIFIED_ROOM_COLOR },
          { id: '2-lib2', name: '図書館', x: 27, z: 7, w: 14, d: 18, color: UNIFIED_ROOM_COLOR },
          { id: '2-lib-off', name: '図書館事務室', x: 29, z: -8, w: 10, d: 9, color: UNIFIED_ROOM_COLOR },

          { id: '6-201', name: '6-201\nシミュレーション室', x: 56, z: 17, w: 13, d: 12, color: UNIFIED_ROOM_COLOR },
          { id: '6-202', name: '6-202 実習室', x: 73, z: 0, w: 11, d: 13, color: UNIFIED_ROOM_COLOR },
          { id: '6-203', name: '6-203 実習室', x: 65, z: -8, w: 14, d: 7, color: UNIFIED_ROOM_COLOR },

          { id: '3-lohas', name: 'ロハスカフェ\nARIAKE', x: 64, z: -45, w: 16, d: 12, color: UNIFIED_ROOM_COLOR },
        ],
        facilities: [
          { id: '1-shop2', name: '店舗・自販機', x: 33, z: 34, w: 7, d: 7 },
          { id: '1-wc2', name: 'トイレ (M / W)', x: 64, z: 47, w: 7, d: 9 },
          { id: '2-wc2', name: 'トイレ (W / M)', x: 19, z: -8, w: 9, d: 9 },
          { id: '6-locker2', name: '男子・女子更衣室・授乳室', x: 71.5, z: 17, w: 14, d: 12 },
          { id: '6-core2', name: '階段・トイレ (W / M)', x: 61, z: 4, w: 9, d: 11 },
          { id: '3-wc2', name: 'トイレ (M / W)', x: 74, z: -45, w: 5, d: 12 },
        ],
        elevators: [
          { id: 'ev-1-2f', name: '1号館 中央EV', x: 47, z: 46, targets: ['1F', '2F', '3F', '4F', '5F', '6F', '7F', '8F', '9F', '10F', '11F', '12F', '13F'] },
          { id: 'ev-2-2f', name: '2号館 EV', x: 24, z: -9, targets: ['1F', '2F', '3F', '4F', '5F', '6F'] },
          { id: 'ev-6-2f', name: '6号館 EV', x: 54, z: 3, targets: ['1F', '2F', '3F', '4F', '5F', '6F'] },
          { id: 'ev-3-2f', name: '3号館 EV', x: 49, z: -46, targets: ['1F', '2F', '3F'] },
        ],
      },

      '3F': {
        spawn: [44, 41],
        buildingZones: [
          { name: '1号館', minX: 12, maxX: 84, minZ: 30, maxZ: 52, floorColor: '#e2e8f0' },
          { name: '2号館', minX: 14, maxX: 36, minZ: -14, maxZ: 24, floorColor: '#e2e8f0' },
          { name: '1・2号館 連絡通路', minX: 18, maxX: 26, minZ: 24, maxZ: 30, floorColor: '#cbd5e1' },
          { name: '6号館', minX: 48, maxX: 80, minZ: -12, maxZ: 24, floorColor: '#e2e8f0' },
          { name: '6・3号館 連絡通路', minX: 50, maxX: 58, minZ: -18, maxZ: -12, floorColor: '#cbd5e1' },
          { name: '3号館', minX: 44, maxX: 78, minZ: -54, maxZ: -18, floorColor: '#e2e8f0' },
        ],
        rooms: [
          { id: '1-304', name: '1-304 教室', x: 17, z: 47, w: 9, d: 9, color: UNIFIED_ROOM_COLOR },
          { id: '1-303', name: '1-303 教室', x: 32, z: 47, w: 15, d: 9, color: UNIFIED_ROOM_COLOR },
          { id: '1-305', name: '1-305 教室', x: 18, z: 34, w: 11, d: 7, color: UNIFIED_ROOM_COLOR },
          { id: '1-306', name: '1-306 教室', x: 34, z: 34, w: 15, d: 7, color: UNIFIED_ROOM_COLOR },
          { id: '1-eng', name: 'イングリッシュスペース', x: 46, z: 34, w: 9, d: 7, color: UNIFIED_ROOM_COLOR },
          { id: '1-307', name: '1-307 教室', x: 60, z: 34, w: 15, d: 7, color: UNIFIED_ROOM_COLOR },
          { id: '1-308', name: '1-308 教室', x: 75, z: 34, w: 15, d: 7, color: UNIFIED_ROOM_COLOR },
          { id: '1-302', name: '1-302 教室', x: 56, z: 47, w: 9, d: 9, color: UNIFIED_ROOM_COLOR },
          { id: '1-301', name: '1-301 教室', x: 76, z: 47, w: 13, d: 9, color: UNIFIED_ROOM_COLOR },

          { id: '2-lib3', name: 'ライブラリー', x: 25, z: 8, w: 20, d: 26, color: UNIFIED_ROOM_COLOR },

          { id: '6-301', name: '6-301 実習室', x: 65, z: 18, w: 24, d: 11, color: UNIFIED_ROOM_COLOR },
          { id: '6-prep31', name: '準備室 31', x: 73, z: 6, w: 11, d: 9, color: UNIFIED_ROOM_COLOR },
          { id: '6-302', name: '6-302 実習室', x: 73, z: -5, w: 11, d: 12, color: UNIFIED_ROOM_COLOR },
          { id: '6-303', name: '6-303 実習室', x: 60, z: -5, w: 11, d: 12, color: UNIFIED_ROOM_COLOR },

          { id: '3-301', name: '3-301 大教室\n(調整室)', x: 54, z: -36, w: 10, d: 26, color: UNIFIED_ROOM_COLOR },
          { id: '3-302', name: '3-302 大教室\n(控室)', x: 66, z: -36, w: 11, d: 26, color: UNIFIED_ROOM_COLOR },
        ],
        facilities: [
          { id: '1-wc3', name: 'トイレ (M / W)', x: 64, z: 47, w: 7, d: 9 },
          { id: '2-wc3', name: 'トイレ (M / W)', x: 19, z: -9, w: 9, d: 8 },
          { id: '6-core3', name: '階段・トイレ (W / M)', x: 60, z: 6, w: 9, d: 9 },
          { id: '3-wc3', name: 'トイレ (M / W)', x: 74, z: -25, w: 5, d: 11 },
        ],
        elevators: [
          { id: 'ev-1-3f', name: '1号館 中央EV', x: 46, z: 46, targets: ['1F', '2F', '3F', '4F', '5F', '6F', '7F', '8F', '9F', '10F', '11F', '12F', '13F'] },
          { id: 'ev-2-3f', name: '2号館 EV', x: 26, z: -9, targets: ['1F', '2F', '3F', '4F', '5F', '6F'] },
          { id: 'ev-6-3f', name: '6号館 EV', x: 53, z: 4, targets: ['1F', '2F', '3F', '4F', '5F', '6F'] },
          { id: 'ev-3-3f', name: '3号館 EV', x: 49, z: -47, targets: ['1F', '2F', '3F'] },
        ],
      },

      '4F': {
        spawn: [44, 41],
        buildingZones: [
          { name: '1号館', minX: 12, maxX: 84, minZ: 30, maxZ: 52, floorColor: '#e2e8f0' },
          { name: '2号館', minX: 14, maxX: 36, minZ: -14, maxZ: 24, floorColor: '#e2e8f0' },
          { name: '1・2号館 連絡通路', minX: 18, maxX: 26, minZ: 24, maxZ: 30, floorColor: '#cbd5e1' },
          { name: '6号館', minX: 48, maxX: 80, minZ: -12, maxZ: 24, floorColor: '#e2e8f0' },
        ],
        voids: [
          { name: '1号館 吹き抜け', x: 48, z: 34, w: 7, d: 7 },
        ],
        rooms: [
          { id: '1-404', name: '1-404 教室', x: 17, z: 47, w: 9, d: 9, color: UNIFIED_ROOM_COLOR },
          { id: '1-403', name: '1-403 教室', x: 32, z: 47, w: 15, d: 9, color: UNIFIED_ROOM_COLOR },
          { id: '1-405', name: '1-405 教室', x: 18, z: 34, w: 11, d: 7, color: UNIFIED_ROOM_COLOR },
          { id: '1-406', name: '1-406 教室', x: 34, z: 34, w: 16, d: 7, color: UNIFIED_ROOM_COLOR },
          { id: '1-407', name: '1-407 教室', x: 60, z: 34, w: 15, d: 7, color: UNIFIED_ROOM_COLOR },
          { id: '1-408', name: '1-408 教室', x: 75, z: 34, w: 15, d: 7, color: UNIFIED_ROOM_COLOR },
          { id: '1-402', name: '1-402 教室', x: 56, z: 47, w: 9, d: 9, color: UNIFIED_ROOM_COLOR },
          { id: '1-401', name: '1-401 教室', x: 76, z: 47, w: 13, d: 9, color: UNIFIED_ROOM_COLOR },

          { id: '2-408', name: '2-408 合同研究室', x: 19, z: 19, w: 9, d: 9, color: UNIFIED_ROOM_COLOR },
          { id: '2-401', name: '2-401\nマルチメディア教室', x: 19, z: 9, w: 9, d: 11, color: UNIFIED_ROOM_COLOR },
          { id: '2-406', name: '2-406 教室', x: 31, z: 19, w: 9, d: 9, color: UNIFIED_ROOM_COLOR },
          { id: '2-405', name: '2-405 ゼミ室', x: 31, z: 11, w: 9, d: 7, color: UNIFIED_ROOM_COLOR },
          { id: '2-404', name: '2-404 ゼミ室', x: 31, z: 3, w: 9, d: 7, color: UNIFIED_ROOM_COLOR },
          { id: '2-402', name: '2-402 教室', x: 31, z: -7, w: 9, d: 9, color: UNIFIED_ROOM_COLOR },

          { id: '6-4w', name: '6-401〜6-410 研究室', x: 51, z: 6, w: 6, d: 34, color: UNIFIED_ROOM_COLOR },
          { id: '6-4e', name: '6-411〜6-416 研究室', x: 77, z: 10, w: 6, d: 26, color: UNIFIED_ROOM_COLOR },
          { id: '6-4n', name: '6-417〜6-426 研究室', x: 66, z: -9, w: 24, d: 6, color: UNIFIED_ROOM_COLOR },
          { id: '6-4c', name: '6-431・432 研究室', x: 64, z: 4, w: 11, d: 14, color: UNIFIED_ROOM_COLOR },
        ],
        facilities: [
          { id: '1-wc4', name: 'トイレ (M / W)', x: 64, z: 47, w: 7, d: 9 },
          { id: '2-wc4', name: 'トイレ (W / M)', x: 19, z: -6, w: 9, d: 11 },
          { id: '6-rest4', name: '休憩スペース・給湯室・WC', x: 64, z: 15, w: 11, d: 8 },
        ],
        elevators: [
          { id: 'ev-1-4f', name: '1号館 中央EV', x: 46, z: 46, targets: ['1F', '2F', '3F', '4F', '5F', '6F', '7F', '8F', '9F', '10F', '11F', '12F', '13F'] },
          { id: 'ev-2-4f', name: '2号館 EV', x: 25, z: -9, targets: ['1F', '2F', '3F', '4F', '5F', '6F'] },
          { id: 'ev-6-4f', name: '6号館 EV', x: 56, z: 3, targets: ['1F', '2F', '3F', '4F', '5F', '6F'] },
        ],
      },

      '5F': {
        spawn: [44, 41],
        buildingZones: [
          { name: '1号館', minX: 12, maxX: 84, minZ: 30, maxZ: 52, floorColor: '#e2e8f0' },
          { name: '2号館', minX: 14, maxX: 36, minZ: -14, maxZ: 24, floorColor: '#e2e8f0' },
          { name: '1・2号館 連絡通路', minX: 18, maxX: 26, minZ: 24, maxZ: 30, floorColor: '#cbd5e1' },
          { name: '6号館', minX: 48, maxX: 80, minZ: -12, maxZ: 24, floorColor: '#e2e8f0' },
        ],
        rooms: [
          { id: '1-504', name: '1-504 教室', x: 17, z: 47, w: 9, d: 9, color: UNIFIED_ROOM_COLOR },
          { id: '1-503', name: '1-503 教室', x: 32, z: 47, w: 15, d: 9, color: UNIFIED_ROOM_COLOR },
          { id: '1-505', name: '1-505 教室', x: 18, z: 34, w: 11, d: 7, color: UNIFIED_ROOM_COLOR },
          { id: '1-506', name: '1-506 教室', x: 34, z: 34, w: 16, d: 7, color: UNIFIED_ROOM_COLOR },
          { id: '1-asia', name: 'アジアスペース', x: 47, z: 34, w: 8, d: 7, color: UNIFIED_ROOM_COLOR },
          { id: '1-508', name: '1-508 教室', x: 60, z: 34, w: 15, d: 7, color: UNIFIED_ROOM_COLOR },
          { id: '1-509', name: '1-509 教室', x: 75, z: 34, w: 15, d: 7, color: UNIFIED_ROOM_COLOR },
          { id: '1-502', name: '1-502 教室', x: 56, z: 47, w: 9, d: 9, color: UNIFIED_ROOM_COLOR },
          { id: '1-501', name: '1-501 教室', x: 76, z: 47, w: 13, d: 9, color: UNIFIED_ROOM_COLOR },

          { id: '2-501-4', name: '2-501〜2-504 研究室', x: 19, z: 14, w: 9, d: 18, color: UNIFIED_ROOM_COLOR },
          { id: '2-505-8', name: '2-505〜2-508 研究室', x: 31, z: 14, w: 9, d: 18, color: UNIFIED_ROOM_COLOR },
          { id: '2-psych', name: '心理臨床センター', x: 25, z: -1, w: 22, d: 9, color: UNIFIED_ROOM_COLOR },

          { id: '6-5w', name: '6-501〜6-510 研究室', x: 51, z: 6, w: 6, d: 34, color: UNIFIED_ROOM_COLOR },
          { id: '6-5e', name: '6-511〜6-516 研究室', x: 77, z: 10, w: 6, d: 26, color: UNIFIED_ROOM_COLOR },
          { id: '6-5n', name: '6-517〜6-526 研究室', x: 66, z: -9, w: 24, d: 6, color: UNIFIED_ROOM_COLOR },
          { id: '6-5c', name: '6-531 研究室・印刷室', x: 64, z: 4, w: 11, d: 14, color: UNIFIED_ROOM_COLOR },
        ],
        facilities: [
          { id: '1-wc5', name: 'トイレ (M / W)', x: 64, z: 47, w: 7, d: 9 },
          { id: '2-wc5', name: 'トイレ (M / W)', x: 19, z: -9, w: 9, d: 6 },
          { id: '6-wc5', name: '給湯室・WC', x: 64, z: 15, w: 11, d: 8 },
        ],
        elevators: [
          { id: 'ev-1-5f', name: '1号館 中央EV', x: 46, z: 46, targets: ['1F', '2F', '3F', '4F', '5F', '6F', '7F', '8F', '9F', '10F', '11F', '12F', '13F'] },
          { id: 'ev-2-5f', name: '2号館 EV', x: 25, z: -9, targets: ['1F', '2F', '3F', '4F', '5F', '6F'] },
          { id: 'ev-6-5f', name: '6号館 EV', x: 56, z: 3, targets: ['1F', '2F', '3F', '4F', '5F', '6F'] },
        ],
      },

      '6F': {
        spawn: [44, 41],
        buildingZones: [
          { name: '1号館', minX: 12, maxX: 84, minZ: 30, maxZ: 52, floorColor: '#e2e8f0' },
          { name: '2号館（屋上庭園）', minX: 14, maxX: 36, minZ: -14, maxZ: 24, floorColor: '#dcfce7' },
          { name: '1・2号館 連絡通路', minX: 18, maxX: 26, minZ: 24, maxZ: 30, floorColor: '#cbd5e1' },
          { name: '6号館（屋上庭園）', minX: 48, maxX: 80, minZ: -12, maxZ: 24, floorColor: '#dcfce7' },
        ],
        voids: [
          { name: '1号館 吹き抜け', x: 51, z: 34, w: 6, d: 7 },
        ],
        rooms: [
          { id: '1-keiri', name: '経理課', x: 17, z: 47, w: 9, d: 9, color: UNIFIED_ROOM_COLOR },
          { id: '1-jinji', name: '管財課・人事課\n総務課・法務課', x: 33, z: 47, w: 16, d: 9, color: UNIFIED_ROOM_COLOR },
          { id: '1-dx', name: 'DX戦略企画課\n1-6B・1-6C会議室', x: 21, z: 34, w: 16, d: 7, color: UNIFIED_ROOM_COLOR },
          { id: '1-sys', name: 'システム運用管理課\n法人企画課・広報課', x: 39, z: 34, w: 16, d: 7, color: UNIFIED_ROOM_COLOR },
          { id: '1-16a', name: '1-6A 会議室・応接室A', x: 60, z: 34, w: 11, d: 7, color: UNIFIED_ROOM_COLOR },
          { id: '1-riji', name: '理事長室・役員室', x: 74, z: 34, w: 17, d: 7, color: UNIFIED_ROOM_COLOR },
          { id: '1-yakuin', name: '役員室（南東）', x: 76, z: 47, w: 13, d: 9, color: UNIFIED_ROOM_COLOR },
        ],
        facilities: [
          { id: '1-locker6', name: '更衣室・トイレ (M / W)', x: 61, z: 47, w: 13, d: 9 },
          { id: '2-roof', name: '2号館 屋上庭園（オープンスペース）', x: 25, z: 5, w: 18, d: 30 },
          { id: '6-roof', name: '6号館 屋上庭園（オープンスペース）', x: 66, z: 6, w: 18, d: 28 },
        ],
        elevators: [
          { id: 'ev-1-6f', name: '1号館 中央EV', x: 46, z: 46, targets: ['1F', '2F', '3F', '4F', '5F', '6F', '7F', '8F', '9F', '10F', '11F', '12F', '13F'] },
          { id: 'ev-6-6f', name: '6号館 屋上EV', x: 54, z: 3, targets: ['1F', '2F', '3F', '4F', '5F', '6F'] },
        ],
      },

      '7F': {
        spawn: [44, 41],
        buildingZones: [
          { name: '1号館', minX: 12, maxX: 84, minZ: 30, maxZ: 52, floorColor: '#e2e8f0' },
        ],
        rooms: [
          { id: '1-print7', name: '印刷室', x: 18, z: 34, w: 11, d: 7, color: UNIFIED_ROOM_COLOR },
          { id: '1-704', name: '1-704 面談ルーム\n教員ステーション2', x: 30, z: 34, w: 13, d: 7, color: UNIFIED_ROOM_COLOR },
          { id: '1-kokusai', name: '国際課\nGC全員留学事務室', x: 44, z: 34, w: 15, d: 7, color: UNIFIED_ROOM_COLOR },
          { id: '1-707', name: '1-707 ゼミ室', x: 56, z: 34, w: 7, d: 7, color: UNIFIED_ROOM_COLOR },
          { id: '1-708', name: '1-708 ゼミ室', x: 63, z: 34, w: 7, d: 7, color: UNIFIED_ROOM_COLOR },
          { id: '1-709', name: '1-709 ゼミ室', x: 69.5, z: 34, w: 6, d: 7, color: UNIFIED_ROOM_COLOR },
          { id: '1-710', name: '1-710 PCルーム', x: 75.5, z: 34, w: 6, d: 7, color: UNIFIED_ROOM_COLOR },
          { id: '1-711', name: '1-711 PCルーム', x: 81, z: 34, w: 5, d: 7, color: UNIFIED_ROOM_COLOR },
          { id: '1-st1', name: '教員ステーション1', x: 20, z: 47, w: 15, d: 9, color: UNIFIED_ROOM_COLOR },
          { id: '1-703', name: '1-703E〜1-703A 研究室', x: 37, z: 47, w: 16, d: 9, color: UNIFIED_ROOM_COLOR },
          { id: '1-702', name: '1-702 ゼミ室', x: 60, z: 47, w: 9, d: 9, color: UNIFIED_ROOM_COLOR },
          { id: '1-701', name: '1-701 PCルーム', x: 77, z: 47, w: 11, d: 9, color: UNIFIED_ROOM_COLOR },
        ],
        facilities: [
          { id: '1-wc7', name: 'トイレ (M / W)', x: 68, z: 47, w: 7, d: 9 },
        ],
        elevators: [
          { id: 'ev-1-7f', name: '1号館 中央EV', x: 50, z: 45, targets: ['1F', '2F', '3F', '4F', '5F', '6F', '7F', '8F', '9F', '10F', '11F', '12F', '13F'] },
        ],
      },

      '8F': {
        spawn: [44, 41],
        buildingZones: [
          { name: '1号館', minX: 12, maxX: 84, minZ: 30, maxZ: 52, floorColor: '#e2e8f0' },
        ],
        voids: [
          { name: '吹き抜け', x: 48, z: 34, w: 7, d: 7 },
        ],
        rooms: [
          { id: '1-812', name: '1-812 教室', x: 17, z: 34, w: 9, d: 7, color: UNIFIED_ROOM_COLOR },
          { id: '1-8c', name: '1-8C 会議室', x: 25, z: 34, w: 7, d: 7, color: UNIFIED_ROOM_COLOR },
          { id: '1-805', name: '1-805 ゼミ室', x: 32, z: 34, w: 7, d: 7, color: UNIFIED_ROOM_COLOR },
          { id: '1-806', name: '1-806 ゼミ室', x: 40, z: 34, w: 9, d: 7, color: UNIFIED_ROOM_COLOR },
          { id: '1-807', name: '1-807 ゼミ室', x: 57, z: 34, w: 9, d: 7, color: UNIFIED_ROOM_COLOR },
          { id: '1-keiei', name: '経営研究所\nGS研究所', x: 68, z: 34, w: 12, d: 7, color: UNIFIED_ROOM_COLOR },
          { id: '1-809', name: '1-809 教室', x: 79, z: 34, w: 9, d: 7, color: UNIFIED_ROOM_COLOR },
          { id: '1-811', name: '1-811 教室', x: 19, z: 47, w: 13, d: 9, color: UNIFIED_ROOM_COLOR },
          { id: '1-803', name: '1-803 教室', x: 36, z: 47, w: 15, d: 9, color: UNIFIED_ROOM_COLOR },
          { id: '1-802', name: '1-802 自習室', x: 60, z: 47, w: 9, d: 9, color: UNIFIED_ROOM_COLOR },
          { id: '1-801', name: '1-801 ゼミ室', x: 78, z: 47, w: 10, d: 9, color: UNIFIED_ROOM_COLOR },
        ],
        facilities: [
          { id: '1-wc8', name: 'トイレ (M / W)・備蓄倉庫', x: 69, z: 47, w: 9, d: 9 },
        ],
        elevators: [
          { id: 'ev-1-8f', name: '1号館 中央EV', x: 50, z: 45, targets: ['1F', '2F', '3F', '4F', '5F', '6F', '7F', '8F', '9F', '10F', '11F', '12F', '13F'] },
        ],
      },

      '9F': {
        spawn: [44, 41],
        buildingZones: [
          { name: '1号館', minX: 12, maxX: 84, minZ: 30, maxZ: 52, floorColor: '#e2e8f0' },
        ],
        rooms: [
          { id: '1-905', name: '1-905 研究室', x: 18, z: 34, w: 11, d: 7, color: UNIFIED_ROOM_COLOR },
          { id: '1-906', name: '1-906 ゼミ室', x: 27, z: 34, w: 7, d: 7, color: UNIFIED_ROOM_COLOR },
          { id: '1-907', name: '1-907 ゼミ室', x: 34, z: 34, w: 7, d: 7, color: UNIFIED_ROOM_COLOR },
          { id: '1-908', name: '1-908 ゼミ室', x: 41, z: 34, w: 7, d: 7, color: UNIFIED_ROOM_COLOR },
          { id: '1-9a', name: '1-9A ゼミ室', x: 48, z: 34, w: 7, d: 7, color: UNIFIED_ROOM_COLOR },
          { id: '1-909', name: '1-909 研究室', x: 58, z: 34, w: 11, d: 7, color: UNIFIED_ROOM_COLOR },
          { id: '1-910', name: '1-910 研究室', x: 69, z: 34, w: 11, d: 7, color: UNIFIED_ROOM_COLOR },
          { id: '1-901ab', name: '1-901B・901A 研究室', x: 79, z: 34, w: 9, d: 7, color: UNIFIED_ROOM_COLOR },
          { id: '1-904', name: '1-904 ゼミ室', x: 18, z: 47, w: 11, d: 9, color: UNIFIED_ROOM_COLOR },
          { id: '1-903', name: '1-903 ゼミ室\n産学連携室', x: 35, z: 47, w: 16, d: 9, color: UNIFIED_ROOM_COLOR },
          { id: '1-902', name: '1-902 響学開発センター', x: 60, z: 47, w: 11, d: 9, color: UNIFIED_ROOM_COLOR },
          { id: '1-901', name: '1-901 国際総合研究所', x: 78, z: 47, w: 11, d: 9, color: UNIFIED_ROOM_COLOR },
        ],
        facilities: [
          { id: '1-wc9', name: 'トイレ (M / W)', x: 69, z: 47, w: 7, d: 9 },
        ],
        elevators: [
          { id: 'ev-1-9f', name: '1号館 中央EV', x: 50, z: 45, targets: ['1F', '2F', '3F', '4F', '5F', '6F', '7F', '8F', '9F', '10F', '11F', '12F', '13F'] },
        ],
      },

      '10F': {
        spawn: [44, 41],
        ...createBldg1LabFloor(10, null, '1-1005 部長室', true),
      },

      '11F': {
        spawn: [44, 41],
        ...createBldg1LabFloor(11, { id: '1-11a', name: '1-11A ゼミ室' }, '1-1105 印刷室', false),
      },

      '12F': {
        spawn: [44, 41],
        ...createBldg1LabFloor(12, null, null, false),
      },

      '13F': {
        spawn: [44, 44],
        buildingZones: [
          { name: '1号館 13F', minX: 12, maxX: 84, minZ: 36, maxZ: 52, floorColor: '#dcfce7' },
        ],
        rooms: [
          { id: '1-13a', name: '1-13A 会議室', x: 34, z: 44, w: 10, d: 11, color: UNIFIED_ROOM_COLOR },
          { id: '1-13b', name: '1-13B 会議室', x: 62, z: 44, w: 10, d: 11, color: UNIFIED_ROOM_COLOR },
        ],
        facilities: [
          { id: '1-roof13-w', name: '屋上庭園（西）', x: 20, z: 44, w: 14, d: 13 },
          { id: '1-wc13', name: 'トイレ (M / W)', x: 48, z: 46, w: 8, d: 7 },
          { id: '1-roof13-e', name: '屋上庭園（東）', x: 76, z: 44, w: 14, d: 13 },
        ],
        elevators: [
          { id: 'ev-1-13f', name: '1号館 中央EV', x: 42, z: 44, targets: ['1F', '2F', '3F', '4F', '5F', '6F', '7F', '8F', '9F', '10F', '11F', '12F', '13F'] },
        ],
      },
    },
  },

  // =========================================================================
  // 左側街区（東側）：5号館（1F平面図・内部/外観写真完全準拠）
  // 東端 X=-16（大通り・信号側）、西端 X=-52（4号館側）
  // 北端 Z=-48（センタープロムナード・芝生広場側）、南端 Z=-14
  // =========================================================================
  'area-5': {
    id: 'area-5',
    name: '5号館（1F〜7F）',
    floors: {
      '1F': {
        spawn: [-19, -18],
        buildingZones: [
          { name: '5号館', minX: -52, maxX: -16, minZ: -48, maxZ: -14, floorColor: '#e2e8f0' },
        ],
        // 壁で囲まれた部屋（教室・事務室・風除室・多目的スペース）
        rooms: [
          // 信号前1F入口（平面図左上・赤丸の風除室）
          { id: '5-fujo-se', name: '風除室\n(信号前1F入口)', x: -18.5, z: -16.5, w: 5, d: 5, color: UNIFIED_ROOM_COLOR },
          // 北側1F入口（平面図下中央・芝生広場側の風除室）
          { id: '5-fujo-n', name: '風除室\n(北側1F入口)', x: -34, z: -45.5, w: 5, d: 5, color: UNIFIED_ROOM_COLOR },
          // 南西側 多目的スペース1（平面図右上）
          { id: '5-multi1', name: '多目的スペース1', x: -41, z: -18.5, w: 10, d: 9, color: UNIFIED_ROOM_COLOR },
          // 中央 警備準備室
          { id: '5-keibi', name: '警備準備室', x: -35, z: -24.5, w: 5, d: 4.5, color: UNIFIED_ROOM_COLOR },
          // 北西側（4号館側）5-101 教室
          { id: '5-101', name: '5-101 教室', x: -42, z: -39.5, w: 16, d: 7, color: UNIFIED_ROOM_COLOR },
        ],
        // 壁なし・オープンスペース＆共用設備（平面図・内部写真準拠）
        facilities: [
          // 東側（大通り窓ガラス沿い）全面の学生ホール
          { id: '5-hall1', name: '学生ホール（吹き抜けラウンジ）', x: -20.5, z: -32, w: 8, d: 24 },
          // 学生ホール中央のプレゼンテーションスペース
          { id: '5-presen', name: 'プレゼンテーションスペース', x: -29.5, z: -32, w: 8, d: 11 },
          // 南側 階段（1F→2F）
          { id: '5-stair-s', name: '階段（1F⇔2F）', x: -23.5, z: -17, w: 4.5, d: 6 },
          // 中央 トイレ（M / W / 多目的）
          { id: '5-wc1', name: 'トイレ (M / W / 多目的)', x: -39, z: -32, w: 10, d: 7 },
          // 西側 ピロティ駐車場
          { id: '5-park1', name: '駐車場（ピロティ）', x: -49, z: -25, w: 5, d: 14 },
          // 北西 屋外階段
          { id: '5-stair-nw', name: '屋外階段（2Fデッキへ）', x: -46, z: -45.5, w: 8, d: 4 },
        ],
        elevators: [
          { id: 'ev-5-1f', name: '5号館 EVホール', x: -31, z: -17.5, targets: ['1F', '2F', '3F', '4F', '5F', '6F', '7F'] },
        ],
      },

      '2F': {
        spawn: [-31, -22],
        buildingZones: [
          { name: '5号館', minX: -52, maxX: -16, minZ: -48, maxZ: -14, floorColor: '#e2e8f0' },
        ],
        voids: [
          { name: '吹き抜け（1F学生ホール上部）', x: -20.5, z: -32, w: 8, d: 24 },
        ],
        rooms: [
          { id: '5-201', name: '5-201 教室', x: -44, z: -23, w: 14, d: 8, color: UNIFIED_ROOM_COLOR },
          { id: '5-202', name: '5-202\nアジアAI研究所', x: -44, z: -31, w: 14, d: 7, color: UNIFIED_ROOM_COLOR },
          { id: '5-203', name: '5-203 共同研究室', x: -44, z: -39, w: 14, d: 8, color: UNIFIED_ROOM_COLOR },
        ],
        facilities: [
          { id: '5-wc2', name: 'トイレ (M / W)', x: -39, z: -32, w: 10, d: 7 },
        ],
        elevators: [
          { id: 'ev-5-2f', name: '5号館 EVホール', x: -31, z: -17.5, targets: ['1F', '2F', '3F', '4F', '5F', '6F', '7F'] },
        ],
      },

      '3F': {
        spawn: [-31, -22],
        buildingZones: [
          { name: '5号館', minX: -52, maxX: -16, minZ: -48, maxZ: -14, floorColor: '#e2e8f0' },
        ],
        rooms: [
          { id: '5-301', name: '5-301 教室', x: -22, z: -32, w: 11, d: 20, color: UNIFIED_ROOM_COLOR },
          { id: '5-302', name: '5-302 教室', x: -44, z: -23, w: 14, d: 7, color: UNIFIED_ROOM_COLOR },
          { id: '5-303', name: '5-303 教室', x: -44, z: -31, w: 14, d: 7, color: UNIFIED_ROOM_COLOR },
          { id: '5-304', name: '5-304 教室', x: -44, z: -39, w: 14, d: 7, color: UNIFIED_ROOM_COLOR },
        ],
        facilities: [
          { id: '5-wc3', name: 'トイレ (M / W)', x: -39, z: -32, w: 10, d: 7 },
          { id: '5-terrace3', name: '交流テラス 31', x: -24, z: -45, w: 14, d: 5 },
        ],
        elevators: [
          { id: 'ev-5-3f', name: '5号館 EVホール', x: -31, z: -17.5, targets: ['1F', '2F', '3F', '4F', '5F', '6F', '7F'] },
        ],
      },

      '4F': {
        spawn: [-31, -22],
        buildingZones: [
          { name: '5号館', minX: -52, maxX: -16, minZ: -48, maxZ: -14, floorColor: '#e2e8f0' },
        ],
        rooms: [
          { id: '5-401', name: '5-401 教室', x: -22, z: -26, w: 11, d: 10, color: UNIFIED_ROOM_COLOR },
          { id: '5-402', name: '5-402 教室', x: -22, z: -37, w: 11, d: 10, color: UNIFIED_ROOM_COLOR },
          { id: '5-403', name: '5-403 教室', x: -44, z: -23, w: 14, d: 7, color: UNIFIED_ROOM_COLOR },
          { id: '5-404', name: '5-404 教室', x: -44, z: -31, w: 14, d: 7, color: UNIFIED_ROOM_COLOR },
          { id: '5-405', name: '5-405 教室', x: -44, z: -39, w: 14, d: 7, color: UNIFIED_ROOM_COLOR },
        ],
        facilities: [
          { id: '5-wc4', name: 'トイレ (M / W)', x: -39, z: -32, w: 10, d: 7 },
          { id: '5-terrace4', name: '交流テラス 41', x: -24, z: -45, w: 14, d: 5 },
        ],
        elevators: [
          { id: 'ev-5-4f', name: '5号館 EVホール', x: -31, z: -17.5, targets: ['1F', '2F', '3F', '4F', '5F', '6F', '7F'] },
        ],
      },

      '5F': {
        spawn: [-31, -22],
        buildingZones: [
          { name: '5号館', minX: -52, maxX: -16, minZ: -48, maxZ: -14, floorColor: '#e2e8f0' },
        ],
        rooms: [
          { id: '5-501', name: '5-501 アクティブ\nラーニング教室', x: -22, z: -26, w: 11, d: 10, color: UNIFIED_ROOM_COLOR },
          { id: '5-502', name: '5-502 アクティブ\nラーニング教室', x: -22, z: -37, w: 11, d: 10, color: UNIFIED_ROOM_COLOR },
          { id: '5-503', name: '5-503 教室', x: -44, z: -23, w: 14, d: 7, color: UNIFIED_ROOM_COLOR },
          { id: '5-504', name: '5-504 教室', x: -44, z: -31, w: 14, d: 7, color: UNIFIED_ROOM_COLOR },
          { id: '5-505', name: '5-505 教室', x: -44, z: -39, w: 14, d: 7, color: UNIFIED_ROOM_COLOR },
        ],
        facilities: [
          { id: '5-wc5', name: 'トイレ (M / W)', x: -39, z: -32, w: 10, d: 7 },
          { id: '5-terrace5', name: '交流テラス 51', x: -24, z: -45, w: 14, d: 5 },
        ],
        elevators: [
          { id: 'ev-5-5f', name: '5号館 EVホール', x: -31, z: -17.5, targets: ['1F', '2F', '3F', '4F', '5F', '6F', '7F'] },
        ],
      },

      '6F': {
        spawn: [-31, -22],
        buildingZones: [
          { name: '5号館', minX: -52, maxX: -16, minZ: -48, maxZ: -14, floorColor: '#e2e8f0' },
        ],
        rooms: [
          { id: '5-6e', name: '5-601 印刷室\n5-602〜5-610 研究室', x: -21, z: -31, w: 9, d: 22, color: UNIFIED_ROOM_COLOR },
          { id: '5-6w', name: '5-611〜5-620 研究室', x: -47, z: -31, w: 9, d: 22, color: UNIFIED_ROOM_COLOR },
        ],
        facilities: [
          { id: '5-wc6', name: 'トイレ (M / W)・給湯室', x: -39, z: -32, w: 10, d: 7 },
          { id: '5-terrace6', name: '交流テラス 61', x: -24, z: -45, w: 14, d: 5 },
        ],
        elevators: [
          { id: 'ev-5-6f', name: '5号館 EVホール', x: -31, z: -17.5, targets: ['1F', '2F', '3F', '4F', '5F', '6F', '7F'] },
        ],
      },

      '7F': {
        spawn: [-31, -22],
        buildingZones: [
          { name: '5号館', minX: -52, maxX: -16, minZ: -48, maxZ: -14, floorColor: '#dcfce7' },
        ],
        rooms: [
          { id: '5-multi2', name: '多目的スペース2', x: -26, z: -31, w: 13, d: 15, color: UNIFIED_ROOM_COLOR },
        ],
        facilities: [
          { id: '5-wc7', name: 'トイレ (M / W)', x: -39, z: -32, w: 10, d: 7 },
          { id: '5-roof7', name: '5号館 屋上庭園（オープンスペース）', x: -43, z: -31, w: 13, d: 20 },
          { id: '5-terrace7', name: '交流テラス 71', x: -24, z: -45, w: 14, d: 5 },
        ],
        elevators: [
          { id: 'ev-5-7f', name: '5号館 EVホール', x: -31, z: -17.5, targets: ['1F', '2F', '3F', '4F', '5F', '6F', '7F'] },
        ],
      },
    },
  },

  // =========================================================================
  // 左側街区（西側）：4号館（5号館のすぐ西隣・北側センタープロムナードに入口）
  // =========================================================================
  'area-4': {
    id: 'area-4',
    name: '4号館（1F〜5F）',
    floors: {
      '1F': {
        spawn: [-98, -42],
        buildingZones: [
          { name: '4号館', minX: -114, maxX: -56, minZ: -48, maxZ: -14, floorColor: '#e2e8f0' },
        ],
        rooms: [
          { id: '4-1-lab1', name: '実験・実習エリア（東）', x: -67, z: -24, w: 18, d: 16, color: UNIFIED_ROOM_COLOR },
          { id: '4-1-lab2', name: '実験・実習エリア（西）', x: -101, z: -24, w: 20, d: 16, color: UNIFIED_ROOM_COLOR },
        ],
        facilities: [
          { id: '4-1-hall', name: '1F エントランスホール', x: -85, z: -41, w: 24, d: 10 },
          { id: '4-1-wc', name: 'トイレ (M / W)', x: -85, z: -24, w: 10, d: 12 },
        ],
        elevators: [
          { id: 'ev-4-1f', name: '4号館 EV', x: -81, z: -34, targets: ['1F', '2F', '3F', '4F', '5F'] },
        ],
      },

      '2F': {
        spawn: [-76, -42],
        buildingZones: [
          { name: '4号館', minX: -114, maxX: -56, minZ: -48, maxZ: -14, floorColor: '#e2e8f0' },
        ],
        rooms: [
          { id: '4-proj', name: 'プロジェクトルーム', x: -65, z: -42, w: 14, d: 9, color: UNIFIED_ROOM_COLOR },
          { id: '4-math-lab', name: '数理工学\n計算機実験室', x: -63, z: -31, w: 10, d: 11, color: UNIFIED_ROOM_COLOR },
          { id: '4-hall2', name: '学生ホール', x: -71, z: -25, w: 10, d: 11, color: UNIFIED_ROOM_COLOR },
          { id: '4-career', name: 'キャリアセンター\n支援課・相談ブース', x: -69, z: -17, w: 22, d: 6, color: UNIFIED_ROOM_COLOR },
          { id: '4-201-5', name: '4-201〜4-205 研究室', x: -93, z: -26, w: 12, d: 6, color: UNIFIED_ROOM_COLOR },
          { id: '4-206-10', name: '4-206〜4-210 研究室', x: -106, z: -26, w: 14, d: 6, color: UNIFIED_ROOM_COLOR },
        ],
        facilities: [
          { id: '4-soko2', name: '倉庫', x: -75, z: -42, w: 7, d: 9 },
          { id: '4-wc2', name: 'トイレ (M / W)', x: -93, z: -35, w: 10, d: 6 },
        ],
        elevators: [
          { id: 'ev-4-2f', name: '4号館 EV', x: -81, z: -34, targets: ['1F', '2F', '3F', '4F', '5F'] },
        ],
      },

      '3F': {
        spawn: [-86, -28],
        buildingZones: [
          { name: '4号館', minX: -114, maxX: -56, minZ: -48, maxZ: -14, floorColor: '#e2e8f0' },
        ],
        rooms: [
          { id: '4-301', name: '4-301 教室', x: -69, z: -42, w: 22, d: 9, color: UNIFIED_ROOM_COLOR },
          { id: '4-302', name: '4-302 教室', x: -63, z: -32, w: 11, d: 9, color: UNIFIED_ROOM_COLOR },
          { id: '4-306', name: '4-306 教室', x: -103, z: -20, w: 18, d: 11, color: UNIFIED_ROOM_COLOR },
          { id: '4-305', name: '4-305 教室', x: -88, z: -20, w: 11, d: 11, color: UNIFIED_ROOM_COLOR },
          { id: '4-304', name: '4-304 研究室', x: -79, z: -20, w: 6, d: 11, color: UNIFIED_ROOM_COLOR },
          { id: '4-303', name: '4-303 教室', x: -67, z: -20, w: 17, d: 11, color: UNIFIED_ROOM_COLOR },
        ],
        facilities: [
          { id: '4-wc3', name: 'トイレ (M / W)', x: -93, z: -35, w: 10, d: 6 },
        ],
        elevators: [
          { id: 'ev-4-3f', name: '4号館 EV', x: -81, z: -34, targets: ['1F', '2F', '3F', '4F', '5F'] },
        ],
      },

      '4F': {
        spawn: [-86, -28],
        buildingZones: [
          { name: '4号館', minX: -114, maxX: -56, minZ: -48, maxZ: -14, floorColor: '#e2e8f0' },
        ],
        rooms: [
          { id: '4-401', name: '4-401 科学実験室', x: -73, z: -42, w: 11, d: 9, color: UNIFIED_ROOM_COLOR },
          { id: '4-402', name: '4-402 科学実験室', x: -63, z: -42, w: 9, d: 9, color: UNIFIED_ROOM_COLOR },
          { id: '4-prep4', name: '実験準備室・印刷室', x: -63, z: -32, w: 11, d: 9, color: UNIFIED_ROOM_COLOR },
          { id: '4-412', name: '4-412 教室', x: -107, z: -20, w: 11, d: 11, color: UNIFIED_ROOM_COLOR },
          { id: '4-411', name: '4-411 教室', x: -95, z: -20, w: 11, d: 11, color: UNIFIED_ROOM_COLOR },
          { id: '4-410', name: '4-410 教室', x: -85, z: -20, w: 8, d: 11, color: UNIFIED_ROOM_COLOR },
          { id: '4-405', name: '4-405 サステナビリティ研究所', x: -76, z: -20, w: 9, d: 11, color: UNIFIED_ROOM_COLOR },
          { id: '4-404', name: '4-404 数理工学センター', x: -68, z: -20, w: 6, d: 11, color: UNIFIED_ROOM_COLOR },
          { id: '4-403', name: '4-403 教室', x: -61, z: -20, w: 7, d: 11, color: UNIFIED_ROOM_COLOR },
        ],
        facilities: [
          { id: '4-wc4', name: '給湯室・トイレ (M / W)', x: -95, z: -35, w: 13, d: 6 },
        ],
        elevators: [
          { id: 'ev-4-4f', name: '4号館 EV', x: -81, z: -34, targets: ['1F', '2F', '3F', '4F', '5F'] },
        ],
      },

      '5F': {
        spawn: [-86, -28],
        buildingZones: [
          { name: '4号館', minX: -114, maxX: -56, minZ: -48, maxZ: -14, floorColor: '#e2e8f0' },
        ],
        rooms: [
          { id: '4-501', name: '4-501 研究室', x: -70, z: -35, w: 11, d: 6, color: UNIFIED_ROOM_COLOR },
          { id: '4-512-7', name: '4-512〜4-507 研究室（西側）', x: -99, z: -20, w: 26, d: 11, color: UNIFIED_ROOM_COLOR },
          { id: '4-506-2', name: '4-506〜4-502 研究室（東側）', x: -71, z: -20, w: 26, d: 11, color: UNIFIED_ROOM_COLOR },
        ],
        facilities: [
          { id: '4-wc5', name: '給湯室・トイレ (M / W)', x: -95, z: -35, w: 13, d: 6 },
        ],
        elevators: [
          { id: 'ev-4-5f', name: '4号館 EV', x: -81, z: -34, targets: ['1F', '2F', '3F', '4F', '5F'] },
        ],
      },
    },
  },
};