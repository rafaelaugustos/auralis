<script setup lang="ts">
import { onUnmounted } from 'nativescript-vue'
import { type Button, type EventData } from '@nativescript/core'
import { motionScope } from '@rafaelaugusto/jolt'

defineProps<{ last: boolean }>()
const emit = defineEmits<{ next: [] }>()
const motion = motionScope()
const registered = new WeakSet<Button>()
function loaded(event: EventData) {
  const button = event.object as Button
  if (registered.has(button)) return
  registered.add(button)
  motion.gradient(button, { type: 'linear', angle: 100, colors: ['#ffffff', '#ffffff', '#dad9e4'], stops: [0, 0.68, 1] })
  motion.press(button, { scale: 0.965 }, { type: 'spring', duration: 280, bounce: 0.1 })
}
onUnmounted(() => motion.dispose())
</script>

<template>
  <Button :text="last ? 'Replay  ↻' : 'Next  →'" class="continue-button" accessible="true" accessibilityRole="button"
    :accessibilityLabel="last ? 'Replay the Auralis introduction' : 'Next page'"
    @loaded="loaded" @tap="emit('next')" />
</template>
