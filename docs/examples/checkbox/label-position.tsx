import { Checkbox } from '@/components/ui/selection-controls'

export default function CheckboxLabelPosition() {
  return (
    <div className="flex flex-wrap items-center gap-12">
      <Checkbox label="Label right" />
      <Checkbox label="Label left" textPosition="left" />
      <Checkbox aria-label="No label" textPosition="none" />
      <Checkbox label="No hover area" hoverable={false} />
    </div>
  )
}
