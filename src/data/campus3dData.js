// 有明キャンパス 3Dウォークスルー用 全館・全フロア統合データ（配置図完全準拠）

const ROOM_COLORS = {
  class: '#3b82f6',    // 講義室・大教室（ブルー）
  lab: '#8b5cf6',      // 研究室・ゼミ室（パープル）
  admin: '#f59e0b',    // 事務室・会議室・窓口（アンバー）
  common: '#10b981',   // 図書館・食堂・ホール・ラウンジ（エメラルド）
  facility: '#64748b', // トイレ・更衣室・倉庫・給湯室（スレート）
  garden: '#22c55e',   // 屋上庭園・交流テラス（グリーン）
};

// 1号館 10F・11F・12F 共通の研究室グリッド生成ヘルパー（配置図準拠）
function createBldg1LabFloor(floorNum, centerNorthRoom, south1005Room, hasVoid = false) {
  const f = floorNum;
  const rooms = [
    // 北側（西から東：1-XX13 〜 1-XX22）
    { id: `1-${f}13`, name: `1-${f}13\n研究室`, x: -37.2, z: 29, w: 5.6, d: 6, color: ROOM_COLORS.lab },
    { id: `1-${f}14`, name: `1-${f}14\n研究室`, x: -31.6, z: 29, w: 5.6, d: 6, color: ROOM_COLORS.lab },
    { id: `1-${f}15`, name: `1-${f}15\n研究室`, x: -26.0, z: 29, w: 5.6, d: 6, color: ROOM_COLORS.lab },
    { id: `1-${f}16`, name: `1-${f}16\n研究室`, x: -20.4, z: 29, w: 5.6, d: 6, color: ROOM_COLORS.lab },
    { id: `1-${f}17`, name: `1-${f}17\n研究室`, x: -14.8, z: 29, w: 5.6, d: 6, color: ROOM_COLORS.lab },
    { id: `1-${f}18`, name: `1-${f}18\n研究室`, x: -9.2, z: 29, w: 5.6, d: 6, color: ROOM_COLORS.lab },
    { id: `1-${f}19`, name: `1-${f}19\n研究室`, x: -3.6, z: 29, w: 5.6, d: 6, color: ROOM_COLORS.lab },
    { id: `1-${f}20`, name: `1-${f}20\n研究室`, x: 2.0, z: 29, w: 5.6, d: 6, color: ROOM_COLORS.lab },
    { id: `1-${f}21`, name: `1-${f}21\n研究室`, x: 7.6, z: 29, w: 5.6, d: 6, color: ROOM_COLORS.lab },
    { id: `1-${f}22`, name: `1-${f}22\n研究室`, x: 13.2, z: 29, w: 5.6, d: 6, color: ROOM_COLORS.lab },
  ];

  // 中央北側（11Fは1-11Aゼミ室、10Fは吹き抜け、12Fは通路）
  if (centerNorthRoom) {
    rooms.push({
      id: centerNorthRoom.id,
      name: centerNorthRoom.name,
      x: 19.0,
      z: 29,
      w: 6.0,
      d: 6,
      color: ROOM_COLORS.class,
    });
  }

  // 北側東ウイング（1-XX23 〜 1-XX32）
  const eastNorthX = [24.2, 26.2, 28.2, 30.2, 32.2, 34.2, 36.2, 38.2];
  // 10室をX=22〜40に隙間なく並べる
  for (let i = 0; i < 10; i++) {
    const num = 23 + i;
    rooms.push({
      id: `1-${f}${num}`,
      name: `1-${f}${num}\n研究室`,
      x: 22.9 + i * 1.8,
      z: 29,
      w: 1.8,
      d: 6,
      color: ROOM_COLORS.lab,
    });
  }

  // 南側（西から東：1-XX12 〜 1-XX01）
  rooms.push(
    { id: `1-${f}12`, name: `1-${f}12\n研究室`, x: -37.0, z: 46, w: 6.0, d: 8, color: ROOM_COLORS.lab },
    { id: `1-${f}11`, name: `1-${f}11\n研究室`, x: -31.0, z: 46, w: 6.0, d: 8, color: ROOM_COLORS.lab },
    { id: `1-${f}10`, name: `1-${f}10\n研究室`, x: -25.0, z: 46, w: 6.0, d: 8, color: ROOM_COLORS.lab },
    { id: `1-${f}09`, name: `1-${f}09\n研究室`, x: -17.5, z: 46, w: 5.0, d: 8, color: ROOM_COLORS.lab },
    { id: `1-${f}08`, name: `1-${f}08\n研究室`, x: -12.5, z: 46, w: 5.0, d: 8, color: ROOM_COLORS.lab },
    { id: `1-${f}07`, name: `1-${f}07\n研究室`, x: -7.5, z: 46, w: 5.0, d: 8, color: ROOM_COLORS.lab },
    { id: `1-${f}06`, name: `1-${f}06\n研究室`, x: -2.5, z: 46, w: 5.0, d: 8, color: ROOM_COLORS.lab },
    {
      id: `1-${f}05`,
      name: south1005Room || `1-${f}05\n研究室`,
      x: 11.5,
      z: 46,
      w: 7.0,
      d: 8,
      color: south1005Room ? ROOM_COLORS.admin : ROOM_COLORS.lab,
    },
    { id: `1-${f}04`, name: `1-${f}04\n研究室`, x: 17.5, z: 46, w: 5.0, d: 8, color: ROOM_COLORS.lab },
    { id: `1-${f}03`, name: `1-${f}03\n研究室`, x: 28.0, z: 46, w: 4.0, d: 8, color: ROOM_COLORS.lab },
    { id: `1-${f}02`, name: `1-${f}02\n研究室`, x: 32.5, z: 46, w: 5.0, d: 8, color: ROOM_COLORS.lab },
    { id: `1-${f}01`, name: `1-${f}01\n研究室`, x: 37.5, z: 46, w: 5.0, d: 8, color: ROOM_COLORS.lab },
    { id: `wc-${f}`, name: 'トイレ\n(M / W)', x: 23.0, z: 46, w: 6.0, d: 8, color: ROOM_COLORS.facility }
  );

  return {
    buildingZones: [
      { name: '1号館', minX: -40, maxX: 40, minZ: 26, maxZ: 50, floorColor: '#e2e8f0' },
    ],
    voids: hasVoid ? [{ name: '吹き抜け', x: 19.0, z: 29, w: 5.8, d: 6 }] : [],
    rooms,
    elevators: [
      { id: `ev-1-${f}f`, name: '1号館 中央EV', x: 4, z: 43, targets: ['1F', '2F', '3F', '4F', '5F', '6F', '7F', '8F', '9F', '10F', '11F', '12F', '13F'] },
    ],
    portals: [],
  };
}

export const CAMPUS_3D_BUILDINGS = {
  // =========================================================================
  // 1号館・2号館・3号館・6号館 統合エリア（配置図 P.1〜P.7 完全準拠）
  // =========================================================================
  'area-1236': {
    id: 'area-1236',
    name: '1・2・3・6号館エリア',
    floors: {
      '1F': {
        spawn: [0, 38],
        buildingZones: [
          { name: '1号館', minX: -40, maxX: 40, minZ: 26, maxZ: 50, floorColor: '#e2e8f0' },
          { name: '2号館', minX: -40, maxX: -12, minZ: -10, maxZ: 26, floorColor: '#fef9c3' },
          { name: '3号館', minX: -14, maxX: 38, minZ: -52, maxZ: -16, floorColor: '#ffedd5' },
          { name: '6号館', minX: 6, maxX: 38, minZ: -16, maxZ: 24, floorColor: '#dcfce7' },
        ],
        connectors: [
          { name: '1号館 ⇔ 2号館 通路', x: -24, z: 26 },
          { name: '1号館 ⇔ 6号館 通路', x: 18, z: 25 },
          { name: '6号館 ⇔ 3号館 通路', x: 22, z: -16 },
        ],
        rooms: [
          // --- 1号館 1F（P.1 下側）---
          { id: '1-health', name: '健康管理センター\n(保健室・学生相談室)', x: -34, z: 44, w: 12, d: 12, color: ROOM_COLORS.admin },
          { id: '1-vend', name: '自販機\nコーナー', x: -36, z: 29, w: 8, d: 6, color: ROOM_COLORS.common },
          { id: '1-1a', name: '1-1A 会議室', x: -24, z: 30, w: 10, d: 8, color: ROOM_COLORS.admin },
          { id: '1-1b', name: '1-1B ミーティング\nカンファ拠点', x: -15, z: 30, w: 8, d: 8, color: ROOM_COLORS.admin },
          { id: '1-nyushi', name: '入試課\n入試広報課', x: -8, z: 30, w: 6, d: 8, color: ROOM_COLORS.admin },
          { id: '1-wc1', name: 'トイレ\n(W / M)', x: -16, z: 45, w: 8, d: 10, color: ROOM_COLORS.facility },
          { id: '1-kanri', name: '管理センター', x: 12, z: 45, w: 8, d: 10, color: ROOM_COLORS.admin },
          { id: '1-shien', name: '学生支援課', x: 21, z: 45, w: 10, d: 10, color: ROOM_COLORS.admin },
          { id: '1-locker1', name: '更衣室・給湯室', x: 33, z: 45, w: 14, d: 10, color: ROOM_COLORS.facility },
          { id: '1-kyomu', name: '教務課・学務課\n教育DX支援課', x: 13, z: 30, w: 12, d: 8, color: ROOM_COLORS.admin },
          { id: '1-gakubu', name: '学部事務課\n研究推進支援課', x: 24, z: 30, w: 10, d: 8, color: ROOM_COLORS.admin },
          { id: '1-kikaku', name: '教育企画課\n社会共創センター\n更衣室', x: 34.5, z: 30, w: 11, d: 8, color: ROOM_COLORS.admin },

          // --- 2号館 1F（P.1 左上）---
          { id: '2-wc1', name: 'トイレ\n(W / M)', x: -34, z: -5, w: 12, d: 10, color: ROOM_COLORS.facility },
          { id: '2-prayer', name: 'prayer room', x: -17, z: -5, w: 10, d: 10, color: ROOM_COLORS.common },
          { id: '2-lib1', name: '図書館', x: -33, z: 12, w: 14, d: 24, color: ROOM_COLORS.common },
          { id: '2-cls', name: 'クリエイティブ・ラーニング\nスクエア', x: -20, z: 10, w: 12, d: 20, color: ROOM_COLORS.common },
          { id: '2-read', name: '閲覧コーナー', x: -19, z: 23, w: 14, d: 6, color: ROOM_COLORS.common },

          // --- 6号館 1F（P.1 右中）---
          { id: '6-101', name: '6-101 教室', x: 16, z: 18, w: 14, d: 12, color: ROOM_COLORS.class },
          { id: '6-ext', name: '学外学修推進\nセンター事務課', x: 30.5, z: 19, w: 15, d: 10, color: ROOM_COLORS.admin },
          { id: '6-102', name: '6-102 教室', x: 32, z: 6, w: 12, d: 16, color: ROOM_COLORS.class },
          { id: '6-103', name: '6-103 教室', x: 26, z: -9, w: 18, d: 14, color: ROOM_COLORS.class },
          { id: '6-core1', name: '階段・トイレ\n(W / M)', x: 21, z: 5, w: 10, d: 12, color: ROOM_COLORS.facility },

          // --- 3号館 1F（P.1 上側）---
          { id: '3-gakuyu', name: '学友会室・倉庫', x: -8, z: -20, w: 12, d: 8, color: ROOM_COLORS.common },
          { id: '3-hall', name: '学生ホール\n自学自修スペース', x: -4, z: -34, w: 16, d: 20, color: ROOM_COLORS.common },
          { id: '3-shop', name: 'カレッジショップ\nありあけ館(売店)', x: -6, z: -48, w: 16, d: 8, color: ROOM_COLORS.common },
          { id: '3-wc1', name: 'トイレ\n(W / M)', x: 6, z: -48, w: 8, d: 8, color: ROOM_COLORS.facility },
          { id: '3-shokudo', name: 'ありあけ食堂\n印刷センター\nブックセンター', x: 23, z: -47, w: 22, d: 10, color: ROOM_COLORS.common },
          { id: '3-food', name: 'フードコート\n(大学食堂)', x: 23, z: -30, w: 22, d: 22, color: ROOM_COLORS.common },
        ],
        elevators: [
          { id: 'ev-1-1f', name: '1号館 中央EV', x: 0, z: 44, targets: ['1F', '2F', '3F', '4F', '5F', '6F', '7F', '8F', '9F', '10F', '11F', '12F', '13F'] },
          { id: 'ev-2-1f', name: '2号館 EV', x: -25, z: -6, targets: ['1F', '2F', '3F', '4F', '5F', '6F'] },
          { id: 'ev-6-1f', name: '6号館 EV', x: 14, z: 3, targets: ['1F', '2F', '3F', '4F', '5F', '6F'] },
          { id: 'ev-3-1f', name: '3号館 EV', x: 11, z: -42, targets: ['1F', '2F', '3F'] },
        ],
        portals: [],
      },

      '2F': {
        spawn: [0, 38],
        buildingZones: [
          { name: '1号館', minX: -40, maxX: 40, minZ: 26, maxZ: 50, floorColor: '#e2e8f0' },
          { name: '2号館', minX: -40, maxX: -12, minZ: -10, maxZ: 26, floorColor: '#fef9c3' },
          { name: 'キャンパスデッキ', minX: -12, maxX: 16, minZ: -38, maxZ: 26, floorColor: '#e0f2fe' },
          { name: '6号館', minX: 6, maxX: 38, minZ: -16, maxZ: 24, floorColor: '#dcfce7' },
          { name: '3号館', minX: 6, maxX: 38, minZ: -52, maxZ: -16, floorColor: '#ffedd5' },
        ],
        connectors: [
          { name: 'キャンパスデッキ（1・2・3・6号館連絡）', x: -3, z: 8 },
        ],
        voids: [
          { name: '1号館 吹き抜け', x: -3, z: 30, w: 6, d: 8 },
          { name: '3号館 吹き抜け（食堂上部）', x: 24, z: -27, w: 20, d: 18 },
        ],
        rooms: [
          // --- 1号館 2F（P.2 下側）---
          { id: '1-205', name: '1-205 教室', x: -35, z: 45, w: 10, d: 10, color: ROOM_COLORS.class },
          { id: '1-204', name: '1-204 教室', x: -24, z: 45, w: 12, d: 10, color: ROOM_COLORS.class },
          { id: '1-203', name: '1-203 教室', x: -12, z: 45, w: 12, d: 10, color: ROOM_COLORS.class },
          { id: '1-206', name: '1-206 教室', x: -31, z: 30, w: 18, d: 8, color: ROOM_COLORS.class },
          { id: '1-shop2', name: '店舗・自販機', x: -18, z: 30, w: 8, d: 8, color: ROOM_COLORS.common },
          { id: '1-202', name: '1-202 教室', x: 11, z: 45, w: 10, d: 10, color: ROOM_COLORS.class },
          { id: '1-wc2', name: 'トイレ\n(M / W)', x: 20, z: 45, w: 8, d: 10, color: ROOM_COLORS.facility },
          { id: '1-201', name: '1-201 教室', x: 33, z: 45, w: 14, d: 10, color: ROOM_COLORS.class },
          { id: '1-207', name: '1-207 教室', x: 16, z: 30, w: 16, d: 8, color: ROOM_COLORS.class },
          { id: '1-208', name: '1-208 教室', x: 32, z: 30, w: 16, d: 8, color: ROOM_COLORS.class },

          // --- 2号館 2F（P.2 左中）---
          { id: '2-common', name: 'コモンエリア', x: -34, z: 20, w: 12, d: 12, color: ROOM_COLORS.common },
          { id: '2-lib2', name: '図書館', x: -24, z: 10, w: 18, d: 20, color: ROOM_COLORS.common },
          { id: '2-lib-off', name: '図書館事務室', x: -20, z: -5, w: 12, d: 10, color: ROOM_COLORS.admin },
          { id: '2-wc2', name: 'トイレ\n(W / M)', x: -35, z: -5, w: 10, d: 10, color: ROOM_COLORS.facility },

          // --- 6号館 2F（P.2 右中）---
          { id: '6-201', name: '6-201\nシミュレーション室', x: 16, z: 17, w: 14, d: 14, color: ROOM_COLORS.class },
          { id: '6-locker2', name: '男子更衣室\n女子更衣室・授乳室', x: 30.5, z: 17, w: 15, d: 14, color: ROOM_COLORS.facility },
          { id: '6-202', name: '6-202 実習室', x: 32, z: -2, w: 12, d: 14, color: ROOM_COLORS.class },
          { id: '6-203', name: '6-203 実習室', x: 24, z: -11, w: 16, d: 10, color: ROOM_COLORS.class },
          { id: '6-core2', name: '階段・トイレ\n(W / M)', x: 21, z: 3, w: 10, d: 12, color: ROOM_COLORS.facility },

          // --- 3号館 2F（P.2 右上）---
          { id: '3-lohas', name: 'ロハスカフェ\nARIAKE', x: 24, z: -43, w: 18, d: 14, color: ROOM_COLORS.common },
          { id: '3-wc2', name: 'トイレ\n(M / W)', x: 35, z: -43, w: 6, d: 14, color: ROOM_COLORS.facility },
        ],
        elevators: [
          { id: 'ev-1-2f', name: '1号館 中央EV', x: 1, z: 44, targets: ['1F', '2F', '3F', '4F', '5F', '6F', '7F', '8F', '9F', '10F', '11F', '12F', '13F'] },
          { id: 'ev-2-2f', name: '2号館 EV', x: -28, z: -5, targets: ['1F', '2F', '3F', '4F', '5F', '6F'] },
          { id: 'ev-6-2f', name: '6号館 EV', x: 14, z: 3, targets: ['1F', '2F', '3F', '4F', '5F', '6F'] },
          { id: 'ev-3-2f', name: '3号館 EV', x: 9, z: -45, targets: ['1F', '2F', '3F'] },
        ],
        portals: [],
      },

      '3F': {
        spawn: [0, 38],
        buildingZones: [
          { name: '1号館', minX: -40, maxX: 40, minZ: 26, maxZ: 50, floorColor: '#e2e8f0' },
          { name: '2号館', minX: -40, maxX: -12, minZ: -10, maxZ: 26, floorColor: '#fef9c3' },
          { name: '6号館', minX: 6, maxX: 38, minZ: -16, maxZ: 24, floorColor: '#dcfce7' },
          { name: '3号館', minX: 6, maxX: 38, minZ: -52, maxZ: -16, floorColor: '#ffedd5' },
        ],
        connectors: [
          { name: '1号館 ⇔ 2号館 連絡通路', x: -30, z: 26 },
          { name: '6号館 ⇔ 3号館 連絡通路', x: 11, z: -16 },
        ],
        rooms: [
          // --- 1号館 3F（P.3 下）---
          { id: '1-304', name: '1-304 教室', x: -35, z: 45, w: 10, d: 10, color: ROOM_COLORS.class },
          { id: '1-303', name: '1-303 教室', x: -18, z: 45, w: 16, d: 10, color: ROOM_COLORS.class },
          { id: '1-305', name: '1-305 教室', x: -34, z: 30, w: 12, d: 8, color: ROOM_COLORS.class },
          { id: '1-306', name: '1-306 教室', x: -16, z: 30, w: 16, d: 8, color: ROOM_COLORS.class },
          { id: '1-eng', name: 'イングリッシュ\nスペース', x: -3, z: 30, w: 10, d: 8, color: ROOM_COLORS.common },
          { id: '1-307', name: '1-307 教室', x: 13, z: 30, w: 16, d: 8, color: ROOM_COLORS.class },
          { id: '1-308', name: '1-308 教室', x: 31, z: 30, w: 18, d: 8, color: ROOM_COLORS.class },
          { id: '1-302', name: '1-302 教室', x: 11, z: 45, w: 10, d: 10, color: ROOM_COLORS.class },
          { id: '1-wc3', name: 'トイレ\n(M / W)', x: 20, z: 45, w: 8, d: 10, color: ROOM_COLORS.facility },
          { id: '1-301', name: '1-301 教室', x: 33, z: 45, w: 14, d: 10, color: ROOM_COLORS.class },

          // --- 2号館 3F（P.3 左上）---
          { id: '2-lib3', name: 'ライブラリー', x: -26, z: 10, w: 28, d: 28, color: ROOM_COLORS.common },
          { id: '2-wc3', name: 'トイレ\n(M / W)', x: -35, z: -6, w: 10, d: 8, color: ROOM_COLORS.facility },

          // --- 6号館 3F（P.3 右上）---
          { id: '6-301', name: '6-301 実習室', x: 24, z: 18, w: 26, d: 12, color: ROOM_COLORS.class },
          { id: '6-prep31', name: '準備室 31', x: 32, z: 5, w: 12, d: 10, color: ROOM_COLORS.admin },
          { id: '6-302', name: '6-302 実習室', x: 32, z: -8, w: 12, d: 16, color: ROOM_COLORS.class },
          { id: '6-303', name: '6-303 実習室', x: 20, z: -8, w: 12, d: 16, color: ROOM_COLORS.class },
          { id: '6-core3', name: '階段・トイレ\n(W / M)', x: 20, z: 5, w: 10, d: 10, color: ROOM_COLORS.facility },

          // --- 3号館 3F（P.3 下右）---
          { id: '3-301', name: '3-301 大教室\n(調整室)', x: 16, z: -35, w: 10, d: 30, color: ROOM_COLORS.class },
          { id: '3-302', name: '3-302 大教室\n(控室)', x: 27, z: -35, w: 12, d: 30, color: ROOM_COLORS.class },
          { id: '3-wc3', name: 'トイレ\n(M / W)', x: 35, z: -22, w: 6, d: 12, color: ROOM_COLORS.facility },
        ],
        elevators: [
          { id: 'ev-1-3f', name: '1号館 中央EV', x: 0, z: 44, targets: ['1F', '2F', '3F', '4F', '5F', '6F', '7F', '8F', '9F', '10F', '11F', '12F', '13F'] },
          { id: 'ev-2-3f', name: '2号館 EV', x: -27, z: -6, targets: ['1F', '2F', '3F', '4F', '5F', '6F'] },
          { id: 'ev-6-3f', name: '6号館 EV', x: 13, z: 3, targets: ['1F', '2F', '3F', '4F', '5F', '6F'] },
          { id: 'ev-3-3f', name: '3号館 EV', x: 9, z: -46, targets: ['1F', '2F', '3F'] },
        ],
        portals: [],
      },

      '4F': {
        spawn: [0, 38],
        buildingZones: [
          { name: '1号館', minX: -40, maxX: 40, minZ: 26, maxZ: 50, floorColor: '#e2e8f0' },
          { name: '2号館', minX: -40, maxX: -12, minZ: -10, maxZ: 26, floorColor: '#fef9c3' },
          { name: '6号館', minX: 6, maxX: 38, minZ: -16, maxZ: 24, floorColor: '#dcfce7' },
        ],
        connectors: [
          { name: '1号館 ⇔ 2号館 連絡通路', x: -30, z: 26 },
        ],
        voids: [
          { name: '1号館 吹き抜け', x: 0, z: 30, w: 8, d: 8 },
        ],
        rooms: [
          // --- 1号館 4F（P.4 左）---
          { id: '1-404', name: '1-404 教室', x: -35, z: 45, w: 10, d: 10, color: ROOM_COLORS.class },
          { id: '1-403', name: '1-403 教室', x: -18, z: 45, w: 16, d: 10, color: ROOM_COLORS.class },
          { id: '1-405', name: '1-405 教室', x: -34, z: 30, w: 12, d: 8, color: ROOM_COLORS.class },
          { id: '1-406', name: '1-406 教室', x: -16, z: 30, w: 18, d: 8, color: ROOM_COLORS.class },
          { id: '1-407', name: '1-407 教室', x: 14, z: 30, w: 16, d: 8, color: ROOM_COLORS.class },
          { id: '1-408', name: '1-408 教室', x: 31, z: 30, w: 18, d: 8, color: ROOM_COLORS.class },
          { id: '1-402', name: '1-402 教室', x: 11, z: 45, w: 10, d: 10, color: ROOM_COLORS.class },
          { id: '1-wc4', name: 'トイレ\n(M / W)', x: 20, z: 45, w: 8, d: 10, color: ROOM_COLORS.facility },
          { id: '1-401', name: '1-401 教室', x: 33, z: 45, w: 14, d: 10, color: ROOM_COLORS.class },

          // --- 2号館 4F（P.4 上）---
          { id: '2-408', name: '2-408 合同研究室', x: -35, z: 21, w: 10, d: 10, color: ROOM_COLORS.lab },
          { id: '2-401', name: '2-401\nマルチメディア教室', x: -35, z: 10, w: 10, d: 12, color: ROOM_COLORS.class },
          { id: '2-wc4', name: 'トイレ\n(W / M)', x: -35, z: -4, w: 10, d: 12, color: ROOM_COLORS.facility },
          { id: '2-406', name: '2-406 教室', x: -18, z: 21, w: 12, d: 10, color: ROOM_COLORS.class },
          { id: '2-405', name: '2-405 ゼミ室', x: -18, z: 12, w: 12, d: 8, color: ROOM_COLORS.lab },
          { id: '2-404', name: '2-404 ゼミ室', x: -18, z: 4, w: 12, d: 8, color: ROOM_COLORS.lab },
          { id: '2-402', name: '2-402 教室', x: -18, z: -5, w: 12, d: 10, color: ROOM_COLORS.class },

          // --- 6号館 4F（P.4 右：外周6-401〜426＋中央6-431・432）---
          { id: '6-4w', name: '6-401〜6-410\n研究室（西列）', x: 9, z: 4, w: 6, d: 40, color: ROOM_COLORS.lab },
          { id: '6-4e', name: '6-411〜6-416\n研究室（東列）', x: 35, z: 10, w: 6, d: 28, color: ROOM_COLORS.lab },
          { id: '6-4n', name: '6-417〜6-426\n研究室（北列）', x: 25, z: -13, w: 26, d: 6, color: ROOM_COLORS.lab },
          { id: '6-4c', name: '6-431・432研究室\n休憩スペース4A-C\n更衣室・給湯室・WC', x: 22, z: 5, w: 12, d: 22, color: ROOM_COLORS.admin },
        ],
        elevators: [
          { id: 'ev-1-4f', name: '1号館 中央EV', x: 0, z: 44, targets: ['1F', '2F', '3F', '4F', '5F', '6F', '7F', '8F', '9F', '10F', '11F', '12F', '13F'] },
          { id: 'ev-2-4f', name: '2号館 EV', x: -27, z: -6, targets: ['1F', '2F', '3F', '4F', '5F', '6F'] },
          { id: 'ev-6-4f', name: '6号館 EV', x: 14, z: 2, targets: ['1F', '2F', '3F', '4F', '5F', '6F'] },
        ],
        portals: [],
      },

      '5F': {
        spawn: [0, 38],
        buildingZones: [
          { name: '1号館', minX: -40, maxX: 40, minZ: 26, maxZ: 50, floorColor: '#e2e8f0' },
          { name: '2号館', minX: -40, maxX: -12, minZ: -10, maxZ: 26, floorColor: '#fef9c3' },
          { name: '6号館', minX: 6, maxX: 38, minZ: -16, maxZ: 24, floorColor: '#dcfce7' },
        ],
        connectors: [
          { name: '1号館 ⇔ 2号館 連絡通路', x: -30, z: 26 },
        ],
        rooms: [
          // --- 1号館 5F（P.5 左下）---
          { id: '1-504', name: '1-504 教室', x: -35, z: 45, w: 10, d: 10, color: ROOM_COLORS.class },
          { id: '1-503', name: '1-503 教室', x: -18, z: 45, w: 16, d: 10, color: ROOM_COLORS.class },
          { id: '1-505', name: '1-505 教室', x: -34, z: 30, w: 12, d: 8, color: ROOM_COLORS.class },
          { id: '1-506', name: '1-506 教室', x: -16, z: 30, w: 18, d: 8, color: ROOM_COLORS.class },
          { id: '1-asia', name: 'アジアスペース', x: -2, z: 30, w: 8, d: 8, color: ROOM_COLORS.common },
          { id: '1-508', name: '1-508 教室', x: 14, z: 30, w: 16, d: 8, color: ROOM_COLORS.class },
          { id: '1-509', name: '1-509 教室', x: 31, z: 30, w: 18, d: 8, color: ROOM_COLORS.class },
          { id: '1-502', name: '1-502 教室', x: 11, z: 45, w: 10, d: 10, color: ROOM_COLORS.class },
          { id: '1-wc5', name: 'トイレ\n(M / W)', x: 20, z: 45, w: 8, d: 10, color: ROOM_COLORS.facility },
          { id: '1-501', name: '1-501 教室', x: 33, z: 45, w: 14, d: 10, color: ROOM_COLORS.class },

          // --- 2号館 5F（P.5 左上）---
          { id: '2-501-4', name: '2-501〜2-504\n研究室', x: -35, z: 16, w: 10, d: 18, color: ROOM_COLORS.lab },
          { id: '2-505-8', name: '2-505〜2-508\n研究室', x: -17, z: 16, w: 10, d: 18, color: ROOM_COLORS.lab },
          { id: '2-psych', name: '心理臨床センター', x: -26, z: 1, w: 28, d: 10, color: ROOM_COLORS.admin },
          { id: '2-wc5', name: 'トイレ\n(M / W)', x: -35, z: -7, w: 10, d: 6, color: ROOM_COLORS.facility },

          // --- 6号館 5F（P.5 左中）---
          { id: '6-5w', name: '6-501〜6-510\n研究室（西列）', x: 9, z: 4, w: 6, d: 40, color: ROOM_COLORS.lab },
          { id: '6-5e', name: '6-511〜6-516\n研究室（東列）', x: 35, z: 10, w: 6, d: 28, color: ROOM_COLORS.lab },
          { id: '6-5n', name: '6-517〜6-526\n研究室（北列）', x: 25, z: -13, w: 26, d: 6, color: ROOM_COLORS.lab },
          { id: '6-5c', name: '6-531 研究室\n印刷室・給湯室・WC', x: 22, z: 5, w: 12, d: 22, color: ROOM_COLORS.admin },
        ],
        elevators: [
          { id: 'ev-1-5f', name: '1号館 中央EV', x: 0, z: 44, targets: ['1F', '2F', '3F', '4F', '5F', '6F', '7F', '8F', '9F', '10F', '11F', '12F', '13F'] },
          { id: 'ev-2-5f', name: '2号館 EV', x: -27, z: -7, targets: ['1F', '2F', '3F', '4F', '5F', '6F'] },
          { id: 'ev-6-5f', name: '6号館 EV', x: 14, z: 2, targets: ['1F', '2F', '3F', '4F', '5F', '6F'] },
        ],
        portals: [],
      },

      '6F': {
        spawn: [0, 38],
        buildingZones: [
          { name: '1号館', minX: -40, maxX: 40, minZ: 26, maxZ: 50, floorColor: '#e2e8f0' },
          { name: '2号館（屋上庭園）', minX: -40, maxX: -12, minZ: -10, maxZ: 26, floorColor: '#dcfce7' },
          { name: '6号館（屋上庭園）', minX: 6, maxX: 38, minZ: -16, maxZ: 24, floorColor: '#dcfce7' },
        ],
        connectors: [
          { name: '1号館 ⇔ 2号館屋上庭園 連絡通路', x: -30, z: 26 },
        ],
        voids: [
          { name: '1号館 吹き抜け', x: 4, z: 30, w: 6, d: 8 },
        ],
        rooms: [
          // --- 1号館 6F（P.5 右下）---
          { id: '1-keiri', name: '経理課', x: -35, z: 45, w: 10, d: 10, color: ROOM_COLORS.admin },
          { id: '1-jinji', name: '管財課有明分室\n人事課・総務課・法務課', x: -16, z: 45, w: 18, d: 10, color: ROOM_COLORS.admin },
          { id: '1-dx', name: 'DX戦略企画課\n1-6B・1-6C会議室', x: -31, z: 30, w: 18, d: 8, color: ROOM_COLORS.admin },
          { id: '1-sys', name: 'システム運用管理課\n法人企画課・広報課', x: -9, z: 30, w: 18, d: 8, color: ROOM_COLORS.admin },
          { id: '1-16a', name: '1-6A 会議室\n応接室A', x: 14, z: 30, w: 12, d: 8, color: ROOM_COLORS.admin },
          { id: '1-riji', name: '理事長室・役員室', x: 30, z: 30, w: 20, d: 8, color: ROOM_COLORS.admin },
          { id: '1-locker6', name: '役員室・更衣室\nトイレ(M / W)', x: 15, z: 45, w: 16, d: 10, color: ROOM_COLORS.facility },
          { id: '1-yakuin', name: '役員室（南東）', x: 33, z: 45, w: 14, d: 10, color: ROOM_COLORS.admin },

          // --- 2号館・6号館 屋上庭園（P.5 右上）---
          { id: '2-roof', name: '2号館 屋上庭園', x: -26, z: 8, w: 22, d: 28, color: ROOM_COLORS.garden },
          { id: '6-roof', name: '6号館 屋上庭園', x: 26, z: 2, w: 18, d: 30, color: ROOM_COLORS.garden },
        ],
        elevators: [
          { id: 'ev-1-6f', name: '1号館 中央EV', x: 0, z: 44, targets: ['1F', '2F', '3F', '4F', '5F', '6F', '7F', '8F', '9F', '10F', '11F', '12F', '13F'] },
          { id: 'ev-6-6f', name: '6号館 屋上EV', x: 12, z: 2, targets: ['1F', '2F', '3F', '4F', '5F', '6F'] },
        ],
        portals: [],
      },

      '7F': {
        spawn: [0, 38],
        buildingZones: [
          { name: '1号館', minX: -40, maxX: 40, minZ: 26, maxZ: 50, floorColor: '#e2e8f0' },
        ],
        rooms: [
          // 北側（P.6 下段上列）
          { id: '1-print7', name: '印刷室\nTA・SA印刷室', x: -34, z: 30, w: 12, d: 8, color: ROOM_COLORS.admin },
          { id: '1-704', name: '1-704 面談ルーム\n教員ステーション2', x: -21, z: 30, w: 14, d: 8, color: ROOM_COLORS.admin },
          { id: '1-kokusai', name: '国際課\nGC全員留学事務室', x: -5, z: 30, w: 18, d: 8, color: ROOM_COLORS.admin },
          { id: '1-707', name: '1-707 ゼミ室', x: 9, z: 30, w: 8, d: 8, color: ROOM_COLORS.lab },
          { id: '1-708', name: '1-708 ゼミ室', x: 17, z: 30, w: 8, d: 8, color: ROOM_COLORS.lab },
          { id: '1-709', name: '1-709 ゼミ室', x: 24, z: 30, w: 6, d: 8, color: ROOM_COLORS.lab },
          { id: '1-710', name: '1-710 PCルーム', x: 30.5, z: 30, w: 7, d: 8, color: ROOM_COLORS.class },
          { id: '1-711', name: '1-711 PCルーム', x: 37, z: 30, w: 6, d: 8, color: ROOM_COLORS.class },
          // 南側（P.6 下段下列）
          { id: '1-st1', name: '教員ステーション1\n給湯室', x: -31, z: 45, w: 18, d: 10, color: ROOM_COLORS.admin },
          { id: '1-703', name: '1-703E〜1-703A\n研究室', x: -11, z: 45, w: 18, d: 10, color: ROOM_COLORS.lab },
          { id: '1-702', name: '1-702 ゼミ室', x: 14, z: 45, w: 10, d: 10, color: ROOM_COLORS.lab },
          { id: '1-wc7', name: 'トイレ\n(M / W)', x: 23, z: 45, w: 8, d: 10, color: ROOM_COLORS.facility },
          { id: '1-701', name: '1-701 PCルーム', x: 34, z: 45, w: 12, d: 10, color: ROOM_COLORS.class },
        ],
        elevators: [
          { id: 'ev-1-7f', name: '1号館 中央EV', x: 4, z: 43, targets: ['1F', '2F', '3F', '4F', '5F', '6F', '7F', '8F', '9F', '10F', '11F', '12F', '13F'] },
        ],
        portals: [],
      },

      '8F': {
        spawn: [0, 38],
        buildingZones: [
          { name: '1号館', minX: -40, maxX: 40, minZ: 26, maxZ: 50, floorColor: '#e2e8f0' },
        ],
        voids: [
          { name: '吹き抜け', x: 0, z: 30, w: 8, d: 8 },
        ],
        rooms: [
          // 北側（P.6 下から2段目）
          { id: '1-812', name: '1-812 教室', x: -35, z: 30, w: 10, d: 8, color: ROOM_COLORS.class },
          { id: '1-8c', name: '1-8C 会議室', x: -26, z: 30, w: 8, d: 8, color: ROOM_COLORS.admin },
          { id: '1-805', name: '1-805 ゼミ室', x: -18, z: 30, w: 8, d: 8, color: ROOM_COLORS.lab },
          { id: '1-806', name: '1-806 ゼミ室', x: -9, z: 30, w: 10, d: 8, color: ROOM_COLORS.lab },
          { id: '1-807', name: '1-807 ゼミ室', x: 10, z: 30, w: 10, d: 8, color: ROOM_COLORS.lab },
          { id: '1-keiei', name: '経営研究所\nグローバルスタディーズ研究所', x: 22, z: 30, w: 14, d: 8, color: ROOM_COLORS.lab },
          { id: '1-809', name: '1-809 教室', x: 34.5, z: 30, w: 11, d: 8, color: ROOM_COLORS.class },
          // 南側
          { id: '1-811', name: '1-811 教室', x: -33, z: 45, w: 14, d: 10, color: ROOM_COLORS.class },
          { id: '1-803', name: '1-803 教室', x: -13, z: 45, w: 16, d: 10, color: ROOM_COLORS.class },
          { id: '1-802', name: '1-802 自習室', x: 14, z: 45, w: 10, d: 10, color: ROOM_COLORS.common },
          { id: '1-wc8', name: 'トイレ(M/W)\n備蓄倉庫', x: 24, z: 45, w: 10, d: 10, color: ROOM_COLORS.facility },
          { id: '1-801', name: '1-801 ゼミ室', x: 34.5, z: 45, w: 11, d: 10, color: ROOM_COLORS.lab },
        ],
        elevators: [
          { id: 'ev-1-8f', name: '1号館 中央EV', x: 4, z: 43, targets: ['1F', '2F', '3F', '4F', '5F', '6F', '7F', '8F', '9F', '10F', '11F', '12F', '13F'] },
        ],
        portals: [],
      },

      '9F': {
        spawn: [0, 38],
        buildingZones: [
          { name: '1号館', minX: -40, maxX: 40, minZ: 26, maxZ: 50, floorColor: '#e2e8f0' },
        ],
        rooms: [
          // 北側（P.6 中段）
          { id: '1-905', name: '1-905 研究室', x: -34, z: 30, w: 12, d: 8, color: ROOM_COLORS.lab },
          { id: '1-906', name: '1-906 ゼミ室', x: -24, z: 30, w: 8, d: 8, color: ROOM_COLORS.lab },
          { id: '1-907', name: '1-907 ゼミ室', x: -16, z: 30, w: 8, d: 8, color: ROOM_COLORS.lab },
          { id: '1-908', name: '1-908 ゼミ室', x: -8, z: 30, w: 8, d: 8, color: ROOM_COLORS.lab },
          { id: '1-9a', name: '1-9A ゼミ室', x: 0, z: 30, w: 8, d: 8, color: ROOM_COLORS.lab },
          { id: '1-909', name: '1-909 研究室', x: 11, z: 30, w: 12, d: 8, color: ROOM_COLORS.lab },
          { id: '1-910', name: '1-910 研究室', x: 23, z: 30, w: 12, d: 8, color: ROOM_COLORS.lab },
          { id: '1-901ab', name: '1-901B・1-901A\n研究室', x: 34.5, z: 30, w: 11, d: 8, color: ROOM_COLORS.lab },
          // 南側
          { id: '1-904', name: '1-904 ゼミ室', x: -34, z: 45, w: 12, d: 10, color: ROOM_COLORS.lab },
          { id: '1-903', name: '1-903 ゼミ室\n産学連携室', x: -14, z: 45, w: 18, d: 10, color: ROOM_COLORS.lab },
          { id: '1-902', name: '1-902\n響学開発センター', x: 14, z: 45, w: 12, d: 10, color: ROOM_COLORS.lab },
          { id: '1-wc9', name: 'トイレ\n(M / W)', x: 24, z: 45, w: 8, d: 10, color: ROOM_COLORS.facility },
          { id: '1-901', name: '1-901\n国際総合研究所', x: 34, z: 45, w: 12, d: 10, color: ROOM_COLORS.lab },
        ],
        elevators: [
          { id: 'ev-1-9f', name: '1号館 中央EV', x: 4, z: 43, targets: ['1F', '2F', '3F', '4F', '5F', '6F', '7F', '8F', '9F', '10F', '11F', '12F', '13F'] },
        ],
        portals: [],
      },

      '10F': {
        spawn: [0, 38],
        ...createBldg1LabFloor(10, null, '1-1005 部長室', true),
      },

      '11F': {
        spawn: [0, 38],
        ...createBldg1LabFloor(11, { id: '1-11a', name: '1-11A ゼミ室' }, '1-1105 印刷室', false),
      },

      '12F': {
        spawn: [0, 38],
        ...createBldg1LabFloor(12, null, null, false),
      },

      '13F': {
        spawn: [0, 42],
        buildingZones: [
          { name: '1号館 13F', minX: -40, maxX: 40, minZ: 34, maxZ: 50, floorColor: '#dcfce7' },
        ],
        rooms: [
          { id: '1-roof13-w', name: '屋上庭園（西）', x: -31, z: 42, w: 18, d: 14, color: ROOM_COLORS.garden },
          { id: '1-13a', name: '1-13A 会議室', x: -16, z: 42, w: 10, d: 12, color: ROOM_COLORS.admin },
          { id: '1-wc13', name: 'トイレ\n(M / W)', x: 0, z: 44, w: 8, d: 8, color: ROOM_COLORS.facility },
          { id: '1-13b', name: '1-13B 会議室', x: 16, z: 42, w: 10, d: 12, color: ROOM_COLORS.admin },
          { id: '1-roof13-e', name: '屋上庭園（東）', x: 31, z: 42, w: 18, d: 14, color: ROOM_COLORS.garden },
        ],
        elevators: [
          { id: 'ev-1-13f', name: '1号館 中央EV', x: -7, z: 42, targets: ['1F', '2F', '3F', '4F', '5F', '6F', '7F', '8F', '9F', '10F', '11F', '12F', '13F'] },
        ],
        portals: [],
      },
    },
  },

  // =========================================================================
  // 4号館（配置図 P.8〜P.9 完全準拠：2号館の西側に配置）
  // =========================================================================
  'area-4': {
    id: 'area-4',
    name: '4号館（2F〜5F）',
    floors: {
      '2F': {
        spawn: [16, 8],
        buildingZones: [
          { name: '4号館', minX: -28, maxX: 28, minZ: -16, maxZ: 18, floorColor: '#fef3c7' },
        ],
        rooms: [
          { id: '4-soko2', name: '倉庫', x: 10, z: -11, w: 8, d: 10, color: ROOM_COLORS.facility },
          { id: '4-proj', name: 'プロジェクトルーム', x: 21, z: -11, w: 14, d: 10, color: ROOM_COLORS.class },
          { id: '4-math-lab', name: '数理工学\n計算機実験室', x: 23, z: 0, w: 10, d: 12, color: ROOM_COLORS.class },
          { id: '4-hall2', name: '学生ホール', x: 15, z: 6, w: 10, d: 12, color: ROOM_COLORS.common },
          { id: '4-career', name: 'キャリアセンター\n支援課・相談ブース\n教職相談ブース', x: 17, z: 15, w: 22, d: 6, color: ROOM_COLORS.admin },
          { id: '4-wc2', name: 'トイレ\n(M / W)', x: -8, z: -4, w: 10, d: 6, color: ROOM_COLORS.facility },
          { id: '4-201-5', name: '4-201〜4-205\n研究室', x: -8, z: 5, w: 12, d: 6, color: ROOM_COLORS.lab },
          { id: '4-206-10', name: '4-206〜4-210\n研究室', x: -21, z: 5, w: 14, d: 6, color: ROOM_COLORS.lab },
        ],
        elevators: [
          { id: 'ev-4-2f', name: '4号館 EV', x: 3, z: -4, targets: ['1F', '2F', '3F', '4F', '5F'] },
        ],
        portals: [],
      },

      '3F': {
        spawn: [0, 4],
        buildingZones: [
          { name: '4号館', minX: -28, maxX: 28, minZ: -16, maxZ: 18, floorColor: '#fef3c7' },
        ],
        rooms: [
          { id: '4-301', name: '4-301 教室', x: 16, z: -11, w: 24, d: 10, color: ROOM_COLORS.class },
          { id: '4-302', name: '4-302 教室', x: 22, z: -1, w: 12, d: 10, color: ROOM_COLORS.class },
          { id: '4-wc3', name: 'トイレ\n(M / W)', x: -8, z: -4, w: 10, d: 6, color: ROOM_COLORS.facility },
          { id: '4-306', name: '4-306 教室', x: -18, z: 12, w: 20, d: 12, color: ROOM_COLORS.class },
          { id: '4-305', name: '4-305 教室', x: -2, z: 12, w: 12, d: 12, color: ROOM_COLORS.class },
          { id: '4-304', name: '4-304 研究室', x: 7, z: 12, w: 6, d: 12, color: ROOM_COLORS.lab },
          { id: '4-303', name: '4-303 教室', x: 19, z: 12, w: 18, d: 12, color: ROOM_COLORS.class },
        ],
        elevators: [
          { id: 'ev-4-3f', name: '4号館 EV', x: 3, z: -4, targets: ['1F', '2F', '3F', '4F', '5F'] },
        ],
        portals: [],
      },

      '4F': {
        spawn: [0, 4],
        buildingZones: [
          { name: '4号館', minX: -28, maxX: 28, minZ: -16, maxZ: 18, floorColor: '#fef3c7' },
        ],
        rooms: [
          { id: '4-401', name: '4-401 科学実験室', x: 12, z: -11, w: 12, d: 10, color: ROOM_COLORS.class },
          { id: '4-402', name: '4-402 科学実験室', x: 23, z: -11, w: 10, d: 10, color: ROOM_COLORS.class },
          { id: '4-prep4', name: '実験準備室・印刷室', x: 22, z: -1, w: 12, d: 10, color: ROOM_COLORS.admin },
          { id: '4-wc4', name: '給湯室・トイレ\n(M / W)', x: -10, z: -4, w: 14, d: 6, color: ROOM_COLORS.facility },
          { id: '4-412', name: '4-412 教室', x: -22, z: 12, w: 12, d: 12, color: ROOM_COLORS.class },
          { id: '4-411', name: '4-411 教室', x: -10, z: 12, w: 12, d: 12, color: ROOM_COLORS.class },
          { id: '4-410', name: '4-410 教室', x: 0, z: 12, w: 8, d: 12, color: ROOM_COLORS.class },
          { id: '4-405', name: '4-405 サステナビリティ研究所\n(4-406〜4-409研究室)', x: 9, z: 12, w: 10, d: 12, color: ROOM_COLORS.lab },
          { id: '4-404', name: '4-404\n数理工学センター', x: 17, z: 12, w: 6, d: 12, color: ROOM_COLORS.lab },
          { id: '4-403', name: '4-403 教室', x: 24, z: 12, w: 8, d: 12, color: ROOM_COLORS.class },
        ],
        elevators: [
          { id: 'ev-4-4f', name: '4号館 EV', x: 3, z: -4, targets: ['1F', '2F', '3F', '4F', '5F'] },
        ],
        portals: [],
      },

      '5F': {
        spawn: [0, 4],
        buildingZones: [
          { name: '4号館', minX: -28, maxX: 28, minZ: -16, maxZ: 18, floorColor: '#fef3c7' },
        ],
        rooms: [
          { id: '4-501', name: '4-501 研究室', x: 15, z: -4, w: 12, d: 6, color: ROOM_COLORS.lab },
          { id: '4-wc5', name: '給湯室・トイレ\n(M / W)', x: -10, z: -4, w: 14, d: 6, color: ROOM_COLORS.facility },
          { id: '4-512-7', name: '倉庫1・4-512〜4-507\n研究室（西側）', x: -14, z: 12, w: 28, d: 12, color: ROOM_COLORS.lab },
          { id: '4-506-2', name: '4-506〜4-502 研究室\n倉庫2（東側）', x: 14, z: 12, w: 28, d: 12, color: ROOM_COLORS.lab },
        ],
        elevators: [
          { id: 'ev-4-5f', name: '4号館 EV', x: 3, z: -4, targets: ['1F', '2F', '3F', '4F', '5F'] },
        ],
        portals: [],
      },
    },
  },

  // =========================================================================
  // 5号館（配置図 P.10〜P.13 完全準拠：4号館の北側・3号館の西側に配置）
  // =========================================================================
  'area-5': {
    id: 'area-5',
    name: '5号館（1F〜7F）',
    floors: {
      '1F': {
        spawn: [-12, 8],
        buildingZones: [
          { name: '5号館', minX: -22, maxX: 22, minZ: -22, maxZ: 22, floorColor: '#f3e8ff' },
        ],
        rooms: [
          { id: '5-multi1', name: '多目的スペース1', x: 11, z: -16, w: 14, d: 12, color: ROOM_COLORS.common },
          { id: '5-park', name: '駐車場スペース', x: 15, z: -4, w: 14, d: 12, color: ROOM_COLORS.facility },
          { id: '5-keibi', name: '警備準備室', x: 1, z: -8, w: 6, d: 8, color: ROOM_COLORS.admin },
          { id: '5-wc1', name: 'トイレ\n(M / W)', x: 6, z: 2, w: 14, d: 8, color: ROOM_COLORS.facility },
          { id: '5-presen', name: 'プレゼンテーション\nスペース', x: -6, z: 2, w: 10, d: 12, color: ROOM_COLORS.common },
          { id: '5-101', name: '5-101 教室', x: 11, z: 11, w: 22, d: 10, color: ROOM_COLORS.class },
        ],
        elevators: [
          { id: 'ev-5-1f', name: '5号館 EVホール', x: -6, z: -18, targets: ['1F', '2F', '3F', '4F', '5F', '6F', '7F'] },
        ],
        portals: [],
      },

      '2F': {
        spawn: [0, -10],
        buildingZones: [
          { name: '5号館', minX: -22, maxX: 22, minZ: -22, maxZ: 22, floorColor: '#f3e8ff' },
        ],
        voids: [
          { name: '吹き抜け（1F学生ホール上部）', x: -11, z: 2, w: 18, d: 22 },
        ],
        rooms: [
          { id: '5-wc2', name: 'トイレ\n(M / W)', x: 13, z: -18, w: 14, d: 8, color: ROOM_COLORS.facility },
          { id: '5-201', name: '5-201 教室', x: 13, z: -6, w: 18, d: 10, color: ROOM_COLORS.class },
          { id: '5-202', name: '5-202\nアジアAI研究所', x: 13, z: 3, w: 18, d: 8, color: ROOM_COLORS.lab },
          { id: '5-203', name: '5-203\n共同研究室', x: 13, z: 12, w: 18, d: 10, color: ROOM_COLORS.lab },
        ],
        elevators: [
          { id: 'ev-5-2f', name: '5号館 EVホール', x: -6, z: -18, targets: ['1F', '2F', '3F', '4F', '5F', '6F', '7F'] },
        ],
        portals: [],
      },

      '3F': {
        spawn: [0, -10],
        buildingZones: [
          { name: '5号館', minX: -22, maxX: 22, minZ: -22, maxZ: 22, floorColor: '#f3e8ff' },
        ],
        rooms: [
          { id: '5-wc3', name: 'トイレ\n(M / W)', x: 13, z: -18, w: 14, d: 8, color: ROOM_COLORS.facility },
          { id: '5-301', name: '5-301 教室', x: -13, z: 2, w: 18, d: 24, color: ROOM_COLORS.class },
          { id: '5-terrace3', name: '交流テラス 31', x: -11, z: 18, w: 22, d: 6, color: ROOM_COLORS.garden },
          { id: '5-302', name: '5-302 教室', x: 13, z: -6, w: 18, d: 9, color: ROOM_COLORS.class },
          { id: '5-303', name: '5-303 教室', x: 13, z: 3, w: 18, d: 9, color: ROOM_COLORS.class },
          { id: '5-304', name: '5-304 教室', x: 13, z: 12, w: 18, d: 9, color: ROOM_COLORS.class },
        ],
        elevators: [
          { id: 'ev-5-3f', name: '5号館 EVホール', x: -6, z: -18, targets: ['1F', '2F', '3F', '4F', '5F', '6F', '7F'] },
        ],
        portals: [],
      },

      '4F': {
        spawn: [0, -10],
        buildingZones: [
          { name: '5号館', minX: -22, maxX: 22, minZ: -22, maxZ: 22, floorColor: '#f3e8ff' },
        ],
        rooms: [
          { id: '5-wc4', name: 'トイレ\n(M / W)', x: 13, z: -18, w: 14, d: 8, color: ROOM_COLORS.facility },
          { id: '5-401', name: '5-401 教室', x: -13, z: -4, w: 18, d: 12, color: ROOM_COLORS.class },
          { id: '5-402', name: '5-402 教室', x: -13, z: 8, w: 18, d: 12, color: ROOM_COLORS.class },
          { id: '5-terrace4', name: '交流テラス 41', x: -11, z: 18, w: 22, d: 6, color: ROOM_COLORS.garden },
          { id: '5-403', name: '5-403 教室', x: 13, z: -6, w: 18, d: 9, color: ROOM_COLORS.class },
          { id: '5-404', name: '5-404 教室', x: 13, z: 3, w: 18, d: 9, color: ROOM_COLORS.class },
          { id: '5-405', name: '5-405 教室', x: 13, z: 12, w: 18, d: 9, color: ROOM_COLORS.class },
        ],
        elevators: [
          { id: 'ev-5-4f', name: '5号館 EVホール', x: -6, z: -18, targets: ['1F', '2F', '3F', '4F', '5F', '6F', '7F'] },
        ],
        portals: [],
      },

      '5F': {
        spawn: [0, -10],
        buildingZones: [
          { name: '5号館', minX: -22, maxX: 22, minZ: -22, maxZ: 22, floorColor: '#f3e8ff' },
        ],
        rooms: [
          { id: '5-wc5', name: 'トイレ\n(M / W)', x: 13, z: -18, w: 14, d: 8, color: ROOM_COLORS.facility },
          { id: '5-501', name: '5-501 アクティブ\nラーニング教室', x: -13, z: -4, w: 18, d: 12, color: ROOM_COLORS.class },
          { id: '5-502', name: '5-502 アクティブ\nラーニング教室', x: -13, z: 8, w: 18, d: 12, color: ROOM_COLORS.class },
          { id: '5-terrace5', name: '交流テラス 51', x: -11, z: 18, w: 22, d: 6, color: ROOM_COLORS.garden },
          { id: '5-503', name: '5-503 教室', x: 13, z: -6, w: 18, d: 9, color: ROOM_COLORS.class },
          { id: '5-504', name: '5-504 教室', x: 13, z: 3, w: 18, d: 9, color: ROOM_COLORS.class },
          { id: '5-505', name: '5-505 教室', x: 13, z: 12, w: 18, d: 9, color: ROOM_COLORS.class },
        ],
        elevators: [
          { id: 'ev-5-5f', name: '5号館 EVホール', x: -6, z: -18, targets: ['1F', '2F', '3F', '4F', '5F', '6F', '7F'] },
        ],
        portals: [],
      },

      '6F': {
        spawn: [0, 0],
        buildingZones: [
          { name: '5号館', minX: -22, maxX: 22, minZ: -22, maxZ: 22, floorColor: '#f3e8ff' },
        ],
        rooms: [
          { id: '5-wc6', name: 'トイレ(M / W)\n給湯室', x: 13, z: -18, w: 14, d: 8, color: ROOM_COLORS.facility },
          { id: '5-6w', name: '5-601 印刷室\n5-602〜5-610 研究室', x: -17, z: 2, w: 10, d: 28, color: ROOM_COLORS.lab },
          { id: '5-6e', name: '5-611〜5-620\n研究室', x: 17, z: 2, w: 10, d: 28, color: ROOM_COLORS.lab },
          { id: '5-terrace6', name: '交流テラス 61', x: -11, z: 19, w: 22, d: 6, color: ROOM_COLORS.garden },
        ],
        elevators: [
          { id: 'ev-5-6f', name: '5号館 EVホール', x: -6, z: -18, targets: ['1F', '2F', '3F', '4F', '5F', '6F', '7F'] },
        ],
        portals: [],
      },

      '7F': {
        spawn: [0, -8],
        buildingZones: [
          { name: '5号館', minX: -22, maxX: 22, minZ: -22, maxZ: 22, floorColor: '#dcfce7' },
        ],
        rooms: [
          { id: '5-wc7', name: 'トイレ\n(M / W)', x: 13, z: -18, w: 14, d: 8, color: ROOM_COLORS.facility },
          { id: '5-multi2', name: '多目的スペース2\n備蓄倉庫', x: -6, z: 4, w: 16, d: 20, color: ROOM_COLORS.common },
          { id: '5-roof7', name: '5号館 屋上庭園', x: 13, z: 4, w: 16, d: 26, color: ROOM_COLORS.garden },
          { id: '5-terrace7', name: '交流テラス 71', x: -11, z: 18, w: 22, d: 6, color: ROOM_COLORS.garden },
        ],
        elevators: [
          { id: 'ev-5-7f', name: '5号館 EVホール', x: -6, z: -18, targets: ['1F', '2F', '3F', '4F', '5F', '6F', '7F'] },
        ],
        portals: [],
      },
    },
  },
};