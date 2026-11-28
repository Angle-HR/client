/**
 * Interview times are planned in a time zone the person picks: the server keeps
 * the instant (UTC) and the IANA zone it was planned in. These turn a wall-clock
 * time in a zone into that instant, and back for showing.
 */

/** The offset of `zone` from UTC at `instant`, in minutes (positive east of UTC). */
function zoneOffsetMinutes(instant: Date, zone: string): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: zone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(instant)
  const get = (type: string) => Number(parts.find((part) => part.type === type)?.value)
  const asUtc = Date.UTC(
    get('year'),
    get('month') - 1,
    get('day'),
    get('hour'),
    get('minute'),
    get('second'),
  )
  return Math.round((asUtc - instant.getTime()) / 60000)
}

/**
 * The instant a wall-clock time (`2026-12-01T14:30`) is in `zone`, as an RFC 3339
 * string in UTC. Returns '' when the text is not a time.
 */
function zonedToIso(local: string, zone: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(local)
  if (!match) return ''
  const [, y, mo, d, h, mi] = match.map(Number) as number[]
  const guess = Date.UTC(y as number, (mo as number) - 1, d as number, h as number, mi as number)
  // The offset depends on the instant, so settle it in two passes (it moves only across a DST change).
  let offset = zoneOffsetMinutes(new Date(guess), zone)
  offset = zoneOffsetMinutes(new Date(guess - offset * 60000), zone)
  return new Date(guess - offset * 60000).toISOString()
}

/** An instant as `2026-12-01T14:30` on the wall clock of `zone`. */
function isoToZoned(iso: string, zone: string): string {
  const instant = new Date(iso)
  if (Number.isNaN(instant.getTime())) return ''
  const shifted = new Date(instant.getTime() + zoneOffsetMinutes(instant, zone) * 60000)
  return shifted.toISOString().slice(0, 16)
}

/** The zones the browser knows, or a short list where it cannot say. */
function timeZones(): string[] {
  const supported = (Intl as unknown as { supportedValuesOf?: (key: string) => string[] })
    .supportedValuesOf
  const list = supported?.('timeZone') ?? ['UTC', 'Europe/London', 'America/New_York']
  return list.includes('UTC') ? list : ['UTC', ...list]
}

function browserZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
}

/** "Mon 1 Dec, 14:30 – 15:15" in the zone the interview was planned in. */
function formatInterviewTime(startsAt: string, minutes: number, zone: string): string {
  const start = new Date(startsAt)
  if (Number.isNaN(start.getTime())) return ''
  const safeZone = zone || browserZone()
  const day = new Intl.DateTimeFormat('en-GB', {
    timeZone: safeZone,
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(start)
  const clock = (date: Date) =>
    new Intl.DateTimeFormat('en-GB', {
      timeZone: safeZone,
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    }).format(date)
  const end = new Date(start.getTime() + minutes * 60000)
  return `${day}, ${clock(start)} – ${clock(end)}`
}

export { browserZone, formatInterviewTime, isoToZoned, timeZones, zonedToIso }
