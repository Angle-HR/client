import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement>

export { ArrowRightIcon } from '@/components/waitlist/icons'

export function EyeIcon(props: IconProps) {
  return (
    <svg
      className="h-full w-full"
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M1 7s2.5-4 6-4 6 4 6 4-2.5 4-6 4-6-4-6-4z"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="7" cy="7" r="2" stroke="currentColor" strokeWidth="1.25" />
    </svg>
  )
}

export function EyeOffIcon(props: IconProps) {
  return (
    <svg
      className="h-full w-full"
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M1 7s2.5-4 6-4 6 4 6 4-2.5 4-6 4-6-4-6-4z"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="7" cy="7" r="2" stroke="currentColor" strokeWidth="1.25" />
      <path d="M2 12L12 2" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
    </svg>
  )
}

export function PencilIcon(props: IconProps) {
  return (
    <svg
      className="h-full w-full"
      viewBox="0 0 14 14"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <path d="M9.82 1.82a1.4 1.4 0 012 0l.36.36a1.4 1.4 0 010 2L5.2 11.16l-2.7.68a.35.35 0 01-.42-.42l.68-2.7L9.82 1.82zm1.3.7a.4.4 0 00-.57 0L4.2 8.87l-.4 1.6 1.6-.4 6.36-6.36a.4.4 0 000-.57l-.36-.36zM2.5 12.25h9a.5.5 0 010 1h-9a.5.5 0 010-1z" />
    </svg>
  )
}

export function MailIcon(props: IconProps) {
  return (
    <svg
      className="h-full w-full"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <rect
        x="1.75"
        y="3.25"
        width="12.5"
        height="9.5"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.25"
      />
      <path
        d="M2.5 4.5L8 8.75L13.5 4.5"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function ChatBubbleIcon(props: IconProps) {
  return (
    <svg
      className="h-full w-full"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M4 4.5h12a1.5 1.5 0 011.5 1.5v7a1.5 1.5 0 01-1.5 1.5H8.2L5 17.5V14.5H4A1.5 1.5 0 012.5 13V6A1.5 1.5 0 014 4.5z"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function ChatBubbleLeftRightIcon(props: IconProps) {
  return (
    <svg
      className="h-full w-full"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
      viewBox="0 0 24 24"
    >
      <path
        d="M4.2056 2.83857C6.36293 2.54955 8.56413 2.40039 10.7997 2.40039C13.0353 2.40039 15.2365 2.54955 17.3938 2.83857C18.8899 3.03901 20.0086 4.16835 20.3154 5.56035C20.0907 5.51826 19.8598 5.49022 19.6234 5.47731C18.6884 5.42624 17.7469 5.40039 16.7997 5.40039C15.8525 5.40039 14.911 5.42624 13.976 5.47731C11.0747 5.63577 8.99971 8.07326 8.99971 10.7979V13.4856C8.99971 15.1818 9.80381 16.7675 11.1122 17.7607L7.5361 21.3368C7.2787 21.5942 6.8916 21.6712 6.55529 21.5319C6.21898 21.3926 5.99971 21.0644 5.99971 20.7004V16.5692C5.39847 16.5109 4.80038 16.4419 4.20563 16.3622C2.43979 16.1256 1.19971 14.595 1.19971 12.8658V6.33502C1.19971 4.60581 2.43975 3.07515 4.2056 2.83857Z"
        fill="#999999"
        style={{ fill: 'color(display-p3 0.6000 0.6000 0.6000)', fillOpacity: 1 }}
      />
      <path
        d="M16.7997 7.20039C15.8852 7.20039 14.9765 7.22535 14.0742 7.27463C12.1884 7.37763 10.7997 8.96693 10.7997 10.7979V13.4856C10.7997 15.3081 12.1757 16.8928 14.0519 17.0075C14.3083 17.0232 14.5652 17.0369 14.8226 17.0486C15.0628 17.0596 15.2837 17.1572 15.444 17.3175L18.2633 20.1368C18.5207 20.3942 18.9078 20.4712 19.2441 20.3319C19.5804 20.1926 19.7997 19.8644 19.7997 19.5004V17.0158C21.5428 16.7821 22.7997 15.2602 22.7997 13.5181V10.7979C22.7997 8.96693 21.411 7.37763 19.5253 7.27463C18.6229 7.22535 17.7142 7.20039 16.7997 7.20039Z"
        fill="#999999"
        style={{ fill: 'color(display-p3 0.6000 0.6000 0.6000)', fillOpacity: 1 }}
      />
    </svg>
  )
}

export function CheckCircleFillIcon(props: IconProps) {
  return (
    <svg
      className="h-full w-full"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <circle cx="8" cy="8" r="7" fill="currentColor" />
      <path
        d="M5 8.2L7.1 10.3L11.2 5.8"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
