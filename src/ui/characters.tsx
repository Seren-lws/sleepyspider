// 动画里的小角色：小礼物、小羊、栅栏、小猫、月亮、气球、泡泡、樱花瓣
import type { CSSProperties } from 'react'
import type { Item } from '../game/catalog'
import { BackEmblem, BackPreview, BgSwatch } from './outfits'
import { SPARKLE_PATH } from './icons'

const INK = '#6B4A55'

/** 小礼物盒；盖子单独一组，动画里可以掀开 */
export function GiftSmall({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 40 40" aria-hidden="true">
      <rect x="6" y="17" width="28" height="20" rx="3" fill="#F3C3CD" stroke="#fff" strokeWidth="1.5" />
      <rect x="18" y="17" width="4" height="20" fill="url(#gold)" />
      <g className="lid">
        <rect x="3.5" y="11" width="33" height="8" rx="3" fill="#E99AAE" stroke="#fff" strokeWidth="1.5" />
        <rect x="18" y="11" width="4" height="8" fill="url(#gold)" />
        <path d="M20 11c-3-5-9-6-9.5-3S16 11 20 11zM20 11c3-5 9-6 9.5-3S24 11 20 11z" fill="#F3C3CD" stroke="var(--gold)" strokeWidth=".9" />
        <circle cx="20" cy="10.6" r="1.8" fill="var(--gold)" />
      </g>
    </svg>
  )
}

const WOOL: [number, number, number][] = [[28, 34, 12], [40, 27, 13], [52, 33, 12], [33, 42, 11], [47, 42, 11], [40, 36, 12]]

export function Sheep({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 80 64" aria-hidden="true">
      <g fill="#6B5560">
        <rect x="24" y="44" width="4.5" height="14" rx="2.2" />
        <rect x="32" y="46" width="4.5" height="13" rx="2.2" />
        <rect x="45" y="46" width="4.5" height="13" rx="2.2" />
        <rect x="53" y="44" width="4.5" height="14" rx="2.2" />
      </g>
      <circle cx="16" cy="33" r="5" fill="#E6D9E0" />
      <circle cx="16" cy="33" r="4" fill="#fff" />
      <g fill="#E6D9E0">{WOOL.map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r + 1.3} />)}</g>
      <g fill="#fff">{WOOL.map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} />)}</g>
      <ellipse cx="58" cy="25" rx="5.5" ry="2.6" transform="rotate(-28 58 25)" fill="#6B5560" />
      <ellipse cx="65" cy="31" rx="9" ry="10.5" fill="#7A6470" />
      <circle cx="62" cy="21" r="4.2" fill="#fff" />
      <circle cx="67.5" cy="21.5" r="3.6" fill="#fff" />
      <path d="M64.5 31q2.2 2 4.4 0" fill="none" stroke="#fff" strokeWidth="1.3" strokeLinecap="round" />
      <ellipse cx="70.5" cy="35.5" rx="2" ry="1.2" fill="#F6B6C6" opacity=".9" />
    </svg>
  )
}

export function Fence({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 70 50" aria-hidden="true">
      <g fill="#FFF8EF" stroke="#E2CDBB" strokeWidth="1.4" strokeLinejoin="round">
        <rect x="0" y="16" width="70" height="6" rx="2" />
        <rect x="0" y="32" width="70" height="6" rx="2" />
        <path d="M5 50V9l5-6 5 6v41zM30 50V9l5-6 5 6v41zM55 50V9l5-6 5 6v41z" />
      </g>
    </svg>
  )
}

/** 坐着的小白猫（正面），眼睛眯着；嘴巴、尾巴单独分组方便做动画 */
export function Kitten({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 80 92" aria-hidden="true">
      <path className="tail" d="M56 80c14 0 19-14 11-24" fill="none" stroke="#CDBFE0" strokeWidth="9" strokeLinecap="round" />
      <path className="tail" d="M56 80c14 0 19-14 11-24" fill="none" stroke="#fff" strokeWidth="6.5" strokeLinecap="round" />
      <ellipse cx="40" cy="68" rx="20" ry="20" fill="#fff" stroke="#CDBFE0" strokeWidth="1.2" />
      <ellipse cx="32.5" cy="86" rx="6.5" ry="4" fill="#fff" stroke="#CDBFE0" strokeWidth="1.2" />
      <ellipse cx="47.5" cy="86" rx="6.5" ry="4" fill="#fff" stroke="#CDBFE0" strokeWidth="1.2" />
      <g fill="#fff" stroke="#CDBFE0" strokeWidth="1.2" strokeLinejoin="round">
        <path d="M21 30 19 10l15 11z" />
        <path d="M59 30 61 10 46 21z" />
      </g>
      <path d="M22.5 26.5 21.5 15l8.2 6.3zM57.5 26.5l1-11.5-8.2 6.3z" fill="#F6B6C6" />
      <ellipse cx="40" cy="38" rx="23" ry="18.5" fill="#fff" stroke="#CDBFE0" strokeWidth="1.2" />
      <g fill="none" stroke={INK} strokeWidth="1.6" strokeLinecap="round">
        <path d="M27.5 37q3.5 3 7 0" />
        <path d="M45.5 37q3.5 3 7 0" />
      </g>
      <path d="M38.4 42h3.2L40 44z" fill="#F29BB0" />
      <path className="mouth" d="M40 44.2q-1.6 2.2-3.4.8M40 44.2q1.6 2.2 3.4.8" fill="none" stroke={INK} strokeWidth="1.2" strokeLinecap="round" />
      <ellipse className="yawn" cx="40" cy="48" rx="3.6" ry="4.4" fill="#E9879F" />
      <ellipse cx="26" cy="44" rx="3.6" ry="2" fill="#F8C4D0" opacity=".85" />
      <ellipse cx="54" cy="44" rx="3.6" ry="2" fill="#F8C4D0" opacity=".85" />
    </svg>
  )
}

/** 睡觉的弯月亮 */
export function SleepyMoon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 80 80" aria-hidden="true">
      <path d="M48 6a34 34 0 1 0 26 56A28 28 0 0 1 48 6z" fill="url(#gold)" />
      <path d="M26 40q4 3.4 8 0" fill="none" stroke={INK} strokeWidth="1.8" strokeLinecap="round" />
      <ellipse cx="25" cy="48" rx="3.6" ry="2.2" fill="#F6B6C6" opacity=".9" />
      <path d="M33 54q-2.5 2-5 .4" fill="none" stroke={INK} strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}

export function Balloon({ color, className, style }: { color: string; className?: string; style?: CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 30 40" aria-hidden="true">
      <ellipse cx="15" cy="15" rx="12" ry="14" fill={color} />
      <path d="M13 28.5h4l-2 2.6z" fill={color} />
      <ellipse cx="10.5" cy="9.5" rx="3.2" ry="4.5" fill="#fff" opacity=".55" transform="rotate(-20 10.5 9.5)" />
    </svg>
  )
}

export function Bubble({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" aria-hidden="true">
      <defs>
        <radialGradient id="bub-in" cx="50%" cy="50%" r="50%">
          <stop offset=".7" stopColor="#fff" stopOpacity=".05" />
          <stop offset="1" stopColor="#fff" stopOpacity=".35" />
        </radialGradient>
        <linearGradient id="bub-rim" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F9C4D3" />
          <stop offset=".5" stopColor="#CDB8F0" />
          <stop offset="1" stopColor="#A9E0D0" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="46" fill="url(#bub-in)" stroke="url(#bub-rim)" strokeWidth="2.4" />
      <path d="M24 34a30 30 0 0 1 18-14" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity=".85" />
      <circle cx="70" cy="72" r="3" fill="#fff" opacity=".7" />
    </svg>
  )
}

export const PETAL_PATH = 'M0 6C-4 3-5-2-2-5L0-3.5 2-5C5-2 4 3 0 6Z'

export function Petal({ className, style, color = '#F4AFC2' }: { className?: string; style?: CSSProperties; color?: string }) {
  return (
    <svg className={className} style={style} viewBox="-6 -6 12 12" aria-hidden="true">
      <path d={PETAL_PATH} fill={color} />
    </svg>
  )
}

function Sakura() {
  return (
    <svg viewBox="-12 -12 24 24" aria-hidden="true" className="anim-icon">
      {[0, 72, 144, 216, 288].map((a) => (
        <path key={a} d={PETAL_PATH} transform={`rotate(${a}) translate(0 -5.5)`} fill="#F4AFC2" />
      ))}
      <circle r="2.4" fill="#F7D58A" />
    </svg>
  )
}

/** 装扮页和礼物里用的小图标：一眼看出是哪个动画 */
export function AnimIcon({ id }: { id: string }) {
  switch (id) {
    case 'lu-gift': return <GiftSmall className="anim-icon" />
    case 'lu-sheep': return <Sheep className="anim-icon wide" />
    case 'lu-moon': return (
      <svg viewBox="0 0 40 48" className="anim-icon" aria-hidden="true">
        <path d="M24 2a14 14 0 1 0 11 23A11.5 11.5 0 0 1 24 2z" fill="url(#gold)" />
        <path d="M24 20v14" stroke="#E99AAE" strokeWidth="1.4" />
        <rect x="17" y="33" width="14" height="11" rx="2" fill="#F3C3CD" stroke="#fff" />
        <rect x="23" y="33" width="2" height="11" fill="var(--gold)" />
      </svg>
    )
    case 'lu-balloon': return (
      <svg viewBox="0 0 40 48" className="anim-icon" aria-hidden="true">
        <path d="M11 24 20 40M20 22v18M29 24l-9 16" stroke="#C9B6C0" strokeWidth=".8" fill="none" />
        <ellipse cx="11" cy="14" rx="7" ry="8.5" fill="#F6A8BC" />
        <ellipse cx="29" cy="14" rx="7" ry="8.5" fill="#C9B6E8" />
        <ellipse cx="20" cy="11" rx="7" ry="8.5" fill="#F7D58A" />
        <rect x="14" y="38" width="12" height="9" rx="2" fill="#F3C3CD" stroke="#fff" />
      </svg>
    )
    case 'lu-kitten': return <BackEmblem back="cat" />
    case 'lu-bubble': return <Bubble className="anim-icon" />
    case 'win-stars': return (
      <svg viewBox="0 0 40 40" className="anim-icon" aria-hidden="true">
        <path d={SPARKLE_PATH} fill="var(--gold)" transform="translate(4 12) scale(.9)" />
        <path d={SPARKLE_PATH} fill="var(--pink-deep)" transform="translate(22 4) scale(.6)" />
        <path d={SPARKLE_PATH} fill="var(--gold-hi)" transform="translate(24 24) scale(.5)" />
      </svg>
    )
    case 'win-catnap': return (
      <div className="anim-icon catnap-icon">
        <BackEmblem back="cat" />
        <span>z</span>
      </div>
    )
    case 'win-sakura': return <Sakura />
    default: return null
  }
}

/** 一件东西的小样：牌背、背景、或者动画的小图标 */
export function ItemTile({ item }: { item: Item }) {
  if (item.kind === 'back') return <BackPreview back={item.id} />
  if (item.kind === 'bg') return <BgSwatch bg={item.id} />
  return <div className={`anim-tile ${item.kind}`}><AnimIcon id={item.id} /></div>
}
