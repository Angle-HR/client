'use client'

import { useMutation } from '@tanstack/react-query'

import { requests } from './requests'

function useJoinWaitlist() {
  return useMutation({ mutationFn: requests.joinWaitlist })
}

function useSubmitOnboarding() {
  return useMutation({ mutationFn: requests.submitOnboarding })
}

export { useJoinWaitlist, useSubmitOnboarding }
