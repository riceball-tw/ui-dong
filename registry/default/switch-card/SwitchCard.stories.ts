import type { Meta, StoryObj } from '@storybook/vue3-vite';
import SwitchCard from './SwitchCard.vue';

const meta = {
  title: 'Example/SwitchCard',
  component: SwitchCard,
  tags: ['autodocs'],
  argTypes: {
    modelValue: { control: 'boolean' },
    label: { control: 'text' },
    sublabel: { control: 'text' },
    description: { control: 'text' },
  },
} satisfies Meta<typeof SwitchCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    modelValue: false,
    label: 'Airplane Mode',
    sublabel: '(Network unavailable)',
    description: 'Disable all wireless connections.',
  },
};
