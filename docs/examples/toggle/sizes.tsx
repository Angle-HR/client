import { Toggle } from '@/components/ui/selection-controls'

export default function ToggleSizes() {
  return (
    <div className="flex flex-wrap items-center gap-12">
      <Toggle size="md" defaultToggled aria-label="md, 20px" />
      <Toggle size="sm" defaultToggled aria-label="sm, 16px" />
    </div>
  )
}
