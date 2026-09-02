import Image from 'next/image'

/**
 * The right-hand column of the split auth layout: a still preview of the app a
 * visitor is signing up for, drawn as a skeleton so it reads as "your workspace,
 * loading" rather than as real data.
 *
 * Purely decorative and `aria-hidden` at the call site, so nothing here is a
 * control and none of it is keyboard reachable. The window is deliberately wider
 * than its container and clipped on the right, matching the Figma frame where the
 * preview bleeds off the edge of the screen.
 */

/** One greyed-out placeholder row standing in for a nav item. */
function SkeletonRow() {
  return (
    <div className="flex h-[27px] w-[204px] items-center overflow-hidden rounded-sm-7 px-[8px] py-[5px]">
      <div className="h-full w-full rounded-xs-4 bg-gradient-to-r from-bg-gradient-transparent-light to-bg-gradient-transparent-lighter" />
    </div>
  )
}

interface NavGroupProps {
  title: string
  /** Placeholder rows above the optional named item. */
  rowsBefore: number
  /** Placeholder rows below it. */
  rowsAfter?: number
  /** The one item shown with real text, e.g. "Interview". */
  namedItem?: string
}

function NavGroup({ title, rowsBefore, rowsAfter = 0, namedItem }: NavGroupProps) {
  return (
    <div className="flex w-[204px] flex-col items-start">
      <div className="flex h-[28px] items-center justify-center gap-[4px] overflow-hidden px-[8px] py-[7px]">
        <span className="text-body-xs font-medium leading-19_2 whitespace-nowrap text-text-secondary">
          {title}
        </span>
        <Image src="/auth/preview/chevron-down.svg" alt="" width={10} height={10} />
      </div>
      <div className="flex w-full flex-col items-start gap-[2px]">
        {Array.from({ length: rowsBefore }, (_, i) => (
          <SkeletonRow key={`before-${i}`} />
        ))}
        {namedItem ? (
          <div className="flex h-[27px] w-[204px] items-center gap-[8px] overflow-hidden rounded-sm-7 px-[8px] py-[7px]">
            <Image src="/auth/preview/chat-bubble.svg" alt="" width={13} height={13} />
            <span className="text-body-s font-medium leading-19_5 text-text-secondary">
              {namedItem}
            </span>
          </div>
        ) : null}
        {Array.from({ length: rowsAfter }, (_, i) => (
          <SkeletonRow key={`after-${i}`} />
        ))}
      </div>
    </div>
  )
}

interface AppPreviewPanelProps {
  /**
   * Name of the workspace being set up — the person's first name for an
   * individual, the business name for a company. Empty until they type one, and
   * the preview's avatar and label stay blank until then.
   */
  workspaceName?: string
}

function AppPreviewPanel({ workspaceName }: AppPreviewPanelProps) {
  const name = workspaceName?.trim() ?? ''
  const initial = name.slice(0, 1).toUpperCase()

  return (
    <div className="relative h-full w-full overflow-hidden rounded-lg-12 bg-bg-primary">
      {/* Figma anchors the window inside the panel and lets it run past the right
          and bottom edges, where the panel clips it. */}
      <div className="absolute top-[21.79%] right-[-35.86%] bottom-[-17.2%] left-[15.71%] overflow-hidden rounded-lg-12 border border-border-notification bg-bg-primary">
        <div className="flex h-full">
          <div className="flex w-[220px] shrink-0 flex-col gap-[8px] px-[8px] py-[12px]">
            {/* Company selector */}
            <div className="flex w-[204px] items-center gap-[12px]">
              <div className="flex items-center gap-[8px] rounded-sm-8 p-[7px]">
                <span
                  className={`flex size-[16px] items-center justify-center rounded-xs-4 border-[0.5px] border-border-transparent-lighter text-[10px] leading-16 font-medium ${
                    initial
                      ? 'bg-bg-avatar-aqua text-text-avatar-aqua'
                      : 'bg-bg-gradient-transparent-light text-transparent'
                  }`}
                >
                  {initial}
                </span>
                <span className="flex items-center gap-[2px]">
                  <span className="text-body-s font-semibold leading-19_5 text-text-primary">
                    {name}
                  </span>
                  <Image src="/auth/preview/chevron-down-sm.svg" alt="" width={10} height={10} />
                </span>
              </div>
              <span className="flex flex-1 justify-end px-[3px] py-[2px]">
                <span className="flex size-[24px] items-center justify-center rounded-sm-7">
                  <Image src="/auth/preview/sidebar.svg" alt="" width={14} height={14} />
                </span>
              </span>
            </div>

            <div className="flex flex-col gap-[13px]">
              <div className="flex flex-col gap-[2px]">
                <SkeletonRow />
                <SkeletonRow />
              </div>
              <NavGroup title="Hiring" rowsBefore={3} namedItem="Interview" rowsAfter={1} />
              <NavGroup title="Team" rowsBefore={4} />
            </div>

            <div className="mt-auto flex flex-col gap-[8px]">
              <span className="flex h-[24px] items-center justify-center rounded-sm-7 border border-border-btn-default-sec-rest px-[8px] text-body-s font-medium leading-19_5 whitespace-nowrap text-text-btn-default-secondary">
                Send us feedback
              </span>
              <span className="flex h-[27px] items-center gap-[8px] py-[7px] pr-[1px] pl-[8px]">
                <Image src="/auth/preview/question-mark.svg" alt="" width={13} height={13} />
                <span className="text-body-s leading-19_5 text-text-secondary">Help</span>
              </span>
            </div>
          </div>

          {/* Main content area of the previewed app. */}
          <div className="my-[4px] mr-[4px] flex-1 rounded-lg-10 border border-border-transparent-medium bg-bg-secondary" />
        </div>
      </div>
    </div>
  )
}

export { AppPreviewPanel }
