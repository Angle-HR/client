'use client'

import { useMutation } from '@tanstack/react-query'

import { requests } from './requests'

function useJoinWaitlist() {
  return useMutation({ mutationFn: requests.joinWaitlist })
}

function useSubmitOnboarding() {
  return useMutation({ mutationFn: requests.submitOnboarding })
}

function useSignup() {
  return useMutation({ mutationFn: requests.signup })
}

function useUpdateSignupEmail() {
  return useMutation({ mutationFn: requests.updateSignupEmail })
}

function useVerifyEmail() {
  return useMutation({ mutationFn: requests.verifyEmail })
}

function useResendVerification() {
  return useMutation({ mutationFn: requests.resendVerification })
}

function useLogin() {
  return useMutation({ mutationFn: requests.login })
}

function useUpsertProfile() {
  return useMutation({ mutationFn: requests.upsertProfile })
}

function useUpsertAddress() {
  return useMutation({ mutationFn: requests.upsertAddress })
}

function useUpsertBusiness() {
  return useMutation({ mutationFn: requests.upsertBusiness })
}

function useCompleteOnboarding() {
  return useMutation({ mutationFn: requests.completeOnboarding })
}

export {
  useCompleteOnboarding,
  useJoinWaitlist,
  useLogin,
  useResendVerification,
  useSignup,
  useSubmitOnboarding,
  useUpdateSignupEmail,
  useUpsertAddress,
  useUpsertBusiness,
  useUpsertProfile,
  useVerifyEmail,
}
