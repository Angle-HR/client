import type { Job, JobManager } from './types'

/**
 * People a job can be assigned to. A stand-in for the workspace's member list
 * until the API serves it.
 */
const TEAM_MEMBERS: JobManager[] = [
  { name: 'Alice', colour: 'green' },
  { name: 'Bob', colour: 'yellow' },
  { name: 'Charlie', colour: 'aqua' },
  { name: 'Diana', colour: 'red' },
  { name: 'Dylan', colour: 'orange' },
  { name: 'Fiona', colour: 'purple' },
  { name: 'Isabella', colour: 'orange' },
  { name: 'Jerry', colour: 'fuchsia' },
  { name: 'Jordan', colour: 'teal' },
  { name: 'Lucas', colour: 'blue' },
  { name: 'Oluwasegun', colour: 'teal' },
  { name: 'Owen', colour: 'grey' },
  { name: 'Samantha', colour: 'purple' },
]

/** "Alice", "Alice and Dylan", "Alice, Samantha and Dylan". */
function listNames(names: string[]): string {
  if (names.length <= 1) return names[0] ?? ''
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`
}

/** Toast copy after assigning, in the designer's wording. */
function assignedMessage(jobs: Pick<Job, 'title'>[], people: JobManager[]): string {
  const titles = jobs.map((job) => job.title)
  const roles =
    titles.length <= 1
      ? (titles[0] ?? '')
      : `${titles.slice(0, -1).join(', ')}, and ${titles[titles.length - 1]}`
  return `The ${roles} role has been assigned to ${listNames(people.map((person) => person.name))}`
}

export { TEAM_MEMBERS, assignedMessage, listNames }
