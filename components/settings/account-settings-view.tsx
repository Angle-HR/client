'use client'

import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import QRCode from 'qrcode'
import { useEffect, useState, type FormEvent, type ReactElement } from 'react'

import { Button, TextInput } from '@/components/ui'
import { getApiError, verificationCodeError } from '@/lib/api-error'
import { clearSession } from '@/lib/auth-session'
import { useConfirmTotp, useDisableTotp, useEnrollTotp } from '@/lib/mutations'
import { useMe } from '@/lib/queries'
import { queryKeys } from '@/lib/query-keys'

const CODE_PATTERN = /^\d{6}$/

/** A QR code for the otpauth link, drawn in the browser so the secret goes nowhere else. */
function OtpQr({ url }: { url: string }): ReactElement {
  const [src, setSrc] = useState('')
  useEffect(() => {
    let live = true
    QRCode.toDataURL(url, { margin: 1, width: 176 })
      .then((data) => {
        if (live) setSrc(data)
      })
      .catch(() => {
        if (live) setSrc('')
      })
    return () => {
      live = false
    }
  }, [url])

  return src ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt="QR code for your authenticator app"
      width={176}
      height={176}
      className="rounded-lg-10 bg-white"
    />
  ) : (
    <div className="h-[176px] w-[176px]" aria-busy />
  )
}

/** Turning two-factor authentication on: start, scan or copy the secret, then confirm with a code. */
function EnrollPanel({ onDone }: { onDone: () => void }): ReactElement {
  const enroll = useEnrollTotp()
  const confirm = useConfirmTotp()
  const [code, setCode] = useState('')
  const [error, setError] = useState('')

  function start(): void {
    setError('')
    enroll.mutate(undefined, {
      onError: (e) => setError(getApiError(e)?.message ?? 'Could not start setup. Try again.'),
    })
  }

  function submit(event: FormEvent): void {
    event.preventDefault()
    if (!CODE_PATTERN.test(code)) {
      setError('Enter the 6 digit code from your app.')
      return
    }
    setError('')
    confirm.mutate(
      { code },
      { onSuccess: onDone, onError: (e) => setError(verificationCodeError(e)) },
    )
  }

  if (!enroll.data) {
    return (
      <div className="flex flex-col gap-[12px]">
        <p className="text-body-xs leading-19_2 text-text-tertiary">
          Use an authenticator app (such as 1Password, Authy or Google Authenticator) to get a code
          each time you sign in.
        </p>
        <Button
          type="button"
          variant="primary"
          accent="blue"
          size="md"
          className="w-fit"
          loading={enroll.isPending}
          onClick={start}
        >
          Set up authenticator app
        </Button>
        {error ? (
          <p role="alert" className="text-body-xs leading-19_2 text-text-error">
            {error}
          </p>
        ) : null}
      </div>
    )
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-[16px]">
      <p className="text-body-xs leading-19_2 text-text-secondary">
        Scan the code with your authenticator app, or enter the key by hand. Then type the 6 digit
        code it shows.
      </p>
      <OtpQr url={enroll.data.otpauth_url} />
      <div className="flex flex-col gap-[4px]">
        <span className="text-body-xs leading-19_2 text-text-tertiary">Setup key</span>
        <code
          data-testid="totp-secret"
          className="w-fit rounded-lg-10 border border-border-transparent-light px-[8px] py-[4px] text-body-s break-all text-text-primary"
        >
          {enroll.data.secret}
        </code>
        <a
          href={enroll.data.otpauth_url}
          className="w-fit text-body-xs leading-19_2 text-text-secondary underline"
        >
          Open in an authenticator app on this device
        </a>
      </div>
      <TextInput
        label="Authentication code"
        value={code}
        autoComplete="one-time-code"
        onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
        errorText={error || undefined}
        helperState={error ? 'error' : 'neutral'}
      />
      <Button
        type="submit"
        variant="primary"
        accent="blue"
        size="md"
        className="w-fit"
        loading={confirm.isPending}
      >
        Turn on
      </Button>
    </form>
  )
}

/** Turning it off takes the password and a current code; the server then ends every session. */
function DisablePanel(): ReactElement {
  const router = useRouter()
  const queryClient = useQueryClient()
  const disable = useDisableTotp()
  const [open, setOpen] = useState(false)
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function submit(event: FormEvent): void {
    event.preventDefault()
    if (!password) {
      setError('Enter your password.')
      return
    }
    if (!CODE_PATTERN.test(code)) {
      setError('Enter the 6 digit code from your app.')
      return
    }
    setError('')
    disable.mutate(
      { code, password },
      {
        onSuccess: () => {
          // The server ends every session of the account, this one included.
          clearSession()
          queryClient.clear()
          router.replace('/login')
        },
        onError: (e) => setError(verificationCodeError(e)),
      },
    )
  }

  if (!open) {
    return (
      <Button
        type="button"
        variant="secondary"
        accent="red"
        size="md"
        className="w-fit"
        onClick={() => setOpen(true)}
      >
        Turn off two-factor authentication
      </Button>
    )
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-[16px]">
      <p className="text-body-xs leading-19_2 text-text-secondary">
        Enter your password and a current code from your app. You will be signed out everywhere and
        asked to sign in again.
      </p>
      <TextInput
        label="Password"
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />
      <TextInput
        label="Authentication code"
        autoComplete="one-time-code"
        value={code}
        onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
        errorText={error || undefined}
        helperState={error ? 'error' : 'neutral'}
      />
      <div className="flex gap-[8px]">
        <Button type="submit" variant="primary" accent="red" size="md" loading={disable.isPending}>
          Turn off
        </Button>
        <Button type="button" variant="tertiary" size="md" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  )
}

/** The person's own settings. For now: two-factor authentication. */
function AccountSettingsView(): ReactElement {
  const me = useMe()
  const queryClient = useQueryClient()

  return (
    <div className="flex w-[640px] max-w-full flex-col gap-[24px] p-[24px]">
      <h1 className="text-body-xl leading-24 font-semibold text-text-primary">Account settings</h1>
      <section className="flex flex-col gap-[16px] border-b border-border-transparent-light pb-[24px]">
        <div className="flex flex-col gap-[4px]">
          <h2 className="text-body-s leading-19_5 font-semibold text-text-primary">
            Two-factor authentication
          </h2>
          <span className="text-body-xs leading-19_2 text-text-tertiary">
            {me.data
              ? me.data.totp_enabled
                ? 'On. You are asked for a code from your authenticator app when you sign in.'
                : 'Off.'
              : ' '}
          </span>
        </div>
        {me.data ? (
          me.data.totp_enabled ? (
            <DisablePanel />
          ) : (
            <EnrollPanel
              onDone={() => void queryClient.invalidateQueries({ queryKey: queryKeys.me })}
            />
          )
        ) : (
          <div aria-busy>
            {me.isError ? <p role="alert">Couldn&apos;t load your account.</p> : null}
          </div>
        )}
      </section>
    </div>
  )
}

export { AccountSettingsView }
