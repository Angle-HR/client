import { Button } from '@/components/ui/button'

export default function ButtonDestructive() {
  return (
    <div className="flex flex-wrap items-center gap-8">
      <Button variant="secondary">Keep member</Button>
      <Button variant="primary" accent="red">
        Remove member
      </Button>
    </div>
  )
}
