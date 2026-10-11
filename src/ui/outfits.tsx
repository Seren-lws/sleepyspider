import { Bow } from './icons'

/** 发牌堆最上面那张牌背中间的小图案，每种牌背不一样 */
export function BackEmblem({ back }: { back: string }) {
  switch (back) {
    case 'cat':
      return (
        <svg className="emblem" viewBox="0 0 40 34" aria-hidden="true">
          <g fill="#fff" stroke="#CDBFE0" strokeWidth="1" strokeLinejoin="round">
            <path d="M8.5 15 7.5 3l9.5 7z" />
            <path d="M31.5 15 32.5 3 23 10z" />
          </g>
          <path d="M10 12.5 9.4 6.4l4.6 3.6z M30 12.5l.6-6.1-4.6 3.6z" fill="#F6B6C6" />
          <ellipse cx="20" cy="20" rx="14" ry="11.5" fill="#fff" stroke="#CDBFE0" strokeWidth="1" />
          <g fill="none" stroke="#6B4A55" strokeWidth="1.3" strokeLinecap="round">
            <path d="M12.6 19.2q2.4 2.2 4.8 0" />
            <path d="M22.6 19.2q2.4 2.2 4.8 0" />
            <path d="M20 24q-1.2 1.6-2.6.6M20 24q1.2 1.6 2.6.6" strokeWidth="1" />
          </g>
          <path d="M18.9 22.4h2.2L20 23.8z" fill="#F29BB0" />
          <ellipse cx="11.8" cy="23.4" rx="2.3" ry="1.3" fill="#F8C4D0" opacity=".8" />
          <ellipse cx="28.2" cy="23.4" rx="2.3" ry="1.3" fill="#F8C4D0" opacity=".8" />
        </svg>
      )
    case 'strawberry':
      return (
        <svg className="emblem" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 21.5c-4.6-2.6-7.2-6.2-7.2-9.5C4.8 9 8 7.6 12 7.6s7.2 1.4 7.2 4.4c0 3.3-2.6 6.9-7.2 9.5z" fill="#F27C98" stroke="#fff" strokeWidth=".8" />
          <g fill="#FFE9A8">
            <ellipse cx="9" cy="11.5" rx=".6" ry=".9" /><ellipse cx="12" cy="10.6" rx=".6" ry=".9" /><ellipse cx="15" cy="11.5" rx=".6" ry=".9" />
            <ellipse cx="10.4" cy="14.6" rx=".6" ry=".9" /><ellipse cx="13.6" cy="14.6" rx=".6" ry=".9" /><ellipse cx="12" cy="17.6" rx=".6" ry=".9" />
          </g>
          <path d="M12 8.6 7.8 6.4l2.5-.5L9.4 3.6 12 5.4l2.6-1.8-.9 2.3 2.5.5z" fill="#7CC79A" stroke="#fff" strokeWidth=".6" strokeLinejoin="round" />
        </svg>
      )
    case 'pearl':
      return (
        <svg className="emblem" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 20.5l-1.3-1.2C6.2 15.3 3.4 12.7 3.4 9.5 3.4 6.9 5.4 5 8 5c1.5 0 2.9.7 4 1.8C13.1 5.7 14.5 5 16 5c2.6 0 4.6 1.9 4.6 4.5 0 3.2-2.8 5.8-7.3 9.8z"
            fill="#fff" stroke="var(--gold)" strokeWidth="1" />
          <circle cx="8.6" cy="9" r="1.6" fill="#fff" stroke="#E6D5BE" strokeWidth=".6" />
          <circle cx="7.9" cy="8.4" r=".5" fill="#fff" />
        </svg>
      )
    case 'moon':
      return (
        <svg className="emblem" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M14.5 3.5a8.5 8.5 0 1 0 6 14.2A7 7 0 0 1 14.5 3.5z" fill="url(#gold)" />
          <path d="M18 5c.3 1.6 1.4 2.7 3 3-1.6.3-2.7 1.4-3 3-.3-1.6-1.4-2.7-3-3 1.6-.3 2.7-1.4 3-3z" fill="#FFF3D6" />
        </svg>
      )
    default:
      return <Bow className="bow" fill="rgba(255,255,255,.9)" />
  }
}

/** 装扮页里的一张牌背小样 */
export function BackPreview({ back }: { back: string }) {
  return (
    <div className="back-preview" data-back={back}>
      <div className="card down"><BackEmblem back={back} /></div>
    </div>
  )
}

/** 装扮页里的一块背景小样 */
export function BgSwatch({ bg }: { bg: string }) {
  return <div className="bg-swatch" data-bg={bg} />
}
