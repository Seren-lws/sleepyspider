import { useState, type CSSProperties } from 'react'
import { KIND_NAME, type Item } from '../game/catalog'
import { CANDY_COLORS, Konpeito, SPARKLE_PATH } from './icons'
import { BackPreview, BgSwatch } from './outfits'

interface Props {
  level: number
  item: Item | null
  bonus: number
  onEquip: (item: Item) => void
  onClose: () => void
}

/** 升级礼物：盒子落下来、轻轻晃两下、盖子掀开，新东西慢慢飘出来 */
export function GiftOverlay({ level, item, bonus, onEquip, onClose }: Props) {
  const [skip, setSkip] = useState(false)
  return (
    <div className={skip ? 'gift skip' : 'gift'} onClick={() => setSkip(true)}>
      <div className="gift-stage">
        <div className="gift-item">
          {item?.kind === 'back' && <BackPreview back={item.id} />}
          {item?.kind === 'bg' && <BgSwatch bg={item.id} />}
          {!item && (
            <div className="candy-pile">
              {CANDY_COLORS.concat(CANDY_COLORS).map((c, i) => <Konpeito key={i} color={c} className={`k k${i}`} />)}
            </div>
          )}
          {Array.from({ length: 8 }, (_, i) => (
            <svg key={i} className="gift-spark" viewBox="0 0 24 24" aria-hidden="true"
              style={{ '--a': `${i * 45}deg` } as CSSProperties}>
              <path d={SPARKLE_PATH} fill="currentColor" />
            </svg>
          ))}
        </div>
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
      </div>

      <div className="gift-panel" onClick={(e) => e.stopPropagation()}>
        <div className="gift-title">升到 Lv.{level} 啦</div>
        <div className="gift-sub">
          {item ? <>送你一件新{KIND_NAME[item.kind]}：「{item.name}」</> : <>送你一小罐金平糖 +{bonus}</>}
        </div>
        {item ? (
          <>
            <button className="btn primary" onClick={() => onEquip(item)}>现在就换上</button>
            <button className="btn text" onClick={onClose}>收下啦</button>
          </>
        ) : (
          <button className="btn primary" onClick={onClose}>收下啦</button>
        )}
      </div>
    </div>
  )
}
