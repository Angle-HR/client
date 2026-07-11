'use client'

import { Button } from '@/components/ui'

import { ArrowRightIcon } from '../icons'

interface StepSuccessProps {
  onContinue?: () => void
}

// Clinking glasses celebration mark (Figma) — teal→blue gradient.
function CelebrationGlasses() {
  return (
    <svg
      className="h-[37px] w-[28px]"
      viewBox="0 0 28 37"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M12.2687 15.8616C11.7241 18.7047 10.0991 21.2087 7.76073 22.8688L6.13278 32.1014C5.94501 33.1671 6.64396 34.1727 7.67964 34.4863C8.89684 34.8547 9.66938 35.2481 9.61926 35.5324C9.53556 35.9898 7.34935 35.9869 4.73562 35.526C2.12203 35.0651 0.0684883 34.3204 0.146255 33.862C0.196372 33.5778 1.0553 33.472 2.32475 33.5421C3.40532 33.6018 4.40787 32.8961 4.59594 31.8304L6.22355 22.5997C4.59308 20.238 3.92219 17.3273 4.38319 14.4672L6.22172 4.27613C6.22172 4.27613 7.69222 4.00589 10.215 4.45073C12.723 4.89293 14.0017 5.65596 14.0214 5.65142L12.2687 15.8616Z"
        fill="url(#wl_glass_a)"
      />
      <path
        d="M23.3015 14.4719C23.7622 17.3298 23.0915 20.2386 21.462 22.5984L23.09 31.8309C23.278 32.8966 24.2788 33.6026 25.3592 33.543C26.629 33.4728 27.4895 33.5783 27.5396 33.8626C27.6174 34.321 25.5621 35.066 22.9484 35.5269C20.3347 35.9877 18.1503 35.9903 18.0666 35.5329C18.0165 35.2487 18.7875 34.8555 20.0043 34.4872C21.0402 34.1737 21.7409 33.1677 21.5531 32.1019L19.9255 22.8713C17.5856 21.2096 15.9597 18.7039 15.4146 15.8586L13.6567 5.65334C13.6567 5.65334 14.9461 4.89646 17.4689 4.45162C19.9769 4.00939 21.4394 4.28906 21.4564 4.27805L23.3015 14.4719Z"
        fill="url(#wl_glass_b)"
      />
      <path
        d="M11.3428 1.33838C11.3428 1.33838 11.7495 1.61534 11.9695 1.83554C12.1895 2.05574 12.4646 2.46021 12.4646 2.46021"
        stroke="url(#wl_glass_c)"
        strokeWidth="0.76266"
        strokeLinecap="round"
      />
      <path
        d="M13.7959 0.381348V2.67901"
        stroke="url(#wl_glass_d)"
        strokeWidth="0.76266"
        strokeLinecap="round"
      />
      <path
        d="M16.1506 1.33863C16.1506 1.33863 15.7852 1.57556 15.588 1.76991C15.3909 1.96425 15.1277 2.36158 15.1277 2.36158"
        stroke="url(#wl_glass_e)"
        strokeWidth="0.76266"
        strokeLinecap="round"
      />
      <defs>
        <linearGradient
          id="wl_glass_a"
          x1="10.216"
          y1="4.4509"
          x2="4.73658"
          y2="35.5262"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#4CC38A" />
          <stop offset="1" stopColor="#3E63DD" />
        </linearGradient>
        <linearGradient
          id="wl_glass_b"
          x1="17.4699"
          y1="4.45145"
          x2="22.9493"
          y2="35.5267"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#4CC38A" />
          <stop offset="1" stopColor="#3E63DD" />
        </linearGradient>
        <linearGradient
          id="wl_glass_c"
          x1="11.3752"
          y1="1.30598"
          x2="12.497"
          y2="2.42781"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#3E63DD" />
          <stop offset="1" stopColor="#4CC38A" />
        </linearGradient>
        <linearGradient
          id="wl_glass_d"
          x1="14.2959"
          y1="0.381348"
          x2="14.2959"
          y2="2.67901"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#3E63DD" />
          <stop offset="1" stopColor="#4CC38A" />
        </linearGradient>
        <linearGradient
          id="wl_glass_e"
          x1="16.1178"
          y1="1.30579"
          x2="15.0949"
          y2="2.32874"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#3E63DD" />
          <stop offset="1" stopColor="#4CC38A" />
        </linearGradient>
      </defs>
    </svg>
  )
}

// Success card (Figma "Congratulations container"): rounded-lg-12 card with a
// top section (celebration icon + heading), a dashed divider, and an inset
// bg/primary panel holding the message + a blue secondary Button.
function StepSuccess({ onContinue }: StepSuccessProps) {
  return (
    <div className="mx-auto w-full max-w-[472px]">
      <div className="bg-bg-transparent-lighter flex flex-col gap-2 rounded-lg-12">
        {/* Top — icon + heading */}
        <div className="flex flex-col p-6 pb-44 border-b-[1.5px] border-border-notification border-dashed items-center pt-20">
          <CelebrationGlasses />
          <h1 className="text-center text-heading-5 font-semibold leading-33_1 text-text-primary">
            Congrats, you&apos;re on the list.
          </h1>
        </div>

        {/* Bottom — message + action, inset bg/primary panel */}
        <div className="border-t-[1.5px] p-6 pt-12 border-border-notification border-dashed">
          <div className="flex flex-col items-center gap-32 rounded-sm-7 bg-bg-tertiary py-32">
            <p className="text-center text-body-xl font-medium max-w-[380px] mx-auto leading-24 text-text-secondary">
              We&apos;re building Open HR around Teams like yours, help us get it right.
            </p>
            <Button
              accent="blue"
              variant="secondary"
              size="md"
              iconSuffix={<ArrowRightIcon />}
              onClick={onContinue}
            >
              Get involved
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export { StepSuccess }
