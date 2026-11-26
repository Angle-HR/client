import { TextInput } from '@/components/ui/input'

export default function TextInputLabels() {
  return (
    <div className="flex w-full max-w-[280px] flex-col gap-16">
      <TextInput label="Full name" placeholder="Ada Lovelace" required />
      <TextInput label="Preferred name" placeholder="Ada" helperText="Optional" />
    </div>
  )
}
