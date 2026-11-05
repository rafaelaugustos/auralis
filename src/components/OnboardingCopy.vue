<script setup lang="ts">
import { computed } from 'nativescript-vue'
import { slides, type SlideIndex } from '../onboarding'

const props = defineProps<{ index: SlideIndex; titleSize: number; bodySize: number; descriptionGap: number }>()
const slide = computed(() => slides[props.index])
</script>

<template>
  <StackLayout horizontalAlignment="center">
    <Label id="copy-heading" :text="slide.heading" class="headline" :fontSize="titleSize" :height="titleSize * 1.3 * (index === 0 ? 2 : 1)" textWrap="true" />
    <GradientTitle id="copy-accent" :key="slide.accent" :text="slide.accent" class="headline accent" :fontSize="titleSize" :height="titleSize * 1.25" />
    <Label id="copy-description" :text="slide.description" class="description" :fontSize="bodySize" :marginTop="descriptionGap" textWrap="true" :height="bodySize * 3.5" />
  </StackLayout>
</template>
