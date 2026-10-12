import { describe, expect, it } from 'vitest'
import { newGame, serialize } from './game/engine'
import { emptyProgress } from './game/progress'
import { defaultPrefs, parseBackup, type Backup } from './storage'

const backup = (): Backup => ({
  app: 'sleepyspider', v: 1, at: Date.now(),
  prefs: { ...defaultPrefs, back: 'cat' },
  progress: { ...emptyProgress(Date.now()), candy: 150 },
  save: { game: serialize(newGame(2, 3)), history: [], elapsed: 42 },
})

describe('存档备份', () => {
  it('正常的存档能读回来', () => {
    const b = backup()
    expect(parseBackup(JSON.stringify(b))).toEqual(b)
  })

  it('不是存档的文件不会被读进来', () => {
    expect(parseBackup('hello')).toBeNull()
    expect(parseBackup('{"app":"other","v":1}')).toBeNull()
    expect(parseBackup(JSON.stringify({ ...backup(), progress: {} }))).toBeNull()
  })

  it('牌局部分坏掉的存档也不会被读进来', () => {
    expect(parseBackup(JSON.stringify({ ...backup(), save: { game: null, history: [], elapsed: 0 } }))).toBeNull()
  })
})
