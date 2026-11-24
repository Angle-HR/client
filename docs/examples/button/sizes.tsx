import { Button } from '@/components/ui/button'

export default function ButtonSizes() {
  return (
    <div className="flex flex-wrap items-center gap-8">
      <Button size="sm">Small · 24px</Button>
      <Button size="md">Medium · 32px</Button>
    </div>
  )
}
