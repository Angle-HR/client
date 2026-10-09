import { describe, expect, it } from 'vitest'

import { EMPTY_DRAFT } from '../jobs/draft'
import {
  draftErrorsFrom,
  draftFromView,
  draftToBody,
  marketFor,
  timezoneLabel,
} from '../jobs/draft-api'

import type { DraftLookups } from '../jobs/draft-api'

const today = new Date('2026-10-09T10:00:00Z')

const lookups: DraftLookups = {
  departments: [{ id: 'dep-1', name: 'Design' }],
  catalog: {
    industries: [{ id: 'ind-1', name: 'Tech / Software' }],
    seniority_levels: [{ id: 'sen-1', name: 'Senior' }],
    experience_ranges: [{ id: 'exp-1', name: '3 to 5 years' }],
    markets: [
      { code: 'UK', name: 'United Kingdom' },
      { code: 'US', name: 'United States' },
    ],
  },
  skills: [{ id: 'skill-1', name: 'Figma' }],
}

describe('marketFor', () => {
  it('takes the market from the country and the city from what comes before it', () => {
    expect(marketFor('London, UK')).toEqual({ market_code: 'UK', city: 'London' })
    expect(marketFor('United States')).toEqual({ market_code: 'US' })
    expect(marketFor('Lagos, Nigeria')).toEqual({ market_code: 'NG', city: 'Lagos' })
  })

  it('leaves the market empty for a place it cannot read a country from', () => {
    expect(marketFor('Atlantis')).toEqual({ market_code: '' })
  })
})

describe('draftToBody', () => {
  it('sends names as the ids the API holds', () => {
    const body = draftToBody(
      {
        ...EMPTY_DRAFT,
        title: '  Product designer ',
        team: 'Design',
        industry: 'Tech / Software',
        seniority: 'Senior',
        experience: '3 to 5 years',
        employmentType: 'Part-time',
        workplace: 'On-site',
        travel: 'few',
        visaSponsorship: 'no',
        description: '<p>Hello</p>',
        skills: ['Figma', 'Sketching'],
      },
      lookups,
      today,
    )
    expect(body).toMatchObject({
      title: 'Product designer',
      department_id: 'dep-1',
      industry_id: 'ind-1',
      custom_industry: '',
      seniority_level_id: 'sen-1',
      experience_range_id: 'exp-1',
      employment_type: 'part_time',
      workplace_type: 'onsite',
      travel_frequency: 'occasional',
      visa_sponsorship: 'no',
      description_sections: { role: '<p>Hello</p>' },
      skills: [{ skill_id: 'skill-1' }, { custom_label: 'Sketching' }],
    })
  })

  it('sends an industry the list does not have as a custom one', () => {
    const body = draftToBody({ ...EMPTY_DRAFT, industry: 'Space' }, lookups, today)
    expect(body.industry_id).toBe('')
    expect(body.custom_industry).toBe('Space')
  })

  it('sends chosen areas as markets, once each, and keeps their text', () => {
    const body = draftToBody(
      {
        ...EMPTY_DRAFT,
        hiringArea: 'area',
        areas: ['London, UK', 'United States', 'London, UK'],
        sameAsCompanyAddress: true,
      },
      lookups,
      today,
    )
    expect(body.location_mode).toBe('specific_area')
    expect(body.location_text).toBe('London, UK; United States; London, UK')
    expect(body.use_company_address).toBe(true)
    expect(body.markets).toEqual([{ market_code: 'UK', city: 'London' }, { market_code: 'US' }])
  })

  it('sends no markets for a job open anywhere', () => {
    const body = draftToBody({ ...EMPTY_DRAFT, areas: ['London, UK'] }, lookups, today)
    expect(body.location_mode).toBe('anywhere')
    expect(body.markets).toEqual([])
    expect(body.location_text).toBe('')
  })

  it('sends the timezone on its own, as the form has no market for it', () => {
    const body = draftToBody(
      { ...EMPTY_DRAFT, hiringArea: 'timezone', timezone: 'Europe/London' },
      lookups,
      today,
    )
    expect(body.location_mode).toBe('specific_timezone')
    expect(body.markets).toEqual([{ timezone: 'Europe/London' }])
  })

  it('sends pay as numbers, with no maximum for an exact amount', () => {
    const range = draftToBody(
      { ...EMPTY_DRAFT, currency: 'GBP', payMin: '39,000', payMax: '49,000' },
      lookups,
      today,
    )
    expect(range.pay).toEqual({
      type: 'range',
      currency: 'GBP',
      period: 'year',
      min: 39000,
      max: 49000,
      visible: true,
    })

    const exact = draftToBody(
      {
        ...EMPTY_DRAFT,
        payType: 'exact',
        payMin: '20',
        payMax: '99',
        payPeriod: 'hourly',
        showPayOnCareerPage: false,
      },
      lookups,
      today,
    )
    expect(exact.pay).toMatchObject({ type: 'exact', period: 'hour', min: 20, max: null })
    expect(exact.pay?.visible).toBe(false)
  })

  it('sends the pay type and period the form shows even before an amount is typed', () => {
    expect(draftToBody(EMPTY_DRAFT, lookups, today).pay).toMatchObject({
      type: 'range',
      period: 'year',
      min: null,
      max: null,
    })
  })

  it('sends a closing date only when it is a real date from today on', () => {
    const closing = (day: string, month: string, year: string) =>
      draftToBody({ ...EMPTY_DRAFT, closingDate: { day, month, year } }, lookups, today)
        .closing_date
    expect(closing('25', '12', '2026')).toBe('2026-12-25')
    expect(closing('01', '01', '2020')).toBe('')
    expect(closing('', '', '')).toBe('')
  })
})

describe('draftFromView', () => {
  it('fills the form from a job as the API returns it', () => {
    const draft = draftFromView(
      {
        title: 'Product designer',
        job_code: 'JB-1',
        department_id: 'dep-1',
        department_name: 'Design',
        closing_date: '2026-12-25',
        location_mode: 'specific_area',
        location_text: 'London, UK; United States',
        use_company_address: true,
        show_on_career_page: false,
        workplace_type: 'hybrid',
        travel_frequency: 'frequent',
        visa_sponsorship: 'yes',
        description_sections: { role: { html: '<p>Hello</p>' } },
        industry_id: 'ind-1',
        employment_type: 'contract',
        seniority_level_id: 'sen-1',
        experience_range_id: 'exp-1',
        pay: { type: 'range', currency: 'GBP', period: 'month', min: 39000, max: 49000 },
        skills: [{ skill_id: 'skill-1' }, { custom_label: 'Sketching' }],
        markets: [{ market_code: 'UK', city: 'London' }, { market_code: 'US' }],
      },
      lookups,
    )
    expect(draft).toMatchObject({
      title: 'Product designer',
      jobId: 'JB-1',
      team: 'Design',
      closingDate: { day: '25', month: '12', year: '2026' },
      hiringArea: 'area',
      areas: ['London, UK', 'United States'],
      sameAsCompanyAddress: true,
      showLocationOnCareerPage: false,
      workplace: 'Hybrid',
      travel: 'monthly',
      visaSponsorship: 'yes',
      description: '<p>Hello</p>',
      industry: 'Tech / Software',
      employmentType: 'Contract',
      seniority: 'Senior',
      experience: '3 to 5 years',
      skills: ['Figma', 'Sketching'],
      payType: 'range',
      currency: 'GBP',
      payMin: '39,000',
      payMax: '49,000',
      payPeriod: 'monthly',
    })
  })

  it('names areas from their markets when the job has no location text', () => {
    const draft = draftFromView(
      {
        location_mode: 'specific_area',
        markets: [{ market_code: 'UK', city: 'Leeds' }, { market_code: 'US' }],
      },
      lookups,
    )
    expect(draft.areas).toEqual(['Leeds, United Kingdom', 'United States'])
  })

  it('reads a timezone, a custom industry and an exact amount', () => {
    const draft = draftFromView(
      {
        location_mode: 'specific_timezone',
        markets: [{ market_code: 'UK', timezone: 'Europe/London' }],
        custom_industry: 'Space',
        pay: { type: 'exact', min: 20, max: 20, visible: false },
      },
      lookups,
    )
    expect(draft).toMatchObject({
      hiringArea: 'timezone',
      timezone: 'Europe/London',
      areas: [],
      industry: 'Space',
      payType: 'exact',
      payMin: '20',
      payMax: '',
      showPayOnCareerPage: false,
    })
  })

  it('is the empty form for an empty payload, such as a bare template', () => {
    expect(draftFromView({ pay: { visible: true }, markets: [], skills: [] }, lookups)).toEqual(
      EMPTY_DRAFT,
    )
  })

  it('survives a round trip through the API body', () => {
    const draft = {
      ...EMPTY_DRAFT,
      title: 'Product designer',
      team: 'Design',
      hiringArea: 'area' as const,
      areas: ['London, UK'],
      workplace: 'Remote' as const,
      travel: 'never' as const,
      industry: 'Tech / Software',
      skills: ['Figma'],
      currency: 'USD',
      payMin: '1,000',
      payMax: '2,000',
    }
    const body = draftToBody(draft, lookups, today)
    expect(draftFromView({ ...body, department_name: 'Design' }, lookups)).toEqual(draft)
  })
})

describe('timezoneLabel', () => {
  it('names the city, the zone and the offset, as the design lists them', () => {
    expect(timezoneLabel({ name: 'Europe/London', offset: '+01:00' }, today)).toBe(
      'London (British Summer Time) [+01:00]',
    )
    expect(timezoneLabel({ name: 'America/New_York', offset: '-04:00' }, today)).toMatch(
      /^New York \(.+\) \[-04:00\]$/,
    )
  })

  it('falls back to the city and offset for a zone the browser does not know', () => {
    expect(timezoneLabel({ name: 'Nowhere/Made_Up', offset: '+00:00' }, today)).toBe(
      'Made Up [+00:00]',
    )
  })
})

describe('draftErrorsFrom', () => {
  const failure = (fields: { path: string; message: string }[]) => ({
    response: { data: { error: { message: 'some fields need attention', details: { fields } } } },
  })

  it('puts problems on the fields that show them and returns the rest', () => {
    expect(
      draftErrorsFrom(
        failure([
          { path: 'department_id', message: 'department is required' },
          { path: 'pay.min', message: 'pay is required' },
          { path: 'markets[0].market_code', message: 'unknown market' },
        ]),
      ),
    ).toEqual({
      errors: { team: 'Department is required', pay: 'Pay is required' },
      other: ['Unknown market'],
    })
  })

  it('has nothing to place for an error that is not a validation error', () => {
    expect(draftErrorsFrom(new Error('offline'))).toEqual({ errors: {}, other: [] })
  })
})
