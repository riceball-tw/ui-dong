<script setup lang="ts">
import type { TabsTriggerProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import { reactiveOmit } from '@vueuse/core'
import { TabsTrigger, useForwardProps } from 'reka-ui'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils.ts'

const props = defineProps<TabsTriggerProps & { class?: HTMLAttributes['class'] } & {
  isHideable: boolean
}>()

const emit = defineEmits(['close'])

const delegatedProps = reactiveOmit(props, 'class')

const forwardedProps = useForwardProps(delegatedProps)

function handleCloseTab() {
  emit('close', props.value)
}
</script>

<template>
  <TabsTrigger
    data-slot="tabs-trigger"
    v-bind="forwardedProps"
    :class="cn(
      `data-[state=active]:font-bold data-[state=active]:text-primary data-[state=active]:border-primary data-[state=active]:bg-sidebar`,
      `group relative cursor-pointer bg-muted dark:data-[state=active]:text-primary focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring text-foreground dark:text-muted-foreground inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 px-4 py-6 text-sm font-medium whitespace-nowrap transition-colors  focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 border-b-2`,
      props.class,
      isHideable && 'pr-10',
    )"
  >
    <slot />
    <Button v-if="isHideable" class="group-hover:opacity-80 opacity-0 hover:opacity-100 cursor-pointer absolute right-0 top-1/2 -translate-y-1/2" data-vitest-id="custom-tabs-trigger-close-button" variant="link" @click="handleCloseTab">
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><!-- Icon from Material Symbols by Google - https://github.com/google/material-design-icons/blob/master/LICENSE --><path fill="currentColor" d="m12 13.4l-2.9 2.9q-.275.275-.7.275t-.7-.275t-.275-.7t.275-.7l2.9-2.9l-2.9-2.875q-.275-.275-.275-.7t.275-.7t.7-.275t.7.275l2.9 2.9l2.875-2.9q.275-.275.7-.275t.7.275q.3.3.3.713t-.3.687L13.375 12l2.9 2.9q.275.275.275.7t-.275.7q-.3.3-.712.3t-.688-.3z" /></svg>
    </Button>
  </TabsTrigger>
</template>
