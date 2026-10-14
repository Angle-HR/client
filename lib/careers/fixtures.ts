import type { CareersPage } from './types'

/**
 * Stand-in careers data. There is no public careers endpoint yet, so
 * `requests.getCareersPage` resolves with these pages; swapping in the real API
 * means changing that one function and deleting this file.
 *
 * The company and its roles are the sample content of the applicant frames
 * (9346:561510, 9346:561611). Those frames draw two sets of roles: the
 * default list and the HR roles the filtered frame shows. Both are kept so
 * every drawn filter state can be reached.
 */

export const REVOLUT: CareersPage = {
  company: {
    name: 'Revolut',
    about:
      'Revolut is a global fintech that has grown from a currency exchange app into one of the world’s largest financial super-apps. Founded in London in 2015, it now serves more than 75 million personal customers and over 800,000 businesses, across more than 160 countries and territories, and operates as a bank in more than 30 countries. Its products span accounts, payments, savings, investing, crypto, insurance and business banking. In 2025 Revolut reported $6 billion in revenue and $1.7 billion in net profit, and in 2026 it secured a full UK banking licence. It is backed by leading investors including SoftBank, Tiger Global, TCV, Coatue and DST Global, and was most recently valued at around $115 billion.',
  },
  roles: [
    {
      id: 'full-stack-engineer-creative-agents',
      title: 'Full-stack Engineer - Creative Agents',
      team: 'Engineering & Product',
      location: 'United Kingdom',
      workplace: 'Remote',
      employmentType: 'Full time',
    },
    {
      id: 'data-scientist-insight-analytics',
      title: 'Data Scientist - Insight Analytics',
      team: 'Data Science',
      workplace: 'On-site',
      employmentType: 'Full time',
    },
    {
      id: 'ux-ui-designer-bright-ideas',
      title: 'UX/UI Designer - Bright Ideas',
      team: 'Design',
      workplace: 'Hybrid',
      employmentType: 'Contract',
    },
    {
      id: 'product-manager-tech-innovations',
      title: 'Product Manager - Tech Innovations',
      team: 'Product Management',
      workplace: 'Remote',
      employmentType: 'Full time',
    },
    {
      id: 'marketing-specialist-growth-strategies',
      title: 'Marketing Specialist - Growth Strategies',
      team: 'Marketing',
      workplace: 'Remote',
      employmentType: 'Part time',
    },
    {
      id: 'devops-engineer-cloud-solutions',
      title: 'DevOps Engineer - Cloud Solutions',
      team: 'Engineering',
      workplace: 'Remote',
      employmentType: 'Full time',
    },
    {
      id: 'sales-executive-global-ventures',
      title: 'Sales Executive - Global Ventures',
      team: 'Sales',
      workplace: 'On-site',
      employmentType: 'Full time',
    },
    {
      id: 'talent-acquisition-specialist-global-tech',
      title: 'Talent Acquisition Specialist - Global Tech Co.',
      team: 'HR & Recruitment',
      location: 'United States',
      workplace: 'Hybrid',
      employmentType: 'Full time',
    },
    {
      id: 'hr-business-partner-innovative-solutions',
      title: 'HR Business Partner - Innovative Solutions',
      team: 'HR Strategy & Operations',
      location: 'Australia',
      workplace: 'Remote',
      employmentType: 'Full time',
    },
    {
      id: 'learning-development-manager-future-leaders',
      title: 'Learning and Development Manager - Future Leaders',
      team: 'Training & Development',
      location: 'Canada',
      workplace: 'On-site',
      employmentType: 'Full time',
    },
    {
      id: 'compensation-benefits-analyst-equity-partners',
      title: 'Compensation and Benefits Analyst - Equity Partners',
      team: 'HR Analytics',
      location: 'Germany',
      workplace: 'Remote',
      employmentType: 'Full time',
    },
    {
      id: 'employee-engagement-coordinator-happy-workplace',
      title: 'Employee Engagement Coordinator - Happy Workplace',
      team: 'HR & Culture',
      location: 'Ireland',
      workplace: 'Hybrid',
      employmentType: 'Full time',
    },
    {
      id: 'recruitment-marketing-specialist-talent-growth',
      title: 'Recruitment Marketing Specialist - Talent Growth',
      team: 'Marketing & HR',
      location: 'Singapore',
      workplace: 'Remote',
      employmentType: 'Full time',
    },
    {
      id: 'diversity-inclusion-manager-inclusive-future',
      title: 'Diversity and Inclusion Manager - Inclusive Future',
      team: 'HR Strategy',
      location: 'Netherlands',
      workplace: 'On-site',
      employmentType: 'Full time',
    },
  ],
}

/** Keyed by company slug, as the careers URL carries it. */
const CAREERS_FIXTURES: Record<string, CareersPage> = {
  revolut: REVOLUT,
}

export { CAREERS_FIXTURES }
