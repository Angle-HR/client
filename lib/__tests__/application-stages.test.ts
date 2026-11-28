import { describe, expect, it } from 'vitest'

import { contactFromAnswers, currentRoleFromAnswers, linkKind } from '../applications/contact'
import {
  describeActivity,
  reasonNeedsNote,
  toActivity,
  toStage,
  visibleActivity,
} from '../applications/pipeline'
import {
  ALL_TAB,
  disqualifyNote,
  disqualifyPlan,
  findStage,
  firstName,
  moveOptionsFor,
  stageForTab,
  stageOfKind,
  stageTabs,
} from '../applications/stages'

import type { ApplicantAnswer } from '../applications/api'

const STAGES = [
  { id: 's-applied', key: 'applied', name: 'Applied', kind: 'applied', position: 0, count: 4 },
  {
    id: 's-short',
    key: 'shortlisted',
    name: 'Shortlisted',
    kind: 'shortlisted',
    position: 1,
    count: 2,
  },
  { id: 's-int', key: 'interview', name: 'Interview', kind: 'interview', position: 2, count: 1 },
  {
    id: 's-test',
    key: 'technical_test',
    name: 'Technical test',
    kind: 'custom',
    position: 3,
    count: 0,
  },
  { id: 's-hired', key: 'hired', name: 'Hired', kind: 'hired', position: 4, count: 3, final: true },
  {
    id: 's-dq',
    key: 'disqualified',
    name: 'Disqualified',
    kind: 'disqualified',
    position: 5,
    count: 5,
    final: true,
  },
].map(toStage)

describe('toStage', () => {
  it('reads a stage and treats an unknown kind as custom', () => {
    expect(toStage({ id: 'x', name: 'Panel', kind: 'whatever', count: 2 })).toMatchObject({
      id: 'x',
      name: 'Panel',
      kind: 'custom',
      count: 2,
      final: false,
    })
  })
})

describe('stageTabs', () => {
  it('lists All Applicants, then every stage but Applied, in order, with its count', () => {
    const tabs = stageTabs(STAGES, { 's-short': 7, 's-hired': 3 }, 16)
    expect(tabs.map((tab) => tab.label)).toEqual([
      'All Applicants',
      'Shortlisted',
      'Interview',
      'Technical test',
      'Hired',
      'Disqualified',
    ])
    expect(tabs[0]?.count).toBe(16)
    expect(tabs.find((tab) => tab.label === 'Shortlisted')?.count).toBe(7)
  })

  it('falls back to the count the stage carries when the list gave none', () => {
    expect(stageTabs(STAGES, {}, 0).find((tab) => tab.label === 'Disqualified')?.count).toBe(5)
  })
})

describe('stageForTab', () => {
  it('filters nothing for All and asks for the stage id otherwise', () => {
    expect(stageForTab(ALL_TAB)).toBeUndefined()
    expect(stageForTab('s-hired')).toBe('s-hired')
  })
})

describe('findStage and stageOfKind', () => {
  it('finds a stage by id and by kind', () => {
    expect(findStage(STAGES, 's-int')?.name).toBe('Interview')
    expect(findStage(STAGES, 'gone')).toBeUndefined()
    expect(findStage(STAGES, undefined)).toBeUndefined()
    expect(stageOfKind(STAGES, 'disqualified')?.id).toBe('s-dq')
  })
})

describe('disqualifyPlan', () => {
  it('moves a received or in review application to Disqualified', () => {
    expect(disqualifyPlan('received', false)).toEqual({ kind: 'move' })
    expect(disqualifyPlan('in_review', false)).toEqual({ kind: 'move' })
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

describe('reasonNeedsNote', () => {
  it('requires a note only for Other', () => {
    expect(reasonNeedsNote('other')).toBe(true)
    expect(reasonNeedsNote('not_a_fit')).toBe(false)
    expect(reasonNeedsNote('')).toBe(false)
  })
})

describe('disqualifyNote', () => {
  it('trims the note', () => {
    expect(disqualifyNote(' Moved abroad ')).toBe('Moved abroad')
    expect(disqualifyNote('  ')).toBe('')
  })
})

describe('moveOptionsFor', () => {
  const inReview = { status: 'in_review', stageId: 's-short' } as const

  it('lists every stage but Applied, in order', () => {
    expect(moveOptionsFor(STAGES, inReview, true).map((option) => option.stage.name)).toEqual([
      'Shortlisted',
      'Interview',
      'Technical test',
      'Hired',
      'Disqualified',
    ])
  })

  it('disables the stage the application is already in', () => {
    const options = moveOptionsFor(STAGES, inReview, true)
    expect(options.find((option) => option.stage.id === 's-short')?.enabled).toBe(false)
    expect(options.find((option) => option.stage.id === 's-int')?.enabled).toBe(true)
  })

  it('enables open stages, Hired and Disqualified for an application that is still open', () => {
    for (const status of ['received', 'in_review'] as const) {
      const options = moveOptionsFor(STAGES, { status, stageId: 's-applied' }, true)
      expect(options.every((option) => option.enabled)).toBe(true)
    }
  })

  it('enables Disqualified on a flagged application only for the person who can decide it', () => {
    const flagged = { status: 'flagged', stageId: 's-applied' } as const
    const options = moveOptionsFor(STAGES, flagged, true)
    expect(options.find((option) => option.stage.kind === 'disqualified')?.enabled).toBe(true)
    expect(options.find((option) => option.stage.kind === 'hired')?.enabled).toBe(false)
  })

  it('disables every move for a finished application, or a person who cannot decide', () => {
    for (const status of ['rejected', 'hired', 'withdrawn'] as const) {
      const options = moveOptionsFor(STAGES, { status, stageId: 's-hired' }, true)
      expect(options.every((option) => !option.enabled)).toBe(true)
    }
    expect(moveOptionsFor(STAGES, inReview, false).every((option) => !option.enabled)).toBe(true)
  })
})

describe('activity', () => {
  const at = '2026-11-01T10:00:00Z'

  it('describes a stage move with where it came from', () => {
    const move = toActivity({
      id: 1,
      type: 'stage_changed',
      created_at: at,
      data: { from_stage: 'Applied', to_stage: 'Interview' },
    })
    expect(describeActivity(move)).toBe('moved from Applied to Interview')
  })

  it('describes tag changes by name', () => {
    const tags = toActivity({
      id: 2,
      type: 'tags_changed',
      data: { added: ['Strong'], removed: ['Maybe'] },
    })
    expect(describeActivity(tags)).toBe('added Strong and removed Maybe (tags)')
  })

  it('hides the status change that comes with a stage move', () => {
    const items = [
      toActivity({
        id: 3,
        type: 'status_changed',
        actor_id: 'u',
        created_at: at,
        data: { to: 'hired' },
      }),
      toActivity({
        id: 4,
        type: 'stage_changed',
        actor_id: 'u',
        created_at: at,
        data: { to_stage: 'Hired' },
      }),
      toActivity({
        id: 5,
        type: 'status_changed',
        actor_id: 'v',
        created_at: '2026-11-02T10:00:00Z',
      }),
    ]
    expect(visibleActivity(items).map((item) => item.id)).toEqual([4, 5])
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
