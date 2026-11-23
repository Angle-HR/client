import { describe, expect, it } from 'vitest'

import { contactFromAnswers, currentRoleFromAnswers, linkKind } from '../applications/contact'
import {
  DISQUALIFY_REASONS,
  canMoveTo,
  disqualifyNote,
  disqualifyPlan,
  firstName,
  moveOptionsFor,
  reasonNeedsNote,
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

describe('DISQUALIFY_REASONS', () => {
  it('lists the reasons the captures draw, grouped under Not a match, with Other last', () => {
    expect(DISQUALIFY_REASONS.map((reason) => reason.label)).toEqual([
      "Doesn't meet required qualifications",
      'Not enough relevant experience',
      "Skills don't match the role",
      "Didn't pass assessment",
      "Salary expectations don't align",
      'Not eligible to work in this location',
      'Other (requires a note)',
    ])
    expect(DISQUALIFY_REASONS.slice(0, 6).every((reason) => reason.group === 'Not a match')).toBe(
      true,
    )
  })

  it('requires a note only for Other', () => {
    expect(reasonNeedsNote('Other (requires a note)')).toBe(true)
    expect(reasonNeedsNote("Didn't pass assessment")).toBe(false)
    expect(reasonNeedsNote('')).toBe(false)
  })
})

describe('disqualifyNote', () => {
  it('sends only the note for Other, which requires one', () => {
    expect(disqualifyNote('Other (requires a note)', ' Moved abroad ')).toBe('Moved abroad')
  })

  it('sends the reason alone when there is no note', () => {
    expect(disqualifyNote("Didn't pass assessment", '  ')).toBe("Didn't pass assessment")
  })

  it('sends the reason and the trimmed note together', () => {
    expect(disqualifyNote("Didn't pass assessment", ' Scored 40% ')).toBe(
      "Didn't pass assessment — Scored 40%",
    )
  })
})

describe('moveOptionsFor', () => {
  it('enables Hired only from in review, and Disqualified when a plan exists', () => {
    const inReview = moveOptionsFor('in_review', true)
    expect(inReview.find((option) => option.stage === 'hired')?.enabled).toBe(true)
    expect(inReview.find((option) => option.stage === 'disqualified')?.enabled).toBe(true)

    const received = moveOptionsFor('received', false)
    expect(received.find((option) => option.stage === 'hired')?.enabled).toBe(false)
    expect(received.find((option) => option.stage === 'disqualified')?.enabled).toBe(true)
  })

  it('enables Disqualified on a flagged application only for the person who can decide it', () => {
    expect(
      moveOptionsFor('flagged', true).find((option) => option.stage === 'disqualified')?.enabled,
    ).toBe(true)
    expect(
      moveOptionsFor('flagged', false).find((option) => option.stage === 'disqualified')?.enabled,
    ).toBe(false)
  })

  it('disables every move for a finished application', () => {
    for (const status of ['rejected', 'hired', 'withdrawn'] as const) {
      expect(moveOptionsFor(status, true).every((option) => !option.enabled)).toBe(true)
    }
  })

  it('lists the stages in the submenu order, with no server status behind the first three', () => {
    const options = moveOptionsFor('in_review', true)
    expect(options.map((option) => option.label)).toEqual([
      'Shortlisted',
      'Interview',
      'Offer',
      'Hired',
      'Disqualified',
    ])
    expect(options.slice(0, 3).every((option) => !option.enabled)).toBe(true)
  })
})

describe('firstName', () => {
  it('takes the first word of a name', () => {
    expect(firstName('  Liam Chen ')).toBe('Liam')
    expect(firstName('')).toBe('')
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
