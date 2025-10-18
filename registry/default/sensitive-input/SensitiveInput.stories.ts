import type { Meta, StoryObj } from '@storybook/vue3-vite';

import SensitiveInput from './SensitiveInput.vue'

const meta = {
  title: 'Example/SensitiveInput',
  component: SensitiveInput,
  tags: ['autodocs'],
  args: {
    defaultValue: "password"
  },
  parameters: {
    docs: {
      description: {
        component: 'A sensitive input that can be used to show/hide the sensitive data.',
      },
    },
  },
} satisfies Meta<typeof SensitiveInput>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    defaultValue: "password",
  },
}
