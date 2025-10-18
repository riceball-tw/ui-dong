<template>
  <div class="relative">
    <ProgressRoot
      :model-value="progress"
      as-child>
      <svg
        style="--stroke-width: 6px"
        class="w-full h-full"
        viewBox="0 0 100 100">
        <!-- Background circle -->
        <path
          :d="trackPath"
          class="fill-none stroke-muted stroke-(length:--stroke-width)"/>
        <!-- Progress circle -->
        <ProgressIndicator as-child>
          <path
            :d="trackPath"
            class="fill-none stroke-primary stroke-(length:--stroke-width) transition-[stroke-dasharray,opacity] duration-700 data-[value='0']:opacity-0"
            :style="{
              'stroke-linecap': 'round',
              'stroke-dasharray': `${dashOffset}px, ${circumference}px`,
              'stroke-dashoffset': '0px',
            }"/>
        </ProgressIndicator>
      </svg>
      <div class="absolute inset-0 flex items-center justify-center">
        <span class="font-bold text-foreground">{{ progress }}%</span>
      </div>
    </ProgressRoot>
  </div>
</template>

<script setup lang="ts">
import { ProgressIndicator, ProgressRoot } from 'reka-ui'
import { computed } from 'vue'

const RADIUS = 45
const circumference = 2 * Math.PI * RADIUS

const props = defineProps<{
  progress: number;
}>()

const dashOffset = computed(() =>
  (props.progress / 100) * circumference,
)

const trackPath = computed(() => {
  const r = RADIUS
  return `
          M 50 50
          m 0 -${r}
          a ${r} ${r} 0 1 1 0 ${r * 2}
          a ${r} ${r} 0 1 1 0 -${r * 2}
          `
})
</script>