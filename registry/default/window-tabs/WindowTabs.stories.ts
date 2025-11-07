import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { h } from 'vue'
import WindowTabs from './WindowTabs.vue'

const meta = {
  title: 'Example/WindowTabs',
  component: WindowTabs,
  tags: ['autodocs'],
} satisfies Meta<typeof WindowTabs>

export default meta
type Story = StoryObj<typeof meta>

const Tab1 = {
  render: () => h('div', 'Tab 1 Content'),
}
const Tab2 = {
  render: () => h('div', 'Tab 2 Content'),
}
const Tab3 = {
  render: () => h('div', 'Tab 3 Content'),
}

export const Default: Story = {
  args: {
    avaliableTabs: [
      { id: 'tab1', title: 'Tab 1', component: Tab1, isShown: true },
      { id: 'tab2', title: 'Tab 2', component: Tab2, isShown: true },
      { id: 'tab3', title: 'Tab 3', component: Tab3, isShown: false },
    ],
  },
}
