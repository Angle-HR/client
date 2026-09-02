'use client'

import { useSyncExternalStore } from 'react'

import { getVerificationEmail } from '@/lib/auth-session'

import {
  getInviteContext,
  getLoginEmail,
  getOnboardingDraft,
  getSignupEmail,
  type InviteContext,
  type OnboardingDraft,
} from './flow-storage'

/**
 * Flow values live in sessionStorage, which doesn't exist while the page is
 * prerendered on the server. Reading them through useSyncExternalStore is what
 * lets a screen render the real value on its first client paint: React hydrates
 * with the server snapshot, then re-renders with the client one — no
 * setState-in-effect, so no cascading render and no frame of empty UI.
 *
 * Nothing outside the current screen rewrites these keys mid-flow, so there is
 * no change to subscribe to; the snapshot is read as React hydrates.
 */
const noSubscribe = () => () => {}

const emptyString = () => ''
const noInvite = () => undefined
const emptyDraft: OnboardingDraft = {}
const noDraft = () => emptyDraft

/**
 * useSyncExternalStore re-renders whenever the snapshot changes identity, so a
 * reader that parses JSON on every call would loop forever. Hand back the
 * previous object unless the stored text actually changed.
 */
function stableReader<T>(read: () => T): () => T {
  let lastRaw: string | undefined
  let lastValue: T
  return () => {
    const value = read()
    const raw = JSON.stringify(value ?? null)
    if (raw !== lastRaw) {
      lastRaw = raw
      lastValue = value
    }
    return lastValue
  }
}

const readInvite = stableReader(getInviteContext)
const readDraft = stableReader(getOnboardingDraft)
const readVerificationEmail = () => getVerificationEmail() ?? ''

/** Email captured by the login form, or '' before the server snapshot resolves. */
function useLoginEmail(): string {
  return useSyncExternalStore(noSubscribe, getLoginEmail, emptyString)
}

/** Email captured by the signup form, or '' before the server snapshot resolves. */
function useSignupEmail(): string {
  return useSyncExternalStore(noSubscribe, getSignupEmail, emptyString)
}

/** Email the verification session was opened with, from the auth-session store. */
function useVerificationEmail(): string {
  return useSyncExternalStore(noSubscribe, readVerificationEmail, emptyString)
}

function useInviteContext(): InviteContext | undefined {
  return useSyncExternalStore(noSubscribe, readInvite, noInvite)
}

function useOnboardingDraft(): OnboardingDraft {
  return useSyncExternalStore(noSubscribe, readDraft, noDraft)
}

export { useInviteContext, useLoginEmail, useOnboardingDraft, useSignupEmail, useVerificationEmail }
