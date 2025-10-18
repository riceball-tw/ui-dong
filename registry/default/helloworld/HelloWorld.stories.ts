import type { Meta, StoryObj } from '@storybook/vue3-vite';
import HelloWorld from './HelloWorld.vue';

const meta = {
  title: 'Example/HelloWorld',
  component: HelloWorld,
  tags: ['autodocs'],
} satisfies Meta<typeof HelloWorld>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
