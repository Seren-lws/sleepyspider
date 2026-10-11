import { useState } from 'react'
import { ITEMS, KIND_NAME, itemAtLevel, type ItemKind } from '../game/catalog'
import type { Difficulty } from '../game/engine'
import { ACHS, CANDY, TASKS, levelFor, threshold, type Progress } from '../game/progress'
import type { Prefs } from '../storage'
import { fmtTime } from './format'
import { IconCheck, IconLock, Konpeito, Medal } from './icons'
import { BackPreview, BgSwatch } from './outfits'
import { Sheet } from './Sheets'

export type GrowthTab = 'tasks' | 'ach' | 'stats' | 'dress'
const TABS: [GrowthTab, string][] = [['tasks', '今日任务'], ['ach', '成就'], ['stats', '战绩'], ['dress', '装扮']]

export function LevelCard({ candy }: { candy: number }) {
  const lv = levelFor(candy)
  const from = threshold(lv), to = threshold(lv + 1)
  const next = itemAtLevel(lv + 1)
  return (
    <div className="level-card">
      <div className="level-top">
        <b>Lv.{lv}</b>
        <span className="level-candy"><Konpeito className="k" />{candy}</span>
      </div>
      <div className="bar"><i style={{ width: `${((candy - from) / (to - from)) * 100}%` }} /></div>
      <div className="level-next">
        再攒 {to - candy} 颗升到 Lv.{lv + 1} · 送你{next ? `${KIND_NAME[next.kind]}「${next.name}」` : `一小罐金平糖`}
      </div>
    </div>
  )
}

function Tasks({ p }: { p: Progress }) {
  const d = p.daily
  return (
    <>
      <ul className="list">
        {d.tasks.map((id) => {
          const t = TASKS[id]
          const done = d.done.includes(id)
          const n = Math.min(t.target, d.prog[t.metric] ?? 0)
          return (
            <li key={id} className={done ? 'done' : ''}>
              <span className="tick">{done && <IconCheck />}</span>
              <span className="grow">
                {t.title}
                {t.target > 1 && !done && <small className="count"> {n}/{t.target}</small>}
              </span>
              <span className="gain"><Konpeito className="k" />+{CANDY.task}</span>
            </li>
          )
        })}
        <li className={d.bonus ? 'done bonus' : 'bonus'}>
          <span className="tick">{d.bonus && <IconCheck />}</span>
          <span className="grow">三个都做完</span>
          <span className="gain"><Konpeito className="k" color="#F7D58A" />+{CANDY.allTasks}</span>
        </li>
      </ul>
      <p className="note center">每天凌晨 4 点换新任务，没做完也没关系～</p>
    </>
  )
}

function Achievements({ p }: { p: Progress }) {
  const got = ACHS.filter((a) => p.ach[a.id]).length
  return (
    <>
      <p className="note center">已经拿到 {got} / {ACHS.length} 个</p>
      <ul className="list ach">
        {ACHS.map((a) => {
          const on = !!p.ach[a.id]
          return (
            <li key={a.id} className={on ? 'done' : 'locked'}>
              <Medal on={on} />
              <span className="grow">
                {a.title}
                <small>{a.desc}</small>
              </span>
              <span className="gain"><Konpeito className="k" />+{a.reward}</span>
            </li>
          )
        })}
      </ul>
    </>
  )
}

function Stats({ p }: { p: Progress }) {
  const col = (d: Difficulty) => p.stats[d]
  const rows: [string, (d: Difficulty) => string][] = [
    ['玩了', (d) => `${col(d).played} 局`],
    ['赢了', (d) => `${col(d).won} 局`],
    ['胜率', (d) => (col(d).played ? `${Math.round((col(d).won / col(d).played) * 100)}%` : '—')],
    ['最快', (d) => (col(d).bestTime === null ? '—' : fmtTime(col(d).bestTime!))],
    ['最高分', (d) => (col(d).bestScore ? String(col(d).bestScore) : '—')],
    ['最长连胜', (d) => `${col(d).bestStreak} 局`],
    ['现在连胜', (d) => `${col(d).streak} 局`],
  ]
  return (
    <>
      <table className="stats">
        <thead><tr><th /><th>单色</th><th>双色</th></tr></thead>
        <tbody>
          {rows.map(([label, f]) => (
            <tr key={label}><td>{label}</td><td>{f(1)}</td><td>{f(2)}</td></tr>
          ))}
        </tbody>
      </table>
      <div className="totals">
        <div><small>一共攒了</small><b><Konpeito className="k" />{p.candy}</b></div>
        <div><small>一共收齐</small><b>{p.sets} 串</b></div>
      </div>
    </>
  )
}

function Dress({ level, prefs, onEquip }: { level: number; prefs: Prefs; onEquip: (kind: ItemKind, id: string) => void }) {
  const section = (kind: ItemKind) => (
    <>
      <div className="row-label">{KIND_NAME[kind]}</div>
      <div className={`dress-grid ${kind}`}>
        {ITEMS.filter((i) => i.kind === kind).map((i) => {
          const locked = i.level > level
          const on = (kind === 'back' ? prefs.back : prefs.bg) === i.id
          return (
            <button key={i.id} className={`dress${on ? ' on' : ''}${locked ? ' locked' : ''}`}
              disabled={locked} onClick={() => onEquip(kind, i.id)}>
              {kind === 'back' ? <BackPreview back={i.id} /> : <BgSwatch bg={i.id} />}
              <span className="dress-name">{i.name}</span>
              {locked && <span className="dress-lock"><IconLock />Lv.{i.level}</span>}
            </button>
          )
        })}
      </div>
    </>
  )
  return <>{section('back')}{section('bg')}</>
}

export function GrowthSheet({ p, prefs, initial, onEquip, onClose }: {
  p: Progress
  prefs: Prefs
  initial: GrowthTab
  onEquip: (kind: ItemKind, id: string) => void
  onClose: () => void
}) {
  const [tab, setTab] = useState<GrowthTab>(initial)
  return (
    <Sheet title="成长" onClose={onClose} tall>
      <LevelCard candy={p.candy} />
      <div className="tabs" role="tablist">
        {TABS.map(([id, label]) => (
          <button key={id} role="tab" aria-selected={tab === id} className={tab === id ? 'on' : ''} onClick={() => setTab(id)}>
            {label}
          </button>
        ))}
      </div>
      <div className="tab-body">
        {tab === 'tasks' && <Tasks p={p} />}
        {tab === 'ach' && <Achievements p={p} />}
        {tab === 'stats' && <Stats p={p} />}
        {tab === 'dress' && <Dress level={levelFor(p.candy)} prefs={prefs} onEquip={onEquip} />}
      </div>
      <button className="btn text" onClick={onClose}>好了</button>
    </Sheet>
  )
}
