import type { Meta, StoryObj } from '@storybook/vue3-vite'

import CircularProgress from './CircularProgress.vue'

const meta = {
  title: 'Example/CircularProgress',
  component: CircularProgress,
  tags: ['autodocs'],
  args: { progress: 50 },
  parameters: {
    docs: {
      description: {
        component: 'A circular progress bar that can be used to show the progress of something.',
      },
    },
  },
  render: args => ({
    components: { CircularProgress },
    setup() {
      return { args }
    },
    template: `
    <div class="flex gap-4">
      <div style="max-width: 50px" class="text-xs">
        <CircularProgress :progress="args.progress" />
      </div>
      <div style="max-width: 100px" class="text-2xl">
        <CircularProgress :progress="args.progress" />
      </div>
      <div style="max-width: 300px" class="text-5xl">
        <CircularProgress :progress="args.progress" />
      </div>
    </div>
    `,
  }),
} satisfies Meta<typeof CircularProgress>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    progress: 50,
  },
}
