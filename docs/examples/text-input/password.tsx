'use client'

import { useState } from 'react'

import { IconButton } from '@/components/ui/button/icon-button'
import { MaskIcon } from '@/components/ui/icons/mask-icon'
import { TextInput } from '@/components/ui/input'

export default function TextInputPassword() {
  const [shown, setShown] = useState(false)
  return (
    <div className="flex w-full max-w-[280px] flex-col">
      <TextInput
        label="Password"
        type={shown ? 'text' : 'password'}
        defaultValue="correct horse"
        suffix="button"
        suffixButton={
          <IconButton
            type="button"
            variant="light"
            size="md"
            aria-label={shown ? 'Hide password' : 'Show password'}
            icon={
              <MaskIcon
                src={`/dashboard/icons/${shown ? 'eye-slash' : 'eye'}-outline.svg`}
                size={14}
              />
            }
            onClick={() => setShown((s) => !s)}
          />
        }
      />
    </div>
  )
}
