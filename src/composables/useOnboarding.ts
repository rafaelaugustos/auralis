import { nextTick, onUnmounted, ref } from 'nativescript-vue'
import { Application, type GridLayout, type View, type SwipeGestureEventData, SwipeDirection } from '@nativescript/core'
import { motionScope, reducedMotion, set, type TimelineStep } from '@rafaelaugusto/jolt'
import { adjacentSlide, type SlideIndex } from '../onboarding'
import type { AuroraView } from '../scene/aurora-view'
import type { GradientTitle } from '../native/gradient-title'
import { useCarouselClock } from './useCarouselClock'

export function useOnboarding() {
  const index = ref<SlideIndex>(0)
  const transitioning = ref(false)
  const motion = motionScope()
  let scene: AuroraView | undefined
  let copy: GridLayout | undefined
  const shine = (delay = 0) => copy?.getViewById<GradientTitle>('copy-accent')?.playSheen(delay)
  const clock = useCarouselClock(() => goTo(adjacentSlide(index.value, 1)))

  async function goTo(target: SlideIndex) {
    if (transitioning.value || target === index.value || Application.suspended || motion.disposed) return
    clock.hold()
    transitioning.value = true
    try {
      const artwork = scene?.show(target)
      if (copy) await motion.animate(copy, { opacity: 0, y: reducedMotion() ? 0 : 16 }, { duration: 180, ease: 'easeIn' }).finished
      if (motion.disposed) return
      index.value = target
      await nextTick()
      if (copy) {
        const words = ['copy-heading', 'copy-accent', 'copy-description'].map(id => copy!.getViewById<View>(id))
        set(words, { opacity: 0, y: reducedMotion() ? 0 : 28 })
        set(copy, { opacity: 1, y: 0 })
        const steps: TimelineStep[] = words.map((word, i) => [word, { opacity: [0, 1], y: [reducedMotion() ? 0 : 28, 0] }, {
          at: reducedMotion() ? 0 : 60 + i * 85, duration: reducedMotion() ? 200 : 480, ease: 'easeOut',
        }])
        const entrance = motion.timeline(steps)
        shine(260)
        await entrance.finished
      }
      await artwork
    } finally {
      transitioning.value = false
      if (!motion.disposed) clock.start()
    }
  }

  const next = () => goTo(adjacentSlide(index.value, 1))
  const previous = () => goTo(adjacentSlide(index.value, -1))
  const swipe = (event: SwipeGestureEventData) => {
    if (event.direction === SwipeDirection.left) void next()
    if (event.direction === SwipeDirection.right) void previous()
  }
  onUnmounted(() => motion.dispose())

  return {
    index, transitioning, goTo, next, previous, swipe, shine,
    progress: clock.progress, playing: clock.playing, togglePlayback: clock.toggle,
    start: () => { shine(); clock.start() },
    attachScene: (view: AuroraView) => { scene = view },
    attachCopy: (view: GridLayout) => { copy = view },
  }
}
