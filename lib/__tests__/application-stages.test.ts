import { describe, expect, it } from 'vitest'

import { contactFromAnswers, currentRoleFromAnswers, linkKind } from '../applications/contact'
import {
  canMoveTo,
  disqualifyPlan,
  stageOfStatus,
  statusesForTab,
  tabCount,
} from '../applications/stages'

import type { ApplicantAnswer } from '../applications/api'

describe('stageOfStatus', () => {
  it('maps received to Applied, hired to Hired and rejected to Disqualified', () => {
    expect(stageOfStatus('received')).toBe('applied')
    expect(stageOfStatus('hired')).toBe('hired')
    expect(stageOfStatus('rejected')).toBe('disqualified')
  })

  it('shows Applied for applications still awaiting a decision, and nothing for withdrawn', () => {
    expect(stageOfStatus('in_review')).toBe('applied')
    expect(stageOfStatus('flagged')).toBe('applied')
    expect(stageOfStatus('withdrawn')).toBeNull()
  })
})

describe('tabCount', () => {
  const counts = { received: 4, in_review: 2, flagged: 1, hired: 3, rejected: 5, withdrawn: 1 }

  it('counts every applicant under All', () => {
    expect(tabCount('all', counts)).toBe(16)
  })

  it('counts Hired and Disqualified from their statuses', () => {
    expect(tabCount('hired', counts)).toBe(3)
    expect(tabCount('disqualified', counts)).toBe(5)
  })

  it('shows zero for the stages with no status yet', () => {
    expect(tabCount('shortlisted', counts)).toBe(0)
    expect(tabCount('interview', counts)).toBe(0)
    expect(tabCount('offer', counts)).toBe(0)
  })
})

describe('statusesForTab', () => {
  it('filters nothing for All and asks for the mapped statuses otherwise', () => {
    expect(statusesForTab('all')).toBeUndefined()
    expect(statusesForTab('hired')).toEqual(['hired'])
    expect(statusesForTab('disqualified')).toEqual(['rejected'])
    expect(statusesForTab('interview')).toEqual([])
  })
})

describe('canMoveTo', () => {
  it('allows Hired only from in review', () => {
    expect(canMoveTo('hired', 'in_review')).toBe(true)
    expect(canMoveTo('hired', 'received')).toBe(false)
    expect(canMoveTo('hired', 'flagged')).toBe(false)
  })

  it('allows no move to the stages without a server status', () => {
    expect(canMoveTo('shortlisted', 'in_review')).toBe(false)
    expect(canMoveTo('interview', 'in_review')).toBe(false)
    expect(canMoveTo('offer', 'in_review')).toBe(false)
    expect(canMoveTo('applied', 'received')).toBe(false)
  })
})

describe('disqualifyPlan', () => {
  it('moves a received application to in review before rejecting it', () => {
    expect(disqualifyPlan('received', false)).toEqual({
      kind: 'status',
      steps: ['in_review', 'rejected'],
    })
  })

  it('rejects an in review application in one step', () => {
    expect(disqualifyPlan('in_review', false)).toEqual({ kind: 'status', steps: ['rejected'] })
  })

  it('rejects a flagged application through its review, only when the person can decide', () => {
    expect(disqualifyPlan('flagged', true)).toEqual({ kind: 'review' })
    expect(disqualifyPlan('flagged', false)).toBeNull()
  })

  it('cannot disqualify a hired, rejected or withdrawn application', () => {
    expect(disqualifyPlan('hired', true)).toBeNull()
    expect(disqualifyPlan('rejected', true)).toBeNull()
    expect(disqualifyPlan('withdrawn', true)).toBeNull()
  })
})

describe('linkKind', () => {
  it('names LinkedIn and GitHub by host and anything else a website', () => {
    expect(linkKind('https://www.linkedin.com/in/ada')).toBe('linkedin')
    expect(linkKind('github.com/ada')).toBe('github')
    expect(linkKind('https://ada.dev')).toBe('website')
    expect(linkKind('not a url at all')).toBe('website')
  })
})

describe('contactFromAnswers', () => {
  const answers: ApplicantAnswer[] = [
    {
      questionId: 'p',
      label: 'Phone',
      section: 'personal_information',
      text: '+44 7000',
      type: 'phone_number',
    },
    {
      questionId: 'w',
      label: 'Website',
      section: 'profile',
      text: 'https://ada.dev',
      type: 'short_text',
    },
    {
      questionId: 'l',
      label: 'LinkedIn',
      section: 'profile',
      text: 'linkedin.com/in/ada',
      type: 'short_text',
    },
    {
      questionId: 'a',
      label: 'Authorized to work in the UK',
      section: 'eligibility',
      text: 'Yes',
      type: 'single_choice',
    },
    { questionId: 'x', label: 'Why', section: 'screening', text: 'Because', type: 'long_text' },
  ]

  it('reads the phone, the links and the work authorisation', () => {
    expect(contactFromAnswers(answers)).toEqual({
      phone: '+44 7000',
      links: [
        { kind: 'website', url: 'https://ada.dev' },
        { kind: 'linkedin', url: 'linkedin.com/in/ada' },
      ],
      authorizedToWork: true,
    })
  })

  it('leaves the work authorisation unset when there is no such answer', () => {
    expect(contactFromAnswers([answers[4] as ApplicantAnswer])).toEqual({
      phone: '',
      links: [],
      authorizedToWork: undefined,
    })
  })
})

describe('currentRoleFromAnswers', () => {
  it('reads the role and company when the form asked for them', () => {
    const answers: ApplicantAnswer[] = [
      {
        questionId: 'r',
        label: 'Current role',
        section: 'profile',
        text: 'Product Designer',
        type: 'short_text',
      },
      { questionId: 'c', label: 'Company', section: 'profile', text: 'Stripe', type: 'short_text' },
    ]
    expect(currentRoleFromAnswers(answers)).toEqual({ role: 'Product Designer', company: 'Stripe' })
    expect(currentRoleFromAnswers([])).toEqual({ role: '', company: '' })
  })
})
