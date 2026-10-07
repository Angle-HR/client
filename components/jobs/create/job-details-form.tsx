'use client'

import { type ReactNode } from 'react'

import { DashboardIcon } from '@/components/dashboard/nav-config'
import {
  BannerInfo,
  Checkbox,
  DateInput,
  Divider,
  InputSelection,
  LabelButton,
  LabelWrapper,
  ListItemPicker,
  RadioButton,
  RichTextInput,
  TextInput,
} from '@/components/ui'
import {
  AREA_OPTIONS,
  CURRENCY_OPTIONS,
  EXPERIENCE_OPTIONS,
  INDUSTRY_OPTIONS,
  SENIORITY_OPTIONS,
  SKILL_OPTIONS,
  TEAM_OPTIONS,
  TIMEZONE_OFFSET_OPTIONS,
  TIMEZONE_OPTIONS,
  formatAmount,
} from '@/lib/jobs/draft'

import type {
  DraftErrors,
  HiringArea,
  JobDraft,
  PayPeriod,
  TravelFrequency,
} from '@/lib/jobs/draft'
import type { JobEmploymentType, JobWorkplace } from '@/lib/jobs/types'

/**
 * The fields of the "Job details" step. Figma: 8973:613907.
 *
 * The form is a 613px column; each section's tips sit in a 277px card to its
 * right, which only has room at wider windows.
 */

interface JobDetailsFormProps {
  draft: JobDraft
  errors: DraftErrors
  onChange: (patch: Partial<JobDraft>) => void
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="flex h-[7px] items-center text-caption-s leading-none font-semibold text-text-secondary uppercase">
      {children}
    </h2>
  )
}

/** The design's section rule: a hairline centred in a 4px slot. */
function Rule() {
  return (
    <div className="flex h-[4px] shrink-0 items-center">
      <Divider />
    </div>
  )
}

/** A hint card beside a section. `top` is its offset from the section's top in the design. */
function Tips({ top, children }: { top: number; children: ReactNode }) {
  return (
    <aside
      style={{ top }}
      className="absolute left-[676px] hidden w-[277px] flex-col gap-[14px] p-[10px] min-[1240px]:flex"
    >
      <span className="flex h-[10px] items-center gap-[4px] text-body-xs leading-none font-medium-550 text-text-secondary">
        <DashboardIcon name="light-bulb-outline" size={10} />
        Tips
      </span>
      <p className="-my-[5px] text-body-xs leading-19_2 text-text-secondary">{children}</p>
    </aside>
  )
}

/** A labelled group of controls that is not a single input. */
function Group({
  label,
  gapClass = 'gap-[13px]',
  children,
}: {
  label: string
  gapClass?: string
  children: ReactNode
}) {
  return (
    <div role="group" aria-label={label} className={`flex flex-col ${gapClass}`}>
      <LabelWrapper label={label} />
      {children}
    </div>
  )
}

const HIRING_AREAS: { value: HiringArea; label: string; icon: string }[] = [
  { value: 'anywhere', label: 'Anywhere', icon: 'globe-alt-solid' },
  { value: 'area', label: 'Specific area', icon: 'location-pin-solid' },
  { value: 'timezone', label: 'Specific timezone', icon: 'clock-solid' },
]

const WORKPLACES: { value: JobWorkplace; label: string; icon: string }[] = [
  { value: 'On-site', label: 'Onsite', icon: 'building-office-2-outline' },
  { value: 'Hybrid', label: 'Hybrid', icon: 'hybrid-outline' },
  { value: 'Remote', label: 'Remote', icon: 'remote-outline' },
]

const TRAVEL: { value: TravelFrequency; label: string }[] = [
  { value: 'never', label: 'Never' },
  { value: 'few', label: 'A few times per year' },
  { value: 'monthly', label: 'Every month' },
]

const EMPLOYMENT_TYPES: { value: JobEmploymentType; label: string }[] = [
  { value: 'Full-time', label: 'Full time' },
  { value: 'Part-time', label: 'Part time' },
  { value: 'Contract', label: 'Freelance/Contract' },
]

const PAY_PERIODS: { value: PayPeriod; label: string }[] = [
  { value: 'hourly', label: 'Hourly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'annually', label: 'Annually' },
]

const single = (value: string | string[]) => (Array.isArray(value) ? (value[0] ?? '') : value)

function JobDetailsForm({ draft, errors, onChange }: JobDetailsFormProps) {
  return (
    <>
      <section className="relative flex flex-col gap-[24px]">
        <SectionTitle>Job title &amp; Department</SectionTitle>
        <div className="flex flex-col gap-[24px]">
          <TextInput
            label="Job title"
            placeholder="e.g. Product designer"
            value={draft.title}
            onChange={(event) => onChange({ title: event.target.value })}
            showHelper
            helperText="No special characters, 70 characters max."
            errorText={errors.title}
          />
          <div className="flex items-start gap-[16px]">
            <div className="min-w-0 flex-1">
              <InputSelection
                label="Team/Department"
                placeholder="Select a team"
                options={TEAM_OPTIONS}
                value={draft.team}
                onChange={(value) => onChange({ team: single(value) })}
                errorText={errors.team}
              />
            </div>
            {/* Dates can be typed straight in; past dates are rejected. */}
            <DateInput
              label="Job closing date"
              value={draft.closingDate}
              onChange={(closingDate) => onChange({ closingDate })}
              errorText={errors.closingDate}
              className="w-[182px] shrink-0"
            />
            <div className="w-[100px] shrink-0">
              <TextInput
                label="Job ID"
                placeholder="JB-01"
                value={draft.jobId}
                onChange={(event) => onChange({ jobId: event.target.value })}
              />
            </div>
          </div>
        </div>
        <Tips top={52}>
          Use a common job title for better search visibility, hire for one role at a time,
          &quot;Hunter&quot; not &quot;Hunters&quot;.
        </Tips>
      </section>

      <Rule />

      <section className="relative flex flex-col gap-[24px]">
        <SectionTitle>Location &amp; Workspace</SectionTitle>
        <div className="flex flex-col gap-[24px]">
          <Group label="Where are you hiring ?" gapClass="gap-[11px]">
            <div role="radiogroup" aria-label="Where are you hiring ?" className="flex gap-[8px]">
              {HIRING_AREAS.map((area) => (
                <ListItemPicker
                  key={area.value}
                  title={area.label}
                  icon={<DashboardIcon name={area.icon} size={17} />}
                  selected={draft.hiringArea === area.value}
                  onClick={() => onChange({ hiringArea: area.value })}
                />
              ))}
            </div>
          </Group>

          <div className="flex flex-col gap-[20px]">
            {draft.hiringArea === 'area' ? (
              <InputSelection
                label="Select an area"
                placeholder="Search for a country or region"
                options={AREA_OPTIONS}
                value={draft.area}
                onChange={(value) => onChange({ area: single(value) })}
              />
            ) : null}

            {draft.hiringArea === 'timezone' ? (
              <div className="flex items-start gap-[16px]">
                <div className="min-w-0 flex-1">
                  <InputSelection
                    label="Select a timezone"
                    placeholder="Search for a timezone"
                    options={TIMEZONE_OPTIONS}
                    value={draft.timezone}
                    onChange={(value) => onChange({ timezone: single(value) })}
                  />
                </div>
                <div className="w-[197px] shrink-0">
                  <InputSelection
                    label="Timezone offset"
                    placeholder="Select"
                    options={TIMEZONE_OFFSET_OPTIONS}
                    value={draft.timezoneOffset}
                    onChange={(value) => onChange({ timezoneOffset: single(value) })}
                  />
                </div>
              </div>
            ) : null}

            <Checkbox
              size="sm"
              label="Show on career page"
              checked={draft.showLocationOnCareerPage}
              onChange={(event) => onChange({ showLocationOnCareerPage: event.target.checked })}
            />
          </div>

          <Rule />

          <Group label="Workplace type">
            <div className="flex gap-[8px]">
              {WORKPLACES.map((workplace) => (
                <LabelButton
                  key={workplace.value}
                  selected={draft.workplace === workplace.value}
                  iconLeft={<DashboardIcon name={workplace.icon} size={14} />}
                  aria-pressed={draft.workplace === workplace.value}
                  onClick={() => onChange({ workplace: workplace.value })}
                >
                  {workplace.label}
                </LabelButton>
              ))}
            </div>
          </Group>

          <Group label="How often is travel required?">
            <div className="flex flex-col gap-[8px]">
              {TRAVEL.map((travel) => (
                <RadioButton
                  key={travel.value}
                  name="travel"
                  label={travel.label}
                  checked={draft.travel === travel.value}
                  onChange={() => onChange({ travel: travel.value })}
                />
              ))}
            </div>
          </Group>

          <Group label="Will you sponsor work visas for this role?">
            <div className="flex flex-col gap-[8px]">
              <RadioButton
                name="visa"
                label="Yes, visa sponsorship is available"
                checked={draft.visaSponsorship === 'yes'}
                onChange={() => onChange({ visaSponsorship: 'yes' })}
              />
              <RadioButton
                name="visa"
                label="No, candidates must have the right to work"
                checked={draft.visaSponsorship === 'no'}
                onChange={() => onChange({ visaSponsorship: 'no' })}
              />
            </div>
          </Group>
        </div>
        <Tips top={249}>
          Not sure? Check your local immigration rules before enabling sponsorship requirements vary
          by country.
        </Tips>
      </section>

      <Rule />

      <section className="relative flex flex-col gap-[24px]">
        <SectionTitle>Description</SectionTitle>
        {/* Height limits are the designer's: 237px minimum, 500px maximum. */}
        <RichTextInput
          label="Full Job Description"
          placeholder="Describe the role, the team and the skills you are looking for"
          value={draft.description}
          onChange={(description) => onChange({ description })}
          showToolbar
          showHelper
          helperText="Clear and specific wins"
          className="[&_[contenteditable]]:max-h-[440px] [&_[contenteditable]]:min-h-[177px] [&_[contenteditable]]:overflow-y-auto"
        />
        <Tips top={250}>
          Describe the role, team, and skills. Use sections and lists. Don’t add an apply link,
          we&apos;ll add one automatically.
        </Tips>
      </section>

      <Rule />

      <section className="relative flex flex-col gap-[24px]">
        <SectionTitle>Employment details</SectionTitle>
        <div className="flex flex-col gap-[24px]">
          <div className="flex items-start gap-[16px]">
            <div className="w-[290px] shrink-0">
              <InputSelection
                label="Industry"
                placeholder="Select an industry"
                options={INDUSTRY_OPTIONS}
                value={draft.industry}
                onChange={(value) => onChange({ industry: single(value) })}
              />
            </div>
            <Group label="Employment type">
              <div className="flex gap-[6px]">
                {EMPLOYMENT_TYPES.map((type) => (
                  <LabelButton
                    key={type.value}
                    selected={draft.employmentType === type.value}
                    aria-pressed={draft.employmentType === type.value}
                    onClick={() => onChange({ employmentType: type.value })}
                  >
                    {type.label}
                  </LabelButton>
                ))}
              </div>
            </Group>
          </div>
          <div className="flex items-start gap-[16px]">
            {/* Both lists are fixed: users can only pick from them. */}
            <div className="min-w-0 flex-1">
              <InputSelection
                label="Seniority Level"
                placeholder="Select a level"
                options={SENIORITY_OPTIONS}
                value={draft.seniority}
                onChange={(value) => onChange({ seniority: single(value) })}
              />
            </div>
            <div className="min-w-0 flex-1">
              <InputSelection
                label="Years of Experience"
                placeholder="Select a range"
                options={EXPERIENCE_OPTIONS}
                value={draft.experience}
                onChange={(value) => onChange({ experience: single(value) })}
              />
            </div>
          </div>
          <InputSelection
            label="Skills"
            placeholder="Add skills"
            options={SKILL_OPTIONS}
            multiple
            value={draft.skills}
            onChange={(value) => onChange({ skills: Array.isArray(value) ? value : [value] })}
            showHelper
            helperText="Add relevant to the jobs skills and keywords so candidates can find this role."
          />
        </div>
        <Tips top={97}>Add relevant Keywords to help candidates find this role, on job boards</Tips>
      </section>

      <Rule />

      <section className="flex flex-col gap-[24px]">
        <SectionTitle>Compensation</SectionTitle>
        <div className="flex flex-col gap-[24px]">
          <div role="radiogroup" aria-label="Pay type" className="flex gap-[8px]">
            <RadioButton
              name="pay-type"
              label="Exact Amount"
              checked={draft.payType === 'exact'}
              onChange={() => onChange({ payType: 'exact' })}
            />
            <RadioButton
              name="pay-type"
              label="Pay range"
              checked={draft.payType === 'range'}
              onChange={() => onChange({ payType: 'range' })}
            />
          </div>
          <div className="flex flex-col gap-[14px]">
            <div className="flex items-start gap-[16px]">
              <div className="w-[194px] shrink-0">
                <InputSelection
                  label="Currency"
                  options={CURRENCY_OPTIONS}
                  value={draft.currency}
                  onChange={(value) => onChange({ currency: single(value) })}
                />
              </div>
              <div className="w-[194px] shrink-0">
                <TextInput
                  label={draft.payType === 'range' ? 'Minimum' : 'Amount'}
                  placeholder="0"
                  value={draft.payMin}
                  onChange={(event) => onChange({ payMin: formatAmount(event.target.value) })}
                  errorText={errors.pay}
                />
              </div>
              {draft.payType === 'range' ? (
                <div className="w-[194px] shrink-0">
                  <TextInput
                    label="Maximum"
                    placeholder="0"
                    value={draft.payMax}
                    onChange={(event) => onChange({ payMax: formatAmount(event.target.value) })}
                  />
                </div>
              ) : null}
            </div>
            <div className="flex gap-[6px]">
              {PAY_PERIODS.map((period) => (
                <LabelButton
                  key={period.value}
                  selected={draft.payPeriod === period.value}
                  aria-pressed={draft.payPeriod === period.value}
                  onClick={() => onChange({ payPeriod: period.value })}
                >
                  {period.label}
                </LabelButton>
              ))}
            </div>
          </div>
          <Checkbox
            size="sm"
            label="Show on career page (Required in EU)"
            checked={draft.showPayOnCareerPage}
            onChange={(event) => onChange({ showPayOnCareerPage: event.target.checked })}
          />
        </div>
        <BannerInfo
          title="EU Pay Transparency Directive"
          body='Directive 2023/970 requires a salary range to be disclosed in job postings. Publishing the range is mandatory - you cannot hide it or show "competitive salary".'
          className="w-[384px]"
        />
      </section>
    </>
  )
}

export { JobDetailsForm }
