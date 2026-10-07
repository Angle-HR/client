import type { JobEmploymentType, JobManager } from './types'

/**
 * Job templates. Figma: "Job Template and secondary action" (8928:518336).
 * Stand-in data until the API serves templates; like jobs, edits live in the
 * query cache.
 */

interface JobTemplate {
  id: string
  title: string
  department: string
  employmentType: JobEmploymentType
  createdBy: JobManager
  /** Who can use the template. Only "Everyone" is designed so far. */
  visibility: 'Everyone'
  timesUsed: number
  /** ISO date (yyyy-mm-dd). */
  lastUsedAt: string
  pinned: boolean
  /** Only the creator may rename or delete a template. */
  ownedByMe: boolean
}

type TemplateGroupKey = 'pinned' | 'others'

interface TemplateGroup {
  key: TemplateGroupKey
  templates: JobTemplate[]
}

const alice: JobManager = { name: 'Alice', colour: 'green' }
const oluwasegun: JobManager = { name: 'Oluwasegun', colour: 'teal' }
const fiona: JobManager = { name: 'Fiona', colour: 'purple' }
const charlie: JobManager = { name: 'Charlie', colour: 'aqua' }

const TEMPLATE_FIXTURES: JobTemplate[] = [
  {
    id: 'tpl-001',
    title: 'Marketing Specialist',
    department: 'Design',
    employmentType: 'Part-time',
    createdBy: oluwasegun,
    visibility: 'Everyone',
    timesUsed: 27,
    lastUsedAt: '2026-11-01',
    pinned: true,
    ownedByMe: false,
  },
  {
    id: 'tpl-002',
    title: 'Data Analyst',
    department: 'Analysis',
    employmentType: 'Part-time',
    createdBy: alice,
    visibility: 'Everyone',
    timesUsed: 29,
    lastUsedAt: '2026-10-15',
    pinned: true,
    ownedByMe: true,
  },
  {
    id: 'tpl-003',
    title: 'Frontend Developer',
    department: 'Development',
    employmentType: 'Full-time',
    createdBy: alice,
    visibility: 'Everyone',
    timesUsed: 12,
    lastUsedAt: '2026-09-22',
    pinned: false,
    ownedByMe: true,
  },
  {
    id: 'tpl-004',
    title: 'Product Designer',
    department: 'Design',
    employmentType: 'Full-time',
    createdBy: fiona,
    visibility: 'Everyone',
    timesUsed: 30,
    lastUsedAt: '2026-10-15',
    pinned: false,
    ownedByMe: false,
  },
  {
    id: 'tpl-005',
    title: 'Content Strategist',
    department: 'Marketing',
    employmentType: 'Part-time',
    createdBy: charlie,
    visibility: 'Everyone',
    timesUsed: 4,
    lastUsedAt: '2025-11-30',
    pinned: false,
    ownedByMe: false,
  },
  {
    id: 'tpl-006',
    title: 'Visual Designer',
    department: 'Design',
    employmentType: 'Contract',
    createdBy: alice,
    visibility: 'Everyone',
    timesUsed: 20,
    lastUsedAt: '2026-10-15',
    pinned: false,
    ownedByMe: true,
  },
]

/** Pinned first, then everything else — the order the designer's note sets. Empty groups are dropped. */
function groupTemplates(templates: JobTemplate[]): TemplateGroup[] {
  const groups: TemplateGroup[] = [
    { key: 'pinned', templates: templates.filter((template) => template.pinned) },
    { key: 'others', templates: templates.filter((template) => !template.pinned) },
  ]
  return groups.filter((group) => group.templates.length > 0)
}

/** Matches a template's title or department, title matches first. */
function searchTemplates(templates: JobTemplate[], query: string): JobTemplate[] {
  const term = query.trim().toLowerCase()
  if (!term) return templates
  const inTitle = templates.filter((template) => template.title.toLowerCase().includes(term))
  const inDepartment = templates.filter(
    (template) =>
      !template.title.toLowerCase().includes(term) &&
      template.department.toLowerCase().includes(term),
  )
  return [...inTitle, ...inDepartment]
}

/** "Frontend Developer" → "Frontend Developer-2", stepping past names already taken. */
function duplicateName(title: string, taken: string[]): string {
  const base = title.replace(/-\d+$/, '')
  let suffix = 2
  while (taken.includes(`${base}-${suffix}`)) suffix += 1
  return `${base}-${suffix}`
}

/** Copies of the given templates, owned by the current user, unpinned and unused. */
function duplicateTemplates(
  all: JobTemplate[],
  ids: string[],
  me: JobManager,
  stamp: number,
): JobTemplate[] {
  const taken = all.map((template) => template.title)
  return all
    .filter((template) => ids.includes(template.id))
    .map((template, index) => {
      const title = duplicateName(template.title, taken)
      taken.push(title)
      return {
        ...template,
        id: `${template.id}-copy-${stamp}-${index}`,
        title,
        createdBy: me,
        ownedByMe: true,
        pinned: false,
        timesUsed: 0,
      }
    })
}

/** Splits a delete request into what may be deleted and what is not the user's to delete. */
function partitionDeletable(
  all: JobTemplate[],
  ids: string[],
): { deletable: string[]; blocked: number } {
  const chosen = all.filter((template) => ids.includes(template.id))
  return {
    deletable: chosen.filter((template) => template.ownedByMe).map((template) => template.id),
    blocked: chosen.filter((template) => !template.ownedByMe).length,
  }
}

function exportTemplates(templates: JobTemplate[], format: 'csv' | 'json'): string {
  const rows = templates.map((template) => ({
    title: template.title,
    department: template.department,
    employmentType: template.employmentType,
    createdBy: template.createdBy.name,
    visibility: template.visibility,
    timesUsed: template.timesUsed,
    lastUsed: template.lastUsedAt,
  }))
  if (format === 'json') return JSON.stringify(rows, null, 2)
  const cell = (value: string | number) => {
    const text = String(value)
    return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
  }
  const header = 'Title,Department,Employment type,Created by,Visibility,Times used,Last used'
  return [header, ...rows.map((row) => Object.values(row).map(cell).join(','))].join('\n')
}

export {
  TEMPLATE_FIXTURES,
  duplicateName,
  duplicateTemplates,
  exportTemplates,
  groupTemplates,
  partitionDeletable,
  searchTemplates,
}
export type { JobTemplate, TemplateGroup, TemplateGroupKey }
