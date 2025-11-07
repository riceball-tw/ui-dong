import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, within } from 'storybook/test'
import SensitiveInput from './SensitiveInput.vue'

const meta = {
  title: 'Example/SensitiveInput',
  component: SensitiveInput,
  tags: ['autodocs'],
  args: {
    defaultValue: 'password',
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
    defaultValue: 'password',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Get the password input field
    const passwordInput = canvas.getByTestId('password-input') as HTMLInputElement

    // Initially, the input should have type="password" (hidden)
    await expect(passwordInput).toHaveAttribute('type', 'password')

    // Get the toggle button by its data-test attribute
    const toggleButton = canvas.getByTestId('password-toggle')
    await expect(toggleButton).toBeInTheDocument()

    // Click to show the password
    await userEvent.click(toggleButton)

    // After clicking, the input type should change to "text" (visible)
    await expect(passwordInput).toHaveAttribute('type', 'text')

    // Click again to hide the password
    await userEvent.click(toggleButton)

    // The input type should be back to "password" (hidden)
    await expect(passwordInput).toHaveAttribute('type', 'password')
  },
}
