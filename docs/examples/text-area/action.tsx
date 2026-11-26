import { Textarea } from '@/components/ui/textarea'

export default function TextAreaAction() {
  return (
    <div className="flex w-[374px] max-w-full flex-col gap-16">
      <Textarea
        label="Job description"
        placeholder="Describe the role"
        showActionButton
        actionButtonLabel="Generate"
      />
    </div>
  )
}
