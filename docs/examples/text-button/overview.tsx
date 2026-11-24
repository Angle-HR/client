import { TextButton } from '@/components/ui/button'

export default function TextButtonOverview() {
  return (
    <p className="max-w-[420px] text-body-s text-text-secondary">
      Candidates can withdraw at any time.{' '}
      <TextButton href="#withdrawals">Read the withdrawal policy</TextButton>
    </p>
  )
}
