import { describe, expect, it } from 'vitest'

import { previewJobFrom } from '../jobs/application-preview'

import type { ApiJobView } from '../jobs/api-types'

const view: ApiJobView = {
  id: 'job-1',
  title: 'Experienced Product Designer',
  department_name: 'Design',
  employment_type: 'full_time',
  workplace_type: 'hybrid',
  location_mode: 'specific_area',
  location_text: 'San Francisco, California',
  description_sections: { role: '<p>Own the design system.</p>' },
}

describe('previewJobFrom', () => {
  it('maps the job summary to the labels the preview shows', () => {
    expect(previewJobFrom(view, 'Revolut')).toEqual({
      title: 'Experienced Product Designer',
      companyName: 'Revolut',
      location: 'San Francisco, California',
      workplace: 'Hybrid',
      employmentType: 'Full-time',
      team: 'Design',
      descriptionHtml: '<p>Own the design system.</p>',
    })
  })

  it('reads the role description whether it is a string or an html object', () => {
    const asObject = previewJobFrom(
      { ...view, description_sections: { role: { html: '<p>Hi</p>' } } },
      '',
    )
    expect(asObject.descriptionHtml).toBe('<p>Hi</p>')
  })

  it('shows Anywhere when the job can be done from anywhere', () => {
    const job = previewJobFrom({ ...view, location_mode: 'anywhere', location_text: '' }, '')
    expect(job.location).toBe('Anywhere')
  })

  it('leaves the workplace and employment type empty when the view has none', () => {
    const job = previewJobFrom(
      { ...view, workplace_type: undefined, employment_type: undefined },
      '',
    )
    expect(job.workplace).toBe('')
    expect(job.employmentType).toBe('')
  })
})
