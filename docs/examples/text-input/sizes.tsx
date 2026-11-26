import { Input } from '@/components/ui/input'

export default function TextInputSizes() {
  return (
    <div className="flex w-full max-w-[280px] flex-col gap-12">
      <Input size="lg" placeholder="40px · lg" aria-label="Large" />
      <Input size="md" placeholder="32px · md" aria-label="Medium" />
      <Input size="sm" placeholder="25px · sm" aria-label="Small" />
    </div>
  )
}
