<script setup lang="ts" generic="T extends { children?: T[] }">
import type { FlattenedItem } from 'reka-ui'
import { extractInstruction } from '@atlaskit/pragmatic-drag-and-drop-hitbox/tree-item'
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine'
import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { TreeItem, TreeRoot, TreeVirtualizer } from 'reka-ui'
import { computed, watch, watchEffect } from 'vue'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { tree, updateTree } from '@/lib/tree-dnd-utils.ts'
import { cn } from '@/lib/utils'
import AppTreeItem from './AppTreeItem.vue'
import AppTreeItemDraggable from './AppTreeItemDraggable.vue'

interface SearchDisabled {
  searchText?: never
  getText?: never
}

interface SearchEnabled<T> {
  searchText: string
  getText: (item: T) => string
}

const props = withDefaults(defineProps<{
  items: T[]
  selected?: T[] | T
  expanded?: string[]
  getKey: (item: T) => string
  multiple?: boolean
  isCheckboxShown?: boolean
  isDraggable?: boolean
  isLoading?: boolean
  estimateVirtualizedSize?: number
  virtualizedContainerHeight?: number
} & (SearchDisabled | SearchEnabled<T>)>(), {
  virtualizedContainerHeight: 500,
})

const emits = defineEmits<{
  (e: 'update:selected', value: T[] | T): void
  (e: 'update:expanded', value: string[]): void
  (e: 'update:items', value: T[]): void
}>()

const selectedItems = computed({
  get: () => props.selected,
  set: (value) => {
    if (value) {
      emits('update:selected', value)
    }
  },
})

const expandedItems = computed({
  get: () => props.expanded,
  set: (value) => {
    if (value) {
      emits('update:expanded', value)
    }
  },
})

const items = computed({
  get: () => props.items,
  set: value => emits('update:items', value),
})

// Based on the search, the key of "should be displayed item" and "should be displayed item's parent item" is dynamically calculated.
const searchKeys = computed<{
  visibleKeys: Set<string>
  parentKeys: Set<string>
}>(() => {
  const visibleKeys = new Set<string>()
  const parentKeys = new Set<string>()
  const searching = (props.searchText || '').trim().toLowerCase()

  const getItemText = (item: T): string => {
    if (!props.getText)
      throw new Error('Please provide `getText` to retrieve the text used for item comparison during the search.')
    return props.getText(item)
  }

  // 1. If the no search result, all item keys will be returned.
  if (!searching) {
    const collectAll = (targetItems: T[]) => {
      for (const i of targetItems) {
        visibleKeys.add(props.getKey(i))
        const children = (i).children || []
        if (children.length)
          collectAll(children)
      }
    }
    collectAll(items.value)
    return { visibleKeys, parentKeys }
  }

  // 2. If a search exists, display the searched item key and all its parent item keys.
  const calcSearchedItemAndParentKeys = (targetItems: T[], parents: T[] = []): void => {
    for (const i of targetItems) {
      const currentKey = props.getKey(i)
      const title = getItemText(i).toLowerCase()
      const children = (i).children || []
      const childMatched = calcSearchedItemAndParentKeys(children, [...parents, i])
      const selfMatched = title.includes(searching)

      if (selfMatched || childMatched) {
        visibleKeys.add(currentKey)

        for (const parent of parents) {
          const parentKey = props.getKey(parent)
          visibleKeys.add(parentKey)
          parentKeys.add(parentKey)
        }
      }
    }
  }
  calcSearchedItemAndParentKeys(items.value)
  return { visibleKeys, parentKeys }
})
const visibleKeySet = computed(() => searchKeys.value.visibleKeys)
const parentKeySet = computed(() => searchKeys.value.parentKeys)

// When searching or modifying data, the search will expand to include all parent items
watch(
  () => [props.searchText, items.value],
  () => {
    if (!props.searchText?.trim())
      return
    const current = new Set(expandedItems.value || [])
    const hasNewKeys = [...parentKeySet.value].some(key => !current.has(key))
    if (hasNewKeys) {
      expandedItems.value = [...new Set([...(expandedItems.value || []), ...parentKeySet.value])]
    }
  },
)
function isItemVisible(item: FlattenedItem<T>): boolean {
  return visibleKeySet.value.has(props.getKey(item.value))
}

function handleDragStart({ item }: { item: FlattenedItem<T> }) {
  // Items should be de-expanded during dragging to prevent them from being dragged onto themselves.
  const itemKey = props.getKey(item.value)
  if (expandedItems.value?.includes(itemKey)) {
    expandedItems.value = expandedItems.value.filter(key => key !== itemKey)
  }
}

watchEffect((onCleanup) => {
  if (!props.isDraggable)
    return

  const dndFunction = combine(
    monitorForElements({
      onDrop(args) {
        const { location, source } = args
        if (!location.current.dropTargets.length)
          return

        const itemId = source.data.id as string
        const item = source.data.item as T

        const target = location.current.dropTargets[0]
        const targetId = target.data.id as string

        const instruction = extractInstruction(target.data)

        if (instruction) {
          const newItems = updateTree(items.value, {
            type: 'instruction',
            instruction,
            itemId,
            targetId,
            item,
          }, props.getKey) ?? []
          items.value = newItems
        }
      },
    }),
  )

  onCleanup(() => {
    dndFunction()
  })
})

function findItemContainerAndIndex(targetItems: T[], itemKey: string, getKey: (item: T) => string): { container: T[], index: number } | null {
  for (let i = 0; i < targetItems.length; i++) {
    if (getKey(targetItems[i]) === itemKey) {
      return { container: targetItems, index: i }
    }
  }

  for (const item of targetItems) {
    if (item.children && item.children.length > 0) {
      const itemLocation = findItemContainerAndIndex(item.children as T[], itemKey, getKey)
      if (itemLocation) {
        return itemLocation
      }
    }
  }
  return null
}

/**
 * Move the project up in its sibling list, find the project and its previous siblings, and reorder them
 */
function moveItemUp(itemToMove: FlattenedItem<T>) {
  const itemKey = props.getKey(itemToMove.value)
  const itemLocation = findItemContainerAndIndex(items.value, itemKey, props.getKey)

  if (itemLocation && itemLocation.index > 0) {
    const { index } = itemLocation
    const precedingSibling = itemLocation.container[index - 1]
    const precedingSiblingKey = props.getKey(precedingSibling)

    const newItems = updateTree(items.value, {
      type: 'instruction',
      instruction: { type: 'reorder-above', currentLevel: itemToMove.level, indentPerLevel: 16 },
      itemId: itemKey,
      targetId: precedingSiblingKey,
      item: itemToMove.value,
    }, props.getKey)

    if (newItems) {
      items.value = newItems
    }
  }
}

/**
 * Move the project down the list of its siblings, find the project and all its subsequent siblings, and reorder them.
 */
function moveItemDown(itemToMove: FlattenedItem<T>) {
  const itemKey = props.getKey(itemToMove.value)
  const itemLocation = findItemContainerAndIndex(items.value, itemKey, props.getKey)

  if (itemLocation && itemLocation.index < itemLocation.container.length - 1) {
    const { index, container } = itemLocation
    const succeedingSibling = container[index + 1]
    const succeedingSiblingKey = props.getKey(succeedingSibling)

    const newItems = updateTree(items.value, {
      type: 'instruction',
      instruction: { type: 'reorder-below', currentLevel: itemToMove.level, indentPerLevel: 16 },
      itemId: itemKey,
      targetId: succeedingSiblingKey,
      item: itemToMove.value,
    }, props.getKey)

    if (newItems) {
      items.value = newItems
    }
  }
}

function getAllChildrenKeys(item: T): string[] {
  let keys: string[] = []
  if (!item.children) {
    return keys
  }
  for (const child of item.children) {
    keys.push(props.getKey(child))
    keys = keys.concat(getAllChildrenKeys(child))
  }
  return keys
}

function toggleExpandAll(item: FlattenedItem<T>) {
  const itemKey = props.getKey(item.value)
  const isExpanded = expandedItems.value?.includes(itemKey)
  const childrenKeys = getAllChildrenKeys(item.value)

  if (isExpanded) {
    // Collapse all
    const keysToToggle = [itemKey, ...childrenKeys]
    if (expandedItems.value) {
      expandedItems.value = expandedItems.value.filter(key => !keysToToggle.includes(key))
    }
  }
  else {
    // Expand all
    const keysToToggle = [itemKey, ...childrenKeys]
    expandedItems.value = [...new Set([...(expandedItems.value || []), ...keysToToggle])]
  }
}

function addItem(parentNode: T, newNode: T) {
  const parent = tree.find(items.value, props.getKey(parentNode), props.getKey)
  if (parent) {
    if (!parent.children) {
      parent.children = [] as any
    }
    else {
      parent.children.push(newNode)
    }
  }
}
</script>

<template>
  <div class="flex flex-col">
    <slot name="before-tree" :add-item="addItem" />
    <TreeRoot
      v-slot="{ flattenItems }"
      v-model:expanded="expandedItems"
      v-model="selectedItems"
      :disabled="isLoading"
      style="--tree-indent: 1rem;"
      :class="cn(
        isLoading && 'pointer-events-none',
        `list-none select-none text-sm font-medium relative before:absolute before:inset-0 before:bg-[repeating-linear-gradient(to_right,transparent_0,transparent_calc(var(--tree-indent)-1px),var(--border)_calc(var(--tree-indent)-1px),var(--border)_calc(var(--tree-indent)))]`)"
      :items="items"
      :get-key="props.getKey"
      :multiple
      v-bind="{ ...$attrs }"
    >
      <!-- TreeItemSkeleton -->
      <template v-if="isLoading">
        <TreeItem
          v-for="item in [
            { id: '1', title: 'Item 1' },
            { id: '2', title: 'Item 2' },
            { id: '3', title: 'Item 3' },
            { id: '4', title: 'Item 4' },
            { id: '5', title: 'Item 5' },
            { id: '6', title: 'Item 6' },
          ]"
          v-slot="{ isSelected, handleSelect, isIndeterminate }"
          :key="item.id"
          :value="item"
          :level="1"
          class="flex gap-2"
          @click.stop="() => {}"
        >
          <div :class="cn('z-10 flex rounded hover:bg-muted bg-background w-full', isSelected && 'bg-primary text-primary-foreground hover:bg-primary')">
            <button disabled :class="cn('flex items-center gap-2 cursor-pointer w-full')">
              <!-- 嵌套項目收合 -->
              <button
                v-if="isCheckboxShown"
                @change="handleSelect"
              >
                <!-- <Checkbox :model-value="true" v-if="isSelected" />
              <Checkbox :model-value="'indeterminate'" v-else-if="isIndeterminate" />
              <Checkbox :model-value="false" v-else /> -->
                <svg v-if="isSelected" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><!-- Icon from Material Symbols by Google - https://github.com/google/material-design-icons/blob/master/LICENSE --><path fill="currentColor" d="m10.6 13.4l-2.15-2.15q-.275-.275-.7-.275t-.7.275t-.275.7t.275.7L9.9 15.5q.3.3.7.3t.7-.3l5.65-5.65q.275-.275.275-.7t-.275-.7t-.7-.275t-.7.275zM5 21q-.825 0-1.412-.587T3 19V5q0-.825.588-1.412T5 3h14q.825 0 1.413.588T21 5v14q0 .825-.587 1.413T19 21zm0-2h14V5H5zM5 5v14z" /></svg>

                <svg v-else-if="isIndeterminate" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><!-- Icon from Material Symbols by Google - https://github.com/google/material-design-icons/blob/master/LICENSE --><path fill="currentColor" d="M7 13h10v-2H7zm-2 8q-.825 0-1.412-.587T3 19V5q0-.825.588-1.412T5 3h14q.825 0 1.413.588T21 5v14q0 .825-.587 1.413T19 21zm0-2h14V5H5zM5 5v14z" /></svg>

                <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><!-- Icon from Material Symbols by Google - https://github.com/google/material-design-icons/blob/master/LICENSE --><path fill="currentColor" d="M5 21q-.825 0-1.412-.587T3 19V5q0-.825.588-1.412T5 3h14q.825 0 1.413.588T21 5v14q0 .825-.587 1.413T19 21zm0-2h14V5H5z" /></svg>
              </button>

              <div class="min-h-8 whitespace-nowrap h-full w-full flex items-center flex-1">
                <Skeleton class="w-60 h-4" />
              </div>
            </button>
            <!-- Action -->
            <div class="flex">
              <!-- <slot name="action" :item="item" :add-item="addItem" /> -->
              <slot v-if="props.isDraggable" name="action-move-up">
                <Button disabled class="text-current" variant="link" size="icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><!-- Icon from Material Symbols by Google - https://github.com/google/material-design-icons/blob/master/LICENSE --><path fill="currentColor" d="m11 8.8l-2.9 2.9q-.275.275-.7.275t-.7-.275t-.275-.7t.275-.7l4.6-4.6q.3-.3.7-.3t.7.3l4.6 4.6q.275.275.275.7t-.275.7t-.7.275t-.7-.275L13 8.8V17q0 .425-.288.713T12 18t-.712-.288T11 17z" /></svg>
                </Button>
              </slot>
              <slot v-if="props.isDraggable" name="action-move-down">
                <Button disabled class="text-current" variant="link" size="icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
                    <!-- Icon from Material Symbols by Google - https://github.com/google/material-design-icons/blob/master/LICENSE --><path fill="currentColor" d="M11 14.2V6q0-.425.288-.712T12 5t.713.288T13 6v8.2l2.9-2.9q.275-.275.7-.275t.7.275t.275.7t-.275.7l-4.6 4.6q-.3.3-.7.3t-.7-.3l-4.6-4.6q-.275-.275-.275-.7t.275-.7t.7-.275t.7.275z" /></svg>
                </Button>
              </slot>
            </div>
          </div>
        </TreeItem>
      </template>
      <!-- VIRTUALIZED -->
      <div
        v-else-if="typeof props.estimateVirtualizedSize === 'number' && props.estimateVirtualizedSize > 0"
        class="overflow-y-auto"
        :style="{
          height: `${virtualizedContainerHeight}px`,
        }"
      >
        <!-- TODO: any: I haven't figured out how to make TreeVirtualizer's return type compatible with AppTree's type yet -->
        <TreeVirtualizer
          v-slot="{ item }: { item: any }"
          :items="flattenItems"
          :text-content="(opt) => getText ? getText(opt.value) : ''"
          :estimate-size="props.estimateVirtualizedSize"
        >
          <AppTreeItemDraggable
            v-if="isDraggable"
            v-slot="{ isExpanded, isSelected, handleSelect, isIndeterminate }"
            :key="item._id"
            class="flex gap-2"
            :style="{ 'padding-left': `${item.level - 0.5}rem` }"
            v-bind="item.bind"
            :item="item"
            :get-key="getKey"
            @drag-start="handleDragStart as any"
          >
            <AppTreeItem
              :item="item"
              :is-expanded="isExpanded"
              :is-selected="isSelected"
              :is-indeterminate="Boolean(isIndeterminate)"
              :is-checkbox-shown="isCheckboxShown"
              :is-draggable="isDraggable"
              :is-item-visible="isItemVisible"
              :handle-select="handleSelect"
              :toggle-expand-all="toggleExpandAll"
              :move-item-up="moveItemUp"
              :move-item-down="moveItemDown"
              :add-item="addItem"
            >
              <template #closeItemIcon>
                <slot name="closeItemIcon" />
              </template>
              <template #openItemIcon>
                <slot name="openItemIcon" />
              </template>
              <template #itemIcon>
                <slot name="itemIcon" />
              </template>
              <template #title="titleProps">
                <slot name="title" v-bind="titleProps" />
              </template>
              <template #action="actionProps">
                <slot name="action" v-bind="actionProps" />
              </template>
              <template #action-move-up="actionProps">
                <slot name="action-move-up" v-bind="actionProps" />
              </template>
              <template #action-move-down="actionProps">
                <slot name="action-move-down" v-bind="actionProps" />
              </template>
            </AppTreeItem>
          </AppTreeItemDraggable>
          <!-- TODO: I haven't figured out how to make TreeVirtualizer's return type compatible with AppTree's type yet -->
          <TreeItem
            v-else
            v-slot="{ isExpanded, isSelected, handleSelect, isIndeterminate }"
            :key="item._id as any"
            class="flex gap-2"
            :style="{ 'padding-left': `${item.level - 0.5}rem` }"
            v-bind="item.bind"
          >
            <AppTreeItem
              :item="item"
              :is-expanded="isExpanded"
              :is-selected="isSelected"
              :is-indeterminate="Boolean(isIndeterminate)"
              :is-checkbox-shown="isCheckboxShown"
              :is-draggable="isDraggable"
              :is-item-visible="isItemVisible"
              :handle-select="handleSelect"
              :toggle-expand-all="toggleExpandAll"
              :move-item-up="moveItemUp"
              :move-item-down="moveItemDown"
              :add-item="addItem"
            >
              <template #closeItemIcon>
                <slot name="closeItemIcon" />
              </template>
              <template #openItemIcon>
                <slot name="openItemIcon" />
              </template>
              <template #itemIcon>
                <slot name="itemIcon" />
              </template>
              <template #title="titleProps">
                <slot name="title" v-bind="titleProps" />
              </template>
              <template #action="actionProps">
                <slot name="action" v-bind="actionProps" />
              </template>
              <template #action-move-up="actionProps">
                <slot name="action-move-up" v-bind="actionProps" />
              </template>
              <template #action-move-down="actionProps">
                <slot name="action-move-down" v-bind="actionProps" />
              </template>
            </AppTreeItem>
          </TreeItem>
        </TreeVirtualizer>
      </div>
      <template v-else-if="isDraggable && !isLoading">
        <AppTreeItemDraggable
          v-for="item in flattenItems"
          v-slot="{ isExpanded, isSelected, handleSelect, isIndeterminate }"
          :key="item._id"
          class="flex gap-2"
          :style="{ 'padding-left': `${item.level - 0.5}rem` }"
          v-bind="item.bind"
          :item="item"
          :get-key="getKey"
          @drag-start="handleDragStart"
        >
          <AppTreeItem
            :item="item"
            :is-expanded="isExpanded"
            :is-selected="isSelected"
            :is-indeterminate="Boolean(isIndeterminate)"
            :is-checkbox-shown="isCheckboxShown"
            :is-draggable="isDraggable"
            :is-item-visible="isItemVisible"
            :handle-select="handleSelect"
            :toggle-expand-all="toggleExpandAll"
            :move-item-up="moveItemUp"
            :move-item-down="moveItemDown"
            :add-item="addItem"
          >
            <template #closeItemIcon>
              <slot name="closeItemIcon" />
            </template>
            <template #openItemIcon>
              <slot name="openItemIcon" />
            </template>
            <template #itemIcon>
              <slot name="itemIcon" />
            </template>
            <template #title="titleProps">
              <slot name="title" v-bind="titleProps" />
            </template>
            <template #action="actionProps">
              <slot name="action" v-bind="actionProps" />
            </template>
            <template #action-move-up="actionProps">
              <slot name="action-move-up" v-bind="actionProps" />
            </template>
            <template #action-move-down="actionProps">
              <slot name="action-move-down" v-bind="actionProps" />
            </template>
          </AppTreeItem>
        </AppTreeItemDraggable>
      </template>
      <template v-else-if="!isLoading">
        <TreeItem
          v-for="item in flattenItems"
          v-slot="{ isExpanded, isSelected, handleSelect, isIndeterminate }"
          :key="item._id"
          class="flex gap-2"
          :style="{ 'padding-left': `${item.level - 0.5}rem` }"
          v-bind="item.bind"
        >
          <AppTreeItem
            :item="item"
            :is-expanded="isExpanded"
            :is-selected="isSelected"
            :is-indeterminate="Boolean(isIndeterminate)"
            :is-checkbox-shown="isCheckboxShown"
            :is-draggable="isDraggable"
            :is-item-visible="isItemVisible"
            :handle-select="handleSelect"
            :toggle-expand-all="toggleExpandAll"
            :move-item-up="moveItemUp"
            :move-item-down="moveItemDown"
            :add-item="addItem"
          >
            <template #closeItemIcon>
              <slot name="closeItemIcon" />
            </template>
            <template #openItemIcon>
              <slot name="openItemIcon" />
            </template>
            <template #itemIcon>
              <slot name="itemIcon" />
            </template>
            <template #title="titleProps">
              <slot name="title" v-bind="titleProps" />
            </template>
            <template #action="actionProps">
              <slot name="action" v-bind="actionProps" />
            </template>
            <template #action-move-up="actionProps">
              <slot name="action-move-up" v-bind="actionProps" />
            </template>
            <template #action-move-down="actionProps">
              <slot name="action-move-down" v-bind="actionProps" />
            </template>
          </AppTreeItem>
        </TreeItem>
      </template>
    </TreeRoot>
  </div>
</template>
