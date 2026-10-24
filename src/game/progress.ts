// 养成：金平糖、每日任务、成就、升级、战绩。只管数字，不碰界面
import { ITEMS, itemAtLevel, type Item } from './catalog'
import { mulberry32, type Difficulty } from './engine'

export interface Stats {
  played: number
  won: number
  bestTime: number | null
  bestScore: number
  streak: number
  bestStreak: number
}

export type Metric = 'wins' | 'sets' | 'noHintWins' | 'noUndoWins' | 'nightWins' | 'fastWins'

export interface Daily {
  day: string
  tasks: string[]
  prog: Partial<Record<Metric, number>>
  done: string[]
  bonus: boolean
}

/** 当前这一局的记账，防止撤销后重复拿糖 */
export interface CurrentGame {
  seed: number
  difficulty: Difficulty
  started: boolean
  won: boolean
  setsAwarded: number
}

export interface Progress {
  candy: number // 一共攒了多少颗（只进不出，等级按它算）
  sets: number
  nightWins: number
  taskDays: number
  stats: Record<Difficulty, Stats>
  ach: Record<string, number> // 成就 id → 拿到的时间
  daily: Daily
  cur: CurrentGame | null
  granted?: number // 礼物已经发到第几级（补发用）
}

export interface WinInfo {
  difficulty: Difficulty
  time: number
  score: number
  undos: number
  hints: number
  night: boolean
}

export type Reward =
  | { kind: 'set'; amount: number }
  | { kind: 'win'; amount: number }
  | { kind: 'task'; id: string; title: string; amount: number }
  | { kind: 'allTasks'; amount: number }
  | { kind: 'ach'; id: string; title: string; amount: number }
  | { kind: 'level'; level: number; item: Item | null; bonus: number }

export const CANDY = { set: 2, win: { 1: 10, 2: 20 } as Record<Difficulty, number>, task: 5, allTasks: 15, levelBonus: 20 }
const FAST_TASK = 15 * 60
const FAST_ACH = 10 * 60

export const TASKS: Record<string, { title: string; metric: Metric; target: number }> = {
  win1: { title: '赢 1 局', metric: 'wins', target: 1 },
  sets5: { title: '收齐 5 串', metric: 'sets', target: 5 },
  sets10: { title: '收齐 10 串', metric: 'sets', target: 10 },
  noHint: { title: '不用提示赢一局', metric: 'noHintWins', target: 1 },
  noUndo: { title: '不用撤销赢一局', metric: 'noUndoWins', target: 1 },
  night: { title: '在夜晚模式下赢一局', metric: 'nightWins', target: 1 },
  fast: { title: '15 分钟内赢一局', metric: 'fastWins', target: 1 },
}

export const ACHS: { id: string; title: string; desc: string; reward: number }[] = [
  { id: 'firstWin', title: '第一次赢', desc: '赢下第一局', reward: 20 },
  { id: 'win10', title: '小有心得', desc: '赢 10 局', reward: 20 },
  { id: 'win50', title: '熟门熟路', desc: '赢 50 局', reward: 40 },
  { id: 'win100', title: '牌桌公主', desc: '赢 100 局', reward: 50 },
  { id: 'two10', title: '双色好手', desc: '双色赢 10 局', reward: 30 },
  { id: 'sets100', title: '收藏家', desc: '累计收齐 100 串', reward: 30 },
  { id: 'sets500', title: '大收藏家', desc: '累计收齐 500 串', reward: 50 },
  { id: 'noUndo', title: '不回头', desc: '不用撤销赢一局', reward: 15 },
  { id: 'noHint', title: '自己来', desc: '不用提示赢一局', reward: 15 },
  { id: 'pure', title: '一气呵成', desc: '不用提示也不用撤销赢一局', reward: 30 },
  { id: 'fast10', title: '手快快', desc: '10 分钟内赢一局', reward: 20 },
  { id: 'score1000', title: '闪闪发光', desc: '一局拿到 1000 分以上', reward: 30 },
  { id: 'streak3', title: '好运连连', desc: '连赢 3 局', reward: 20 },
  { id: 'night10', title: '月光常客', desc: '在夜晚模式下赢 10 局', reward: 25 },
  { id: 'days7', title: '七个晚上', desc: '累计 7 天做完每日任务', reward: 40 },
]

/* ---------- 等级 ---------- */

/** 升到第 L 级一共要攒多少颗：每一级比上一级多要 15 颗 */
export const threshold = (L: number) => 30 * (L - 1) + (15 * (L - 1) * (L - 2)) / 2

export function levelFor(candy: number) {
  let L = 1
  while (candy >= threshold(L + 1)) L++
  return L
}

/* ---------- 日子：凌晨 4 点才算新的一天 ---------- */

export function dayKey(now: number) {
  const d = new Date(now - 4 * 3600_000)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function hash(s: string) {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619)
  return h >>> 0
}

/** 同一天抽到的任务永远一样；第一个是轻松的，三个任务不会重复算同一件事 */
export function pickTasks(day: string): string[] {
  const rand = mulberry32(hash(day))
  const first = rand() < 0.5 ? 'win1' : 'sets5'
  const pool = Object.keys(TASKS).filter((k) => k !== first)
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }
  const out = [first]
  for (const k of pool) {
    if (out.length === 3) break
    if (out.some((o) => TASKS[o].metric === TASKS[k].metric)) continue
    out.push(k)
  }
  return out
}

const newDaily = (day: string): Daily => ({ day, tasks: pickTasks(day), prog: {}, done: [], bonus: false })
const newStats = (): Stats => ({ played: 0, won: 0, bestTime: null, bestScore: 0, streak: 0, bestStreak: 0 })

export const emptyProgress = (now: number): Progress => ({
  candy: 0, sets: 0, nightWins: 0, taskDays: 0,
  stats: { 1: newStats(), 2: newStats() },
  ach: {}, daily: newDaily(dayKey(now)), cur: null,
})

/** 过了凌晨 4 点就换一批任务 */
export function ensureDay(p: Progress, now: number): Progress {
  const day = dayKey(now)
  return p.daily.day === day ? p : { ...p, daily: newDaily(day) }
}

/* ---------- 牌局事件 ---------- */

/** 开新的一局。上一局走过了却没赢完，连胜就断了 */
export function beginGame(p: Progress, seed: number, difficulty: Difficulty): Progress {
  const q = structuredClone(p)
  if (q.cur?.started && !q.cur.won) q.stats[q.cur.difficulty].streak = 0
  q.cur = { seed, difficulty, started: false, won: false, setsAwarded: 0 }
  return q
}

/** 打开 App 时：存档里那局和记账对不上，就当成新的一局开始记（不算放弃） */
export function syncGame(p: Progress, seed: number, difficulty: Difficulty): Progress {
  if (p.cur && p.cur.seed === seed && p.cur.difficulty === difficulty) return p
  return { ...p, cur: { seed, difficulty, started: false, won: false, setsAwarded: 0 } }
}

/** 这一局走了第一步，才算"玩了一局" */
export function markStarted(p: Progress): Progress {
  if (!p.cur || p.cur.started) return p
  const q = structuredClone(p)
  q.cur!.started = true
  q.stats[q.cur!.difficulty].played++
  return q
}

type Result = { p: Progress; rewards: Reward[] }

function bump(q: Progress, metric: Metric, n: number, rewards: Reward[]) {
  const d = q.daily
  d.prog[metric] = (d.prog[metric] ?? 0) + n
  for (const id of d.tasks) {
    const t = TASKS[id]
    if (t.metric !== metric || d.done.includes(id) || (d.prog[metric] ?? 0) < t.target) continue
    d.done.push(id)
    rewards.push({ kind: 'task', id, title: t.title, amount: CANDY.task })
  }
  if (!d.bonus && d.done.length === d.tasks.length) {
    d.bonus = true
    q.taskDays++
    rewards.push({ kind: 'allTasks', amount: CANDY.allTasks })
  }
}

function checkAchievements(q: Progress, now: number, rewards: Reward[], win?: WinInfo) {
  const wins = q.stats[1].won + q.stats[2].won
  const hit: Record<string, boolean> = {
    firstWin: wins >= 1, win10: wins >= 10, win50: wins >= 50, win100: wins >= 100,
    two10: q.stats[2].won >= 10,
    sets100: q.sets >= 100, sets500: q.sets >= 500,
    noUndo: !!win && win.undos === 0,
    noHint: !!win && win.hints === 0,
    pure: !!win && win.undos === 0 && win.hints === 0,
    fast10: !!win && win.time <= FAST_ACH,
    score1000: !!win && win.score >= 1000,
    streak3: q.stats[1].streak >= 3 || q.stats[2].streak >= 3,
    night10: q.nightWins >= 10,
    days7: q.taskDays >= 7,
  }
  for (const a of ACHS) {
    if (q.ach[a.id] || !hit[a.id]) continue
    q.ach[a.id] = now
    rewards.push({ kind: 'ach', id: a.id, title: a.title, amount: a.reward })
  }
}

/** 把这次得到的糖加进去，顺便看看升没升级（可能一次升好几级） */
function payout(q: Progress, rewards: Reward[]): Result {
  let level = levelFor(q.candy)
  for (const r of rewards) if (r.kind !== 'level') q.candy += r.amount
  for (;;) {
    const now = levelFor(q.candy)
    if (now <= level) break
    for (let L = level + 1; L <= now; L++) {
      const item = itemAtLevel(L)
      const bonus = item ? 0 : CANDY.levelBonus
      q.candy += bonus
      rewards.push({ kind: 'level', level: L, item, bonus })
    }
    level = now
  }
  q.granted = Math.max(q.granted ?? 0, level)
  return { p: q, rewards }
}

/** 这次更新以前，礼物只排到了 8 级；之后那些级只送了糖 */
const LEGACY_GRANTED = 8

/**
 * 补发：已经升过去、但当时礼物还没做出来的那些级，现在把东西补上。
 * 返回要补发的东西（没有就是空的），并记下"已经发到第几级了"
 */
export function catchUp(p: Progress): { p: Progress; items: Item[] } {
  const lv = levelFor(p.candy)
  const from = p.granted ?? Math.min(lv, LEGACY_GRANTED)
  if (from >= lv) return { p: p.granted === lv ? p : { ...p, granted: Math.max(from, lv) }, items: [] }
  return { p: { ...p, granted: lv }, items: ITEMS.filter((i) => i.level > from && i.level <= lv) }
}

/** 收齐了几串（doneCount = 这一局一共收了几串）。撤销再收不会重复给 */
export function collectSets(p: Progress, doneCount: number, now: number): Result {
  const q = ensureDay(structuredClone(p), now)
  const rewards: Reward[] = []
  if (!q.cur) return { p: q, rewards }
  const fresh = doneCount - q.cur.setsAwarded
  if (fresh <= 0) return { p: q, rewards }
  q.cur.setsAwarded = doneCount
  q.sets += fresh
  rewards.push({ kind: 'set', amount: CANDY.set * fresh })
  bump(q, 'sets', fresh, rewards)
  checkAchievements(q, now, rewards)
  return payout(q, rewards)
}

export function winGame(p: Progress, info: WinInfo, now: number): Result {
  const q = ensureDay(structuredClone(p), now)
  const rewards: Reward[] = []
  if (!q.cur || q.cur.won) return { p: q, rewards }
  q.cur.won = true
  if (!q.cur.started) {
    q.cur.started = true
    q.stats[info.difficulty].played++
  }
  const s = q.stats[info.difficulty]
  s.won++
  s.streak++
  s.bestStreak = Math.max(s.bestStreak, s.streak)
  s.bestScore = Math.max(s.bestScore, info.score)
  s.bestTime = s.bestTime === null ? info.time : Math.min(s.bestTime, info.time)
  if (info.night) q.nightWins++

  rewards.push({ kind: 'win', amount: CANDY.win[info.difficulty] })
  bump(q, 'wins', 1, rewards)
  if (info.hints === 0) bump(q, 'noHintWins', 1, rewards)
  if (info.undos === 0) bump(q, 'noUndoWins', 1, rewards)
  if (info.night) bump(q, 'nightWins', 1, rewards)
  if (info.time <= FAST_TASK) bump(q, 'fastWins', 1, rewards)
  checkAchievements(q, now, rewards, info)
  return payout(q, rewards)
}

/** 给界面用：一条奖励怎么念 */
export function rewardText(r: Reward): string {
  switch (r.kind) {
    case 'set': return `收齐一串 +${r.amount}`
    case 'win': return `赢了这一局 +${r.amount}`
    case 'task': return `完成任务「${r.title}」+${r.amount}`
    case 'allTasks': return `今天的任务都做完啦 +${r.amount}`
    case 'ach': return `获得成就「${r.title}」+${r.amount}`
    case 'level': return `升到 Lv.${r.level} 啦`
  }
}
