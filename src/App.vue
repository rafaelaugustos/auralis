<script setup lang="ts">
import { computed, ref } from 'nativescript-vue'
import { Page, type EventData, type GridLayout } from '@nativescript/core'
import OnboardingCopy from './components/OnboardingCopy.vue'
import PageIndicator from './components/PageIndicator.vue'
import ContinueButton from './components/ContinueButton.vue'
import LaunchScreen from './components/LaunchScreen.vue'
import { useOnboarding } from './composables/useOnboarding'
import { composition } from './onboarding'
import type { AuroraView } from './scene/aurora-view'

const { index, next, goTo, swipe, attachScene, attachCopy, start, progress, playing, togglePlayback } = useOnboarding()
const launching = ref(true)
const contentVisible = ref(false)
function finishLaunch() { launching.value = false; start() }
const width = ref(402)
const height = ref(778)
const layout = computed(() => composition(width.value, height.value, index.value))
function measure(event: EventData) {
  const size = (event.object as GridLayout).getActualSize()
  if (size.width > 0) width.value = size.width
  if (size.height > 0) height.value = size.height
}
function pageLoaded(event: EventData) {
  const page = event.object as Page
  page.statusBarStyle = 'light'
}
</script>

<template>
  <Page actionBarHidden="true" backgroundColor="#090b26" @loaded="pageLoaded">
    <GridLayout @layoutChanged="measure" iosOverflowSafeArea="true">
      <GridLayout v-if="contentVisible" :isUserInteractionEnabled="!launching" @swipe="swipe">
        <AuroraView @sceneReady="attachScene($event.object as AuroraView)" />
        <Label text="A U R A L I S" class="wordmark" verticalAlignment="top" horizontalAlignment="center" accessibilityHidden="true" />
        <AbsoluteLayout>
          <GridLayout :left="(width - layout.copyWidth) / 2" :top="layout.copyTop" :width="layout.copyWidth"
            rows="auto,auto" @loaded="attachCopy($event.object as GridLayout)">
            <OnboardingCopy row="0" :index="index" :titleSize="layout.titleSize" :bodySize="layout.bodySize" :descriptionGap="layout.descriptionGap" />
            <PageIndicator row="1" :index="index" :progress="progress" :playing="playing" :marginTop="layout.paginationGap" @select="goTo" @toggle="togglePlayback" />
          </GridLayout>
        </AbsoluteLayout>
        <ContinueButton verticalAlignment="bottom" margin="0 34 24" :last="index === 2" @next="next" />
      </GridLayout>
      <LaunchScreen v-if="launching" @reveal="contentVisible = true" @finished="finishLaunch" />
    </GridLayout>
  </Page>
</template>
