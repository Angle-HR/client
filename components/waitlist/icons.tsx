// Inline icons for the waitlist. Sized to fill their host wrapper (our UI
// components place icons in fixed boxes); coloured via currentColor so the
// design-system token on the parent drives the colour.
import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement>

export function ArrowRightIcon(props: IconProps) {
  return (
    <svg
      className="h-full w-full"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M5 12h14M13 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function XIcon(props: IconProps) {
  return (
    <svg
      className="h-full w-full"
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M17.53 3h3.02l-6.6 7.54L21.75 21h-6.09l-4.77-6.23L5.43 21H2.4l7.06-8.07L2.25 3h6.24l4.31 5.7L17.53 3zm-1.06 16.2h1.67L7.6 4.71H5.8l10.67 14.49z" />
    </svg>
  )
}

export function LinkedInIcon(props: IconProps) {
  return (
    <svg
      className="h-full w-full"
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M4.98 3.5a2.5 2.5 0 11-.02 5 2.5 2.5 0 01.02-5zM3 9h4v12H3V9zm6 0h3.83v1.64h.05c.53-1 1.84-2.05 3.79-2.05 4.05 0 4.8 2.67 4.8 6.14V21h-4v-5.45c0-1.3-.02-2.97-1.81-2.97-1.81 0-2.09 1.42-2.09 2.88V21H9V9z" />
    </svg>
  )
}
