<script setup lang="ts">
import { nextTick, onBeforeUnmount } from 'nativescript-vue'
import { type EventData, type GridLayout, type View } from '@nativescript/core'
import { playLaunch } from '../launch/launch-animation'

const emit = defineEmits<{ reveal: []; finished: [] }>()
let playback: ReturnType<typeof playLaunch> | undefined
let disposed = false

function layout(event: EventData) {
  const root = event.object as GridLayout
  const size = root.getActualSize()
  if (!size.width || !size.height || !root.isLoaded || disposed) return
  const stage = root.getViewById<View>('launch-stage')
  stage.scaleX = stage.scaleY = Math.min(1, (size.width - 16) / 380, (size.height - 20) / 430)
  if (!playback) void start(root)
}

async function start(root: GridLayout) {
  try {
    playback = playLaunch(root, async () => { emit('reveal'); await nextTick() })
    if (await playback.finished && !disposed) emit('finished')
  } catch (error) {
    console.warn('[Auralis] Launch animation unavailable:', error)
    if (!disposed) { emit('reveal'); emit('finished') }
  }
}

onBeforeUnmount(() => { disposed = true; playback?.dispose() })
</script>

<template>
  <GridLayout backgroundColor="#090b26" @loaded="layout" @layoutChanged="layout"
    accessible="true" accessibilityLabel="Auralis. Make room for possibility." automationText="launch-screen">
    <AbsoluteLayout id="launch-stage" width="380" height="430" horizontalAlignment="center" verticalAlignment="middle">
      <GridLayout id="launch-aura" left="0" top="-20" width="380" height="380" opacity="0">
        <GridLayout id="launch-aura-paint" />
      </GridLayout>
      <GridLayout id="launch-orbit" left="15" top="-5" width="350" height="350" opacity="0">
        <GridLayout id="launch-orbit-paint" />
      </GridLayout>
      <GridLayout id="launch-inner" left="40" top="20" width="300" height="300" opacity="0">
        <GridLayout id="launch-inner-paint" />
      </GridLayout>
      <GridLayout id="launch-wave" left="15" top="-5" width="350" height="350" opacity="0">
        <GridLayout id="launch-wave-paint" />
      </GridLayout>
      <Image id="launch-mark" left="50" top="30" width="280" height="280" src="~/assets/auralis-mark.png" stretch="aspectFit" accessible="false" />
      <GridLayout id="launch-motes" left="165" top="145" width="50" height="50" />
      <Label id="launch-title" left="0" top="325" width="380" height="45" text="AURALIS"
        textAlignment="center" fontSize="29" fontWeight="600" letterSpacing="0.24" color="#faf6ff" opacity="0" accessible="false" />
      <Label id="launch-caption" left="0" top="383" width="380" height="25" text="Make room for possibility."
        textAlignment="center" fontSize="12" letterSpacing="0.035" color="#b8b4d0" opacity="0" accessible="false" />
    </AbsoluteLayout>
  </GridLayout>
</template>
