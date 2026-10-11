export const fmtTime = (sec: number) => {
  const s = Math.floor(sec)
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), r = s % 60
  const mmss = `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`
  return h ? `${h}:${mmss}` : mmss
}
