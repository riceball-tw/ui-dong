<script setup lang="ts" generic="T extends { children?: T[] }">
import type { FlattenedItem } from 'reka-ui'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const props = defineProps<{
  item: FlattenedItem<T>
  isExpanded: boolean
  isSelected: boolean
  isIndeterminate: boolean
  isCheckboxShown?: boolean
  isDraggable?: boolean
  isItemVisible: (item: FlattenedItem<T>) => boolean
  handleSelect: () => void
  toggleExpandAll: (item: FlattenedItem<T>) => void
  moveItemUp: (item: FlattenedItem<T>) => void
  moveItemDown: (item: FlattenedItem<T>) => void
  addItem: (parentNode: T, newNode: T) => void
}>()
</script>

<template>
  <div
    v-show="isItemVisible(item)"
    :class="
      cn(
        'z-10 flex rounded hover:bg-muted bg-background w-full',
        isSelected && 'bg-primary text-primary-foreground hover:bg-primary',
      )
    "
  >
    <button
      :class="cn('flex items-center gap-2 cursor-pointer w-full')"
      @click.stop="handleSelect"
    >
      <!-- 嵌套項目收合 -->
      <div class="flex h-full items-center">
        <template v-if="item.value.children && item.value.children.length > 0">
          <button
            class="flex items-center px-2 -ml-2 h-full cursor-pointer"
            @click.stop="toggleExpandAll(item)"
          >
            <svg
              :class="isExpanded ? 'rotate-90' : ''"
              class="ransition-transform" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
            ><!-- Icon from Material Symbols by Google - https://github.com/google/material-design-icons/blob/master/LICENSE --><path fill="currentColor" d="M12.6 12L8.7 8.1q-.275-.275-.275-.7t.275-.7t.7-.275t.7.275l4.6 4.6q.15.15.213.325t.062.375t-.062.375t-.213.325l-4.6 4.6q-.275.275-.7.275t-.7-.275t-.275-.7t.275-.7z" /></svg>
          </button>
          <slot v-if="!isExpanded" name="closeItemIcon">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><!-- Icon from Material Symbols by Google - https://github.com/google/material-design-icons/blob/master/LICENSE --><path fill="currentColor" d="M4 20q-.825 0-1.412-.587T2 18V6q0-.825.588-1.412T4 4h5.175q.4 0 .763.15t.637.425L12 6h8q.825 0 1.413.588T22 8v10q0 .825-.587 1.413T20 20zm0-2h16V8h-8.825l-2-2H4zm0 0V6z" /></svg>
          </slot>
          <slot v-else name="openItemIcon">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><!-- Icon from Material Symbols by Google - https://github.com/google/material-design-icons/blob/master/LICENSE --><path fill="currentColor" d="M4 20q-.825 0-1.412-.587T2 18V6q0-.825.588-1.412T4 4h5.175q.4 0 .763.15t.637.425L12 6h9q.425 0 .713.288T22 7t-.288.713T21 8h-9.825l-2-2H4v12l1.975-6.575q.2-.65.738-1.037T7.9 10h12.9q1.025 0 1.613.813t.312 1.762l-1.8 6q-.2.65-.737 1.038T19 20zm2.1-2H19l1.8-6H7.9zM4 11.45V6zM6.1 18l1.8-6z" /></svg>
          </slot>
        </template>
        <slot v-else name="itemIcon">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><!-- Icon from Material Symbols by Google - https://github.com/google/material-design-icons/blob/master/LICENSE --><path fill="currentColor" d="M19 19H8q-.825 0-1.412-.587T6 17V3q0-.825.588-1.412T8 1h6.175q.4 0 .763.15t.637.425l4.85 4.85q.275.275.425.638t.15.762V17q0 .825-.587 1.413T19 19m0-11h-3.5q-.625 0-1.062-.437T14 6.5V3H8v14h11zM4 23q-.825 0-1.412-.587T2 21V8q0-.425.288-.712T3 7t.713.288T4 8v13h10q.425 0 .713.288T15 22t-.288.713T14 23zM8 3v5zv14z" /></svg>
        </slot>
      </div>

      <button v-if="isCheckboxShown" @change="handleSelect">
        <svg v-if="isSelected" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><!-- Icon from Material Symbols by Google - https://github.com/google/material-design-icons/blob/master/LICENSE --><path fill="currentColor" d="m10.6 13.4l-2.15-2.15q-.275-.275-.7-.275t-.7.275t-.275.7t.275.7L9.9 15.5q.3.3.7.3t.7-.3l5.65-5.65q.275-.275.275-.7t-.275-.7t-.7-.275t-.7.275zM5 21q-.825 0-1.412-.587T3 19V5q0-.825.588-1.412T5 3h14q.825 0 1.413.588T21 5v14q0 .825-.587 1.413T19 21zm0-2h14V5H5zM5 5v14z" /></svg>

        <svg v-else-if="isIndeterminate" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><!-- Icon from Material Symbols by Google - https://github.com/google/material-design-icons/blob/master/LICENSE --><path fill="currentColor" d="M7 13h10v-2H7zm-2 8q-.825 0-1.412-.587T3 19V5q0-.825.588-1.412T5 3h14q.825 0 1.413.588T21 5v14q0 .825-.587 1.413T19 21zm0-2h14V5H5zM5 5v14z" /></svg>

        <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><!-- Icon from Material Symbols by Google - https://github.com/google/material-design-icons/blob/master/LICENSE --><path fill="currentColor" d="M5 21q-.825 0-1.412-.587T3 19V5q0-.825.588-1.412T5 3h14q.825 0 1.413.588T21 5v14q0 .825-.587 1.413T19 21zm0-2h14V5H5z" /></svg>
      </button>

      <div class="min-h-8 whitespace-nowrap h-full w-full flex items-center flex-1">
        <slot name="title" :item="item">
          Title
        </slot>
      </div>
    </button>
    <!-- Action -->
    <div class="flex">
      <slot name="action" :item="item" :add-item="addItem" />
      <slot v-if="props.isDraggable" name="action-move-up">
        <Button
          class="text-current"
          variant="link"
          size="icon"
          @click.stop="moveItemUp(item)"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><!-- Icon from Material Symbols by Google - https://github.com/google/material-design-icons/blob/master/LICENSE --><path fill="currentColor" d="m11 8.8l-2.9 2.9q-.275.275-.7.275t-.7-.275t-.275-.7t.275-.7l4.6-4.6q.3-.3.7-.3t.7.3l4.6 4.6q.275.275.275.7t-.275.7t-.7.275t-.7-.275L13 8.8V17q0 .425-.288.713T12 18t-.712-.288T11 17z" /></svg>
        </Button>
      </slot>
      <slot v-if="props.isDraggable" name="action-move-down">
        <Button
          class="text-current"
          variant="link"
          size="icon"
          @click.stop="moveItemDown(item)"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
            <!-- Icon from Material Symbols by Google - https://github.com/google/material-design-icons/blob/master/LICENSE --><path fill="currentColor" d="M11 14.2V6q0-.425.288-.712T12 5t.713.288T13 6v8.2l2.9-2.9q.275-.275.7-.275t.7.275t.275.7t-.275.7l-4.6 4.6q-.3.3-.7.3t-.7-.3l-4.6-4.6q-.275-.275-.275-.7t.275-.7t.7-.275t.7.275z" /></svg>
        </Button>
      </slot>
    </div>
  </div>
</template>
