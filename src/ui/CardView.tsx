import { memo, type CSSProperties } from 'react'
import type { Card } from '../game/engine'
import { Bow, FaceArt, Pip } from './icons'

const LABEL = ['', 'A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']

export const CardFace = memo(function CardFace({ card }: { card: Card }) {
  return (
    <>
      <div className="corner">
        <span className={card.rank === 10 ? 'rank ten' : 'rank'}>{LABEL[card.rank]}</span>
        <Pip suit={card.suit} className="pip" />
      </div>
      {card.rank > 10 ? (
        <div className="art">
          <FaceArt rank={card.rank} />
          <Pip suit={card.suit} className="pip-s" />
        </div>
      ) : (
        <Pip suit={card.suit} className={card.rank === 1 ? 'big ace' : 'big'} />
      )}
    </>
  )
})

interface Props {
  card: Card
  col: number
  idx: number
  top: number
  extra?: string
}

/** 牌桌上的一张牌；data-* 给拖拽和动画认人用 */
export const CardView = memo(function CardView({ card, col, idx, top, extra }: Props) {
  const cls = card.up ? `card up ${card.suit === 'h' ? 'heart' : 'spade'}` : 'card down'
  return (
    <div
      className={extra ? `${cls} ${extra}` : cls}
      data-card={card.id}
      data-up={card.up ? 1 : 0}
      data-col={col}
      data-idx={idx}
      style={{ top }}
    >
      {card.up && <CardFace card={card} />}
    </div>
  )
})

export function CardBack({ style, bow, stockTop }: { style?: CSSProperties; bow?: boolean; stockTop?: boolean }) {
  return (
    <div className="card down" style={style} data-stock-top={stockTop ? 1 : undefined}>
      {bow && <Bow className="bow" fill="rgba(255,255,255,.9)" />}
    </div>
  )
}
