import { Button } from '../button/button'

import { Modal, ModalActions } from './modal'

import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta: Meta<typeof Modal> = {
  title: 'UI/Modal',
  component: Modal,
  argTypes: {
    width: { control: 'select', options: [400, 500, 700] },
  },
  args: {
    open: true,
    title: 'Pause Job(s)',
    onClose: () => {},
    children: (
      <>
        <p className="-my-[5px] text-body-s leading-19_5 font-medium text-text-secondary">
          The job listing will be paused, removed from job boards, and closed to applications until
          reopened.
        </p>
        <ModalActions>
          <Button variant="primary" accent="default" size="md">
            Cancel
          </Button>
          <Button variant="primary" accent="blue" size="md">
            Pause
          </Button>
        </ModalActions>
      </>
    ),
  },
}

export default meta
type Story = StoryObj<typeof Modal>

export const Default: Story = {}

export const Wide: Story = {
  args: { width: 500, title: 'Create new team or department' },
}
