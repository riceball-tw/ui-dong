<template>
  <TabsList
    data-slot="tabs-list"
    v-bind="delegatedProps"
    :class="cn(
      'text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-lg',
      props.class,
    )">
    <slot />
  </TabsList>
</template>

<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { reactiveOmit } from '@vueuse/core'
import { TabsList, type TabsListProps } from 'reka-ui'
import { cn } from "@/lib/utils.ts"

const props = defineProps<TabsListProps & { class?: HTMLAttributes['class'] }>()

const delegatedProps = reactiveOmit(props, 'class')
</script>
