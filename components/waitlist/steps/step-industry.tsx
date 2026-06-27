'use client'

import { useState } from 'react'

import { Button, ListItemMultiSelect, TextInput } from '@/components/ui'

import { ArrowRightIcon } from '../icons'

interface StepIndustryProps {
  onContinue?: (industries: string[], other?: string) => void
}

// Industry options (emoji + label) exactly as in the Figma list.
const industries = [
  '⌨️ Tech',
  '♻️ Energy',
  '🌴 Green',
  '💸 Fintech',
  '💪 Health',
  '📚 Education',
  '🔒 Security',
  '🏗️ Construction',
  '🛠️ Hard ware',
]

function StepIndustry({ onContinue }: StepIndustryProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [othersOn, setOthersOn] = useState(false)
  const [otherText, setOtherText] = useState('')
  const [error, setError] = useState(false)

  function toggle(value: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(value)) next.delete(value)
      else next.add(value)
      return next
    })
    setError(false)
  }

  function handleContinue() {
    const hasSelection = selected.size > 0 || (othersOn && otherText.trim().length > 0)
    if (!hasSelection) {
      setError(true)
      return
    }
    onContinue?.([...selected], othersOn ? otherText.trim() : undefined)
  }

  return (
    <div className="mx-auto w-full max-w-[472px]">
      <div className="rounded-lg-12 border border-border-light bg-bg-secondary px-[6px] pb-[6px] pt-[12px]">
        <div className="flex flex-col items-center gap-[28px] rounded-sm-7 bg-bg-primary px-[24px] py-[32px]">
          {/* Header */}
          <div className="flex w-full flex-col gap-[12px]">
            <span className="text-body-l font-medium leading-21 text-text-secondary">
              Tell us a bit about your team
            </span>
            <h1 className="text-heading-5 font-semibold leading-33_1 text-text-primary">
              What industry do you work
            </h1>
          </div>

          {/* Options */}
          <div className="flex w-full flex-col gap-[10px]">
            <ul className="flex flex-col">
              {industries.map((value) => (
                <ListItemMultiSelect
                  key={value}
                  mainText={value}
                  withIcon={false}
                  selected={selected.has(value)}
                  onChange={() => toggle(value)}
                />
              ))}
            </ul>

            <div className="border-t border-dashed border-border-light" />

            <div className="flex flex-col gap-[2px]">
              <ListItemMultiSelect
                mainText="Others"
                withIcon={false}
                selected={othersOn}
                onChange={() => {
                  setOthersOn((v) => !v)
                  setError(false)
                }}
              />
              <TextInput
                showLabel={false}
                showHelper={false}
                placeholder="Enter your industry"
                size="md"
                disabled={!othersOn}
                value={otherText}
                onChange={(e) => setOtherText(e.target.value)}
              />
            </div>

            {error && (
              <span className="text-body-xs text-text-error" role="alert">
                Please make a selection to continue.
              </span>
            )}
          </div>

          {/* Action */}
          <Button
            accent="blue"
            variant="secondary"
            size="md"
            iconSuffix={<ArrowRightIcon />}
            onClick={handleContinue}
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  )
}

export { StepIndustry }
