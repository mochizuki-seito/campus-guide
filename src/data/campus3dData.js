// 3D空間用の建築・フロアデータ（『教室配置図_有明キャンパス.pdf』全階完全準拠版）
// 座標基準: X = 東西（西がマイナス・東がプラス）, Z = 南北（北がマイナス・南がプラス）

// 1号館 10F〜12F 共通の研究室フロア生成ヘルパー
function createBldg1LabFloor(floorNum) {
  const prefix = `1-${floorNum}`;
  const rooms = [];

  // 北側西半分（13〜22：西から東へ10室）
  for (let i = 0; i < 10; i++) {
    const num = 13 + i;
    rooms.push({
      id: `${prefix}${num}`,
      bldg: '1号館',
      name: `${prefix}${num}\n研究室`,
      x: -38 + i * 3.6,
      z: 29.5,
      w: 3.4,
      d: 5,
      color: '#cbd5e1',
    });
  }

  // 北側東半分（23〜32：西から東へ10室）
  for (let i = 0; i < 10; i++) {
    const num = 23 + i;
    rooms.push({
      id: `${prefix}${num}`,
      bldg: '1号館',
      name: `${prefix}${num}\n研究室`,
      x: 5.6 + i * 3.6,
      z: 29.5,
      w: 3.4,
      d: 5,
      color: '#cbd5e1',
    });
  }

  // 南側西ブロック（12, 11, 10）
  [12, 11, 10].forEach((num, idx) => {
    rooms.push({
      id: `${prefix}${num}`,
      bldg: '1号館',
      name: `${prefix}${num}\n研究室`,
      x: -36 + idx * 4.5,
      z: 46.5,
      w: 4.2,
      d: 5,
      color: '#cbd5e1',
    });
  });

  // 南側中央ブロック（09, 08, 07, 06）
  [9, 8, 7, 6].forEach((num, idx) => {
    const labelNum = `0${num}`;
    rooms.push({
      id: `${prefix}${labelNum}`,
      bldg: '1号館',
      name: `${prefix}${labelNum}\n研究室`,
      x: -6 + idx * 4.5,
      z: 46.5,
      w: 4.2,
      d: 5,
      color: '#cbd5e1',
    });
  });

  // 南側中東ブロック（05, 04）※10Fの1-1005は部長室
  rooms.push({
    id: `${prefix}05`,
    bldg: '1号館',
    name: floorNum === 10 ? `${prefix}05\n部長室` : `${prefix}05\n研究室`,
    x: 13.5,
    z: 46.5,
    w: 4.2,
    d: 5,
    color: floorNum === 10 ? '#fcd34d' : '#cbd5e1',
  });
  rooms.push({
    id: `${prefix}04`,
    bldg: '1号館',
    name: `${prefix}04\n研究室`,
    x: 18,
    z: 46.5,
    w: 4.2,
    d: 5,
    color: '#cbd5e1',
  });

  // トイレ
  rooms.push({
    id: `${prefix}-wc`,
    bldg: '1号館',
    name: 'トイレ',
    x: 23,
    z: 46.5,
    w: 4.5,
    d: 5,
    color: '#e2e8f0',
  });

  // 南側東端ブロック（03, 02, 01）
  [3, 2, 1].forEach((num, idx) => {
    const labelNum = `0${num}`;
    rooms.push({
      id: `${prefix}${labelNum}`,
      bldg: '1号館',
      name: `${prefix}${labelNum}\n研究室`,
      x: 28.5 + idx * 4.5,
      z: 46.5,
      w: 4.2,
      d: 5,
      color: '#cbd5e1',
    });
  });

  return {
    label: `1号館 ${floorNum}F（研究室フロア）`,
    spawn: [-16, 38],
    buildingZones: [
      { name: '1号館', minX: -41, maxX: 41, minZ: 26, maxZ: 50, floorColor: '#e2e8f0' },
    ],
    voids: floorNum === 11 ? [{ name: '吹き抜け', x: 0, z: 29.5, w: 4.5, d: 4.5 }] : [],
    connectors: [],
    rooms,
    elevators: [
      {
        id: 'ev-1',
        name: '1号館 EV',
        x: -16,
        z: 46,
        targets: ['1F', '2F', '3F', '4F', '5F', '6F', '7F', '8F', '9F', '10F', '11F', '12F', '13F'],
      },
    ],
    portals: [],
  };
}

// 6号館 4F・5F 共通の研究室ロの字フロア生成ヘルパー
function createBldg6LabRooms(floorNum) {
  const prefix = `6-${floorNum}`;
  const rooms = [];

  // 西列（01〜10：南から北へ）
  for (let i = 0; i < 10; i++) {
    const num = String(i + 1).padStart(2, '0');
    rooms.push({
      id: `${prefix}${num}`,
      bldg: '6号館',
      name: `${prefix}${num} 研究室`,
      x: 9,
      z: 21 - i * 3.4,
      w: 5,
      d: 3.1,
      color: '#bbf7d0',
    });
  }

  // 東列（17〜26：南から北へ）
  for (let i = 0; i < 10; i++) {
    const num = String(17 + i);
    rooms.push({
      id: `${prefix}${num}`,
      bldg: '6号館',
      name: `${prefix}${num} 研究室`,
      x: 35,
      z: 21 - i * 3.4,
      w: 5,
      d: 3.1,
      color: '#bbf7d0',
    });
  }

  // 南列（11〜16：西から東へ）
  for (let i = 0; i < 6; i++) {
    const num = String(11 + i);
    rooms.push({
      id: `${prefix}${num}`,
      bldg: '6号館',
      name: `${prefix}${num}\n研究室`,
      x: 14.5 + i * 3.1,
      z: 21,
      w: 2.9,
      d: 4.5,
      color: '#bbf7d0',
    });
  }

  // 中央コア部分（4Fと5Fの差分）
  if (floorNum === 4) {
    rooms.push(
      { id: '6-4a', bldg: '6号館', name: '会議スペース\n4A', x: 18, z: 12, w: 3.5, d: 4, color: '#a5f3fc' },
      { id: '6-4b', bldg: '6号館', name: '会議スペース\n4B', x: 22, z: 12, w: 3.5, d: 4, color: '#a5f3fc' },
      { id: '6-431', bldg: '6号館', name: '6-431\n研究室', x: 22, z: 7, w: 4, d: 4, color: '#86efac' },
      { id: '6-432', bldg: '6号館', name: '6-432\n研究室', x: 26.5, z: 7, w: 4, d: 4, color: '#86efac' },
      { id: '6-4c', bldg: '6号館', name: '会議スペース\n4C', x: 24, z: -2, w: 4.5, d: 4, color: '#a5f3fc' },
      { id: '6-4f-core', bldg: '6号館', name: '階段・給湯・トイレ', x: 26, z: 12, w: 5, d: 5, color: '#e2e8f0' }
    );
  } else {
    rooms.push(
      { id: '6-5print', bldg: '6号館', name: '印刷室', x: 20, z: 11, w: 4.5, d: 4.5, color: '#cbd5e1' },
      { id: '6-531', bldg: '6号館', name: '6-531 研究室', x: 24.5, z: 7, w: 5.5, d: 5, color: '#86efac' },
      { id: '6-5f-core', bldg: '6号館', name: '階段・給湯・トイレ', x: 26, z: 12, w: 5.5, d: 4.5, color: '#e2e8f0' }
    );
  }

  return rooms;
}

const EV_1_TARGETS = ['1F', '2F', '3F', '4F', '5F', '6F', '7F', '8F', '9F', '10F', '11F', '12F', '13F'];
const EV_26_TARGETS = ['1F', '2F', '3F', '4F', '5F', '6F'];
const EV_3_TARGETS = ['1F', '2F', '3F'];

export const CAMPUS_3D_BUILDINGS = {
  'area-1236': {
    id: 'area-1236',
    name: '1・2・3・6号館エリア',
    floors: {
      // =====================================================================
      // 1F（PDF 1ページ目）
      // =====================================================================
      '1F': {
        label: '1・2・3・6号館 1F',
        spawn: [0, 40],
        buildingZones: [
          { name: '1号館', minX: -40, maxX: 40, minZ: 26, maxZ: 50, floorColor: '#e2e8f0' },
          { name: '2号館', minX: -40, maxX: -10, minZ: -10, maxZ: 26, floorColor: '#fef9c3' },
          { name: '6号館', minX: 4, maxX: 38, minZ: -14, maxZ: 26, floorColor: '#dcfce7' },
          { name: '3号館', minX: -24, maxX: 38, minZ: -52, maxZ: -14, floorColor: '#ffedd5' },
        ],
        voids: [],
        connectors: [
          { name: '◀ 2号館（図書館・閲覧コーナー）通路', x: -16, z: 26 },
          { name: '6号館（エントランスホール）通路 ▶', x: 9, z: 26 },
          { name: '▲ 3号館（フードコート・学生ホール）連絡口', x: 8, z: -14 },
        ],
        rooms: [
          { id: '1-health', bldg: '1号館', name: '健康管理センター\n(保健室・学生相談室)', x: -33, z: 42, w: 10, d: 12, color: '#fca5a5' },
          { id: '1-vending', bldg: '1号館', name: '自販機コーナー', x: -34, z: 31, w: 8, d: 4, color: '#cbd5e1' },
          { id: '1-1a', bldg: '1号館', name: '1-1A 会議室', x: -21, z: 35, w: 8, d: 8, color: '#93c5fd' },
          { id: '1-1b', bldg: '1号館', name: '1-1B ミーティング\nルーム', x: -14.5, z: 33, w: 4, d: 4, color: '#bfdbfe' },
          { id: '1-kv', bldg: '1号館', name: 'カンファ・グリー・\nヴィレッジ拠点', x: -14.5, z: 37.5, w: 4, d: 4, color: '#bfdbfe' },
          { id: '1-nyushi', bldg: '1号館', name: '入試課 /\n入試広報課', x: -9.5, z: 35, w: 5, d: 8, color: '#93c5fd' },
          { id: '1-wc-w', bldg: '1号館', name: '1号館西 トイレ', x: -16, z: 45.5, w: 10, d: 4, color: '#e2e8f0' },
          { id: '1-kyomu', bldg: '1号館', name: '教務課', x: 8, z: 33, w: 4, d: 6, color: '#93c5fd' },
          { id: '1-gakumu', bldg: '1号館', name: '学務課', x: 12, z: 33, w: 4, d: 6, color: '#93c5fd' },
          { id: '1-dx', bldg: '1号館', name: '教育DX支援課', x: 16, z: 33, w: 4, d: 6, color: '#bfdbfe' },
          { id: '1-gakubu', bldg: '1号館', name: '学部事務課', x: 20, z: 33, w: 4, d: 6, color: '#93c5fd' },
          { id: '1-kenkyu', bldg: '1号館', name: '研究推進支援課', x: 24, z: 33, w: 4, d: 6, color: '#bfdbfe' },
          { id: '1-kikaku', bldg: '1号館', name: '教育企画課', x: 28, z: 33, w: 4, d: 6, color: '#bfdbfe' },
          { id: '1-shakai', bldg: '1号館', name: '社会響創センター\n事務課', x: 32.5, z: 33, w: 5, d: 6, color: '#93c5fd' },
          { id: '1-locker-n', bldg: '1号館', name: '更衣室', x: 37, z: 33, w: 4, d: 6, color: '#cbd5e1' },
          { id: '1-kanri', bldg: '1号館', name: '管理センター', x: 12, z: 45, w: 8, d: 6, color: '#cbd5e1' },
          { id: '1-shien', bldg: '1号館', name: '学生支援課', x: 21, z: 45, w: 10, d: 6, color: '#93c5fd' },
          { id: '1-locker-s', bldg: '1号館', name: '更衣室', x: 30, z: 45, w: 6, d: 6, color: '#cbd5e1' },
          { id: '1-kyuto', bldg: '1号館', name: '給湯室', x: 35.5, z: 43.5, w: 4, d: 3, color: '#cbd5e1' },

          { id: '2-lib', bldg: '2号館', name: '図書館', x: -33, z: 12, w: 10, d: 24, color: '#fde047' },
          { id: '2-cls', bldg: '2号館', name: 'クリエイティブ・\nラーニングスクエア', x: -18, z: 9, w: 8, d: 14, color: '#fef08a' },
          { id: '2-etsuran', bldg: '2号館', name: '閲覧コーナー', x: -18, z: 20, w: 8, d: 6, color: '#fef9c3' },
          { id: '2-prayer', bldg: '2号館', name: 'prayer room', x: -18, z: -1, w: 5, d: 4, color: '#fed7aa' },
          { id: '2-wc', bldg: '2号館', name: '2号館 トイレ', x: -34, z: -5, w: 8, d: 5, color: '#e2e8f0' },

          { id: '6-101', bldg: '6号館', name: '6-101 教室', x: 18, z: 20, w: 10, d: 8, color: '#86efac' },
          { id: '6-gakugai', bldg: '6号館', name: '学外学修推進\nセンター事務課', x: 28, z: 20, w: 8, d: 8, color: '#bbf7d0' },
          { id: '6-102', bldg: '6号館', name: '6-102 教室', x: 31, z: 5, w: 8, d: 16, color: '#86efac' },
          { id: '6-103', bldg: '6号館', name: '6-103 教室', x: 24, z: -8, w: 12, d: 7, color: '#86efac' },
          { id: '6-fujo', bldg: '6号館', name: '風除室', x: 13, z: -8, w: 4, d: 5, color: '#cbd5e1' },
          { id: '6-core', bldg: '6号館', name: '6号館 階段・トイレ', x: 20, z: 6, w: 6, d: 10, color: '#e2e8f0' },

          { id: '3-shop', bldg: '3号館', name: 'カレッジショップ\nありあけ館 (売店)', x: -18, z: -45, w: 7, d: 9, color: '#f9a8d4' },
          { id: '3-jishu', bldg: '3号館', name: '自学自修スペース', x: -18, z: -32, w: 7, d: 13, color: '#fed7aa' },
          { id: '3-gakuyu', bldg: '3号館', name: '学友会室', x: -14, z: -20, w: 6, d: 4, color: '#fdba74' },
          { id: '3-soko', bldg: '3号館', name: '倉庫 (学友会室)', x: -7, z: -18, w: 6, d: 4, color: '#cbd5e1' },
          { id: '3-wc-nw', bldg: '3号館', name: '3号館西 トイレ', x: -7, z: -46, w: 9, d: 5, color: '#e2e8f0' },
          { id: '3-kenshu', bldg: '3号館', name: '検収センター', x: 10, z: -43, w: 4, d: 5, color: '#cbd5e1' },
          { id: '3-aim', bldg: '3号館', name: '㈱エームビジネス\nサポート', x: 15.5, z: -46, w: 6, d: 5, color: '#fdba74' },
          { id: '3-shokudo', bldg: '3号館', name: 'ありあけ食堂\n(フードコート)', x: 22.5, z: -46, w: 7, d: 5, color: '#fb923c' },
          { id: '3-book', bldg: '3号館', name: 'ブックセンター', x: 30, z: -44, w: 6, d: 7, color: '#f9a8d4' },
        ],
        elevators: [
          { id: 'ev-1', name: '1号館 EV（1F〜13F）', x: -2, z: 47, targets: EV_1_TARGETS },
          { id: 'ev-2', name: '2号館 EV（1F〜6F）', x: -25, z: -4, targets: EV_26_TARGETS },
          { id: 'ev-6', name: '6号館 EV（1F〜6F）', x: 13, z: 6, targets: EV_26_TARGETS },
          { id: 'ev-3', name: '3号館 EV（1F〜3F）', x: 3, z: -38, targets: EV_3_TARGETS },
        ],
        portals: [
          { id: 'to-4', name: '4号館（2F）へ移動 ➔', x: 35, z: 28, targetArea: 'area-4', targetFloor: '2F' },
          { id: 'to-5', name: '5号館（1F）へ移動 ➔', x: -34, z: 26, targetArea: 'area-5', targetFloor: '1F' },
        ],
      },

      // =====================================================================
      // 2F（PDF 2ページ目）
      // =====================================================================
      '2F': {
        label: '1・2・3・6号館 2F',
        spawn: [0, 38],
        buildingZones: [
          { name: '1号館', minX: -40, maxX: 40, minZ: 26, maxZ: 50, floorColor: '#e2e8f0' },
          { name: '2号館', minX: -40, maxX: -12, minZ: -10, maxZ: 26, floorColor: '#fef9c3' },
          { name: 'キャンパスデッキ', minX: -12, maxX: 6, minZ: -38, maxZ: 26, floorColor: '#e0f2fe' },
          { name: '6号館', minX: 6, maxX: 38, minZ: -14, maxZ: 24, floorColor: '#dcfce7' },
          { name: '3号館', minX: 6, maxX: 38, minZ: -52, maxZ: -16, floorColor: '#ffedd5' },
        ],
        voids: [
          { name: '吹抜（1Fフードコート上部）', x: 23, z: -24, w: 22, d: 12 },
        ],
        connectors: [
          { name: '◀ 2号館（図書館・コモンエリア）', x: -14, z: 22 },
          { name: 'キャンパスデッキ（正門方面） ▲', x: -6, z: -10 },
          { name: '6号館 2F（ホール・実習室） ▶', x: 6, z: 6 },
          { name: '▲ 3号館 2F（ロハスカフェ）', x: 10, z: -34 },
        ],
        rooms: [
          { id: '1-206', bldg: '1号館', name: '1-206 教室', x: -29, z: 31, w: 14, d: 6, color: '#93c5fd' },
          { id: '1-2f-vend', bldg: '1号館', name: '自販機コーナー', x: -17, z: 31, w: 5, d: 5, color: '#cbd5e1' },
          { id: '1-2f-ent', bldg: '1号館', name: 'エントランス(吹抜)', x: -10, z: 31, w: 6, d: 5, color: '#e2e8f0' },
          { id: '1-207', bldg: '1号館', name: '1-207 教室', x: 14, z: 31, w: 14, d: 6, color: '#93c5fd' },
          { id: '1-208', bldg: '1号館', name: '1-208 教室', x: 29, z: 31, w: 14, d: 6, color: '#93c5fd' },
          { id: '1-205', bldg: '1号館', name: '1-205 教室', x: -32, z: 45, w: 10, d: 6, color: '#93c5fd' },
          { id: '1-204', bldg: '1号館', name: '1-204 教室', x: -21, z: 45, w: 10, d: 6, color: '#93c5fd' },
          { id: '1-203', bldg: '1号館', name: '1-203 教室', x: -10, z: 45, w: 10, d: 6, color: '#93c5fd' },
          { id: '1-202', bldg: '1号館', name: '1-202 教室', x: 11, z: 45, w: 10, d: 6, color: '#93c5fd' },
          { id: '1-2f-wc', bldg: '1号館', name: '1号館2F トイレ', x: 19, z: 45, w: 4, d: 6, color: '#e2e8f0' },
          { id: '1-201', bldg: '1号館', name: '1-201 教室', x: 30, z: 45, w: 12, d: 6, color: '#93c5fd' },

          { id: '2-common', bldg: '2号館', name: 'コモンエリア', x: -33, z: 20, w: 10, d: 7, color: '#fef08a' },
          { id: '2-lib-2f', bldg: '2号館', name: '図書館', x: -33, z: 7, w: 10, d: 16, color: '#fde047' },
          { id: '2-lib-off', bldg: '2号館', name: '図書館事務室', x: -20, z: 5, w: 6, d: 12, color: '#fef9c3' },
          { id: '2-2f-wc', bldg: '2号館', name: '2号館2F トイレ', x: -32, z: -5, w: 10, d: 5, color: '#e2e8f0' },

          { id: '6-201', bldg: '6号館', name: '6-201 シミュレーション室', x: 18, z: 18, w: 11, d: 8, color: '#86efac' },
          { id: '6-2f-fujo1', bldg: '6号館', name: '風除室', x: 9, z: 19, w: 3, d: 5, color: '#cbd5e1' },
          { id: '6-m-lock', bldg: '6号館', name: '男子更衣室', x: 26, z: 19, w: 4, d: 6, color: '#cbd5e1' },
          { id: '6-baby', bldg: '6号館', name: '授乳室', x: 26, z: 13, w: 4, d: 4, color: '#f9a8d4' },
          { id: '6-w-lock', bldg: '6号館', name: '女子更衣室', x: 33, z: 17, w: 6, d: 9, color: '#cbd5e1' },
          { id: '6-2f-core', bldg: '6号館', name: '6号館2F 階段・トイレ', x: 21, z: 5, w: 6, d: 9, color: '#e2e8f0' },
          { id: '6-2f-fujo2', bldg: '6号館', name: '風除室', x: 13, z: -9, w: 4, d: 5, color: '#cbd5e1' },
          { id: '6-203', bldg: '6号館', name: '6-203 実習室', x: 21, z: -8, w: 9, d: 8, color: '#86efac' },
          { id: '6-202', bldg: '6号館', name: '6-202 実習室', x: 31, z: -8, w: 9, d: 8, color: '#86efac' },

          { id: '3-lohas', bldg: '3号館', name: 'ロハスカフェ ARIAKE', x: 25, z: -43, w: 14, d: 14, color: '#fb923c' },
          { id: '3-2f-wc', bldg: '3号館', name: '3号館2F トイレ', x: 34, z: -32, w: 5, d: 5, color: '#e2e8f0' },
        ],
        elevators: [
          { id: 'ev-1', name: '1号館 EV（1F〜13F）', x: -2, z: 47, targets: EV_1_TARGETS },
          { id: 'ev-2', name: '2号館 EV（1F〜6F）', x: -24, z: -5, targets: EV_26_TARGETS },
          { id: 'ev-6', name: '6号館 EV（1F〜6F）', x: 14, z: 5, targets: EV_26_TARGETS },
          { id: 'ev-3', name: '3号館 EV（1F〜3F）', x: 11, z: -45, targets: EV_3_TARGETS },
        ],
        portals: [
          { id: 'to-4-2f', name: '4号館（2F）へ移動 ➔', x: 35, z: 28, targetArea: 'area-4', targetFloor: '2F' },
        ],
      },

      // =====================================================================
      // 3F（PDF 3ページ目）
      // =====================================================================
      '3F': {
        label: '1・2・3・6号館 3F',
        spawn: [0, 38],
        buildingZones: [
          { name: '1号館', minX: -40, maxX: 40, minZ: 26, maxZ: 50, floorColor: '#e2e8f0' },
          { name: '2号館連絡通路', minX: -32, maxX: -24, minZ: 20, maxZ: 26, floorColor: '#fef9c3' },
          { name: '2号館', minX: -38, maxX: -12, minZ: -12, maxZ: 20, floorColor: '#fef9c3' },
          { name: '6号館', minX: 8, maxX: 38, minZ: -14, maxZ: 22, floorColor: '#dcfce7' },
          { name: '3号館', minX: 6, maxX: 36, minZ: -52, maxZ: -18, floorColor: '#ffedd5' },
        ],
        voids: [],
        connectors: [
          { name: '◀ 2号館 3F（ライブラリー）連絡通路', x: -28, z: 25 },
        ],
        rooms: [
          { id: '1-305', bldg: '1号館', name: '1-305 教室', x: -33, z: 31, w: 10, d: 6, color: '#93c5fd' },
          { id: '1-306', bldg: '1号館', name: '1-306 教室', x: -19, z: 31, w: 14, d: 6, color: '#93c5fd' },
          { id: '1-eng', bldg: '1号館', name: 'イングリッシュ\nスペース', x: -5, z: 31, w: 10, d: 6, color: '#a5f3fc' },
          { id: '1-307', bldg: '1号館', name: '1-307 教室', x: 14, z: 31, w: 14, d: 6, color: '#93c5fd' },
          { id: '1-308', bldg: '1号館', name: '1-308 教室', x: 30, z: 31, w: 14, d: 6, color: '#93c5fd' },
          { id: '1-304', bldg: '1号館', name: '1-304 教室', x: -33, z: 45, w: 10, d: 6, color: '#93c5fd' },
          { id: '1-303', bldg: '1号館', name: '1-303 教室', x: -17, z: 45, w: 14, d: 6, color: '#93c5fd' },
          { id: '1-302', bldg: '1号館', name: '1-302 教室', x: 11, z: 45, w: 10, d: 6, color: '#93c5fd' },
          { id: '1-3f-wc', bldg: '1号館', name: '1号館3F トイレ', x: 19, z: 45, w: 4, d: 6, color: '#e2e8f0' },
          { id: '1-301', bldg: '1号館', name: '1-301 教室', x: 31, z: 45, w: 12, d: 6, color: '#93c5fd' },

          { id: '2-lib-3f', bldg: '2号館', name: 'ライブラリー', x: -24, z: 6, w: 18, d: 22, color: '#fde047' },
          { id: '2-3f-wc', bldg: '2号館', name: '2号館3F トイレ', x: -33, z: -8, w: 8, d: 4, color: '#e2e8f0' },

          { id: '6-301', bldg: '6号館', name: '6-301 実習室', x: 24, z: 16, w: 22, d: 8, color: '#86efac' },
          { id: '6-303', bldg: '6号館', name: '6-303 実習室', x: 20, z: -8, w: 11, d: 8, color: '#86efac' },
          { id: '6-302', bldg: '6号館', name: '6-302 実習室', x: 32, z: -8, w: 10, d: 8, color: '#86efac' },
          { id: '6-prep31', bldg: '6号館', name: '準備室 31', x: 33, z: 3, w: 8, d: 6, color: '#cbd5e1' },
          { id: '6-3f-core', bldg: '6号館', name: '6号館3F 階段・トイレ', x: 21, z: 4, w: 6, d: 9, color: '#e2e8f0' },

          { id: '3-301', bldg: '3号館', name: '3-301 大教室', x: 17, z: -37, w: 9, d: 20, color: '#c4b5fd' },
          { id: '3-chosei', bldg: '3号館', name: '調整室', x: 17, z: -24, w: 7, d: 4, color: '#cbd5e1' },
          { id: '3-302', bldg: '3号館', name: '3-302 大教室', x: 27, z: -37, w: 9, d: 20, color: '#c4b5fd' },
          { id: '3-hikae', bldg: '3号館', name: '控室', x: 27, z: -24, w: 7, d: 4, color: '#cbd5e1' },
          { id: '3-3f-wcm', bldg: '3号館', name: '男子トイレ', x: 9, z: -22, w: 3, d: 4, color: '#e2e8f0' },
          { id: '3-3f-wcw', bldg: '3号館', name: '女子トイレ', x: 33, z: -22, w: 3, d: 4, color: '#e2e8f0' },
        ],
        elevators: [
          { id: 'ev-1', name: '1号館 EV（1F〜13F）', x: -2, z: 47, targets: EV_1_TARGETS },
          { id: 'ev-2', name: '2号館 EV（1F〜6F）', x: -25, z: -8, targets: EV_26_TARGETS },
          { id: 'ev-6', name: '6号館 EV（1F〜6F）', x: 13, z: 4, targets: EV_26_TARGETS },
          { id: 'ev-3', name: '3号館 EV（1F〜3F）', x: 9, z: -47, targets: EV_3_TARGETS },
        ],
        portals: [],
      },

      // =====================================================================
      // 4F（PDF 4ページ目：1号館・2号館・6号館 ※3号館は屋上）
      // =====================================================================
      '4F': {
        label: '1・2・6号館 4F',
        spawn: [0, 38],
        buildingZones: [
          { name: '1号館', minX: -40, maxX: 40, minZ: 26, maxZ: 50, floorColor: '#e2e8f0' },
          { name: '2号館連絡通路', minX: -32, maxX: -24, minZ: 20, maxZ: 26, floorColor: '#fef9c3' },
          { name: '2号館', minX: -40, maxX: -12, minZ: -14, maxZ: 20, floorColor: '#fef9c3' },
          { name: '6号館', minX: 6, maxX: 38, minZ: -14, maxZ: 24, floorColor: '#dcfce7' },
        ],
        voids: [
          { name: '吹き抜け', x: 2, z: 31, w: 8, d: 6 },
        ],
        connectors: [
          { name: '◀ 2号館 4F（マルチメディア・ゼミ室）通路', x: -28, z: 25 },
        ],
        rooms: [
          // 1号館 4F
          { id: '1-405', bldg: '1号館', name: '1-405 教室', x: -33, z: 31, w: 10, d: 6, color: '#93c5fd' },
          { id: '1-406', bldg: '1号館', name: '1-406 教室', x: -16, z: 31, w: 18, d: 6, color: '#93c5fd' },
          { id: '1-407', bldg: '1号館', name: '1-407 教室', x: 16, z: 31, w: 16, d: 6, color: '#93c5fd' },
          { id: '1-408', bldg: '1号館', name: '1-408 教室', x: 31, z: 31, w: 12, d: 6, color: '#93c5fd' },
          { id: '1-404', bldg: '1号館', name: '1-404 教室', x: -33, z: 45, w: 10, d: 6, color: '#93c5fd' },
          { id: '1-403', bldg: '1号館', name: '1-403 教室', x: -17, z: 45, w: 16, d: 6, color: '#93c5fd' },
          { id: '1-402', bldg: '1号館', name: '1-402 教室', x: 11, z: 45, w: 10, d: 6, color: '#93c5fd' },
          { id: '1-4f-wc', bldg: '1号館', name: '1号館4F トイレ', x: 19, z: 45, w: 4, d: 6, color: '#e2e8f0' },
          { id: '1-401', bldg: '1号館', name: '1-401 教室', x: 31, z: 45, w: 12, d: 6, color: '#93c5fd' },

          // 2号館 4F
          { id: '2-408', bldg: '2号館', name: '2-408\n合同研究室', x: -34, z: 15, w: 8, d: 7, color: '#fde047' },
          { id: '2-401', bldg: '2号館', name: '2-401\nマルチメディア教室', x: -34, z: 5, w: 8, d: 11, color: '#fef08a' },
          { id: '2-4f-wc', bldg: '2号館', name: '2号館4F トイレ', x: -34, z: -7, w: 8, d: 6, color: '#e2e8f0' },
          { id: '2-406', bldg: '2号館', name: '2-406 教室', x: -18, z: 15, w: 9, d: 7, color: '#fde047' },
          { id: '2-405', bldg: '2号館', name: '2-405 ゼミ室', x: -18, z: 8, w: 9, d: 5, color: '#fef08a' },
          { id: '2-404', bldg: '2号館', name: '2-404 ゼミ室', x: -18, z: 2, w: 9, d: 5, color: '#fef08a' },
          { id: '2-402', bldg: '2号館', name: '2-402 教室', x: -18, z: -6, w: 9, d: 9, color: '#fde047' },

          // 6号館 4F（研究室40室＋中央コア）
          ...createBldg6LabRooms(4),
        ],
        elevators: [
          { id: 'ev-1', name: '1号館 EV（1F〜13F）', x: -2, z: 47, targets: EV_1_TARGETS },
          { id: 'ev-2', name: '2号館 EV（1F〜6F）', x: -26, z: -9, targets: EV_26_TARGETS },
          { id: 'ev-6', name: '6号館 EV（1F〜6F）', x: 19, z: 2, targets: EV_26_TARGETS },
        ],
        portals: [],
      },

      // =====================================================================
      // 5F（PDF 5ページ目：1号館・2号館・6号館）
      // =====================================================================
      '5F': {
        label: '1・2・6号館 5F',
        spawn: [0, 38],
        buildingZones: [
          { name: '1号館', minX: -40, maxX: 40, minZ: 26, maxZ: 50, floorColor: '#e2e8f0' },
          { name: '2号館連絡通路', minX: -32, maxX: -24, minZ: 20, maxZ: 26, floorColor: '#fef9c3' },
          { name: '2号館', minX: -40, maxX: -12, minZ: -14, maxZ: 20, floorColor: '#fef9c3' },
          { name: '6号館', minX: 6, maxX: 38, minZ: -14, maxZ: 24, floorColor: '#dcfce7' },
        ],
        voids: [],
        connectors: [
          { name: '◀ 2号館 5F（心理臨床センター・研究室）通路', x: -28, z: 25 },
        ],
        rooms: [
          // 1号館 5F
          { id: '1-505', bldg: '1号館', name: '1-505 教室', x: -33, z: 31, w: 10, d: 6, color: '#93c5fd' },
          { id: '1-506', bldg: '1号館', name: '1-506 教室', x: -16, z: 31, w: 18, d: 6, color: '#93c5fd' },
          { id: '1-asia', bldg: '1号館', name: 'アジアスペース', x: 2, z: 31, w: 8, d: 6, color: '#a5f3fc' },
          { id: '1-508', bldg: '1号館', name: '1-508 教室', x: 16, z: 31, w: 16, d: 6, color: '#93c5fd' },
          { id: '1-509', bldg: '1号館', name: '1-509 教室', x: 31, z: 31, w: 12, d: 6, color: '#93c5fd' },
          { id: '1-504', bldg: '1号館', name: '1-504 教室', x: -33, z: 45, w: 10, d: 6, color: '#93c5fd' },
          { id: '1-503', bldg: '1号館', name: '1-503 教室', x: -17, z: 45, w: 16, d: 6, color: '#93c5fd' },
          { id: '1-502', bldg: '1号館', name: '1-502 教室', x: 11, z: 45, w: 10, d: 6, color: '#93c5fd' },
          { id: '1-5f-wc', bldg: '1号館', name: '1号館5F トイレ', x: 19, z: 45, w: 4, d: 6, color: '#e2e8f0' },
          { id: '1-501', bldg: '1号館', name: '1-501 教室', x: 31, z: 45, w: 12, d: 6, color: '#93c5fd' },

          // 2号館 5F
          { id: '2-501-504', bldg: '2号館', name: '2-501〜2-504\n研究室', x: -34, z: 13, w: 8, d: 10, color: '#fde047' },
          { id: '2-505-508', bldg: '2号館', name: '2-505〜2-508\n研究室', x: -18, z: 13, w: 8, d: 10, color: '#fde047' },
          { id: '2-shinri-w', bldg: '2号館', name: '心理臨床センター\n(西)', x: -34, z: 0, w: 8, d: 11, color: '#f9a8d4' },
          { id: '2-shinri-e', bldg: '2号館', name: '心理臨床センター\n(東)', x: -18, z: 0, w: 8, d: 11, color: '#f9a8d4' },
          { id: '2-5f-wc', bldg: '2号館', name: '2号館5F トイレ', x: -32, z: -10, w: 10, d: 4, color: '#e2e8f0' },

          // 6号館 5F
          ...createBldg6LabRooms(5),
        ],
        elevators: [
          { id: 'ev-1', name: '1号館 EV（1F〜13F）', x: -2, z: 47, targets: EV_1_TARGETS },
          { id: 'ev-2', name: '2号館 EV（1F〜6F）', x: -24, z: -10, targets: EV_26_TARGETS },
          { id: 'ev-6', name: '6号館 EV（1F〜6F）', x: 19, z: 2, targets: EV_26_TARGETS },
        ],
        portals: [],
      },

      // =====================================================================
      // 6F（PDF 5ページ目右図：1号館 管理・役員フロア / 2号館・6号館 屋上庭園）
      // =====================================================================
      '6F': {
        label: '1号館 6F（管理・法人フロア）/ 2・6号館 屋上庭園',
        spawn: [0, 38],
        buildingZones: [
          { name: '1号館', minX: -40, maxX: 40, minZ: 26, maxZ: 50, floorColor: '#e2e8f0' },
          { name: '2号館連絡通路', minX: -32, maxX: -24, minZ: 20, maxZ: 26, floorColor: '#bbf7d0' },
          { name: '2号館 屋上庭園', minX: -40, maxX: -12, minZ: -14, maxZ: 20, floorColor: '#86efac' },
          { name: '6号館 屋上庭園', minX: 6, maxX: 38, minZ: -14, maxZ: 24, floorColor: '#86efac' },
        ],
        voids: [
          { name: '吹き抜け', x: 4, z: 31, w: 6, d: 6 },
        ],
        connectors: [
          { name: '◀ 2号館 屋上庭園へ', x: -28, z: 25 },
        ],
        rooms: [
          // 1号館 6F 北側列
          { id: '1-keiri', bldg: '1号館', name: '経理課', x: -34, z: 31, w: 8, d: 6, color: '#93c5fd' },
          { id: '1-dx6', bldg: '1号館', name: 'DX戦略企画課', x: -25, z: 30, w: 7, d: 3.5, color: '#bfdbfe' },
          { id: '1-6b', bldg: '1号館', name: '1-6B ミーティング', x: -26.5, z: 33, w: 4, d: 2.5, color: '#e0f2fe' },
          { id: '1-6c', bldg: '1号館', name: '1-6C ミーティング', x: -22.5, z: 33, w: 4, d: 2.5, color: '#e0f2fe' },
          { id: '1-sys', bldg: '1号館', name: 'システム運用管理課', x: -16, z: 31, w: 6, d: 6, color: '#bfdbfe' },
          { id: '1-hojin', bldg: '1号館', name: '法人企画課', x: -10, z: 31, w: 5, d: 6, color: '#93c5fd' },
          { id: '1-koho', bldg: '1号館', name: '広報課', x: -4.5, z: 31, w: 5, d: 6, color: '#93c5fd' },
          { id: '1-6a', bldg: '1号館', name: '1-6A 会議室', x: 13, z: 31, w: 7, d: 6, color: '#93c5fd' },
          { id: '1-osetsu', bldg: '1号館', name: '応接室A', x: 19, z: 32.5, w: 4, d: 3, color: '#fde047' },
          { id: '1-yakuin-n1', bldg: '1号館', name: '役員室', x: 19, z: 29.5, w: 4, d: 3, color: '#fcd34d' },
          { id: '1-riji', bldg: '1号館', name: '理事長室', x: 24.5, z: 31, w: 6, d: 6, color: '#fb923c' },
          { id: '1-yakuin-n2', bldg: '1号館', name: '役員室', x: 30.5, z: 31, w: 5, d: 6, color: '#fcd34d' },
          { id: '1-yakuin-n3', bldg: '1号館', name: '役員室', x: 36, z: 31, w: 5, d: 6, color: '#fcd34d' },

          // 1号館 6F 南側列
          { id: '1-kanzai', bldg: '1号館', name: '管財課\n有明分室', x: -28, z: 45, w: 6, d: 6, color: '#cbd5e1' },
          { id: '1-jinji', bldg: '1号館', name: '人事課', x: -22, z: 45, w: 5, d: 6, color: '#93c5fd' },
          { id: '1-somu', bldg: '1号館', name: '総務課', x: -16.5, z: 45, w: 5, d: 6, color: '#93c5fd' },
          { id: '1-homu', bldg: '1号館', name: '法務課', x: -11, z: 45, w: 5, d: 6, color: '#93c5fd' },
          { id: '1-yakuin-s1', bldg: '1号館', name: '役員室', x: 8, z: 45, w: 4, d: 6, color: '#fcd34d' },
          { id: '1-lock6', bldg: '1号館', name: '更衣室', x: 13.5, z: 45, w: 6, d: 6, color: '#cbd5e1' },
          { id: '1-6f-wc', bldg: '1号館', name: '1号館6F トイレ', x: 20, z: 45, w: 6, d: 6, color: '#e2e8f0' },
          { id: '1-yakuin-s2', bldg: '1号館', name: '役員室', x: 29, z: 45, w: 7, d: 6, color: '#fcd34d' },
          { id: '1-yakuin-s3', bldg: '1号館', name: '役員室', x: 36, z: 45, w: 6, d: 6, color: '#fcd34d' },

          // 6号館 6F 中央コア
          { id: '6-6f-core', bldg: '6号館', name: '6号館6F EVコア\n（周囲：屋上庭園）', x: 21, z: 5, w: 8, d: 12, color: '#cbd5e1' },
        ],
        elevators: [
          { id: 'ev-1', name: '1号館 EV（1F〜13F）', x: -2, z: 47, targets: EV_1_TARGETS },
          { id: 'ev-6', name: '6号館 EV（1F〜6F）', x: 15, z: 5, targets: EV_26_TARGETS },
        ],
        portals: [],
      },

      // =====================================================================
      // 7F（PDF 6ページ目下図：1号館 国際課・PCルーム・ゼミ室）
      // =====================================================================
      '7F': {
        label: '1号館 7F（国際課・PCルーム・ゼミ室）',
        spawn: [-16, 38],
        buildingZones: [
          { name: '1号館', minX: -41, maxX: 41, minZ: 26, maxZ: 50, floorColor: '#e2e8f0' },
        ],
        voids: [],
        connectors: [],
        rooms: [
          // 北側列
          { id: '1-kokusai', bldg: '1号館', name: '国際課', x: -34, z: 31, w: 10, d: 6, color: '#93c5fd' },
          { id: '1-mendan', bldg: '1号館', name: '面談ルーム', x: -25, z: 31, w: 6, d: 6, color: '#bfdbfe' },
          { id: '1-station2', bldg: '1号館', name: 'TA/SA・教員\nステーション2', x: -16, z: 31, w: 10, d: 6, color: '#fde047' },
          { id: '1-gc', bldg: '1号館', name: 'GC全員留学事務室', x: -6, z: 31, w: 8, d: 6, color: '#93c5fd' },
          { id: '1-707', bldg: '1号館', name: '1-707 ゼミ室', x: 4, z: 31, w: 8, d: 6, color: '#86efac' },
          { id: '1-708', bldg: '1号館', name: '1-708 ゼミ室', x: 12.5, z: 31, w: 7, d: 6, color: '#86efac' },
          { id: '1-709', bldg: '1号館', name: '1-709 ゼミ室', x: 20, z: 31, w: 7, d: 6, color: '#86efac' },
          { id: '1-710', bldg: '1号館', name: '1-710 PCルーム', x: 28, z: 31, w: 8, d: 6, color: '#67e8f9' },
          { id: '1-711', bldg: '1号館', name: '1-711 PCルーム', x: 36.5, z: 31, w: 8, d: 6, color: '#67e8f9' },

          // 南側列
          { id: '1-7print', bldg: '1号館', name: '印刷室', x: -36, z: 45, w: 6, d: 6, color: '#cbd5e1' },
          { id: '1-704', bldg: '1号館', name: '1-704 教員\nステーション1', x: -27, z: 45, w: 10, d: 6, color: '#fde047' },
          { id: '1-703', bldg: '1号館', name: '1-703E〜1-703A\n研究室', x: 0, z: 45, w: 18, d: 6, color: '#cbd5e1' },
          { id: '1-702', bldg: '1号館', name: '1-702 ゼミ室', x: 15, z: 45, w: 9, d: 6, color: '#86efac' },
          { id: '1-7f-wc', bldg: '1号館', name: 'トイレ', x: 22, z: 45, w: 4, d: 6, color: '#e2e8f0' },
          { id: '1-701', bldg: '1号館', name: '1-701 PCルーム', x: 32, z: 45, w: 13, d: 6, color: '#67e8f9' },
        ],
        elevators: [
          { id: 'ev-1', name: '1号館 EV（1F〜13F）', x: -16, z: 46, targets: EV_1_TARGETS },
        ],
        portals: [],
      },

      // =====================================================================
      // 8F（PDF 6ページ目中下図：1号館 教室・ゼミ室・研究所）
      // =====================================================================
      '8F': {
        label: '1号館 8F（教室・ゼミ室・研究所）',
        spawn: [-16, 38],
        buildingZones: [
          { name: '1号館', minX: -41, maxX: 41, minZ: 26, maxZ: 50, floorColor: '#e2e8f0' },
        ],
        voids: [
          { name: '吹き抜け', x: 6, z: 31, w: 6, d: 6 },
        ],
        connectors: [],
        rooms: [
          // 北側列
          { id: '1-812', bldg: '1号館', name: '1-812 教室', x: -34, z: 31, w: 11, d: 6, color: '#93c5fd' },
          { id: '1-8c', bldg: '1号館', name: '1-8C 会議室', x: -23, z: 31, w: 8, d: 6, color: '#bfdbfe' },
          { id: '1-805', bldg: '1号館', name: '1-805 ゼミ室', x: -12, z: 31, w: 11, d: 6, color: '#86efac' },
          { id: '1-806', bldg: '1号館', name: '1-806 ゼミ室', x: -1, z: 31, w: 8, d: 6, color: '#86efac' },
          { id: '1-807', bldg: '1号館', name: '1-807 ゼミ室', x: 16, z: 31, w: 11, d: 6, color: '#86efac' },
          { id: '1-809', bldg: '1号館', name: '1-809 教室', x: 31, z: 31, w: 16, d: 6, color: '#93c5fd' },

          // 南側列
          { id: '1-811', bldg: '1号館', name: '1-811 教室', x: -32, z: 45, w: 15, d: 6, color: '#93c5fd' },
          { id: '1-keiei', bldg: '1号館', name: '経営研究所', x: -5, z: 45, w: 8, d: 6, color: '#fde047' },
          { id: '1-global', bldg: '1号館', name: 'グローバルスタディース\n研究所', x: 4, z: 45, w: 8, d: 6, color: '#fde047' },
          { id: '1-803', bldg: '1号館', name: '1-803 教室', x: 13, z: 45, w: 8, d: 6, color: '#93c5fd' },
          { id: '1-802', bldg: '1号館', name: '1-802 自習室', x: 20, z: 45, w: 5, d: 6, color: '#fed7aa' },
          { id: '1-8f-wc', bldg: '1号館', name: 'トイレ', x: 25, z: 45, w: 4, d: 6, color: '#e2e8f0' },
          { id: '1-801', bldg: '1号館', name: '1-801 ゼミ室', x: 33.5, z: 45, w: 11, d: 6, color: '#86efac' },
        ],
        elevators: [
          { id: 'ev-1', name: '1号館 EV（1F〜13F）', x: -16, z: 46, targets: EV_1_TARGETS },
        ],
        portals: [],
      },

      // =====================================================================
      // 9F（PDF 6ページ目中上図：1号館 ゼミ室・研究室・産学連携室）
      // =====================================================================
      '9F': {
        label: '1号館 9F（ゼミ室・研究室・産学連携室）',
        spawn: [-16, 38],
        buildingZones: [
          { name: '1号館', minX: -41, maxX: 41, minZ: 26, maxZ: 50, floorColor: '#e2e8f0' },
        ],
        voids: [],
        connectors: [],
        rooms: [
          // 北側列
          { id: '1-9a', bldg: '1号館', name: '1-9A 会議室', x: -34, z: 31, w: 10, d: 6, color: '#bfdbfe' },
          { id: '1-905', bldg: '1号館', name: '1-905 研究室', x: -24, z: 31, w: 7, d: 6, color: '#cbd5e1' },
          { id: '1-906', bldg: '1号館', name: '1-906 ゼミ室', x: -16, z: 31, w: 7, d: 6, color: '#86efac' },
          { id: '1-907', bldg: '1号館', name: '1-907 ゼミ室', x: -8, z: 31, w: 7, d: 6, color: '#86efac' },
          { id: '1-908', bldg: '1号館', name: '1-908 ゼミ室', x: 0, z: 31, w: 7, d: 6, color: '#86efac' },
          { id: '1-909', bldg: '1号館', name: '1-909 ゼミ室', x: 8, z: 31, w: 7, d: 6, color: '#86efac' },
          { id: '1-910', bldg: '1号館', name: '1-910 研究室', x: 16, z: 31, w: 7, d: 6, color: '#cbd5e1' },
          { id: '1-901b', bldg: '1号館', name: '1-901B\n研究室', x: 24, z: 31, w: 7, d: 6, color: '#cbd5e1' },
          { id: '1-901a', bldg: '1号館', name: '1-901A\n研究室', x: 31.5, z: 31, w: 6, d: 6, color: '#cbd5e1' },
          { id: '1-901', bldg: '1号館', name: '1-901', x: 37.5, z: 31, w: 5, d: 6, color: '#93c5fd' },

          // 南側列
          { id: '1-sangaku', bldg: '1号館', name: '産学連携室', x: -35, z: 45, w: 8, d: 6, color: '#fde047' },
          { id: '1-kyogaku', bldg: '1号館', name: '響学開発センター', x: -26, z: 45, w: 8, d: 6, color: '#fde047' },
          { id: '1-904', bldg: '1号館', name: '1-904 ゼミ室', x: -4, z: 45, w: 9, d: 6, color: '#86efac' },
          { id: '1-903', bldg: '1号館', name: '1-903 ゼミ室', x: 6, z: 45, w: 9, d: 6, color: '#86efac' },
          { id: '1-kokusai-ken', bldg: '1号館', name: '国際総合研究所', x: 16, z: 45, w: 9, d: 6, color: '#fde047' },
          { id: '1-902', bldg: '1号館', name: '1-902', x: 25, z: 45, w: 7, d: 6, color: '#93c5fd' },
          { id: '1-9f-wc', bldg: '1号館', name: 'トイレ', x: 32, z: 45, w: 5, d: 6, color: '#e2e8f0' },
        ],
        elevators: [
          { id: 'ev-1', name: '1号館 EV（1F〜13F）', x: -16, z: 46, targets: EV_1_TARGETS },
        ],
        portals: [],
      },

      // =====================================================================
      // 10F・11F・12F（PDF 6〜7ページ目：1号館 研究室フロア）
      // =====================================================================
      '10F': createBldg1LabFloor(10),
      '11F': createBldg1LabFloor(11),
      '12F': createBldg1LabFloor(12),

      // =====================================================================
      // 13F（PDF 7ページ目上図：1号館 1-13A/13B会議室・屋上庭園）
      // =====================================================================
      '13F': {
        label: '1号館 13F（最上階 会議室・屋上庭園）',
        spawn: [-2, 43],
        buildingZones: [
          { name: '1号館 13F・屋上庭園', minX: -36, maxX: 36, minZ: 26, maxZ: 48, floorColor: '#bbf7d0' },
        ],
        voids: [],
        connectors: [],
        rooms: [
          { id: '1-13a', bldg: '1号館', name: '1-13A 会議室', x: -18, z: 37, w: 14, d: 8, color: '#93c5fd' },
          { id: '1-13f-wc', bldg: '1号館', name: '13F トイレ', x: -7, z: 37, w: 5, d: 8, color: '#e2e8f0' },
          { id: '1-13b', bldg: '1号館', name: '1-13B 会議室', x: 18, z: 37, w: 16, d: 8, color: '#93c5fd' },
        ],
        elevators: [
          { id: 'ev-1', name: '1号館 EV（1F〜13F）', x: -2, z: 37, targets: EV_1_TARGETS },
        ],
        portals: [],
      },
    },
  },

  // =========================================================================
  // 4号館（2F〜5F：PDF 8・9ページ目準拠）
  // =========================================================================
  'area-4': {
    id: 'area-4',
    name: '4号館',
    floors: {
      '2F': {
        label: '4号館 2F（キャリアセンター・研究室4-201〜4-210）',
        spawn: [18, 9],
        buildingZones: [
          { name: '4号館 西ウイング', minX: -28, maxX: 12, minZ: -3, maxZ: 16, floorColor: '#fef3c7' },
          { name: '4号館 東ウイング', minX: 10, maxX: 28, minZ: -18, maxZ: 24, floorColor: '#fde68a' },
        ],
        voids: [],
        connectors: [
          { name: '◀ 西側研究室エリア（4-201〜4-210）', x: 6, z: 2 },
        ],
        rooms: [
          { id: '4-210', bldg: '4号館', name: '4-210\n研究室', x: -25.5, z: 8, w: 3, d: 4, color: '#cbd5e1' },
          { id: '4-209', bldg: '4号館', name: '4-209\n研究室', x: -22.5, z: 6, w: 2.5, d: 5, color: '#cbd5e1' },
          { id: '4-208', bldg: '4号館', name: '4-208\n研究室', x: -20.0, z: 6, w: 2.5, d: 5, color: '#cbd5e1' },
          { id: '4-207', bldg: '4号館', name: '4-207\n研究室', x: -17.5, z: 6, w: 2.5, d: 5, color: '#cbd5e1' },
          { id: '4-206', bldg: '4号館', name: '4-206\n研究室', x: -15.0, z: 6, w: 2.5, d: 5, color: '#cbd5e1' },
          { id: '4-205', bldg: '4号館', name: '4-205\n研究室', x: -12.5, z: 6, w: 2.5, d: 5, color: '#cbd5e1' },
          { id: '4-204', bldg: '4号館', name: '4-204\n研究室', x: -10.0, z: 6, w: 2.5, d: 5, color: '#cbd5e1' },
          { id: '4-203', bldg: '4号館', name: '4-203\n研究室', x: -7.5, z: 6, w: 2.5, d: 5, color: '#cbd5e1' },
          { id: '4-202', bldg: '4号館', name: '4-202\n研究室', x: -5.0, z: 6, w: 2.5, d: 5, color: '#cbd5e1' },
          { id: '4-201', bldg: '4号館', name: '4-201\n研究室', x: -2.5, z: 6, w: 2.5, d: 5, color: '#cbd5e1' },
          { id: '4-2f-wc', bldg: '4号館', name: '4号館2F トイレ', x: -5, z: -0.5, w: 8, d: 3, color: '#e2e8f0' },

          { id: '4-soko', bldg: '4号館', name: '倉庫', x: 13, z: -13, w: 6, d: 8, color: '#cbd5e1' },
          { id: '4-proj', bldg: '4号館', name: 'プロジェクトルーム', x: 22, z: -14, w: 10, d: 6, color: '#a5f3fc' },
          { id: '4-math', bldg: '4号館', name: '数理工学\n計算機実験室', x: 24, z: -3, w: 6, d: 12, color: '#93c5fd' },
          { id: '4-fujo', bldg: '4号館', name: '風除室', x: 12.5, z: 10, w: 3, d: 6, color: '#cbd5e1' },
          { id: '4-csodan', bldg: '4号館', name: 'キャリアセンター\n相談ブース', x: 12.5, z: 20, w: 3, d: 6, color: '#fde047' },
          { id: '4-kyoshoku', bldg: '4号館', name: '教職相談\nブース', x: 15.5, z: 20, w: 3, d: 6, color: '#fde047' },
          { id: '4-career1', bldg: '4号館', name: 'キャリアセンター\n支援課(西)', x: 19.5, z: 20, w: 5, d: 6, color: '#fcd34d' },
          { id: '4-career2', bldg: '4号館', name: 'キャリアセンター\n支援課(東)', x: 24.5, z: 20, w: 5, d: 6, color: '#fcd34d' },
        ],
        elevators: [
          { id: 'ev-4', name: '4号館 EV（2F〜5F）', x: 6, z: -0.5, targets: ['2F', '3F', '4F', '5F'] },
        ],
        portals: [
          { id: 'back-1236', name: '⬅ 1・2・3・6号館 2Fへ移動', x: 2, z: 13, targetArea: 'area-1236', targetFloor: '2F' },
        ],
      },

      '3F': {
        label: '4号館 3F（4-301〜4-306 教室・研究室）',
        spawn: [0, 4],
        buildingZones: [
          { name: '4号館 南側教室棟', minX: -28, maxX: 28, minZ: -3, maxZ: 18, floorColor: '#fef3c7' },
          { name: '4号館 北東ウイング', minX: 10, maxX: 28, minZ: -18, maxZ: -3, floorColor: '#fde68a' },
        ],
        voids: [],
        connectors: [],
        rooms: [
          { id: '4-301', bldg: '4号館', name: '4-301 教室', x: 19, z: -13, w: 14, d: 8, color: '#86efac' },
          { id: '4-302', bldg: '4号館', name: '4-302 教室', x: 23, z: -4, w: 8, d: 7, color: '#86efac' },
          { id: '4-3f-wc', bldg: '4号館', name: '4号館3F トイレ', x: -5, z: -0.5, w: 8, d: 3, color: '#e2e8f0' },

          { id: '4-306', bldg: '4号館', name: '4-306 教室', x: -18, z: 12, w: 16, d: 8, color: '#86efac' },
          { id: '4-305', bldg: '4号館', name: '4-305 教室', x: -4, z: 12, w: 10, d: 8, color: '#86efac' },
          { id: '4-304', bldg: '4号館', name: '4-304 研究室', x: 4, z: 12, w: 6, d: 8, color: '#cbd5e1' },
          { id: '4-303', bldg: '4号館', name: '4-303 教室', x: 17, z: 12, w: 18, d: 8, color: '#86efac' },
        ],
        elevators: [
          { id: 'ev-4', name: '4号館 EV（2F〜5F）', x: 6, z: -0.5, targets: ['2F', '3F', '4F', '5F'] },
        ],
        portals: [],
      },

      '4F': {
        label: '4号館 4F（科学実験室・サステナビリティ研究所・教室）',
        spawn: [0, 4],
        buildingZones: [
          { name: '4号館 南側教室棟', minX: -28, maxX: 28, minZ: -3, maxZ: 18, floorColor: '#fef3c7' },
          { name: '4号館 北東実験棟', minX: 10, maxX: 28, minZ: -18, maxZ: -3, floorColor: '#fde68a' },
        ],
        voids: [],
        connectors: [],
        rooms: [
          // 北東ウイング
          { id: '4-401', bldg: '4号館', name: '4-401 科学実験室', x: 14, z: -14, w: 7, d: 7, color: '#67e8f9' },
          { id: '4-402', bldg: '4号館', name: '4-402 科学実験室', x: 22.5, z: -14, w: 8, d: 7, color: '#67e8f9' },
          { id: '4-4soko', bldg: '4号館', name: '倉庫', x: 13.5, z: -8, w: 5, d: 3.5, color: '#cbd5e1' },
          { id: '4-4prep', bldg: '4号館', name: '実験準備室', x: 23, z: -7, w: 7, d: 5, color: '#a5f3fc' },
          { id: '4-4print', bldg: '4号館', name: '印刷室', x: 23, z: -2.5, w: 7, d: 3, color: '#cbd5e1' },
          { id: '4-4f-wc', bldg: '4号館', name: '給湯・トイレ', x: -6, z: -0.5, w: 10, d: 3, color: '#e2e8f0' },

          // 南側横一列
          { id: '4-412', bldg: '4号館', name: '4-412 教室', x: -22, z: 12, w: 10, d: 8, color: '#86efac' },
          { id: '4-411', bldg: '4号館', name: '4-411 教室', x: -11, z: 12, w: 10, d: 8, color: '#86efac' },
          { id: '4-410', bldg: '4号館', name: '4-410 教室', x: -1.5, z: 12, w: 7, d: 8, color: '#86efac' },
          { id: '4-405', bldg: '4号館', name: '4-405 サステナビリティ研究所\n(4-406〜4-409 研究室)', x: 6.5, z: 12, w: 8, d: 8, color: '#fde047' },
          { id: '4-404', bldg: '4号館', name: '4-404 数理工学\nセンター', x: 13, z: 12, w: 4, d: 8, color: '#93c5fd' },
          { id: '4-403', bldg: '4号館', name: '4-403 教室', x: 21, z: 12, w: 10, d: 8, color: '#86efac' },
        ],
        elevators: [
          { id: 'ev-4', name: '4号館 EV（2F〜5F）', x: 6, z: -0.5, targets: ['2F', '3F', '4F', '5F'] },
        ],
        portals: [],
      },

      '5F': {
        label: '4号館 5F（研究室フロア 4-501〜4-512）',
        spawn: [0, 4],
        buildingZones: [
          { name: '4号館 5F', minX: -28, maxX: 28, minZ: -4, maxZ: 18, floorColor: '#fef3c7' },
        ],
        voids: [],
        connectors: [],
        rooms: [
          // 北側
          { id: '4-5f-wc', bldg: '4号館', name: '給湯・トイレ', x: -6, z: -1, w: 10, d: 3.5, color: '#e2e8f0' },
          { id: '4-501', bldg: '4号館', name: '4-501 研究室', x: 18, z: -1, w: 8, d: 4, color: '#cbd5e1' },

          // 南側横一列（倉庫1 + 4-512〜4-502 + 倉庫2）
          { id: '4-5soko1', bldg: '4号館', name: '倉庫1', x: -26, z: 12, w: 2.5, d: 8, color: '#94a3b8' },
          ...[12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2].map((num, idx) => {
            const label = String(num).padStart(2, '0');
            return {
              id: `4-5${label}`,
              bldg: '4号館',
              name: `4-5${label}\n研究室`,
              x: -22.5 + idx * 4.5,
              z: 12,
              w: 4.2,
              d: 8,
              color: '#cbd5e1',
            };
          }),
          { id: '4-5soko2', bldg: '4号館', name: '倉庫2', x: 26, z: 12, w: 2.5, d: 8, color: '#94a3b8' },
        ],
        elevators: [
          { id: 'ev-4', name: '4号館 EV（2F〜5F）', x: 6, z: -1, targets: ['2F', '3F', '4F', '5F'] },
        ],
        portals: [],
      },
    },
  },

  // =========================================================================
  // 5号館（1F〜7F：PDF 10〜13ページ目準拠）
  // =========================================================================
  'area-5': {
    id: 'area-5',
    name: '5号館',
    floors: {
      '1F': {
        label: '5号館 1F（学生ホール・5-101教室・多目的スペース1）',
        spawn: [-15, 10],
        buildingZones: [
          { name: '5号館', minX: -22, maxX: 22, minZ: -22, maxZ: 22, floorColor: '#f3e8ff' },
        ],
        voids: [],
        connectors: [],
        rooms: [
          { id: '5-fujo-nw', bldg: '5号館', name: '風除室', x: -19, z: -13, w: 4, d: 4, color: '#cbd5e1' },
          { id: '5-multi1', bldg: '5号館', name: '多目的スペース 1', x: 8, z: -17, w: 10, d: 8, color: '#d8b4fe' },
          { id: '5-keibi', bldg: '5号館', name: '警備準備室', x: 1, z: -8, w: 5, d: 5, color: '#cbd5e1' },
          { id: '5-presen', bldg: '5号館', name: 'プレゼンテーション\nスペース', x: -6, z: 2, w: 8, d: 10, color: '#e9d5ff' },
          { id: '5-1f-wc', bldg: '5号館', name: '5号館1F トイレ', x: 5, z: 3, w: 10, d: 6, color: '#e2e8f0' },
          { id: '5-parking', bldg: '5号館', name: '駐車場（屋外）', x: 15, z: -4, w: 10, d: 14, color: '#94a3b8' },
          { id: '5-101', bldg: '5号館', name: '5-101 教室', x: 10, z: 14, w: 18, d: 8, color: '#86efac' },
          { id: '5-fujo-s', bldg: '5号館', name: '風除室', x: 0, z: 19, w: 5, d: 4, color: '#cbd5e1' },
        ],
        elevators: [
          { id: 'ev-5', name: '5号館 EVホール（1F〜7F）', x: -6, z: -18, targets: ['1F', '2F', '3F', '4F', '5F', '6F', '7F'] },
        ],
        portals: [
          { id: 'back-1236-5', name: '⬅ 1・2・3・6号館 1Fへ戻る', x: -15, z: 18, targetArea: 'area-1236', targetFloor: '1F' },
        ],
      },

      '2F': {
        label: '5号館 2F（5-201教室・アジアAI研究所・5-203共同研究室）',
        spawn: [0, 0],
        buildingZones: [
          { name: '5号館', minX: -22, maxX: 22, minZ: -22, maxZ: 22, floorColor: '#f3e8ff' },
        ],
        voids: [
          { name: '吹抜（1F学生ホール上部）', x: -11, z: 2, w: 16, d: 22 },
        ],
        connectors: [],
        rooms: [
          { id: '5-2f-wc', bldg: '5号館', name: '5号館2F トイレ', x: 12, z: -18, w: 14, d: 5, color: '#e2e8f0' },
          { id: '5-201', bldg: '5号館', name: '5-201 教室', x: 12, z: -6, w: 16, d: 8, color: '#86efac' },
          { id: '5-202', bldg: '5号館', name: '5-202 アジアAI研究所', x: 12, z: 1, w: 16, d: 6, color: '#a5f3fc' },
          { id: '5-203', bldg: '5号館', name: '5-203 共同研究室', x: 12, z: 9, w: 16, d: 10, color: '#93c5fd' },
          { id: '5-2f-fujo', bldg: '5号館', name: '風除室', x: 0, z: 19, w: 5, d: 4, color: '#cbd5e1' },
        ],
        elevators: [
          { id: 'ev-5', name: '5号館 EVホール（1F〜7F）', x: -6, z: -18, targets: ['1F', '2F', '3F', '4F', '5F', '6F', '7F'] },
        ],
        portals: [],
      },

      '3F': {
        label: '5号館 3F（5-301〜5-304 教室・交流テラス31）',
        spawn: [0, 0],
        buildingZones: [
          { name: '5号館', minX: -22, maxX: 22, minZ: -22, maxZ: 22, floorColor: '#f3e8ff' },
        ],
        voids: [],
        connectors: [],
        rooms: [
          { id: '5-3f-wc', bldg: '5号館', name: '5号館3F トイレ', x: 12, z: -18, w: 14, d: 5, color: '#e2e8f0' },
          { id: '5-301', bldg: '5号館', name: '5-301 教室', x: -11, z: 2, w: 16, d: 22, color: '#93c5fd' },
          { id: '5-terrace31', bldg: '5号館', name: '交流テラス 31', x: -11, z: 17, w: 16, d: 6, color: '#bae6fd' },
          { id: '5-302', bldg: '5号館', name: '5-302 教室', x: 12, z: -6, w: 16, d: 8, color: '#86efac' },
          { id: '5-303', bldg: '5号館', name: '5-303 教室', x: 12, z: 2, w: 16, d: 8, color: '#86efac' },
          { id: '5-304', bldg: '5号館', name: '5-304 教室', x: 12, z: 10, w: 16, d: 8, color: '#86efac' },
        ],
        elevators: [
          { id: 'ev-5', name: '5号館 EVホール（1F〜7F）', x: -6, z: -18, targets: ['1F', '2F', '3F', '4F', '5F', '6F', '7F'] },
        ],
        portals: [],
      },

      '4F': {
        label: '5号館 4F（5-401〜5-405 教室・交流テラス41）',
        spawn: [0, 0],
        buildingZones: [
          { name: '5号館', minX: -22, maxX: 22, minZ: -22, maxZ: 22, floorColor: '#f3e8ff' },
        ],
        voids: [],
        connectors: [],
        rooms: [
          { id: '5-4f-wc', bldg: '5号館', name: '5号館4F トイレ', x: 12, z: -18, w: 14, d: 5, color: '#e2e8f0' },
          { id: '5-401', bldg: '5号館', name: '5-401 教室', x: -12, z: -3, w: 14, d: 11, color: '#93c5fd' },
          { id: '5-402', bldg: '5号館', name: '5-402 教室', x: -12, z: 8, w: 14, d: 10, color: '#93c5fd' },
          { id: '5-soko41', bldg: '5号館', name: '倉庫 41', x: -3.5, z: 10, w: 3, d: 5, color: '#cbd5e1' },
          { id: '5-terrace41', bldg: '5号館', name: '交流テラス 41', x: -11, z: 17, w: 16, d: 6, color: '#bae6fd' },
          { id: '5-403', bldg: '5号館', name: '5-403 教室', x: 12, z: -6, w: 16, d: 8, color: '#86efac' },
          { id: '5-404', bldg: '5号館', name: '5-404 教室', x: 12, z: 2, w: 16, d: 8, color: '#86efac' },
          { id: '5-405', bldg: '5号館', name: '5-405 教室', x: 12, z: 10, w: 16, d: 8, color: '#86efac' },
        ],
        elevators: [
          { id: 'ev-5', name: '5号館 EVホール（1F〜7F）', x: -6, z: -18, targets: ['1F', '2F', '3F', '4F', '5F', '6F', '7F'] },
        ],
        portals: [],
      },

      '5F': {
        label: '5号館 5F（アクティブラーニング教室・5-503〜505教室）',
        spawn: [0, 0],
        buildingZones: [
          { name: '5号館', minX: -22, maxX: 22, minZ: -22, maxZ: 22, floorColor: '#f3e8ff' },
        ],
        voids: [],
        connectors: [],
        rooms: [
          { id: '5-5f-wc', bldg: '5号館', name: '5号館5F トイレ', x: 12, z: -18, w: 14, d: 5, color: '#e2e8f0' },
          { id: '5-501', bldg: '5号館', name: '5-501 アクティブ\nラーニング教室', x: -12, z: -3, w: 14, d: 11, color: '#c4b5fd' },
          { id: '5-502', bldg: '5号館', name: '5-502 アクティブ\nラーニング教室', x: -12, z: 8, w: 14, d: 10, color: '#c4b5fd' },
          { id: '5-soko51', bldg: '5号館', name: '倉庫 51', x: -3.5, z: 10, w: 3, d: 5, color: '#cbd5e1' },
          { id: '5-terrace51', bldg: '5号館', name: '交流テラス 51', x: -11, z: 17, w: 16, d: 6, color: '#bae6fd' },
          { id: '5-503', bldg: '5号館', name: '5-503 教室', x: 12, z: -6, w: 16, d: 8, color: '#86efac' },
          { id: '5-504', bldg: '5号館', name: '5-504 教室', x: 12, z: 2, w: 16, d: 8, color: '#86efac' },
          { id: '5-505', bldg: '5号館', name: '5-505 教室', x: 12, z: 10, w: 16, d: 8, color: '#86efac' },
        ],
        elevators: [
          { id: 'ev-5', name: '5号館 EVホール（1F〜7F）', x: -6, z: -18, targets: ['1F', '2F', '3F', '4F', '5F', '6F', '7F'] },
        ],
        portals: [],
      },

      '6F': {
        label: '5号館 6F（研究室スペース 5-602〜5-620）',
        spawn: [0, 0],
        buildingZones: [
          { name: '5号館', minX: -22, maxX: 22, minZ: -22, maxZ: 22, floorColor: '#f3e8ff' },
        ],
        voids: [],
        connectors: [],
        rooms: [
          { id: '5-6f-wc', bldg: '5号館', name: '給湯・トイレ', x: 12, z: -18, w: 14, d: 5, color: '#e2e8f0' },
          // 西側壁並び（5-601印刷室 + 5-602〜5-610研究室）
          { id: '5-601', bldg: '5号館', name: '5-601 印刷室', x: -18, z: -10, w: 5, d: 2.3, color: '#94a3b8' },
          ...[2, 3, 4, 5, 6, 7, 8, 9, 10].map((num, idx) => {
            const label = String(num).padStart(2, '0');
            return {
              id: `5-6${label}`,
              bldg: '5号館',
              name: `5-6${label} 研究室`,
              x: -18,
              z: -7.5 + idx * 2.4,
              w: 5,
              d: 2.2,
              color: '#cbd5e1',
            };
          }),
          // 東側壁並び（5-611〜5-620研究室）
          ...[11, 12, 13, 14, 15, 16, 17, 18, 19, 20].map((num, idx) => ({
            id: `5-6${num}`,
            bldg: '5号館',
            name: `5-6${num} 研究室`,
            x: 18,
            z: -10 + idx * 2.4,
            w: 5,
            d: 2.2,
            color: '#cbd5e1',
          })),
          { id: '5-terrace61', bldg: '5号館', name: '交流テラス 61', x: -11, z: 18, w: 16, d: 5, color: '#bae6fd' },
        ],
        elevators: [
          { id: 'ev-5', name: '5号館 EVホール（1F〜7F）', x: -6, z: -18, targets: ['1F', '2F', '3F', '4F', '5F', '6F', '7F'] },
        ],
        portals: [],
      },

      '7F': {
        label: '5号館 7F（最上階 多目的スペース2・屋上庭園）',
        spawn: [-4, 0],
        buildingZones: [
          { name: '5号館 7F・屋上庭園', minX: -22, maxX: 22, minZ: -22, maxZ: 22, floorColor: '#bbf7d0' },
        ],
        voids: [],
        connectors: [],
        rooms: [
          { id: '5-bichiku', bldg: '5号館', name: '備蓄倉庫', x: 2, z: -18, w: 6, d: 5, color: '#cbd5e1' },
          { id: '5-multi2', bldg: '5号館', name: '多目的スペース 2', x: 8, z: 0, w: 12, d: 14, color: '#d8b4fe' },
          { id: '5-terrace71', bldg: '5号館', name: '交流テラス 71', x: -10, z: 16, w: 18, d: 6, color: '#bae6fd' },
        ],
        elevators: [
          { id: 'ev-5', name: '5号館 EVホール（1F〜7F）', x: -6, z: -18, targets: ['1F', '2F', '3F', '4F', '5F', '6F', '7F'] },
        ],
        portals: [],
      },
    },
  },
};