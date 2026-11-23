import { Button } from '@/components/ui/button'

export default function ButtonOverview() {
  return (
    <div className="flex flex-wrap items-center gap-8">
      <Button variant="primary">Save changes</Button>
      <Button variant="secondary">Cancel</Button>
      <Button variant="tertiary">Skip for now</Button>
    </div>
  )
}
