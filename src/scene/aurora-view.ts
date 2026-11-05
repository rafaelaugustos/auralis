import { AbsoluteLayout, Application, GridLayout } from '@nativescript/core'
import { motionScope, onReducedMotion, particles, reducedMotion, set, type MotionScope, type TimelineStep } from '@rafaelaugusto/jolt'
import { shape, type Shape } from '@rafaelaugusto/jolt/shapes'
import { composition, type SlideIndex } from '../onboarding'
import { createEmblems, createTeammates, createTools, drawIcon, place, surface, type Card } from './artwork'
import { entryFlight, exitFlight, sceneTiming } from './choreography'

/** Native artwork. Vue owns the screen state; this view owns only its drawing and motion. */
export class AuroraView extends GridLayout {
  private resources?: MotionScope
  private floating?: MotionScope
  private atmosphere?: MotionScope
  private transition?: MotionScope
  private drawings: Shape[] = []
  private cards: Card[][] = []
  private groups: AbsoluteLayout[] = []
  private horizon?: AbsoluteLayout
  private glow?: AbsoluteLayout
  private emitters?: AbsoluteLayout
  private flash?: GridLayout
  private burst?: GridLayout
  private current: SlideIndex = 0
  private dimensions = ''
  private queued = false

  constructor() {
    super()
    this.isUserInteractionEnabled = false
    this.accessibilityHidden = true
    this.on('layoutChanged', this.schedule)
  }

  override onLoaded() {
    super.onLoaded()
    this.schedule()
  }

  private schedule = () => {
    if (this.queued) return
    this.queued = true
    void Promise.resolve().then(() => {
      this.queued = false
      const { width, height } = this.getActualSize()
      if (!this.isLoaded || width <= 0 || height <= 0) return
      const dimensions = `${width.toFixed(1)}:${height.toFixed(1)}`
      if (dimensions === this.dimensions) return
      this.clear()
      this.dimensions = dimensions
      this.build(width, height)
      this.notify({ eventName: 'sceneReady', object: this })
    })
  }

  private build(width: number, height: number) {
    const scope = this.resources = motionScope()
    const scale = composition(width, height, this.current).scale
    scope.gradient(this, { type: 'linear', angle: 155, colors: ['#080a25', '#111445', '#0b0921'] })
    const canvas = new AbsoluteLayout()
    canvas.width = 402
    canvas.height = height / scale
    canvas.horizontalAlignment = 'left'
    canvas.verticalAlignment = 'top'
    canvas.originX = canvas.originY = 0
    canvas.scaleX = canvas.scaleY = scale
    canvas.translateX = (width - 402 * scale) / 2
    this.addChild(canvas)

    const violet = surface(canvas, -170, 40, 560, 620)
    scope.gradient(violet, { type: 'radial', colors: ['#4448bdbb', '#31377c44', '#35308700'], radius: 0.59 })
    const blue = surface(canvas, 20, -220, 280, 740)
    scope.gradient(blue, { type: 'radial', colors: ['#26238988', '#201b6d00'], radius: 0.76 })
    const aurora = surface(canvas, 205, -160, 290, 650)
    scope.gradient(aurora, { type: 'radial', colors: ['#57e6c466', '#276c9738', '#08122e00'], radius: 0.7 })

    const glow = this.glow = place(canvas, new AbsoluteLayout(), 0, 0, 402, 470)
    const bloom = surface(glow, -49, 44, 500, 500)
    scope.gradient(bloom, { type: 'radial', colors: ['#faffff', '#c6e7ffe0', '#9196ff77', '#6e75e000'], stops: [0, 0.19, 0.43, 1], radius: 0.5 })
    const core = surface(glow, 1, 104, 400, 400)
    scope.gradient(core, { type: 'radial', colors: ['#ffffff', '#ffffffee', '#dbfaff00'], stops: [0, 0.25, 1], radius: 0.48 })

    for (let i = 0; i < 3; i++) this.groups.push(place(canvas, new AbsoluteLayout(), 0, 0, 402, 470))
    this.cards = [createEmblems(this.groups[0]!, scope, this.drawings), createTeammates(this.groups[1]!, scope, this.drawings), createTools(this.groups[2]!, scope, this.drawings)]
    this.groups.forEach((group, index) => { group.visibility = index === this.current ? 'visible' : 'hidden' })

    const emitters = this.emitters = place(canvas, new AbsoluteLayout(), 0, 0, 402, 470)
    const dust = surface(emitters, 27, -40, 348, 343)
    const glitter = surface(emitters, 60, 94, 282, 210)
    this.burst = surface(emitters, 40, 94, 322, 210)
    const flash = this.flash = surface(emitters, -29, 54, 460, 460)
    scope.gradient(flash, { type: 'radial', colors: ['#f4ffffdd', '#a1d7ff77', '#7877fe00'], radius: 0.5 })
    flash.opacity = 0

    // Fixed seeds keep the composition stable while native animations supply the twinkle.
    const stars: GridLayout[] = []
    for (let i = 0; i < 19; i++) {
      const x = 35 + ((i * 73 + 31) % 330)
      const y = 144 + ((i * 47 + 9) % 163)
      const star = drawIcon(emitters, 'spark', x, y, i % 5 === 0 ? 5 : 2.5, this.drawings, true)
      star.opacity = 0.25
      stars.push(star)
    }

    const horizon = this.horizon = place(canvas, new AbsoluteLayout(), 0, 284, 402, height / scale)
    const extra = Math.max(0, (width / scale - 402) / 2)
    const paint = surface(horizon, -extra, 0, 402 + extra * 2, height / scale)
    const bottom = height / scale
    this.drawings.push(shape(paint, {
      viewBox: [-extra, 0, 402 + extra * 2, bottom],
      d: `M${-extra} 17 Q${-extra} 0 ${18 - extra} 0 L84 0 C120 0 128 31 201 31 C274 31 282 0 318 0 L${384 + extra} 0 Q${402 + extra} 0 ${402 + extra} 17 L${402 + extra} ${bottom} L${-extra} ${bottom} Z`,
      fill: '#090713', stroke: 'transparent', strokeWidth: 0,
    }))
    const lowerGlow = surface(horizon, -75, 265, 552, 510)
    scope.gradient(lowerGlow, { type: 'radial', colors: ['#15115fb8', '#10104377', '#09071300'], radius: 0.72 })

    const offset = this.current === 0 ? 0 : 91
    set([horizon, glow, emitters], { y: offset })
    const attachAmbient = () => {
      let dustOff = () => {}
      let glitterOff = () => {}
      const update = () => {
        dustOff(); glitterOff()
        if (reducedMotion()) return
        dustOff = particles(dust, { source: 'bottom', colors: ['#c4d5ff', '#ffffff', '#b5b1ff'], rate: 58, lifetime: 2100, size: 1.6, velocity: 45, velocityRange: 28, angle: -90, spread: 110, gravity: -7 })
        glitterOff = particles(glitter, { source: 'bottom', colors: ['#ffffff', '#dcf8ff'], rate: 16, lifetime: 1700, size: 3.1, velocity: 26, velocityRange: 15, angle: -90, spread: 140 })
      }
      update()
      const unwatch = onReducedMotion(update)
      return () => { unwatch(); dustOff(); glitterOff() }
    }
    scope.use(attachAmbient)
    const startAtmosphere = () => {
      this.atmosphere?.dispose()
      const atmosphere = this.atmosphere = motionScope()
      if (reducedMotion()) {
        set([aurora, violet], { opacity: 0.7, x: 0 })
        set(stars, { opacity: 0.25 })
        return
      }
      stars.forEach((star, i) => atmosphere.animate(star, { opacity: [0.05, 0.8, 0.05] }, { duration: 1600 + i * 130, repeat: Infinity, ease: 'easeInOut' }))
      atmosphere.animate(aurora, { opacity: [0.6, 1, 0.6], x: [0, -20, 0] }, { duration: 7500, repeat: Infinity, ease: 'easeInOut' })
      atmosphere.animate(violet, { opacity: [0.7, 1, 0.7] }, { duration: 6200, repeat: Infinity, ease: 'easeInOut' })
    }
    let motionPreference = reducedMotion()
    const refreshMotion = () => {
      const preference = reducedMotion()
      if (preference === motionPreference) return
      motionPreference = preference
      this.startFloating()
      startAtmosphere()
    }
    // Reattach after backgrounding and catch preferences changed while suspended.
    scope.use(() => {
      refreshMotion()
      return onReducedMotion(refreshMotion)
    })
    this.startFloating()
    startAtmosphere()
  }

  private startFloating() {
    this.floating?.dispose()
    const scope = this.floating = motionScope()
    if (reducedMotion()) {
      this.cards[this.current]?.forEach(card => set(card.art, { y: 0, rotate: 0 }))
      return
    }
    this.cards[this.current]?.forEach((card, index) => {
      scope.animate(card.art, { y: [0, index % 2 ? 7 : -9, 0], rotate: [0, index % 2 ? -1.8 : 1.8, 0] }, {
        duration: 3800 + index * 370, repeat: Infinity, ease: 'easeInOut',
      })
    })
  }

  async show(index: SlideIndex) {
    if (index === this.current || !this.resources || Application.suspended) return
    this.transition?.dispose()
    this.floating?.dispose()
    const transition = this.transition = motionScope()
    const previous = this.current
    this.current = index
    const incoming = this.cards[index]!
    const outgoing = this.cards[previous]!
    this.groups[index]!.visibility = 'visible'
    const reduced = reducedMotion()
    const offset = index === 0 ? 0 : 91
    const moving = [this.horizon!, this.glow!, this.emitters!]
    const steps: TimelineStep[] = [
      [moving, { y: offset }, { at: reduced ? 0 : sceneTiming.horizonAt, duration: reduced ? 0 : sceneTiming.horizonDuration, ease: 'easeInOut' }],
    ]

    // Exit below both horizon positions so a moving mask never uncovers a card.
    const pool = Math.max(previous === 0 ? 284 : 375, index === 0 ? 284 : 375)
    outgoing.forEach((card, i) => {
      if (reduced) {
        steps.push([card.view, { opacity: 0 }, { at: 0, duration: 180 }])
      } else {
        const flight = exitFlight(card, pool, i, outgoing.length)
        steps.push([card.view, flight.keyframes, { ...flight.options, at: 0 }])
      }
    })
    incoming.forEach((card, i) => {
      set(card.art, { y: 0, rotate: 0 })
      if (reduced) {
        set(card.view, { x: 0, y: 0, scale: 1, rotate: card.rotation })
        steps.push([card.view, { opacity: [0, card.opacity] }, { at: 80, duration: 230 }])
      } else {
        const flight = entryFlight(card, pool, i)
        steps.push([card.view, flight.keyframes, { ...flight.options, at: 0 }])
      }
    })

    if (!reduced) {
      steps.push([this.flash!, { opacity: [0, 0.95, 0.35, 0], scale: [0.85, 1.12, 1.06, 1] }, {
        at: 110, duration: 980, times: [0, 0.23, 0.55, 1], ease: 'easeInOut',
      }])
      transition.use(() => particles(this.burst!, { source: 'bottom', colors: ['#ffffff', '#d8e7ff', '#d7bbff'], rate: 520, duration: 620, lifetime: 1350, size: 2.1, velocity: 210, velocityRange: 65, angle: -90, spread: 95, gravity: 70 }))
      // Card-local glitter follows the tumbling artwork into and out of the pool.
      for (const card of [...outgoing, ...incoming]) {
        transition.use(() => particles(card.art, { source: 'bottom', colors: ['#ffffff', '#dcddff'], rate: 30, duration: 650, lifetime: 800, size: 1.7, velocity: 28, velocityRange: 18, angle: -90, spread: 150 }))
      }
    }

    await transition.timeline(steps).finished
    if (transition.disposed) return
    this.groups[previous]!.visibility = 'hidden'
    this.startFloating()
  }

  private clear() {
    this.transition?.dispose()
    this.floating?.dispose()
    this.atmosphere?.dispose()
    this.resources?.dispose()
    this.drawings.forEach(drawing => drawing.dispose())
    this.drawings = []
    this.cards = []
    this.groups = []
    this.removeChildren()
    this.dimensions = ''
  }

  override disposeNativeView() {
    this.clear()
    super.disposeNativeView()
  }
}
