import { TextButton } from '@/components/ui/button'

export default function TextButtonUnderlineBold() {
  return (
    <div className="flex flex-wrap items-baseline gap-16">
      <TextButton>Underlined on hover</TextButton>
      <TextButton underline="always">Always underlined</TextButton>
      <TextButton underline="never">Never underlined</TextButton>
      <TextButton bold underline="always">
        Bold and underlined
      </TextButton>
    </div>
  )
}
