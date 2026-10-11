// 进度和设置都存在手机本地，不用账号
import { deserialize, serialize, type Difficulty, type GameState, type SavedGame } from './game/engine'

export type ThemePref = 'day' | 'night' | 'auto'

export interface Prefs {
  theme: ThemePref
  tapToMove: boolean
  difficulty: Difficulty
}

export const defaultPrefs: Prefs = { theme: 'day', tapToMove: true, difficulty: 2 }

const SAVE_KEY = 'sleepyspider:save:v1'
const PREFS_KEY = 'sleepyspider:prefs:v1'
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

function write(key: string, value: unknown) {
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
