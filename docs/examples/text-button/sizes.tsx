import { TextButton } from '@/components/ui/button'

export default function TextButtonSizes() {
  return (
    <div className="flex flex-wrap items-baseline gap-16">
      <TextButton size="xs">View details</TextButton>
      <TextButton size="sm">View details</TextButton>
      <TextButton size="md">View details</TextButton>
      <TextButton size="lg">View details</TextButton>
    </div>
  )
}
