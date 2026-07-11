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

// Survey question definitions. Shaped like the props StepQuestionnaire takes, so
// they can later be fetched from the backend and passed straight through.
type SurveyQuestion = Omit<StepQuestionnaireProps, 'onContinue'>

const slug = (label: string) =>
  label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

const opt = (label: string, icon?: React.ReactNode) => ({ value: slug(label), label, icon })

export const surveyQuestions: SurveyQuestion[] = [
  {
    question: 'What industry do you work',
    groups: [
      {
        mode: 'multi',
        columns: 1,
        options: [
          '⌨️ Tech',
          '♻️ Energy',
          '🌴 Green',
          '💸 Fintech',
          '💪 Health',
          '📚 Education',
          '🔒 Security',
          '🏗️ Construction',
          '🛠️ Hard ware',
        ].map((l) => opt(l)),
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
        options: [
          opt('Notion', <NotionIcon />),
          opt('Calendly / Cal.com', <CalendlyIcon />),
          opt('Google Forms', <GoogleFormsIcon />),
          opt('Typeform', <TypeformIcon />),
          opt('Excel / Spreed Sheet', <ExcelIcon />),
          opt('Gmail / Outlook', <GmailIcon />),
          opt('Slack', <SlackIcon />),
          opt('DocuSign', <DocuSignIcon />),
          opt('Google Docs', <GoogleDocsIcon />),
          opt('Zoom / Google Meet', <ZoomIcon />),
          opt('Airtable', <AirtableIcon />),
          opt('Other ATS tools', <OtherATSIcon />),
        ],
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
        options: [
          'Finding the right candidates',
          'Tracking and Managing applications',
          'No clear hiring pipeline',
          'Following up with candidates',
          'No easy way to collect feedback',
          'Manual onboarding and paperwork',
        ].map((l) => opt(l)),
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
        options: [
          '🧑‍💼 Founder/CEO',
          '👥 HR / People',
          '👨‍💻 Engineer/ Designer',
          '🫂 Customer Support',
          '📣 Marketing',
          '⚙️ Operations',
          '💼 Product',
          'Others',
        ].map((l) => opt(l)),
      },
      {
        mode: 'single',
        columns: 2,
        options: ['Just me', '10-20', '2-10', '20+'].map((l) => opt(l)),
      },
    ],
  },
]

export type { SurveyQuestion }
