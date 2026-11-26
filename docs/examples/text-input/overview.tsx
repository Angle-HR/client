import { TextInput } from '@/components/ui/input'

export default function TextInputOverview() {
  return (
    <div className="flex w-full max-w-[280px] flex-col gap-16">
      <TextInput
        label="Full name"
        placeholder="Ada Lovelace"
        helperText="As it appears on your ID"
      />
    </div>
  )
}
