'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { queryKeys } from './query-keys'
import { requests } from './requests'

import type { OnboardingProgressSummary, ProductOnboardingStatusData } from './types'

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

function useRequestLoginOtp() {
  return useMutation({ mutationFn: requests.requestLoginOtp })
}

function useVerifyLoginOtp() {
  return useMutation({ mutationFn: requests.verifyLoginOtp })
}

function useVerifyLoginTotp() {
  return useMutation({ mutationFn: requests.verifyLoginTotp })
}

function useForgotPassword() {
  return useMutation({ mutationFn: requests.forgotPassword })
}

function useResetPassword() {
  return useMutation({ mutationFn: requests.resetPassword })
}

function useAcceptInvite() {
  return useMutation({ mutationFn: requests.acceptInvite })
}

function useEnrollTotp() {
  return useMutation({ mutationFn: requests.enrollTotp })
}

function useConfirmTotp() {
  return useMutation({ mutationFn: requests.confirmTotp })
}

function useDisableTotp() {
  return useMutation({ mutationFn: requests.disableTotp })
}

function useInviteTeammate() {
  return useMutation({ mutationFn: requests.inviteTeammate })
}

/**
 * Saving a step returns the progress it produced. Writing that straight into the
 * cached `/onboarding/status` keeps the two in step: without it the next page
 * asks for status, is handed the pre-save answer, and sends the user back to the
 * step they just finished until the query happens to refetch.
 */
function useOnboardingStep<TPayload, TData extends { onboarding?: OnboardingProgressSummary }>(
  mutationFn: (payload: TPayload) => Promise<TData>,
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn,
    onSuccess: (data) => {
      if (!data.onboarding) {
        // Nothing authoritative came back; refetch rather than trust the cache.
        void queryClient.invalidateQueries({ queryKey: queryKeys.onboardingStatus })
        return
      }
      queryClient.setQueryData<ProductOnboardingStatusData>(
        queryKeys.onboardingStatus,
        (previous) => ({ ...previous, ...data.onboarding }) as ProductOnboardingStatusData,
      )
    },
  })
}

function useUpsertProfile() {
  return useOnboardingStep(requests.upsertProfile)
}

function useUpsertAddress() {
  return useOnboardingStep(requests.upsertAddress)
}

function useUpsertBusiness() {
  return useOnboardingStep(requests.upsertBusiness)
}

/** Canonical compliance step; `useUpsertBusiness` hits the deprecated alias. */
function useUpsertCompliance() {
  return useOnboardingStep(requests.upsertCompliance)
}

function useCompleteOnboarding() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: requests.completeOnboarding,
    // Finishing changes status wholesale, so take it fresh from the server.
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.onboardingStatus })
    },
  })
}

export {
  useAcceptInvite,
  useConfirmTotp,
  useDisableTotp,
  useEnrollTotp,
  useForgotPassword,
  useInviteTeammate,
  useRequestLoginOtp,
  useResetPassword,
  useVerifyLoginOtp,
  useVerifyLoginTotp,
  useCompleteOnboarding,
  useJoinWaitlist,
  useLogin,
  useResendVerification,
  useSignup,
  useSubmitOnboarding,
  useUpdateSignupEmail,
  useUpsertAddress,
  useUpsertBusiness,
  useUpsertCompliance,
  useUpsertProfile,
  useVerifyEmail,
}
