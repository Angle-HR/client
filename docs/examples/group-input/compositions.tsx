import { FlowButton } from '@/components/ui/button/flow-button'
import {
  GroupInput,
  GroupInputField,
  GroupInputLeftCurrency,
  GroupInputLeftFlag,
  GroupInputLeftText,
  GroupInputRightText,
} from '@/components/ui/group-input'
import { MaskIcon } from '@/components/ui/icons/mask-icon'

// Figma's four Text Group input layouts, plus the currency and left text panels.
export default function GroupInputCompositions() {
  return (
    <div className="flex w-[320px] max-w-full flex-col gap-24">
      <GroupInput label="Right: flag + field">
        <GroupInputLeftFlag countryCode="GB" countryName="United Kingdom" />
        <GroupInputField type="tel" placeholder="7700 900123" />
      </GroupInput>
      <GroupInput label="Center: flag + field + text">
        <GroupInputLeftFlag countryCode="KE" countryName="Kenya" />
        <GroupInputField position="center" placeholder="name" />
        <GroupInputRightText text="@company.co.ke" />
      </GroupInput>
      <GroupInput label="Left: field + text">
        <GroupInputField
          position="left"
          placeholder="careers"
          prefixIcon={<MaskIcon src="/dashboard/icons/globe-alt-outline.svg" size={14} />}
        />
        <GroupInputRightText text=".openhr.com" />
      </GroupInput>
      <GroupInput label="Left: field + Flow Button">
        <GroupInputField
          position="left"
          type="email"
          placeholder="you@company.com"
          prefixIcon={<MaskIcon src="/dashboard/icons/envelope-outline.svg" size={14} />}
        />
        <FlowButton variant="primary" size="sm" position="right">
          Invite
        </FlowButton>
      </GroupInput>
      <GroupInput label="Salary">
        <GroupInputLeftCurrency value="NGN" aria-haspopup="listbox" />
        <GroupInputField inputMode="decimal" placeholder="0.00" />
      </GroupInput>
      <GroupInput label="Website">
        <GroupInputLeftText text="https://" />
        <GroupInputField placeholder="yourcompany.com" />
      </GroupInput>
    </div>
  )
}
