import { describe, expect, it } from 'vitest'
import {
  canDeal, canMove, collect, deal, deserialize, findCompleted, hints, isRun, makeCard,
  moveCards, newGame, runStart, serialize, undoTo, bestTarget, type Card, type GameState,
} from './engine'

const up = (rank: number, suit: 's' | 'h' = 's', id = 0): Card => ({ id, suit, rank, up: true })
const down = (rank: number, suit: 's' | 'h' = 's', id = 0): Card => ({ id, suit, rank, up: false })
const board = (cols: Card[][], extra: Partial<GameState> = {}): GameState => ({
  difficulty: 2, seed: 1, cols, stock: [], done: [], score: 500, moves: 0, undos: 0, hints: 0, ...extra,
})

describe('发牌', () => {
  it('前 4 列 6 张、后 6 列 5 张，最上面一张翻开，剩 50 张', () => {
    const g = newGame(2, 42)
    expect(g.cols.map((c) => c.length)).toEqual([6, 6, 6, 6, 5, 5, 5, 5, 5, 5])
    expect(g.stock).toHaveLength(50)
    g.cols.forEach((c) => {
      expect(c[c.length - 1].up).toBe(true)
      expect(c.slice(0, -1).every((x) => !x.up)).toBe(true)
    })
    const ids = [...g.cols.flat(), ...g.stock].map((c) => c.id).sort((a, b) => a - b)
    expect(ids).toEqual(Array.from({ length: 104 }, (_, i) => i))
  })

  it('同一个种子发出来的牌一样（"重开这一局"靠它）', () => {
    expect(serialize(newGame(2, 7))).toEqual(serialize(newGame(2, 7)))
  })

  it('单色全是黑桃，双色黑桃红心各半', () => {
    const one = newGame(1, 1), two = newGame(2, 1)
    expect([...one.cols.flat(), ...one.stock].every((c) => c.suit === 's')).toBe(true)
    const hearts = [...two.cols.flat(), ...two.stock].filter((c) => c.suit === 'h')
    expect(hearts).toHaveLength(52)
  })
})

describe('移牌规则', () => {
  it('同花色连续才算一串', () => {
    expect(isRun([up(9), up(8), up(7)], 0)).toBe(true)
    expect(isRun([up(9), up(8, 'h'), up(7)], 0)).toBe(false)
    expect(isRun([up(9), up(8, 'h'), up(7)], 1)).toBe(false)
    expect(isRun([up(9), up(8, 'h'), up(7, 'h')], 1)).toBe(true)
    expect(runStart([down(3), up(9), up(8), up(7)])).toBe(1)
  })

  it('只能放在大一点的牌上（不管花色），空列什么都能放', () => {
    const g = board([[up(7)], [up(8, 'h')], [up(9)], [], ...Array(6).fill([up(1)])])
    expect(canMove(g, 0, 0, 1)).toBe(true)
    expect(canMove(g, 0, 0, 2)).toBe(false)
    expect(canMove(g, 0, 0, 3)).toBe(true)
  })

  it('挪走后下面那张自动翻开，扣 1 分', () => {
    const g = board([[down(2), up(7)], [up(8)], ...Array(8).fill([up(1)])])
    const n = moveCards(g, 0, 1, 1)
    expect(n.cols[0]).toEqual([up(2)].map((c) => ({ ...c, up: true })))
    expect(n.cols[1].map((c) => c.rank)).toEqual([8, 7])
    expect(n.score).toBe(499)
    expect(n.moves).toBe(1)
  })
})

describe('收牌', () => {
  it('K 到 A 同花色凑齐会被收走，加 100 分', () => {
    const run = Array.from({ length: 13 }, (_, i) => up(13 - i, 'h'))
    const g = board([[down(5), ...run], ...Array(9).fill([up(1)])])
    expect(findCompleted(g)).toEqual([0])
    const n = collect(g, 0)
    expect(n.cols[0]).toHaveLength(1)
    expect(n.cols[0][0].up).toBe(true)
    expect(n.done).toEqual(['h'])
    expect(n.score).toBe(600)
  })

  it('混了花色的不算', () => {
    const run = Array.from({ length: 13 }, (_, i) => up(13 - i, i === 5 ? 'h' : 's'))
    expect(findCompleted(board([run, ...Array(9).fill([up(1)])]))).toEqual([])
  })
})

describe('发牌堆', () => {
  it('有空列时不能发', () => {
    const stock = Array.from({ length: 10 }, (_, i) => makeCard(i, 2))
    expect(canDeal(board([[], ...Array(9).fill([up(1)])], { stock }))).toBe(false)
    const g = board(Array(10).fill([up(1)]), { stock })
    expect(canDeal(g)).toBe(true)
    const n = deal(g)
    expect(n.stock).toHaveLength(0)
    expect(n.cols.every((c) => c.length === 2 && c[1].up)).toBe(true)
  })

  it('宽松规则：有空列也能发，空列里落进一张翻开的牌', () => {
    const stock = Array.from({ length: 10 }, (_, i) => makeCard(i, 2))
    const g = board([[], ...Array(9).fill([up(13)])], { stock })
    expect(canDeal(g, true)).toBe(true)
    expect(hints(g, true)).toContainEqual({ deal: true })
    const n = deal(g)
    expect(n.cols[0]).toHaveLength(1)
    expect(n.cols[0][0].up).toBe(true)
  })
})

describe('提示和点一下自动移', () => {
  it('优先接到同花色上', () => {
    const g = board([[down(1), up(7, 'h')], [up(8)], [up(8, 'h')], ...Array(7).fill([up(13)])])
    expect(hints(g)[0]).toEqual({ from: 0, idx: 1, to: 2 })
    expect(bestTarget(g, 0, 1)).toBe(2)
  })

  it('不会建议把已经接好的同花色串拆开乱挪', () => {
    const g = board([[up(8), up(7)], [up(8, 'h')], ...Array(8).fill([up(13)])])
    expect(hints(g).filter((h) => !('deal' in h))).toEqual([])
  })

  it('没得走时建议发牌', () => {
    const stock = Array.from({ length: 10 }, (_, i) => makeCard(i, 2))
    const g = board(Array(10).fill([up(13)]), { stock })
    expect(hints(g)).toEqual([{ deal: true }])
  })
})

describe('撤销和存档', () => {
  it('撤销回到上一步，但分数不退', () => {
    const g = board([[down(2), up(7)], [up(8)], ...Array(8).fill([up(1)])])
    const n = moveCards(g, 0, 1, 1)
    const u = undoTo(g, n)
    expect(u.cols).toEqual(g.cols)
    expect(u.score).toBe(499)
    expect(u.moves).toBe(2)
    expect(u.undos).toBe(1)
  })

  it('存档读档前后一模一样', () => {
    const g = moveCards(newGame(2, 99), 0, 5, 4)
    expect(deserialize(serialize(g))).toEqual(g)
  })
})
