import { useState, type CSSProperties } from 'react'
import { KIND_NAME, type Item } from '../game/catalog'
import { Balloon, Bubble, Fence, GiftSmall, ItemTile, Kitten, Sheep, SleepyMoon } from './characters'
import { CANDY_COLORS, Konpeito, SPARKLE_PATH } from './icons'

/** 一次要拆的礼物：升级、补发、或者装扮页里的"看一看" */
export interface GiftShow {
  key: string
  style: string // 用哪种升级动画
  title: string
  items: Item[] // 空的就是一小罐金平糖
  bonus: number
  catchup?: boolean
  preview?: boolean
}

interface Props {
  show: GiftShow
  onEquip: (item: Item) => void
  onDress: () => void
  onClose: () => void
}

/* ---------- 六种"送礼物"的方式，最后都会把东西从中间捧出来 ---------- */

function BigBox() {
  return (
    <svg className="gift-box" viewBox="0 0 120 120" aria-hidden="true">
      <rect x="18" y="54" width="84" height="56" rx="8" className="gift-body" />
      <rect x="54" y="54" width="12" height="56" fill="url(#gold)" />
      <g className="gift-lid">
        <rect x="12" y="40" width="96" height="18" rx="6" className="gift-lid-top" />
        <rect x="54" y="40" width="12" height="18" fill="url(#gold)" />
        <g transform="translate(36 12) scale(1.2)" style={{ fill: 'var(--pink)', stroke: 'var(--gold)' }} strokeWidth="1" strokeLinejoin="round">
          <path d="M18.5 12.5 13 24l3.5-1.4 2.1 2.4 1.9-12z" />
          <path d="M21.5 12.5 27 24l-3.5-1.4-2.1 2.4-1.9-12z" />
          <path d="M20 11C15 3 5 1 3.5 6.5 2 12 11 15 20 11z" />
          <path d="M20 11c5-8 15-10 16.5-4.5C38 12 29 15 20 11z" />
          <ellipse cx="20" cy="11.3" rx="3.2" ry="3.6" />
        </g>
      </g>
    </svg>
  )
}

const BALLOONS = ['#F6A8BC', '#F7D58A', '#C9B6E8']

function Stage({ style }: { style: string }) {
  switch (style) {
    case 'lu-sheep':
      return (
        <>
          <Fence className="fence" />
          <div className="sheep-walk"><div className="sheep-leave"><div className="sheep-bob">
            <Sheep className="sheep" />
            <GiftSmall className="back-gift" />
          </div></div></div>
          <GiftSmall className="ground-gift" />
        </>
      )
    case 'lu-moon':
      return (
        <>
          <div className="moon-sway"><SleepyMoon className="moon" /></div>
          <div className="ribbon" />
          <GiftSmall className="moon-gift" />
        </>
      )
    case 'lu-balloon':
      return (
        <div className="bal-rise">
          <div className="bal-top">
            <svg className="bal-strings" viewBox="0 0 120 90" aria-hidden="true">
              <path d="M24 34 60 90M60 30v60M96 34 60 90" stroke="#C9B6C0" strokeWidth="1" fill="none" />
            </svg>
            {BALLOONS.map((c, i) => <Balloon key={i} color={c} className={`balloon b${i}`} />)}
          </div>
          <GiftSmall className="bal-gift" />
        </div>
      )
    case 'lu-kitten':
      return (
        <div className="kit-walk"><div className="kit-bob">
          <GiftSmall className="kit-gift" />
          <Kitten className="kitten" />
        </div></div>
      )
    case 'lu-bubble':
      return (
        <>
          <div className="bub-rise"><div className="bub-wobble">
            <Bubble className="bubble" />
            <svg className="bub-glint" viewBox="0 0 24 24" aria-hidden="true"><path d={SPARKLE_PATH} fill="#fff" /></svg>
          </div></div>
          {Array.from({ length: 10 }, (_, i) => (
            <i key={i} className="droplet" style={{ '--a': `${i * 36}deg` } as CSSProperties} />
          ))}
        </>
      )
    default:
      return <BigBox />
  }
}

/** 升级礼物：东西送到以后，从中间慢慢飘出来 */
export function GiftOverlay({ show, onEquip, onDress, onClose }: Props) {
  const [skip, setSkip] = useState(false)
  const { style, items, bonus } = show
  const one = items.length === 1 ? items[0] : null
  const sub = show.preview
    ? `${one ? KIND_NAME[one.kind] : ''}预览`
    : show.catchup
      ? `之前升级欠你的 ${items.length} 份礼物，一次补给你`
      : one
        ? `送你一个新${KIND_NAME[one.kind]}：「${one.name}」${one.kind === 'levelup' ? '，以后升级时会随机出现' : ''}`
        : `送你一小罐金平糖 +${bonus}`

  return (
    <div className={`gift style-${style}${skip ? ' skip' : ''}`} onClick={() => setSkip(true)}>
      <div className="gift-stage">
        <Stage style={style} />
        <div className={items.length > 1 ? 'gift-item many' : 'gift-item'}>
          {items.length > 0
            ? items.map((i) => <ItemTile key={i.id} item={i} />)
            : (
              <div className="candy-pile">
                {CANDY_COLORS.concat(CANDY_COLORS).map((c, i) => <Konpeito key={i} color={c} className={`k k${i}`} />)}
              </div>
            )}
          {Array.from({ length: 8 }, (_, i) => (
            <svg key={i} className="gift-spark" viewBox="0 0 24 24" aria-hidden="true" style={{ '--a': `${i * 45}deg` } as CSSProperties}>
              <path d={SPARKLE_PATH} fill="currentColor" />
            </svg>
          ))}
        </div>
      </div>

      <div className="gift-panel" onClick={(e) => e.stopPropagation()}>
        <div className="gift-title">{show.title}</div>
        <div className="gift-sub">{sub}</div>
        {show.preview ? (
          <button className="btn primary" onClick={onClose}>好啦</button>
        ) : show.catchup ? (
          <>
            <button className="btn primary" onClick={onDress}>去装扮页看看</button>
            <button className="btn text" onClick={onClose}>收下啦</button>
          </>
        ) : one && one.kind !== 'levelup' ? (
          <>
            <button className="btn primary" onClick={() => onEquip(one)}>现在就换上</button>
            <button className="btn text" onClick={onClose}>收下啦</button>
          </>
        ) : (
          <button className="btn primary" onClick={onClose}>收下啦</button>
        )}
      </div>
    </div>
  )
}
