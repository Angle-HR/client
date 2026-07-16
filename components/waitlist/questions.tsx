import {
  AirtableIcon,
  CalendlyIcon,
  DocuSignIcon,
  ExcelIcon,
  GmailIcon,
  GoogleDocsIcon,
  GoogleFormsIcon,
  NotionIcon,
  OtherATSIcon,
  SlackIcon,
  TypeformIcon,
  ZoomIcon,
} from './brand-icons'

import type { StepQuestionnaireProps } from './steps/step-questionnaire'
import type {
  HiringFrustration,
  HiringTool,
  Industry,
  Role,
  TeamSize,
} from '@/api/waitlist'

// Survey question definitions. Shaped like the props StepQuestionnaire takes, so
// they can later be fetched from the backend and passed straight through.
type SurveyQuestion = Omit<StepQuestionnaireProps, 'onContinue'>

interface SurveyData {
  industries: Industry[]
  hiringTools: HiringTool[]
  hiringFrustrations: HiringFrustration[]
  roles: Role[]
  teamSizes: TeamSize[]
}

const withEmoji = (emoji: string | undefined, text: string) => (emoji ? `${emoji} ${text}` : text)

// Local brand icons, keyed by the API's `name` (lowercased) — the API's own
// `icon_url` is currently a shared placeholder for every tool, so these give
// each option a distinct mark until real per-tool icons are seeded.
const toolIconByName: Record<string, React.ReactNode> = {
  notion: <NotionIcon />,
  calendly: <CalendlyIcon />,
  'google forms': <GoogleFormsIcon />,
  typeform: <TypeformIcon />,
  excel: <ExcelIcon />,
  gmail: <GmailIcon />,
  slack: <SlackIcon />,
  docusign: <DocuSignIcon />,
  'google docs': <GoogleDocsIcon />,
  zoom: <ZoomIcon />,
  airtable: <AirtableIcon />,
  'other ats tools': <OtherATSIcon />,
}

// Builds the live survey from API data. Question copy, hints, and "Others"
// config stay static — only each group's options come from the backend.
function buildSurveyQuestions(data: SurveyData): SurveyQuestion[] {
  return [
    {
      question: 'What industry do you work',
      groups: [
        {
          mode: 'multi',
          columns: 1,
          options: data.industries.map((i) => ({
            value: i.id,
            label: withEmoji(i.emoji, i.name),
          })),
        },
      ],
      others: { input: 'text', placeholder: 'Enter your industry' },
    },
    {
      question: 'Which of these do you currently use for hiring?',
      hint: 'Select all that apply',
      groups: [
        {
          mode: 'multi',
          columns: 2,
          options: data.hiringTools.map((t) => ({
            value: t.id,
            label: t.name,
            icon: toolIconByName[t.name.trim().toLowerCase()],
          })),
        },
      ],
      others: { input: 'text', placeholder: 'List them...' },
    },
    {
      question: 'What are the biggest frustrations with your current hiring process?',
      hint: 'Select all that apply',
      groups: [
        {
          mode: 'multi',
          columns: 1,
          options: data.hiringFrustrations.map((f) => ({
            value: f.id,
            label: withEmoji(f.emoji, f.description),
          })),
        },
      ],
      others: { input: 'textarea', placeholder: 'Tell us more ...' },
    },
    {
      question: "What's your role, and team size?",
      errorText: 'Please select a role and Team size to continue.',
      groups: [
        {
          mode: 'single',
          columns: 2,
          options: data.roles.map((r) => ({ value: r.id, label: withEmoji(r.emoji, r.name) })),
        },
        {
          mode: 'single',
          columns: 2,
          options: data.teamSizes.map((s) => ({ value: s.id, label: s.label })),
        },
      ],
    },
  ]
}

export { buildSurveyQuestions }
export type { SurveyQuestion, SurveyData }
