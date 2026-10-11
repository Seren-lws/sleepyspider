// 蜘蛛纸牌的规则本体：不碰界面，只管"牌在哪、能不能动"

export type Suit = 's' | 'h'
export type Difficulty = 1 | 2

export interface Card {
  id: number // 0..103，花色和点数都能从 id 推出来
  suit: Suit
  rank: number // 1 = A … 13 = K
  up: boolean
}

export interface GameState {
  difficulty: Difficulty
  seed: number
  cols: Card[][]
  stock: Card[]
  done: Suit[] // 已收齐的整串，按顺序
  score: number
  moves: number
  undos: number
  hints: number
}

export type Hint = { from: number; idx: number; to: number } | { deal: true }

export const COLS = 10
export const SETS = 8
const START_SCORE = 500

export const rankOf = (id: number) => (id % 13) + 1
export const suitOf = (id: number, d: Difficulty): Suit =>
  d === 1 ? 's' : Math.floor(id / 13) % 2 === 0 ? 's' : 'h'
export const makeCard = (id: number, d: Difficulty, up = false): Card => ({
  id, suit: suitOf(id, d), rank: rankOf(id), up,
})

export function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export const randomSeed = () => Math.floor(Math.random() * 2 ** 32)

export function newGame(difficulty: Difficulty, seed = randomSeed()): GameState {
  const rand = mulberry32(seed)
  const ids = Array.from({ length: 104 }, (_, i) => i)
  for (let i = ids.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[ids[i], ids[j]] = [ids[j], ids[i]]
  }
  const cards = ids.map((id) => makeCard(id, difficulty))
  const cols: Card[][] = []
  let k = 0
  for (let c = 0; c < COLS; c++) {
    const n = c < 4 ? 6 : 5
    const col = cards.slice(k, k + n)
    k += n
    col[n - 1] = { ...col[n - 1], up: true }
    cols.push(col)
  }
  return {
    difficulty, seed, cols, stock: cards.slice(k), done: [],
    score: START_SCORE, moves: 0, undos: 0, hints: 0,
  }
}

/** 从 idx 到底是不是一整串同花色、连续递减、全翻开的牌（只有这种才能整体拿走） */
export function isRun(col: Card[], idx: number): boolean {
  if (idx < 0 || idx >= col.length || !col[idx].up) return false
  for (let i = idx + 1; i < col.length; i++) {
    const a = col[i - 1], b = col[i]
    if (!b.up || b.suit !== a.suit || b.rank !== a.rank - 1) return false
  }
  return true
}

/** 这一列最底下那串能拿走的牌从哪开始；空列返回 -1 */
export function runStart(col: Card[]): number {
  if (!col.length || !col[col.length - 1].up) return col.length ? col.length - 1 : -1
  let i = col.length - 1
  while (i > 0) {
    const a = col[i - 1], b = col[i]
    if (!a.up || a.suit !== b.suit || a.rank !== b.rank + 1) break
    i--
  }
  return i
}

export function canMove(s: GameState, from: number, idx: number, to: number): boolean {
  if (from === to) return false
  const src = s.cols[from], dst = s.cols[to]
  if (!src || !dst || !isRun(src, idx)) return false
  const top = dst[dst.length - 1]
  return !top || top.rank === src[idx].rank + 1
}

const flipTop = (col: Card[]): Card[] => {
  const top = col[col.length - 1]
  return top && !top.up ? [...col.slice(0, -1), { ...top, up: true }] : col
}

export function moveCards(s: GameState, from: number, idx: number, to: number): GameState {
  const cols = s.cols.slice()
  const moving = cols[from].slice(idx)
  cols[from] = flipTop(cols[from].slice(0, idx))
  cols[to] = cols[to].concat(moving)
  return { ...s, cols, score: Math.max(0, s.score - 1), moves: s.moves + 1 }
}

/** 哪些列底下凑齐了 K→A 一整串 */
export function findCompleted(s: GameState): number[] {
  const out: number[] = []
  s.cols.forEach((col, c) => {
    const i = col.length - 13
    if (i >= 0 && col[i].rank === 13 && isRun(col, i)) out.push(c)
  })
  return out
}

export function collect(s: GameState, c: number): GameState {
  const cols = s.cols.slice()
  const suit = cols[c][cols[c].length - 1].suit
  cols[c] = flipTop(cols[c].slice(0, -13))
  return { ...s, cols, done: [...s.done, suit], score: s.score + 100 }
}

export const dealsLeft = (s: GameState) => Math.floor(s.stock.length / COLS)
export const hasEmptyCol = (s: GameState) => s.cols.some((c) => c.length === 0)
export const canDeal = (s: GameState) => dealsLeft(s) > 0 && !hasEmptyCol(s)

export function deal(s: GameState): GameState {
  const stock = s.stock.slice(0, -COLS)
  const dealt = s.stock.slice(-COLS)
  const cols = s.cols.map((col, i) => [...col, { ...dealt[i], up: true }])
  return { ...s, cols, stock, score: Math.max(0, s.score - 1), moves: s.moves + 1 }
}

export const isWon = (s: GameState) => s.done.length === SETS

/** 撤销：回到上一步，但扣的分和步数不退回，免得反复撤销刷分 */
export function undoTo(prev: GameState, cur: GameState): GameState {
  return { ...prev, score: Math.max(0, prev.score - 1), moves: cur.moves + 1, undos: cur.undos + 1, hints: cur.hints }
}

/** 点一下牌时，自动挑一个最合适的去处 */
export function bestTarget(s: GameState, from: number, idx: number): number | null {
  if (!isRun(s.cols[from], idx)) return null
  const moving = s.cols[from][idx]
  let best: number | null = null, bestScore = 0
  for (let k = 1; k < COLS; k++) {
    const to = (from + k) % COLS
    if (!canMove(s, from, idx, to)) continue
    const dst = s.cols[to]
    const top = dst[dst.length - 1]
    let sc: number
    if (!top) {
      if (idx === 0) continue // 整列挪到空列没意义
      sc = 1
    } else if (top.suit === moving.suit) {
      sc = 3 + (dst.length - runStart(dst)) / 100
    } else sc = 2
    if (sc > bestScore) { bestScore = sc; best = to }
  }
  return best
}

/** 提示：按"有多值得走"排序的所有走法，最后才建议发牌 */
export function hints(s: GameState): Hint[] {
  const scored: { h: Hint; sc: number }[] = []
  s.cols.forEach((col, from) => {
    const rs = runStart(col)
    if (rs < 0) return
    for (let idx = rs; idx < col.length; idx++) {
      const moving = col[idx]
      const parent = idx > 0 ? col[idx - 1] : null
      const onNatural = !!parent && parent.up && parent.rank === moving.rank + 1
      const onSameSuit = onNatural && parent!.suit === moving.suit
      for (let to = 0; to < COLS; to++) {
        if (!canMove(s, from, idx, to)) continue
        const dst = s.cols[to]
        const top = dst[dst.length - 1]
        let sc: number
        if (!top) {
          if (idx === 0 || onNatural) continue
          sc = 20 + (parent && !parent.up ? 30 : 0)
        } else {
          const same = top.suit === moving.suit
          if (onSameSuit) {
            // 把一整串拆开，只有接过去能连成更长的同花色串才值得
            const joined = dst.length - runStart(dst) + col.length - idx
            if (!same || joined <= col.length - rs) continue
            sc = 260 + joined
          } else if (onNatural) {
            if (!same) continue // 从一个能接的位置挪到另一个能接的位置，白走
            sc = 280
          } else {
            sc = (same ? 300 : 150) + (idx === 0 ? 40 : !parent!.up ? 60 : 10)
          }
        }
        scored.push({ h: { from, idx, to }, sc })
      }
    }
  })
  scored.sort((a, b) => b.sc - a.sc)
  const out: Hint[] = scored.map((x) => x.h)
  if (canDeal(s)) out.push({ deal: true })
  return out
}

// ---------- 存档：一张牌压成一个数字，省空间 ----------

export interface SavedGame {
  d: Difficulty
  seed: number
  c: number[][]
  s: number[]
  done: string
  sc: number
  m: number
  u: number
  h: number
}

const enc = (c: Card) => c.id * 2 + (c.up ? 1 : 0)
const dec = (n: number, d: Difficulty) => makeCard(n >> 1, d, (n & 1) === 1)

export const serialize = (g: GameState): SavedGame => ({
  d: g.difficulty, seed: g.seed,
  c: g.cols.map((col) => col.map(enc)), s: g.stock.map(enc),
  done: g.done.join(''), sc: g.score, m: g.moves, u: g.undos, h: g.hints,
})

export const deserialize = (x: SavedGame): GameState => ({
  difficulty: x.d, seed: x.seed,
  cols: x.c.map((col) => col.map((n) => dec(n, x.d))),
  stock: x.s.map((n) => dec(n, x.d)),
  done: x.done.split('') as Suit[],
  score: x.sc, moves: x.m, undos: x.u, hints: x.h,
})
