import { Button } from '@/components/ui/button'

const accents = ['default', 'blue', 'red'] as const

export default function ButtonVariants() {
  return (
    <div className="flex flex-col gap-16">
      {accents.map((accent) => (
        <div key={accent} className="flex flex-wrap items-center gap-8">
          <span className="w-[64px] shrink-0 text-body-xs text-text-secondary">{accent}</span>{' '}
          {/* docs-hide */}
          <Button variant="primary" accent={accent}>
            Primary
          </Button>
          <Button variant="secondary" accent={accent}>
            Secondary
          </Button>
          <Button variant="tertiary" accent={accent}>
            Tertiary
          </Button>
        </div>
      ))}
    </div>
  )
}
