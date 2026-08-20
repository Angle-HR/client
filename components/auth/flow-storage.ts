'use client'

import type { AccountType } from '@/components/auth/onboarding-options'
import type { BusinessValues, IndividualValues } from '@/components/auth/steps/step-account-type'
import type { ComplianceValues } from '@/components/auth/steps/step-compliance'
import type { WorkspaceValues } from '@/components/auth/steps/step-workspace'

const KEYS = {
  signupEmail: 'openhr.signup.email',
  invite: 'openhr.invite',
  onboarding: 'openhr.onboarding',
  loginEmail: 'openhr.login.email',
} as const

export interface InviteContext {
  email: string
  companyName: string
  /** Show Germany/GDPR controller disclaimer on accept screen. */
  showGdprDisclaimer?: boolean
}

export interface OnboardingDraft {
  accountType?: AccountType
  profile?: IndividualValues | BusinessValues
  workspace?: WorkspaceValues
  compliance?: ComplianceValues
}

function canUseStorage() {
  return typeof window !== 'undefined'
}

function readJson<T>(key: string): T | undefined {
  if (!canUseStorage()) return undefined
  try {
    const raw = window.sessionStorage.getItem(key)
    if (!raw) return undefined
    return JSON.parse(raw) as T
  } catch {
    return undefined
  }
}

function writeJson(key: string, value: unknown) {
  if (!canUseStorage()) return
  window.sessionStorage.setItem(key, JSON.stringify(value))
}

function removeKey(key: string) {
  if (!canUseStorage()) return
  window.sessionStorage.removeItem(key)
}

export function getSignupEmail(): string {
  if (!canUseStorage()) return ''
  return window.sessionStorage.getItem(KEYS.signupEmail) ?? ''
}

export function setSignupEmail(email: string) {
  if (!canUseStorage()) return
  window.sessionStorage.setItem(KEYS.signupEmail, email)
}

export function clearSignupEmail() {
  removeKey(KEYS.signupEmail)
}

export function getInviteContext(): InviteContext | undefined {
  return readJson<InviteContext>(KEYS.invite)
}

export function setInviteContext(value: InviteContext) {
  writeJson(KEYS.invite, value)
}

export function clearInviteContext() {
  removeKey(KEYS.invite)
}

export function getOnboardingDraft(): OnboardingDraft {
  return readJson<OnboardingDraft>(KEYS.onboarding) ?? {}
}

export function patchOnboardingDraft(patch: Partial<OnboardingDraft>) {
  writeJson(KEYS.onboarding, { ...getOnboardingDraft(), ...patch })
}

export function clearOnboardingDraft() {
  removeKey(KEYS.onboarding)
}

export function getLoginEmail(): string {
  if (!canUseStorage()) return ''
  return window.sessionStorage.getItem(KEYS.loginEmail) ?? ''
}

export function setLoginEmail(email: string) {
  if (!canUseStorage()) return
  window.sessionStorage.setItem(KEYS.loginEmail, email)
}

export function clearLoginEmail() {
  removeKey(KEYS.loginEmail)
}
