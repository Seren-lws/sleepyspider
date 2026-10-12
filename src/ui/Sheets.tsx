import { useRef, useState, type ReactNode } from 'react'
import type { Difficulty } from '../game/engine'
import { levelFor } from '../game/progress'
import { parseBackup, type Backup, type Prefs, type ThemePref } from '../storage'
import { Konpeito, Pip } from './icons'

const fmtDate = (t: number) => {
  const d = new Date(t)
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
}

export function Sheet({ title, onClose, children, tall }: { title: string; onClose: () => void; children: ReactNode; tall?: boolean }) {
  return (
    <div className="backdrop" onClick={onClose}>
      <div className={tall ? 'sheet tall' : 'sheet'} onClick={(e) => e.stopPropagation()} role="dialog" aria-label={title}>
        <h2>{title}</h2>
        {children}
      </div>
    </div>
  )
}

export function NewGameSheet({ initial, canRestart, onStart, onRestart, onClose }: {
  initial: Difficulty
  canRestart: boolean
  onStart: (d: Difficulty) => void
  onRestart: () => void
  onClose: () => void
}) {
  const [d, setD] = useState<Difficulty>(initial)
  return (
    <Sheet title="新的一局" onClose={onClose}>
      <div className="seg two">
        <button className={d === 1 ? 'on' : ''} onClick={() => setD(1)}>
          <span className="seg-title">单色 <span className="spade"><Pip suit="s" className="seg-pip" /></span></span>
          <small>只有黑桃，轻松一点</small>
        </button>
        <button className={d === 2 ? 'on' : ''} onClick={() => setD(2)}>
          <span className="seg-title">双色 <span className="spade"><Pip suit="s" className="seg-pip" /></span><span className="heart"><Pip suit="h" className="seg-pip" /></span></span>
          <small>黑桃和红心</small>
        </button>
      </div>
      <button className="btn primary" onClick={() => onStart(d)}>开始</button>
      {canRestart && <button className="btn ghost" onClick={onRestart}>从头再来这一局</button>}
      <button className="btn text" onClick={onClose}>算了</button>
    </Sheet>
  )
}

const THEMES: [ThemePref, string][] = [['day', '白天'], ['night', '夜晚'], ['auto', '跟着时间']]

export function SettingsSheet({ prefs, onChange, onDress, onExport, onRestore, onError, onClose }: {
  prefs: Prefs
  onChange: (p: Partial<Prefs>) => void
  onDress: () => void
  onExport: () => void
  onRestore: (b: Backup) => void
  onError: (text: string) => void
  onClose: () => void
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [pending, setPending] = useState<Backup | null>(null)

  async function pick(file: File | undefined) {
    if (!file) return
    const b = parseBackup(await file.text())
    if (b) setPending(b)
    else onError('这个文件好像不是 Sleepy Spider 的存档')
  }

  if (pending) {
    return (
      <Sheet title="导入存档" onClose={() => setPending(null)}>
        <div className="backup-card">
          <div className="backup-row">
            <b>Lv.{levelFor(pending.progress.candy)}</b>
            <span className="level-candy"><Konpeito className="k" />{pending.progress.candy}</span>
          </div>
          <small>这个存档是 {fmtDate(pending.at)} 导出的</small>
        </div>
        <p className="note center">要用这个存档覆盖现在的进度吗？现在的等级、金平糖和正在打的这一局都会换成存档里的。</p>
        <button className="btn primary" onClick={() => onRestore(pending)}>覆盖</button>
        <button className="btn text" onClick={() => setPending(null)}>算了</button>
      </Sheet>
    )
  }

  return (
    <Sheet title="设置" onClose={onClose}>
      <div className="row-label">夜晚模式</div>
      <div className="seg three">
        {THEMES.map(([v, label]) => (
          <button key={v} className={prefs.theme === v ? 'on' : ''} onClick={() => onChange({ theme: v })}>
            <span className="seg-title">{label}</span>
          </button>
        ))}
      </div>
      <p className="note">选"跟着时间"的话，晚上 9 点到早上 6 点会自动变暗。</p>

      <label className="switch-row">
        <span>点一下牌，自动挪到合适的位置</span>
        <input type="checkbox" checked={prefs.tapToMove} onChange={(e) => onChange({ tapToMove: e.target.checked })} />
        <i className="switch" aria-hidden="true" />
      </label>

      <button className="btn ghost" onClick={onDress}>换牌背和背景</button>

      <div className="row-label">存档</div>
      <div className="btn-row">
        <button className="btn ghost" onClick={onExport}>导出存档</button>
        <button className="btn ghost" onClick={() => fileRef.current?.click()}>导入存档</button>
      </div>
      <input
        ref={fileRef} type="file" accept=".json,application/json,text/plain" hidden
        onChange={(e) => { void pick(e.target.files?.[0]); e.target.value = '' }}
      />
      <p className="note">
        进度只存在这台手机里。导出的小文件可以存到"文件"里，或者发给自己，换手机时导入就能接着玩。
        {prefs.lastBackup ? ` 上次导出：${fmtDate(prefs.lastBackup)}` : ' 还没有导出过。'}
      </p>

      <button className="btn text" onClick={onClose}>好了</button>
      <p className="ver">Sleepy Spider · v0.1</p>
    </Sheet>
  )
}
