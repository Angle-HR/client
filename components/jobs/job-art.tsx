import { DashboardIcon } from '@/components/dashboard/nav-config'

/**
 * The small illustrations of the jobs screens. They are the designer's vectors
 * inlined rather than served as images, because each uses up to three greys
 * that have to follow the theme: #666 is text-secondary, #999 text-tertiary and
 * #B3B3B3 text-light.
 */

/** The funnel over the "no job matching the filters" state. Figma: 8440:566638. */
function FunnelArt() {
  return (
    <svg
      aria-hidden="true"
      width={46}
      height={33}
      viewBox="0 0 46 33"
      fill="none"
      className="shrink-0 text-text-tertiary"
    >
      <path
        d="M45.4841 32.4952H39.3303M0.508303 32.4952H6.75106M1.52491 29.6484H44.4675"
        stroke="currentColor"
        strokeWidth="1.01661"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M22.6076 0C25.9126 1.39204e-05 29.1534 0.278304 32.307 0.813087C33.2706 0.976542 33.957 1.81607 33.957 2.77879V4.01778C33.9569 4.84848 33.6471 5.6474 33.0923 6.26047L32.9782 6.3806L26.534 12.8247C26.1607 13.1985 25.9514 13.7054 25.9513 14.2335V17.7062L25.9423 17.9425C25.8592 19.1149 25.1634 20.1656 24.1017 20.6965L20.2418 22.6274C20.0329 22.7319 19.7828 22.7198 19.5836 22.5967C19.3848 22.4735 19.264 22.2569 19.2639 22.0238V14.2335C19.2638 13.7055 19.0543 13.1985 18.6811 12.8247L12.237 6.3806C11.6105 5.75378 11.2583 4.90395 11.2581 4.01778V2.77879C11.2582 1.81621 11.9437 0.976702 12.9071 0.813087C16.0609 0.278265 19.3024 4.3628e-06 22.6076 0ZM22.6076 1.35018C19.3785 1.35018 16.213 1.62121 13.1335 2.14341C12.8835 2.18583 12.6691 2.38504 12.6192 2.65767L12.6083 2.77879V4.01778C12.6085 4.54583 12.8178 5.0528 13.1911 5.42653L19.6352 11.8707C20.2618 12.4976 20.614 13.3472 20.6141 14.2335V20.1078C20.6143 20.2836 20.7048 20.4471 20.8543 20.5396C21.004 20.6322 21.1913 20.6409 21.3487 20.5625L23.4981 19.4883L23.6222 19.4208C24.2249 19.0643 24.6008 18.4145 24.6011 17.7062V14.2335C24.6012 13.3473 24.9535 12.4975 25.58 11.8707L32.0241 5.42653C32.3974 5.0528 32.6067 4.54583 32.6069 4.01778V2.77879C32.6066 2.44494 32.3662 2.19183 32.0807 2.14341C29.0014 1.62128 25.8365 1.35019 22.6076 1.35018Z"
        fill="currentColor"
      />
    </svg>
  )
}

/**
 * The monitor over the "Create your first job" invitation, with a briefcase on
 * its screen. Figma: Frame 1400002040 in 8973:608566.
 */
function FirstJobArt() {
  return (
    // 147.4px tall in the design; the stand's feet overhang by a stroke.
    <span aria-hidden="true" className="relative h-[147.4px] w-[180px] shrink-0">
      <svg
        width={180}
        height={149}
        viewBox="0 0 180 149"
        fill="none"
        className="absolute top-0 left-0 max-w-none"
      >
        <path
          d="M111.632 147.025V102.664H67.3906V147.025H111.632Z"
          className="stroke-text-secondary"
          strokeLinejoin="round"
        />
        <path
          d="M111.632 147.941H105.578M67.3906 147.941H73.5314M68.3906 145.141H110.632"
          className="stroke-text-tertiary"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <rect
          x="0.5"
          y="0.5"
          width="178.073"
          height="102.149"
          rx="3"
          className="stroke-text-tertiary"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="absolute top-[37px] left-[75px] inline-flex text-text-primary">
        <DashboardIcon name="briefcase-solid" size={28} />
      </span>
    </span>
  )
}

type StartThumbnailKind = 'manual' | 'template' | 'ai'

/**
 * The 47×36 thumbnail beside each way of starting a job. Figma: the List-icon
 * slot of the "Create a new Job" options (9008:505351, 9008:505409, 9005:497892).
 */
function StartThumbnail({ kind }: { kind: StartThumbnailKind }) {
  return (
    <span aria-hidden="true" className="relative h-[36px] w-[47px] shrink-0">
      <svg
        width={48}
        height={36}
        viewBox="0 0 48 36"
        fill="none"
        className="absolute top-0 left-0 max-w-none"
      >
        <rect
          x="0.193394"
          y="0.193394"
          width="46.8267"
          height="35.6132"
          rx="9.8631"
          className="stroke-text-light"
          strokeWidth="0.386788"
        />
        {kind === 'manual' ? (
          <>
            <circle
              cx="23.6086"
              cy="18"
              r="11.3762"
              className="stroke-text-secondary"
              strokeWidth="0.386788"
            />
            <path
              d="M25.1797 15.4299C25.1797 15.9822 25.6274 16.4299 26.1797 16.4299H28.1582C28.7105 16.4299 29.1582 16.8776 29.1582 17.4299V18.5696C29.1582 19.1219 28.7105 19.5696 28.1582 19.5696H26.1797C25.6274 19.5696 25.1797 20.0173 25.1797 20.5696V22.5481C25.1797 23.1004 24.732 23.5481 24.1797 23.5481H23.04C22.4878 23.5481 22.04 23.1004 22.04 22.5481V20.5696C22.04 20.0173 21.5923 19.5696 21.04 19.5696H19.0625C18.5102 19.5696 18.0625 19.1219 18.0625 18.5696V17.4299C18.0625 16.8776 18.5102 16.4299 19.0625 16.4299H21.04C21.5923 16.4299 22.04 15.9822 22.04 15.4299V13.4524C22.04 12.9001 22.4878 12.4524 23.04 12.4524H24.1797C24.732 12.4524 25.1797 12.9001 25.1797 13.4524V15.4299Z"
              className="fill-text-secondary"
            />
          </>
        ) : null}
        {kind === 'template' ? (
          <>
            <path
              d="M46.7882 9.15137H14.1167C12.6306 9.15137 11.4258 10.3562 11.4258 11.8423V35.6558"
              className="stroke-text-tertiary"
              strokeWidth="0.386788"
            />
            <circle cx="21.5116" cy="17.9815" r="3.43343" className="fill-text-secondary" />
            <rect
              x="18.0781"
              y="25.2927"
              width="25.2052"
              height="2.7181"
              rx="1.35905"
              className="fill-text-secondary"
            />
            <rect
              x="18.0781"
              y="29.8896"
              width="25.2052"
              height="2.7181"
              rx="1.35905"
              className="fill-text-secondary"
            />
          </>
        ) : null}
      </svg>
      {kind === 'ai' ? (
        <span className="absolute top-1/2 left-1/2 inline-flex -translate-x-1/2 -translate-y-1/2 text-text-secondary">
          <DashboardIcon name="sparkles-solid" size={14} />
        </span>
      ) : null}
    </span>
  )
}

export { FirstJobArt, FunnelArt, StartThumbnail }
export type { StartThumbnailKind }
