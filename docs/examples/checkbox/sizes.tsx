import { Checkbox } from '@/components/ui/selection-controls'

export default function CheckboxSizes() {
  return (
    <div className="flex flex-wrap items-center gap-12">
      <Checkbox size={18} defaultChecked label="18px" />
      <Checkbox size={15} defaultChecked label="15px" />
      <Checkbox size={14} defaultChecked aria-label="14px" textPosition="none" />
      <Checkbox size={11} defaultChecked label="11px" />
    </div>
  )
}
