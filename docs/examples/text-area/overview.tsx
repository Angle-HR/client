import { Textarea } from '@/components/ui/textarea'

export default function TextAreaOverview() {
  return (
    <div className="flex w-[320px] max-w-full flex-col gap-16">
      <Textarea
        label="Cover note"
        placeholder="Tell us why you'd like this role"
        helperText="A few sentences is plenty"
      />
    </div>
  )
}
