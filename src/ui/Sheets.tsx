import { useState, type ReactNode } from 'react'
import type { Difficulty } from '../game/engine'
import type { Prefs, ThemePref } from '../storage'
import { Pip } from './icons'

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

export function SettingsSheet({ prefs, onChange, onDress, onClose }: {
  prefs: Prefs
  onChange: (p: Partial<Prefs>) => void
  onDress: () => void
  onClose: () => void
}) {
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
      <button className="btn text" onClick={onClose}>好了</button>
      <p className="ver">Sleepy Spider · v0.1</p>
    </Sheet>
  )
}
