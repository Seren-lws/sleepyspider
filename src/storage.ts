// 进度和设置都存在手机本地，不用账号
import { deserialize, serialize, type Difficulty, type GameState, type SavedGame } from './game/engine'
import { emptyProgress, type Progress } from './game/progress'

export type ThemePref = 'day' | 'night' | 'auto'

export interface Prefs {
  theme: ThemePref
  tapToMove: boolean
  difficulty: Difficulty
  back: string
  bg: string
  lastBackup?: number
  dealWithEmpty: boolean
}

export const defaultPrefs: Prefs = {
  theme: 'day', tapToMove: true, difficulty: 2, back: 'pink', bg: 'cream', dealWithEmpty: true,
}

const SAVE_KEY = 'sleepyspider:save:v1'
const PREFS_KEY = 'sleepyspider:prefs:v1'
const PROGRESS_KEY = 'sleepyspider:progress:v1'
const MAX_HISTORY = 400

interface SaveFile {
  game: SavedGame
  history: SavedGame[]
  elapsed: number
}

function read<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

/** 导入存档后要刷新页面，这期间别让旧数据把刚导入的覆盖掉 */
let frozen = false

function write(key: string, value: unknown) {
  if (frozen) return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* 存不下也别让游戏崩 */
  }
}

export function loadGame(): { game: GameState; history: GameState[]; elapsed: number } | null {
  const f = read<SaveFile>(SAVE_KEY)
  if (!f?.game) return null
  try {
    return { game: deserialize(f.game), history: f.history.map(deserialize), elapsed: f.elapsed || 0 }
  } catch {
    return null
  }
}

export function saveGame(game: GameState, history: GameState[], elapsed: number) {
  write(SAVE_KEY, {
    game: serialize(game),
    history: history.slice(-MAX_HISTORY).map(serialize),
    elapsed: Math.floor(elapsed),
  } satisfies SaveFile)
}

export const loadPrefs = (): Prefs => ({ ...defaultPrefs, ...read<Partial<Prefs>>(PREFS_KEY) })
export const savePrefs = (p: Prefs) => write(PREFS_KEY, p)

export function loadProgress(now: number): Progress {
  const p = read<Progress>(PROGRESS_KEY)
  return p?.daily && p.stats ? p : emptyProgress(now)
}
export const saveProgress = (p: Progress) => write(PROGRESS_KEY, p)

/* ---------- 存档备份：导出成一个小文件，换手机时再导入 ---------- */

export interface Backup {
  app: 'sleepyspider'
  v: 1
  at: number
  prefs: Prefs
  progress: Progress
  save: SaveFile | null
}

export function makeBackup(now: number): Backup {
  const save = read<SaveFile>(SAVE_KEY)
  return {
    app: 'sleepyspider', v: 1, at: now,
    prefs: loadPrefs(),
    progress: loadProgress(now),
    save: save?.game ? { game: save.game, history: [], elapsed: save.elapsed } : null,
  }
}

export function parseBackup(text: string): Backup | null {
  try {
    const b = JSON.parse(text) as Backup
    if (b?.app !== 'sleepyspider' || b.v !== 1 || !b.progress?.stats || !b.progress?.daily || !b.prefs) return null
    if (b.save) deserialize(b.save.game) // 坏掉的牌局存档在这里就会报错
    return b
  } catch {
    return null
  }
}

/** 写入存档，然后锁住，等页面刷新后按新存档重新打开 */
export function restoreBackup(b: Backup) {
  write(PREFS_KEY, { ...defaultPrefs, ...b.prefs })
  write(PROGRESS_KEY, b.progress)
  if (b.save) write(SAVE_KEY, b.save)
  else localStorage.removeItem(SAVE_KEY)
  frozen = true
}
