import type { GridLayout, View } from '@nativescript/core'
import { motionScope, particles, reducedMotion, set } from '@rafaelaugusto/jolt'
import { shape, type Shape } from '@rafaelaugusto/jolt/shapes'

const ORBIT = 'M175 16 C263 16 334 87 334 175 C334 263 263 334 175 334 C87 334 16 263 16 175 C16 87 87 16 175 16 Z'
const INNER = 'M150 22 C221 22 278 79 278 150 C278 221 221 278 150 278 C79 278 22 221 22 150 C22 79 79 22 150 22 Z'

/** One native timeline, automatically paused by Jolt while the app is backgrounded. */
export function playLaunch(root: GridLayout, reveal: () => Promise<void>) {
  const motion = motionScope()
  const drawings: Shape[] = []
  const view = (id: string) => root.getViewById<View>(`launch-${id}`)
  const mark = view('mark'), aura = view('aura'), orbit = view('orbit')
  const inner = view('inner'), wave = view('wave'), title = view('title'), caption = view('caption')
  const reduced = reducedMotion()

  const finished = (async () => {
    if (reduced) {
      set([title, caption], { opacity: 1 })
      if (!await motion.animate(root, { opacity: [1, 1] }, { duration: 120 }).finished) return false
    } else {
      motion.gradient(view('aura-paint'), { type: 'radial', radius: .5,
        colors: ['#9d73fa70', '#6246bf38', '#090b2600'], stops: [0, .38, 1] })
      motion.gradient(view('wave-paint'), { type: 'radial', radius: .5,
        colors: ['#c6b6ff00', '#8ee9ef40', '#090b2600'], stops: [0, .72, 1] })
      const outerLine = shape(view('orbit-paint'), { viewBox: [0, 0, 350, 350], d: ORBIT,
        stroke: '#a2bbf0', strokeWidth: .8, strokeEnd: 0, lineCap: 'round' })
      const innerLine = shape(view('inner-paint'), { viewBox: [0, 0, 300, 300], d: INNER,
        stroke: '#c796ef', strokeWidth: .6, strokeEnd: 0, lineCap: 'round' })
      drawings.push(outerLine, innerLine)
      motion.use(() => particles(view('motes'), { source: 'center',
        colors: ['#e9dcff', '#99f4e2', '#a595ff'], rate: 24, duration: 1100,
        lifetime: 1300, size: 1.8, velocity: 100, velocityRange: 40, spread: 360, gravity: -14 }))

      const entrance = motion.timeline([
        [mark, { scale: [1, .93, 1.1, 1], y: [0, 5, -13, -5], rotate: [0, -7, 3, 0] },
          { at: 0, duration: 1850, times: [0, .22, .62, 1], ease: 'easeInOut' }],
        [aura, { opacity: [0, 1, .75], scale: [.65, 1.08, 1] }, { at: 0, duration: 1800, ease: 'easeInOut' }],
        [orbit, { opacity: [0, .55, .55, 0], rotate: [-60, 24], scale: [.8, 1.06] },
          { at: 80, duration: 1730, ease: 'easeInOut' }],
        [inner, { opacity: [0, .4, .4, 0], rotate: [70, -40], scale: [1.15, .95] },
          { at: 120, duration: 1600, ease: 'easeInOut' }],
        { at: 100, run: () => outerLine.animate({ strokeEnd: .92 }, { duration: 1050, ease: 'easeInOut' }) },
        { at: 250, run: () => innerLine.animate({ strokeEnd: .85 }, { duration: 950, ease: 'easeInOut' }) },
        [title, { opacity: [0, 1], y: [16, 0] }, { at: 420, duration: 650, ease: 'easeOut' }],
        [caption, { opacity: [0, 1], y: [9, 0] }, { at: 730, duration: 560, ease: 'easeOut' }],
        [wave, { opacity: [0, .95, 0], scale: [.45, 1.45, 1.8] }, { at: 1050, duration: 800, ease: 'easeOut' }],
      ])
      if (!await entrance.finished) return false
    }
    if (motion.disposed) return false
    await reveal()
    if (motion.disposed) return false
    const stage = view('stage')
    const scale = stage.scaleX
    return motion.timeline([
      [root, { opacity: [1, 0] }, { duration: reduced ? 150 : 500, ease: 'easeInOut' }],
      [stage, { scale: reduced ? scale : [scale, scale * 1.08], y: reduced ? 0 : [0, -18] },
        { duration: reduced ? 150 : 500, ease: 'easeInOut' }],
    ]).finished
  })()

  return { finished, dispose() { motion.dispose(); drawings.forEach(drawing => drawing.dispose()) } }
}
