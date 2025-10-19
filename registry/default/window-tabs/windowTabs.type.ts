import type { Component, InjectionKey } from 'vue';

export interface Tab {
  id: string;
  title: string;
  component: Component;
  isHideable?: boolean;
  isShown?: boolean;
}

export interface WindowTabEmits {
    addNewTab: [value: Tab];
    openTab: [tabId: string];
    closeTab: [tabId: string];
  }

export const openTabProvideKey = Symbol() as InjectionKey<(newTab: Tab) => void>