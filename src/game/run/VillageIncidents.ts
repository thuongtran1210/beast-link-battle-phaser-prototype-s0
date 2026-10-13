export type IncidentKind = 'anvil' | 'garden' | 'fishing' | 'patrol';

export interface VillageIncident {
  id: string;
  kind: IncidentKind;
  beastId?: string;
  title: string;
  dialogue: string;
  icon: string;
  diaryMeme: string;
  /** Bonus coin reward or material scrap if player discovers it */
  bonusReward?: { coins: number; itemLabel?: string };
}

export const VILLAGE_INCIDENTS: Record<IncidentKind, VillageIncident[]> = {
  anvil: [
    {
      id: 'anvil_toe_stub',
      kind: 'anvil',
      beastId: 'beast-e',
      title: 'Đập trúng ngón chân',
      dialogue: 'Ai rải đinh ở xưởng vậy chèn?! Hết cứu cái chân tui rồi...',
      icon: '💥',
      diaryMeme: 'Gấu rèn sắt đập trúng chân. Nhảy lò cò hết ngày.',
      bonusReward: { coins: 1, itemLabel: 'Mảnh sắt vụn' },
    },
    {
      id: 'anvil_rubber_duck',
      kind: 'anvil',
      beastId: 'beast-e',
      title: 'Ra lò chú vịt cao su',
      dialogue: 'Định rèn đao kiếm gia truyền, sao ra con vịt cạp cạp này?',
      icon: '🦆',
      diaryMeme: 'Lò rèn sản xuất vịt vàng cao su kêu cạp cạp.',
      bonusReward: { coins: 2, itemLabel: 'Vịt cao su mini' },
    },
  ],
  garden: [
    {
      id: 'garden_carrot_bite',
      kind: 'garden',
      beastId: 'beast-c',
      title: 'Bắt quả tang ăn vụng',
      dialogue: 'Ủa đâu có, tui chỉ kiểm định độ giòn của cà rốt thôi mà!',
      icon: '🥕',
      diaryMeme: 'Thỏ bị bắt quả tang gặm vụng cà rốt trong vườn.',
      bonusReward: { coins: 0, itemLabel: 'Củ cà rốt có vết cắn' },
    },
    {
      id: 'garden_giant_root',
      kind: 'garden',
      beastId: 'beast-c',
      title: 'Cà rốt quái vật kéo ngược',
      dialogue: 'Củ cà rốt này tập gym hay gì mà kéo không nhúc nhích!',
      icon: '💪',
      diaryMeme: 'Thỏ bật ngửa vì nhổ trúng củ cà rốt lực điền.',
      bonusReward: { coins: 1, itemLabel: 'Lá cà rốt' },
    },
  ],
  fishing: [
    {
      id: 'fishing_old_boot',
      kind: 'fishing',
      beastId: 'beast-b',
      title: 'Câu trúng chiếc ủng rách',
      dialogue: 'Tưởng cá quái vật khổng lồ, ai dè chiếc ủng tổ ong...',
      icon: '🥾',
      diaryMeme: 'Sát thủ đi câu kéo lên chiếc ủng rách.',
      bonusReward: { coins: 1, itemLabel: 'Ủng rách' },
    },
    {
      id: 'fishing_pulled_in',
      kind: 'fishing',
      beastId: 'beast-b',
      title: 'Cá câu lại cần thủ',
      dialogue: 'Hôm nay cá ăn chay, cá không cắn câu mà câu luôn tui!',
      icon: '🐟',
      diaryMeme: 'Cần thủ bị cá kéo tụt xuống mép nước.',
      bonusReward: { coins: 2, itemLabel: 'Vảy cá lạ' },
    },
  ],
  patrol: [
    {
      id: 'patrol_stuck_beak',
      kind: 'patrol',
      beastId: 'beast-a',
      title: 'Mắc kẹt chiếc mỏ',
      dialogue: 'Mũ phớt phong độ nhưng cái mỏ lại kẹt hàng rào, cứu với!',
      icon: '🪵',
      diaryMeme: 'Vịt đội trưởng kẹt mỏ vào hàng rào khi đang tuần tra.',
      bonusReward: { coins: 1, itemLabel: 'Mảnh dăm gỗ' },
    },
  ],
};

export const RESIDENT_RANDOM_CHATS: Record<string, string[]> = {
  'beast-a': [
    'Mũ phớt đội ngay ngắn, an ninh làng được đảm bảo!',
    'Khiên này để chắn gió cũng mát lắm.',
    'Ai làm rơi đồ gọi đội tuần tra nha!',
  ],
  'beast-b': [
    'Tịnh tâm câu cá, đừng ai hỏi chuyện giang hồ.',
    'Chiếc ủng câu được hồi nãy giặt phơi vẫn xài được...',
    'Gió hôm nay độc lạ ghê.',
  ],
  'beast-c': [
    'Một ngày không ăn cà rốt, lòng bất an!',
    'Vừa tưới rau vừa tập ngắm bắn, đa nhiệm mà.',
    'Nhìn tui nhỏ con vậy chứ ăn khoẻ lắm đó.',
  ],
  'beast-e': [
    'Gõ một búa cho tỉnh táo, cả làng nghe thấy luôn.',
    'Ai cần đồ chơi cơ khí ghé xưởng tui!',
    'Hôm nay cái búa nó nặng hơn mọi khi ta?',
  ],
};

export const DEFAULT_RESIDENT_CHATS: string[] = [
  'Hôm nay thời tiết đẹp quá chừng!',
  'Đang nạp năng lượng, xin đừng làm phiền.',
  'Làng mình càng ngày càng đông vui.',
  'Ủa alo, ai gọi tui đó?',
];

/**
 * Determines whether a workplace incident triggers during work completion or tick.
 * Base chance is ~15%. If resident is hungry, chance doubles to ~35%.
 */
export function rollVillageIncident(
  kind: IncidentKind,
  isHungry = false,
  rngSeed = Math.random(),
): VillageIncident | null {
  const list = VILLAGE_INCIDENTS[kind];
  if (!list || list.length === 0) return null;

  const threshold = isHungry ? 0.35 : 0.15;
  if (rngSeed > threshold) return null;

  // Pick deterministic or uniform index from remainder of rng
  const index = Math.floor((rngSeed / threshold) * list.length) % list.length;
  return list[index] ?? null;
}

/**
 * Get random banter dialogue for a beast resident when tapped.
 */
export function getResidentBanter(beastId: string, rng = Math.random()): string {
  const pool = RESIDENT_RANDOM_CHATS[beastId] ?? DEFAULT_RESIDENT_CHATS;
  const index = Math.floor(rng * pool.length) % pool.length;
  return pool[index] ?? pool[0];
}
