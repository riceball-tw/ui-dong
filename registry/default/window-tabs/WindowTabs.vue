<template>
  <CustomTabs :default-value="defaultFocusPanelId" 
              :model-value="currentTabId"
              @update:model-value="currentTabId = $event">
    <ScrollArea>
      <CustomTabsList class="w-full -mt-px">
        <template v-for="({ id, title, isShown, isHideable }) in currentTabs" :key="id">
          <CustomTabsTrigger :is-hideable="isHideable ?? defaultIsHideable" v-if="isShown ?? defaultIsTabshown" :value="id" @close="handleCloseTab">
            {{ title }}
          </CustomTabsTrigger>
        </template>
      </CustomTabsList>
      <ScrollBar class="translate-y-full" orientation="horizontal" />
    </ScrollArea>

    <!-- [Tab] Keep tabs content mounted when switching between tabs -->
    <!-- https://github.com/radix-ui/primitives/issues/2359#issuecomment-2481321719 -->
    <CustomTabsContent :force-mount="true" class="p-4 data-[state=inactive]:hidden" v-for="({ id, component }) in currentTabs" :key="id" :value="id">
      <component
        @open-tab="handleOpenTab"
        @close-tab="handleCloseTab"
        @add-new-tab="handleAddNewTab"
        :is="component"/>
    </CustomTabsContent>
  </CustomTabs>
  <!-- 暴露內部方法測試時使用 -->
  <slot :handle-open-tab="handleOpenTab" :handle-add-new-tab="handleAddNewTab" />
</template>

<script setup lang="ts">
import { CustomTabs, CustomTabsContent, CustomTabsList, CustomTabsTrigger } from './custom-tabs'
import { ref, shallowRef, provide } from 'vue'
import type { Tab } from './windowTabs.type'
import { openTabProvideKey } from './windowTabs.type'

const { avaliableTabs, defaultPanelId } = defineProps<{
  avaliableTabs: Tab[];
  defaultPanelId?: string;
}>()
const defaultFocusPanelId = defaultPanelId || avaliableTabs[0].id
const defaultIsTabshown = true
const defaultIsHideable = true

const currentTabs = shallowRef<Tab[]>(avaliableTabs)
const currentTabId = ref<number | string>(defaultFocusPanelId)

function handleCloseTab(targetCloseTabId: string) {
  const newCurrentTabs = currentTabs.value.reduce(
    (acc: Tab[], panel) => panel.id === targetCloseTabId ? acc : [...acc, panel],
    [],
  )
  
  currentTabs.value = newCurrentTabs

  const closeTabIsCurrentTab = currentTabId.value === targetCloseTabId
  if (closeTabIsCurrentTab) {
    const newTargetTab = newCurrentTabs.findLast((panel) => {
      if (panel.isShown === undefined){
        return defaultIsTabshown
      } else {
        return panel.isShown
      }
    })
    handleOpenTab(newTargetTab?.id || defaultFocusPanelId)
  }
}

function handleOpenTab(targetTabId: string) {
  const newCurrentTabs = currentTabs.value.map((panel) => {
    if (panel.id === targetTabId) {
      return {
        ...panel,
        isShown: true,
      }
    } else {
      return panel
    }
  })
  currentTabs.value = newCurrentTabs
  currentTabId.value = targetTabId
}

function handleAddNewTab(newTab: Tab) {
  const isTabExist = currentTabs.value.some((tab) => tab.id === newTab.id)
  
  if (!isTabExist) {
    console.log(newTab)
    currentTabs.value.push(newTab)
  }

  handleOpenTab(newTab.id)
}

provide(openTabProvideKey, handleAddNewTab)
</script>