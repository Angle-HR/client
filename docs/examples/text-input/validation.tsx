import { TextInput } from '@/components/ui/input'

export default function TextInputValidation() {
  return (
    <div className="flex w-full max-w-[280px] flex-col gap-16">
      <TextInput label="Email" defaultValue="ada@" errorText="Enter a full email address" />
      <TextInput
        label="Username"
        defaultValue="ada"
        helperText="That username is free"
        helperState="success"
      />
      <TextInput label="Company" placeholder="Acme" disabled helperText="Set by your admin" />
    </div>
  )
}
