export type AccountType = 'individual' | 'business'

export const BUSINESS_DESCRIPTORS = [
  { value: 'early-stage', label: 'Early-stage startup' },
  { value: 'small-business', label: 'Small business (1-50 employees)' },
  { value: 'growing-company', label: 'Growing company (50+ employees)' },
  { value: 'agency-creator', label: 'Agency / Creator' },
  { value: 'nonprofit', label: 'Non-profit' },
  { value: 'enterprise', label: 'Big Company/Enterprise' },
] as const
