// 装扮清单：哪些一开始就有，哪些要升到几级才送
export type ItemKind = 'back' | 'bg' | 'levelup' | 'win'

export interface Item {
  id: string
  kind: ItemKind
  name: string
  level: number
}

export const ITEMS: Item[] = [
  { id: 'pink', kind: 'back', name: '粉色格纹', level: 1 },
  { id: 'cat', kind: 'back', name: '小白猫', level: 1 },
  { id: 'cream', kind: 'bg', name: '奶油圆点', level: 1 },
  { id: 'lu-gift', kind: 'levelup', name: '礼物盒', level: 1 },
  { id: 'win-stars', kind: 'win', name: '星星飘走', level: 1 },
  { id: 'strawberry', kind: 'back', name: '草莓牛奶', level: 2 },
  { id: 'lavender', kind: 'bg', name: '薰衣草', level: 3 },
  { id: 'pearl', kind: 'back', name: '珍珠蕾丝', level: 4 },
  { id: 'starry', kind: 'bg', name: '星空', level: 5 },
  { id: 'sakura', kind: 'bg', name: '樱花', level: 6 },
  { id: 'moon', kind: 'back', name: '月亮', level: 7 },
  { id: 'cloud', kind: 'bg', name: '云朵', level: 8 },
  { id: 'lu-sheep', kind: 'levelup', name: '小羊送礼', level: 9 },
  { id: 'win-catnap', kind: 'win', name: '小猫睡觉', level: 10 },
  { id: 'lu-moon', kind: 'levelup', name: '月亮垂丝带', level: 11 },
  { id: 'lu-balloon', kind: 'levelup', name: '气球飘来', level: 13 },
  { id: 'win-sakura', kind: 'win', name: '樱花落', level: 14 },
  { id: 'lu-kitten', kind: 'levelup', name: '小猫推礼物', level: 15 },
  { id: 'lu-bubble', kind: 'levelup', name: '大泡泡', level: 17 },
]

export const KIND_NAME: Record<ItemKind, string> = { back: '牌背', bg: '背景', levelup: '升级动画', win: '胜利动画' }

export const itemAtLevel = (level: number) => ITEMS.find((i) => i.level === level) ?? null
export const isUnlocked = (id: string, level: number) => (ITEMS.find((i) => i.id === id)?.level ?? 99) <= level

/** 升级时从已经解锁的升级动画里随机挑一个 */
export function pickLevelupStyle(level: number) {
  const pool = ITEMS.filter((i) => i.kind === 'levelup' && i.level <= level)
  return pool[Math.floor(Math.random() * pool.length)]?.id ?? 'lu-gift'
}
