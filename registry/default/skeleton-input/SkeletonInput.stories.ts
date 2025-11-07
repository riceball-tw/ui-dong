import type { Meta, StoryObj } from '@storybook/vue3-vite'
import SkeletonInput from './SkeletonInput.vue'

const meta = {
  title: 'Example/SkeletonInput',
  component: SkeletonInput,
  tags: ['autodocs'],
} satisfies Meta<typeof SkeletonInput>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
