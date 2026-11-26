'use client'

import {
  GroupInput,
  GroupInputLeftFlag,
  GroupInputRightText,
  GroupSelectionField,
} from '@/components/ui/group-input'

const CITIES = [
  { value: 'lagos', label: 'Lagos' },
  { value: 'abuja', label: 'Abuja' },
  { value: 'nairobi', label: 'Nairobi' },
  { value: 'london', label: 'London' },
]

const DAYS = [
  { value: '7', label: '7 days' },
  { value: '14', label: '14 days' },
  { value: '30', label: '30 days' },
]

const TEAMS = [
  { value: 'design', label: 'Design' },
  { value: 'engineering', label: 'Engineering' },
  { value: 'people', label: 'People' },
  { value: 'sales', label: 'Sales' },
]

export default function GroupInputSelection() {
  return (
    <div className="flex w-[320px] max-w-full flex-col gap-16">
      <GroupInput label="City" helperText="Where the role is based" helperInset={false}>
        <GroupInputLeftFlag countryCode="NG" countryName="Nigeria" aria-haspopup="listbox" />
        <GroupSelectionField options={CITIES} placeholder="Search for an option..." />
      </GroupInput>
      <GroupInput label="Office" helperText="Pick the nearest one" helperInset={false}>
        <GroupInputLeftFlag countryCode="KE" countryName="Kenya" aria-haspopup="listbox" />
        <GroupSelectionField
          position="center"
          options={CITIES}
          placeholder="Search for an option..."
        />
        <GroupInputRightText text="HQ" />
      </GroupInput>
      <GroupInput label="Notice period" helperText="How long they must wait" helperInset={false}>
        <GroupSelectionField position="left" options={DAYS} placeholder="Choose" />
        <GroupInputRightText text="before start" />
      </GroupInput>
      <GroupInput label="Notice period (small)" size="sm" helperInset={false}>
        <GroupSelectionField position="left" options={DAYS} placeholder="Choose" />
        <GroupInputRightText text="before start" />
      </GroupInput>
      <GroupInput
        label="Teams"
        helperText="Choose every team that will interview"
        helperInset={false}
      >
        <GroupInputLeftFlag countryCode="GB" countryName="United Kingdom" aria-haspopup="listbox" />
        <GroupSelectionField
          options={TEAMS}
          multiple
          defaultValue={['design', 'people']}
          placeholder="Search for an option..."
        />
      </GroupInput>
    </div>
  )
}
