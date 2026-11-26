import { Avatar, AvatarStack } from '@/components/ui/avatar'

const people = ['VA', 'TB', 'KO', 'MN', 'JD'] as const

export default function AvatarStackDensity() {
  return (
    <div className="flex flex-wrap items-center gap-24">
      <AvatarStack size={32} maxVisible={3}>
        {people.map((p) => (
          <Avatar key={p} size={32} text={p} colour="blue" />
        ))}
      </AvatarStack>
      <AvatarStack size={32} density="tight" maxVisible={3}>
        {people.map((p) => (
          <Avatar key={p} size={32} text={p} colour="blue" />
        ))}
      </AvatarStack>
    </div>
  )
}
