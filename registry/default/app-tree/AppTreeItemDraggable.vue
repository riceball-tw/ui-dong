<script setup lang="ts" generic="T extends { children?: T[], name?: string }">
import type { Instruction } from '@atlaskit/pragmatic-drag-and-drop-hitbox/tree-item'
import type { FlattenedItem } from 'reka-ui'
import { attachInstruction, extractInstruction } from '@atlaskit/pragmatic-drag-and-drop-hitbox/tree-item'
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine'
import { draggable, dropTargetForElements, monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { pointerOutsideOfPreview } from '@atlaskit/pragmatic-drag-and-drop/element/pointer-outside-of-preview'
import { setCustomNativeDragPreview } from '@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview'
import { unrefElement } from '@vueuse/core'
import { TreeItem } from 'reka-ui'
import { computed, h, ref, render, watchEffect } from 'vue'
import { cn } from '@/lib/utils'

const props = defineProps<{
  item: FlattenedItem<T>
  getKey: (item: T) => string
}>()

const emits = defineEmits<{ (e: 'dragStart', value: { item: FlattenedItem<T> }): void }>()

// Just like TreeItem
defineSlots<{
  default?: (props: {
    isExpanded: boolean
    isSelected: boolean
    isIndeterminate: boolean | undefined
    handleToggle: () => void
    handleSelect: () => void
  }) => any
}>()

const elRef = ref()
const isDragging = ref(false)
const isDraggedOver = ref(false)
const instruction = ref<Extract<Instruction, { type: 'reorder-above' | 'reorder-below' | 'make-child' }> | null>(null)

const mode = computed(() => {
  if (props.item.hasChildren)
    return 'expanded'
  if (props.item.index + 1 === props.item.parentItem?.children?.length)
    return 'last-in-group'
  return 'standard'
})

watchEffect((onCleanup) => {
  const currentElement = unrefElement(elRef)

  if (!currentElement)
    return

  const itemId = props.getKey(props.item.value)

  const dndFunction = combine(
    draggable({
      element: currentElement,
      getInitialData: () => ({ id: itemId, item: props.item.value }),
      onDragStart: () => {
        isDragging.value = true
        emits('dragStart', { item: props.item })
      },
      onDrop: () => {
        isDragging.value = false
      },
      onGenerateDragPreview({ nativeSetDragImage }) {
        setCustomNativeDragPreview({
          getOffset: pointerOutsideOfPreview({ x: '16px', y: '8px' }),
          render: ({ container }) => {
            return render(h(
              'div',
              { class: 'bg-background rounded-md text-sm font-medium px-3 py-1.5' },
              props.item.value?.name ?? itemId,
            ), container)
          },
          nativeSetDragImage,
        })
      },
    }),

    dropTargetForElements({
      element: currentElement,
      getData: ({ input, element }) => {
        const data = { id: itemId }

        return attachInstruction(data, {
          input,
          element,
          indentPerLevel: 8,
          currentLevel: props.item.level,
          mode: mode.value,
          block: [],
        })
      },
      canDrop: ({ source }) => {
        return source.data.id !== itemId
      },
      onDrag: ({ self }) => {
        instruction.value = extractInstruction(self.data) as typeof instruction.value
      },
      onDragEnter: ({ source }) => {
        if (source.data.id !== itemId) {
          isDraggedOver.value = true
        }
      },
      onDragLeave: () => {
        isDraggedOver.value = false
        instruction.value = null
      },
      onDrop: () => {
        isDraggedOver.value = false
        instruction.value = null
      },
      getIsSticky: () => true,
    }),

    monitorForElements({
      canMonitor: ({ source }) => {
        return source.data.id !== itemId
      },
    }),
  )

  onCleanup(() => dndFunction())
})
</script>

<template>
  <TreeItem
    ref="elRef"
    v-slot="slotProps"
    :value="item.value"
    :level="item.level"
    class="relative w-full border-none"
  >
    <!-- before 偽元素用於覆蓋透明度色塊表示抓取中，不使用 opacity 是因為避免透露背景 -->
    <div :class="cn(isDragging && 'relative before:absolute before:inset-0 before:bg-primary-foreground/40', 'w-full')">
      <slot v-bind="slotProps" />
    </div>
    <div
      v-if="instruction"
      class="absolute h-full w-full top-0 z-20 border-primary "
      :style="{
        left: `${instruction?.currentLevel * instruction?.indentPerLevel}px`,
        width: `calc(100% - ${instruction?.currentLevel * instruction?.indentPerLevel}px)`,
      }"
      :class="{
        'border-b-2': instruction?.type === 'reorder-below',
        'border-t-2': instruction?.type === 'reorder-above',
        'border-2 rounded border-dashed': instruction?.type === 'make-child',
      }"
    />
  </TreeItem>
</template>
