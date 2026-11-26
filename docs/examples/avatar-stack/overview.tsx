import { Avatar, AvatarStack } from '@/components/ui/avatar'

const people = [
  { text: 'VA', colour: 'green' },
  { text: 'TB', colour: 'purple' },
  { text: 'KO', colour: 'aqua' },
  { text: 'MN', colour: 'orange' },
  { text: 'JD', colour: 'blue' },
  { text: 'RS', colour: 'red' },
] as const

export default function AvatarStackOverview() {
  return (
    <div className="flex flex-wrap items-center gap-24">
      <AvatarStack size={24} maxVisible={3}>
        {people.map((p) => (
          <Avatar key={p.text} size={24} text={p.text} colour={p.colour} />
        ))}
      </AvatarStack>
      <AvatarStack size={24} maxVisible={4}>
        {people.slice(0, 4).map((p) => (
          <Avatar key={p.text} size={24} text={p.text} colour={p.colour} />
        ))}
      </AvatarStack>
    </div>
  )
}
