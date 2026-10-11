import { describe, expect, it } from 'vitest'
import {
  beginGame, collectSets, dayKey, emptyProgress, ensureDay, levelFor, markStarted, pickTasks, syncGame,
  threshold, winGame, TASKS, type Progress, type WinInfo,
} from './progress'

const T0 = new Date(2026, 9, 12, 23, 0).getTime() // 10/12 晚上 11 点
const win = (o: Partial<WinInfo> = {}): WinInfo => ({ difficulty: 2, time: 1200, score: 800, undos: 3, hints: 2, night: false, ...o })
const fresh = (): Progress => beginGame(emptyProgress(T0), 1, 2)

describe('一天从凌晨 4 点开始', () => {
  it('凌晨 3 点还算前一天，4 点才换', () => {
    expect(dayKey(new Date(2026, 9, 13, 3, 59).getTime())).toBe('2026-10-12')
    expect(dayKey(new Date(2026, 9, 13, 4, 0).getTime())).toBe('2026-10-13')
  })

  it('每天 3 个任务，同一天抽到的一样，不会两个算同一件事', () => {
    for (const day of ['2026-10-12', '2026-10-13', '2026-11-01', '2027-01-01']) {
      const t = pickTasks(day)
      expect(t).toHaveLength(3)
      expect(t).toEqual(pickTasks(day))
      expect(['win1', 'sets5']).toContain(t[0])
      expect(new Set(t.map((k) => TASKS[k].metric)).size).toBe(3)
    }
  })

  it('过了 4 点任务会换新，进度清零', () => {
    let p = fresh()
    p = collectSets(p, 1, T0).p
    expect(p.daily.prog.sets).toBe(1)
    p = ensureDay(p, new Date(2026, 9, 13, 4, 1).getTime())
    expect(p.daily.day).toBe('2026-10-13')
    expect(p.daily.prog).toEqual({})
  })
})

describe('金平糖', () => {
  it('收齐一串给 2 颗，撤销后再收同一串不再给', () => {
    let p = fresh()
    let r = collectSets(p, 1, T0)
    expect(r.rewards[0]).toEqual({ kind: 'set', amount: 2 })
    p = r.p
    r = collectSets(p, 1, T0) // 撤销后又收了一次
    expect(r.rewards).toEqual([])
    expect(r.p.candy).toBe(p.candy)
  })

  it('赢一局只算一次：双色 20、单色 10', () => {
    let p = fresh()
    const r = winGame(p, win(), T0)
    expect(r.rewards.find((x) => x.kind === 'win')).toEqual({ kind: 'win', amount: 20 })
    p = r.p
    expect(winGame(p, win(), T0).rewards).toEqual([])
    const one = winGame(beginGame(emptyProgress(T0), 2, 1), win({ difficulty: 1 }), T0)
    expect(one.rewards.find((x) => x.kind === 'win')).toEqual({ kind: 'win', amount: 10 })
  })
})

describe('等级', () => {
  it('每一级比上一级多要 15 颗', () => {
    expect([2, 3, 4, 5].map(threshold)).toEqual([30, 75, 135, 210])
    expect(levelFor(0)).toBe(1)
    expect(levelFor(29)).toBe(1)
    expect(levelFor(30)).toBe(2)
    expect(levelFor(75)).toBe(3)
  })

  it('第一次赢就能升级，并送出 Lv.2 的草莓牛奶牌背', () => {
    const r = winGame(fresh(), win(), T0)
    const lv = r.rewards.find((x) => x.kind === 'level')
    expect(lv).toMatchObject({ kind: 'level', level: 2, item: { id: 'strawberry' } })
  })

  it('没有礼物的等级送 20 颗金平糖', () => {
    const p = { ...fresh(), candy: threshold(9) - 1 }
    const r = collectSets(p, 1, T0)
    const lv = r.rewards.find((x) => x.kind === 'level')
    expect(lv).toMatchObject({ level: 9, item: null, bonus: 20 })
  })
})

describe('任务和成就', () => {
  it('完成任务给 5 颗，三个都做完再给 15', () => {
    let p = fresh()
    p = { ...p, daily: { ...p.daily, tasks: ['win1', 'noHint', 'night'] } }
    const r = winGame(p, win({ hints: 0, night: true }), T0)
    const kinds = r.rewards.map((x) => x.kind)
    expect(kinds.filter((k) => k === 'task')).toHaveLength(3)
    expect(kinds).toContain('allTasks')
    expect(r.p.taskDays).toBe(1)
  })

  it('第一次赢、不用撤销、一气呵成会一起拿到', () => {
    const r = winGame(fresh(), win({ undos: 0, hints: 0 }), T0)
    const ids = r.rewards.flatMap((x) => (x.kind === 'ach' ? [x.id] : []))
    expect(ids).toEqual(expect.arrayContaining(['firstWin', 'noUndo', 'noHint', 'pure']))
  })

  it('成就只能拿一次', () => {
    const p = winGame(fresh(), win(), T0).p
    const again = winGame(beginGame(p, 2, 2), win(), T0)
    expect(again.rewards.some((x) => x.kind === 'ach' && x.id === 'firstWin')).toBe(false)
  })
})

describe('战绩和连胜', () => {
  it('走了第一步才算玩了一局；中途换新局，连胜清零', () => {
    let p = fresh()
    p = markStarted(p)
    p = markStarted(p)
    expect(p.stats[2].played).toBe(1)
    p = winGame(p, win(), T0).p
    expect(p.stats[2].streak).toBe(1)
    p = markStarted(beginGame(p, 5, 2))
    p = beginGame(p, 6, 2) // 没赢完就开了新局
    expect(p.stats[2].streak).toBe(0)
    expect(p.stats[2].bestStreak).toBe(1)
  })

  it('打开 App 时，记账对得上就不动', () => {
    const p = markStarted(fresh())
    expect(syncGame(p, 1, 2)).toBe(p)
    expect(syncGame(p, 9, 2).cur).toMatchObject({ seed: 9, started: false })
  })
})
