import { memo } from 'react'
import { SPARKLE_PATH } from './icons'

const SPARKS: [number, number, number][] = [
  [7, 10, 0], [90, 7, 1.2], [12, 47, 2.1], [93, 40, 0.6], [48, 74, 1.6], [18, 84, 0.3], [82, 79, 2.6], [62, 27, 1],
]

/** 背景装饰：蕾丝垫 + 慢慢闪的小星星 */
export const Decor = memo(function Decor() {
  const ring = Array.from({ length: 32 }, (_, i) => {
    const a = (i / 32) * Math.PI * 2
    return <circle key={i} cx={(Math.cos(a) * 128).toFixed(1)} cy={(Math.sin(a) * 128).toFixed(1)} r="14" />
  })
  const petals = Array.from({ length: 16 }, (_, i) => (
    <ellipse key={i} rx="10" ry="32" transform={`rotate(${i * 22.5}) translate(0 -64)`} />
  ))
  const dots = Array.from({ length: 12 }, (_, i) => {
    const a = (i / 12) * Math.PI * 2
    return <circle key={i} className="f" cx={(Math.cos(a) * 92).toFixed(1)} cy={(Math.sin(a) * 92).toFixed(1)} r="2.5" />
  })
  return (
    <>
      <svg className="doily" viewBox="-150 -150 300 300" aria-hidden="true">
        {ring}
        <circle r="118" />
        <circle r="104" strokeDasharray="2 5" />
        {petals}
        {dots}
        <circle r="26" />
        <circle r="12" />
      </svg>
      {SPARKS.map(([x, y, d], i) => (
        <svg key={i} className="spark" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"
          style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${d}s` }}>
          <path d={SPARKLE_PATH} />
        </svg>
      ))}
    </>
  )
})
