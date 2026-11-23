import { Button } from '@/components/ui/button'

export default function ButtonDisabledReason() {
  return (
    <div className="flex flex-col items-start gap-6">
      <Button variant="primary" disabled aria-describedby="submit-reason">
        Submit
      </Button>
      <span id="submit-reason" className="text-body-xs text-text-secondary">
        Complete all required fields before submitting.
      </span>
    </div>
  )
}
