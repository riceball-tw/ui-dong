import type { Meta, StoryObj } from '@storybook/vue3-vite';

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
} satisfies Meta<typeof CircularProgress>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    progress: 50,
  },
}
