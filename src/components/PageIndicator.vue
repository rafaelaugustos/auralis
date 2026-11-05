<script setup lang="ts">
import { onUnmounted, watch } from 'nativescript-vue'
import { type EventData, type GridLayout } from '@nativescript/core'
import { bind, motionScope, set, type MotionValue } from '@rafaelaugusto/jolt'
import { slides, type SlideIndex } from '../onboarding'

const props = defineProps<{ index: SlideIndex; progress: MotionValue; playing: boolean }>()
const emit = defineEmits<{ select: [index: SlideIndex]; toggle: [] }>()
const motion = motionScope()
let marker: GridLayout | undefined
const bound = new WeakSet<GridLayout>()
function fillLoaded(event: EventData) {
  const fill = event.object as GridLayout
  if (bound.has(fill)) return
  bound.add(fill)
  fill.originX = 0
  motion.use(() => bind(fill, { scaleX: props.progress }))
}
function loaded(event: EventData) {
  marker = event.object as GridLayout
  set(marker, { x: props.index * 28 })
}
watch(() => props.index, index => {
  if (marker) motion.animate(marker, { x: index * 28 }, { type: 'spring', duration: 420, bounce: 0.1 })
})
onUnmounted(() => motion.dispose())
</script>

<template>
  <GridLayout width="144" height="44" horizontalAlignment="center">
    <GridLayout width="128" height="27" borderRadius="13.5" backgroundColor="#aaa7ed14" />
    <AbsoluteLayout width="128" height="27" isUserInteractionEnabled="false" accessibilityHidden="true">
      <GridLayout v-for="i in 3" :key="i" :left="13 + (i - 1) * 28" :opacity="i - 1 === index ? 0 : 1" top="10.5" width="6" height="6" borderRadius="3" backgroundColor="#d4d1ff44" />
      <GridLayout left="4" top="10" width="24" height="7" borderRadius="3.5" backgroundColor="#d9d7ff44" clipToBounds="true" @loaded="loaded">
        <GridLayout width="24" height="7" borderRadius="3.5" backgroundColor="#eeedff" @loaded="fillLoaded" />
      </GridLayout>
    </AbsoluteLayout>
    <GridLayout columns="28,28,28,44" width="128">
      <Button v-for="(slide, i) in slides" :key="slide.id" :col="i" text="" class="dot-button" accessible="true" accessibilityRole="button"
        :accessibilityLabel="`${slide.label}, page ${i + 1} of ${slides.length}${i === index ? ', selected' : ''}`"
        @tap="emit('select', i as SlideIndex)" />
      <Button col="3" :text="playing ? 'Ⅱ' : '▶'" class="dot-button" fontSize="10" color="#d4d1ff99"
        accessible="true" accessibilityRole="button" :accessibilityLabel="playing ? 'Pause slideshow' : 'Resume slideshow'" @tap="emit('toggle')" />
    </GridLayout>
  </GridLayout>
</template>
