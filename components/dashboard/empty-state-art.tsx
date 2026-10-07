import Image from 'next/image'
import { useId } from 'react'

import { DashboardIcon } from '@/components/dashboard/nav-config'

/**
 * The two illustrations the dashboard states use, both the designer's own
 * exports rendered as-is rather than redrawn.
 *
 * The failure states get a monitor with the warning triangle on its screen. The
 * welcome state gets the Open HR mark as a watermark with a dashed 29.59px
 * badge over it.
 *
 * The monitor is a light-mode asset with baked-in colours; there is no dark
 * variant in the file yet.
 */

function ErrorScreenArt() {
  return (
    <Image
      aria-hidden="true"
      alt=""
      src="/dashboard/illustration/error-screen.svg"
      width={180}
      height={149}
      className="h-[149px] w-[180px] max-w-none shrink-0"
    />
  )
}

/**
 * The watermark behind the welcome state.
 *
 * The designer's export fades #F7F7F7 into white, which are the light values of
 * `--bg-primary` and `--bg-secondary`. The paths are inlined so the gradient can
 * read those tokens instead — as an `<img>` the baked-in white turns into a
 * solid blob over the dark surface.
 *
 * Figma centres it 100px above the centre of the content area, which is why
 * this is absolutely positioned rather than stacked with the text.
 */
function WelcomeWatermark() {
  const gradientId = useId()

  return (
    <svg
      aria-hidden="true"
      width={225}
      height={160}
      viewBox="0 0 225 160"
      fill="none"
      className="pointer-events-none absolute top-[calc(50%-100px)] left-1/2 h-[160px] w-[225px] max-w-none -translate-x-1/2 -translate-y-1/2"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M109.303 159.195L110.241 159.168C155.66 162.342 197.118 149.139 217.565 126.562C227.136 115.994 225.224 100.441 218.796 87.7156L190.985 32.6557L189.823 30.3533C178.128 9.28744 141.479 -3.46892 99.7908 0.83167C56.3101 5.3172 21.9837 26.8482 16.9063 51.0956L1.40219 100.361C-1.26965 108.851 -0.308365 118.329 5.8931 124.713C26.9255 146.366 65.5279 160.309 109.303 159.195ZM100.761 10.2348C140.535 6.13159 174.669 21.1237 177 43.7206C179.331 66.3176 148.977 87.9623 109.203 92.0655C69.4282 96.1687 35.2948 81.1766 32.9636 58.5797C30.6325 35.9827 60.9863 14.338 100.761 10.2348Z"
        fill={`url(#${gradientId})`}
      />
      <path
        d="M96.7456 55.8254C123.32 48.9348 148.506 52.1688 161.744 62.6614C150.819 73.7433 131.506 82.2754 108.862 84.6118C88.2845 86.7346 69.3531 83.2826 56.3444 76.1703C66.2348 67.4704 80.3188 60.0851 96.7456 55.8254Z"
        fill={`url(#${gradientId})`}
      />
      <defs>
        <linearGradient
          id={gradientId}
          x1="112.091"
          y1="6.50332"
          x2="112.091"
          y2="135.055"
          gradientUnits="userSpaceOnUse"
        >
          <stop style={{ stopColor: 'var(--bg-primary)' }} />
          <stop offset="1" style={{ stopColor: 'var(--bg-secondary)' }} />
        </linearGradient>
      </defs>
    </svg>
  )
}

/** The dashed badge that sits over the watermark, holding the state's icon. */
function WelcomeBadge({ icon }: { icon: string }) {
  return (
    <span aria-hidden="true" className="relative size-[44px] shrink-0 overflow-hidden">
      <span className="absolute top-1/2 left-1/2 size-[29.59px] -translate-x-1/2 -translate-y-1/2 rounded-sm-6 border-[0.5px] border-dashed border-text-secondary" />
      <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-text-primary">
        <DashboardIcon name={icon} size={17} />
      </span>
    </span>
  )
}

export { ErrorScreenArt, WelcomeBadge, WelcomeWatermark }
