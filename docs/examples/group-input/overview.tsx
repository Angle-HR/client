import { GroupInput, GroupInputField, GroupInputLeftFlag } from '@/components/ui/group-input'

export default function GroupInputOverview() {
  return (
    <div className="flex w-[320px] max-w-full flex-col gap-16">
      <GroupInput label="Phone number" helperText="We'll text you the interview time">
        <GroupInputLeftFlag countryCode="NG" countryName="Nigeria" aria-haspopup="listbox" />
        <GroupInputField type="tel" placeholder="801 234 5678" />
      </GroupInput>
    </div>
  )
}
