import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import AppTree from './AppTree.vue'

interface TreeItem {
  id: string
  title: string
  children?: TreeItem[]
}

const meta: Meta<{
  multiple: boolean
  isCheckboxShown: boolean
  isDraggable: boolean
  isLoading: boolean
}> = {
  title: 'Example/AppTree',
  // How can I create stories for generically typed Vue Components?
  // https://stackoverflow.com/questions/78037116/how-can-i-create-stories-for-generically-typed-vue-components
  component: AppTree as Record<keyof typeof AppTree, unknown>,
  tags: ['autodocs'],
  args: {
    multiple: false,
    isCheckboxShown: true,
    isDraggable: false,
    isLoading: false,
  },
  argTypes: {
    multiple: {
      control: { type: 'boolean' },
    },
    isCheckboxShown: {
      control: { type: 'boolean' },
    },
    isDraggable: {
      control: { type: 'boolean' },
    },
    isLoading: {
      control: { type: 'boolean' },
    },
  },
  render: args => ({
    components: { AppTree },
    setup() {
      const items = ref<TreeItem[]>([
        {
          id: '1',
          title: 'Item 1',
          children: [
            { id: '1-1', title: 'Item 1-1' },
            { id: '1-2', title: 'Item 1-2' },
          ],
        },
        {
          id: '2',
          title: 'Item 2',
          children: [
            { id: '2-1', title: 'Item 2-1' },
            {
              id: '2-2',
              title: 'Item 2-2',
              children: [
                { id: '2-2-1', title: 'Item 2-2-1' },
                { id: '2-2-2', title: 'Item 2-2-2' },
              ],
            },
          ],
        },
        { id: '3', title: 'Item 3' },
      ])
      const selected = args.multiple ? ref<TreeItem[]>([]) : ref<TreeItem>()
      const expanded = ref<string[]>([])

      const getKey = (item: TreeItem) => item.id

      return { args, items, selected, expanded, getKey }
    },
    template: `
      <AppTree
        v-model:items="items"
        v-model:selected="selected"
        v-model:expanded="expanded"
        :get-key="getKey"
        :multiple="args.multiple"
        :is-checkbox-shown="args.isCheckboxShown"
        :is-draggable="args.isDraggable"
        :is-loading="args.isLoading"
      >
        <template #title="{ item }">
            {{ item.value.title }}
        </template>
      </AppTree>
    `,
  }),
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    multiple: false,
  },
}

export const MultipleSelect: Story = {
  args: {
    multiple: true,
  },
}

export const Checkbox: Story = {
  args: {
    isCheckboxShown: true,
  },
  render: args => ({
    components: { AppTree },
    setup() {
      const items = ref<TreeItem[]>([
        {
          id: '1',
          title: 'Item 1',
          children: [
            { id: '1-1', title: 'Item 1-1' },
            { id: '1-2', title: 'Item 1-2' },
          ],
        },
        {
          id: '2',
          title: 'Item 2',
          children: [
            { id: '2-1', title: 'Item 2-1' },
            {
              id: '2-2',
              title: 'Item 2-2',
              children: [
                { id: '2-2-1', title: 'Item 2-2-1' },
                { id: '2-2-2', title: 'Item 2-2-2' },
              ],
            },
          ],
        },
        { id: '3', title: 'Item 3' },
      ])
      const selected = args.multiple ? ref<TreeItem[]>([]) : ref<TreeItem>()
      const expanded = ref<string[]>([])

      const getKey = (item: TreeItem) => item.id

      return { args, items, selected, expanded, getKey }
    },
    template: `
      <AppTree
        v-model:items="items"
        v-model:selected="selected"
        v-model:expanded="expanded"
        :get-key="getKey"
        :multiple="args.multiple"
        :is-checkbox-shown="args.isCheckboxShown"
        :is-draggable="args.isDraggable"
        :is-loading="args.isLoading"
      >
        <template #title="{ item }">
            {{ item.value.title }}
        </template>
        <template #closeItemIcon>
          {{null}}
        </template>
        <template #openItemIcon>
          {{null}}
        </template>
        <template #itemIcon>
          {{null}}
        </template>
      </AppTree>
    `,
  }),
}

export const Loading: Story = {
  args: {
    isLoading: true,
  },
}
