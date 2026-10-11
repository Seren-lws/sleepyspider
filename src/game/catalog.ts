// 装扮清单：哪些一开始就有，哪些要升到几级才送
export type ItemKind = 'back' | 'bg'

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
  { id: 'strawberry', kind: 'back', name: '草莓牛奶', level: 2 },
  { id: 'lavender', kind: 'bg', name: '薰衣草', level: 3 },
  { id: 'pearl', kind: 'back', name: '珍珠蕾丝', level: 4 },
  { id: 'starry', kind: 'bg', name: '星空', level: 5 },
  { id: 'sakura', kind: 'bg', name: '樱花', level: 6 },
  { id: 'moon', kind: 'back', name: '月亮', level: 7 },
  { id: 'cloud', kind: 'bg', name: '云朵', level: 8 },
]

export const KIND_NAME: Record<ItemKind, string> = { back: '牌背', bg: '背景' }

export const itemAtLevel = (level: number) => ITEMS.find((i) => i.level === level) ?? null
export const isUnlocked = (id: string, level: number) => (ITEMS.find((i) => i.id === id)?.level ?? 99) <= level
