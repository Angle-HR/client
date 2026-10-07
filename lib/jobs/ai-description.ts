/**
 * Drafting a job description with AI. Figma: "Adding description with AI"
 * (8973:610003 – 8973:612039), which the designer marks as work in progress.
 *
 * There is no AI endpoint yet, so the "model" here is a stand-in that writes
 * from a fixed outline. Everything the screen needs from a real one — the
 * access states, the progress steps, the kinds of edit — is modelled, so wiring
 * the API in means replacing the functions at the bottom of this file.
 */

/**
 * Whether this person can use AI here:
 * - `unavailable` — the workspace cannot connect an AI yet
 * - `restricted` — an admin has to connect one, or grant permission
 * - `disconnected` — this person may connect one, and has not
 * - `connected` — ready to draft
 */
type AiAccess = 'unavailable' | 'restricted' | 'disconnected' | 'connected'

type Improvement = 'salary' | 'tasks' | 'growth' | 'hiring'

interface ImprovementOption {
  value: Improvement
  label: string
  /** The progress line shown while it is applied. */
  step: string
  heading: string
  body: string
}

const IMPROVEMENTS: ImprovementOption[] = [
  {
    value: 'salary',
    label: 'Add salary & benefits',
    step: 'Adding salary & benefits',
    heading: 'Salary & benefits',
    body: 'A competitive salary, reviewed every year, with a pension, private health cover, 25 days of holiday and a budget for learning.',
  },
  {
    value: 'tasks',
    label: 'Add day-to-day tasks',
    step: 'Adding day-to-day tasks',
    heading: 'Day to day',
    body: 'You will plan your week with the team, ship work in small steps, review what your colleagues ship and talk to the people who use it.',
  },
  {
    value: 'growth',
    label: 'Add growth path',
    step: 'Adding growth path',
    heading: 'Where this role can go',
    body: 'We set goals together every quarter. People in this role have grown into senior and lead positions within two years.',
  },
  {
    value: 'hiring',
    label: 'Add how we hire',
    step: 'Adding how we hire',
    heading: 'How we hire',
    body: 'A 30 minute introduction, a practical exercise you can do in your own time, then a conversation with the team. We reply to every applicant.',
  },
]

const READING_STEP = 'Reading your job title and company profile'
const POLISHING_STEP = 'Polishing it for the right candidates'

/** The lines of the progress list while a first draft is written. */
const GENERATE_STEPS = [
  READING_STEP,
  'Drafting from your job descriptions',
  'Checking it against similar roles',
  POLISHING_STEP,
]

/** The lines of the progress list while an existing draft is changed. */
function editSteps(action: string): string[] {
  return [READING_STEP, action, POLISHING_STEP]
}

/** Where an MCP client connects for this workspace. */
function mcpEndpoint(workspace: string): string {
  const slug = workspace
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  return `https://tryopenhr.com/mcp/${slug || 'workspace'}`
}

const escapeHtml = (text: string) =>
  text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')

/** The readable text of an editor value, without its markup. */
function plainText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li|h[1-6])>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replaceAll('&nbsp;', ' ')
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replace(/\n{2,}/g, '\n')
    .trim()
}

/** An editor value split into its top-level blocks (paragraphs, lists, headings). */
function blocks(html: string): string[] {
  return html.match(/<(p|ul|ol|h[1-6]|div)\b[^>]*>[\s\S]*?<\/\1>/gi) ?? (html.trim() ? [html] : [])
}

interface DraftRequest {
  title: string
  team: string
  /** Whatever was already typed into the editor; used as context. */
  context: string
}

function draftDescription({ title, team, context }: DraftRequest): string {
  const role = escapeHtml(title.trim() || 'this role')
  const where = team.trim() ? ` in our ${escapeHtml(team.trim())} team` : ''
  const notes = plainText(context)
  return [
    `<p>We are looking for a ${role}${where}. You will own your work from first idea to release and help shape how the team works.</p>`,
    notes ? `<p>${escapeHtml(notes)}</p>` : '',
    '<p><b>What you will do</b></p>',
    '<ul><li>Turn goals into clear, well scoped work</li><li>Work closely with people across the company</li><li>Share what you learn and help others do the same</li></ul>',
    '<p><b>What we are looking for</b></p>',
    '<ul><li>Experience in a similar role</li><li>Clear written and spoken communication</li><li>Care for the people who use what you make</li></ul>',
  ].join('')
}

/** Keeps the opening and the first list, dropping the rest. */
function shortenDescription(html: string): string {
  const all = blocks(html)
  if (all.length <= 2) return html
  const firstList = all.find((block) => /^<(ul|ol)\b/i.test(block))
  return [all[0], firstList].filter(Boolean).join('')
}

function lengthenDescription(html: string): string {
  return `${html}<p><b>Why join us</b></p><p>You will join a small team that trusts each other, works in the open and cares about doing a few things well. We will give you the time and tools to do your best work.</p>`
}

/** Appends the section for an improvement, once. */
function improveDescription(html: string, improvement: Improvement): string {
  const option = IMPROVEMENTS.find((item) => item.value === improvement)
  if (!option || html.includes(`<b>${option.heading}</b>`)) return html
  return `${html}<p><b>${option.heading}</b></p><p>${option.body}</p>`
}

/** Applies a change described in the user's own words. */
function describeChange(html: string, instruction: string): string {
  const note = instruction.trim()
  if (!note) return html
  return `${html}<p>${escapeHtml(note.charAt(0).toUpperCase() + note.slice(1))}${/[.!?]$/.test(note) ? '' : '.'}</p>`
}

export {
  GENERATE_STEPS,
  IMPROVEMENTS,
  describeChange,
  draftDescription,
  editSteps,
  improveDescription,
  lengthenDescription,
  mcpEndpoint,
  plainText,
  shortenDescription,
}
export type { AiAccess, DraftRequest, Improvement, ImprovementOption }
