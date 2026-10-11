// 让牌"滑"到新位置：记住每张牌上一次在哪，这次在哪，中间补一段动画
export const EASE = 'cubic-bezier(.22,.8,.24,1)'

/** 牌"本来"在哪（不算正在播的动画和拖拽的位移）：所在列的位置 + 牌在列里的偏移 */
function layoutPos(el: HTMLElement) {
  const p = (el.offsetParent as HTMLElement | null)?.getBoundingClientRect()
  return { x: (p?.left ?? 0) + el.offsetLeft, y: (p?.top ?? 0) + el.offsetTop }
}

const reduced = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches

export class Flipper {
  private rects = new Map<number, { x: number; y: number }>()
  private ups = new Map<number, boolean>()

  /** 拖拽松手时，把牌"现在被手指拖到的位置"记下来，动画就从那里接着滑 */
  capture(els: HTMLElement[]) {
    for (const el of els) {
      const r = el.getBoundingClientRect()
      this.rects.set(Number(el.dataset.card), { x: r.left, y: r.top })
    }
  }

  reset() {
    this.rects.clear()
    this.ups.clear()
  }

  /** spawn：新出现的牌从哪飞出来（发牌堆） */
  play(root: HTMLElement, spawn: DOMRect | null, animate: boolean) {
    const els = Array.from(root.querySelectorAll<HTMLElement>('[data-card]'))
    const motion = animate && !reduced()
    const nextRects = new Map<number, { x: number; y: number }>()
    const nextUps = new Map<number, boolean>()
    const spawned: { el: HTMLElement; x: number; y: number }[] = []

    for (const el of els) {
      if (el.dataset.dragging) continue
      const id = Number(el.dataset.card)
      const isUp = el.dataset.up === '1'
      const r = layoutPos(el)
      nextRects.set(id, r)
      nextUps.set(id, isUp)
      if (!motion) continue // 只是屏幕尺寸变了：记下新位置，正在播的动画别打断

      const prev = this.rects.get(id)
      if (!prev) {
        if (spawn) {
          for (const a of el.getAnimations()) a.cancel()
          spawned.push({ el, ...r })
        }
        continue
      }
      const dx = prev.x - r.x, dy = prev.y - r.y
      if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
        for (const a of el.getAnimations()) a.cancel()
        el.animate(
          [{ transform: `translate(${dx}px,${dy}px)`, zIndex: 50 }, { transform: 'none', zIndex: 50 }],
          { duration: 300, easing: EASE },
        )
      } else if (this.ups.get(id) !== undefined && this.ups.get(id) !== isUp) {
        // 翻牌
        el.animate([{ transform: 'scaleX(.05)' }, { transform: 'scaleX(1)' }], { duration: 220, delay: 120, easing: EASE, fill: 'backwards' })
      }
    }

    if (spawn && spawned.length) {
      spawned.sort((a, b) => a.y - b.y || a.x - b.x)
      const step = spawned.length > 12 ? 16 : 45
      spawned.forEach(({ el, x, y }, i) => {
        el.animate(
          [{ transform: `translate(${spawn.left - x}px,${spawn.top - y}px)`, zIndex: 50 }, { transform: 'none', zIndex: 50 }],
          { duration: 340, delay: i * step, easing: EASE, fill: 'backwards' },
        )
      })
    }

    this.rects = nextRects
    this.ups = nextUps
  }
}

/** 收齐一整串：把这 13 张牌复制一份，让复制品飞进左上角的格子里，原牌直接拿掉 */
export function flyToSlot(app: HTMLElement, ids: number[], slot: HTMLElement | null) {
  if (!slot || reduced()) return
  const appR = app.getBoundingClientRect()
  const s = slot.getBoundingClientRect()
  ids.slice().reverse().forEach((id, i) => {
    const el = app.querySelector<HTMLElement>(`[data-card="${id}"]`)
    if (!el) return
    const r = el.getBoundingClientRect()
    const g = el.cloneNode(true) as HTMLElement
    g.removeAttribute('data-card')
    g.classList.remove('hint', 'hint-to')
    g.classList.add('ghost')
    g.style.left = `${r.left - appR.left}px`
    g.style.top = `${r.top - appR.top}px`
    app.appendChild(g)
    const dx = s.left + s.width / 2 - (r.left + r.width / 2)
    const dy = s.top + s.height / 2 - (r.top + r.height / 2)
    const tilt = i % 2 ? 8 : -8
    const a = g.animate(
      [
        { transform: 'none', opacity: 1 },
        { transform: `translate(${dx}px,${dy}px) scale(.62) rotate(${tilt}deg)`, opacity: 1, offset: 0.82 },
        { transform: `translate(${dx}px,${dy}px) scale(.35)`, opacity: 0 },
      ],
      { duration: 560, delay: i * 42, easing: EASE, fill: 'both' },
    )
    a.onfinish = () => g.remove()
    a.oncancel = () => g.remove()
  })
}

export function shake(els: HTMLElement[]) {
  if (reduced()) return
  for (const el of els) {
    el.animate(
      [{ transform: 'translateX(0)' }, { transform: 'translateX(-3px)' }, { transform: 'translateX(3px)' }, { transform: 'translateX(-2px)' }, { transform: 'translateX(0)' }],
      { duration: 260 },
    )
  }
}

/** 收齐一串后：一颗金平糖从格子里蹦出来，飞到右上角的糖罐上 */
export function flyCandy(app: HTMLElement, from: Element | null, to: Element | null, amount: number, delay = 0) {
  if (!from || !to || reduced()) return
  const a = app.getBoundingClientRect(), f = from.getBoundingClientRect(), t = to.getBoundingClientRect()
  const node = document.createElement('div')
  node.className = 'candy-fly'
  node.innerHTML = `${to.querySelector('svg')?.outerHTML ?? ''}<b>+${amount}</b>`
  node.style.left = `${f.left + f.width / 2 - a.left}px`
  node.style.top = `${f.top + f.height / 2 - a.top}px`
  app.appendChild(node)
  const dx = t.left + t.width / 2 - (f.left + f.width / 2)
  const dy = t.top + t.height / 2 - (f.top + f.height / 2)
  const anim = node.animate(
    [
      { transform: 'translate(-50%,-50%) scale(.2)', opacity: 0 },
      { transform: 'translate(-50%,-110%) scale(1.15)', opacity: 1, offset: 0.3 },
      { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(.55)`, opacity: 0.9 },
    ],
    { duration: 950, delay, easing: 'cubic-bezier(.5,0,.3,1)', fill: 'both' },
  )
  anim.onfinish = () => {
    node.remove()
    to.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.18)' }, { transform: 'scale(1)' }], { duration: 320, easing: EASE })
  }
  anim.oncancel = () => node.remove()
}
