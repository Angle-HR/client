import type { MDXComponents } from 'mdx/types'
import type { ComponentProps, ReactNode } from 'react'

// Styles for MDX pages (the live docs at /docs). Text uses the design
// system's own typography classes and colour tokens.

function slug(children: ReactNode): string {
  const text =
    typeof children === 'string' ? children : Array.isArray(children) ? children.join('') : ''
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function Anchor({ id }: { id: string }) {
  return (
    <a
      href={`#${id}`}
      aria-hidden="true"
      tabIndex={-1}
      className="docs-anchor ml-[6px] text-text-tertiary no-underline"
    >
      #
    </a>
  )
}

const components: MDXComponents = {
  h1: (props) => <h1 className="heading-h4-semibold mb-[8px] text-text-primary" {...props} />,
  h2: ({ children, ...props }: ComponentProps<'h2'>) => {
    const id = slug(children)
    return (
      <h2
        id={id}
        className="group subtitle-s-semibold mt-[48px] mb-[8px] scroll-mt-[64px] text-text-primary"
        {...props}
      >
        {children}
        <Anchor id={id} />
      </h2>
    )
  },
  h3: ({ children, ...props }: ComponentProps<'h3'>) => {
    const id = slug(children)
    return (
      <h3
        id={id}
        className="group body-l-semibold mt-[28px] mb-[6px] scroll-mt-[64px] text-text-primary"
        {...props}
      >
        {children}
        <Anchor id={id} />
      </h3>
    )
  },
  p: (props) => (
    <p
      className="body-l-regular my-[10px] max-w-[68ch] text-text-secondary [&_strong]:text-text-primary"
      {...props}
    />
  ),
  a: (props) => (
    <a className="text-text-blue-accent underline-offset-2 hover:underline" {...props} />
  ),
  ul: (props) => (
    <ul
      className="body-l-regular my-[10px] max-w-[68ch] list-disc pl-[20px] text-text-secondary marker:text-text-tertiary"
      {...props}
    />
  ),
  ol: (props) => (
    <ol
      className="body-l-regular my-[10px] max-w-[68ch] list-decimal pl-[20px] text-text-secondary"
      {...props}
    />
  ),
  li: (props) => <li className="my-[4px] pl-[2px] [&_strong]:text-text-primary" {...props} />,
  code: (props) => <code className="docs-inline-code" {...props} />,
  pre: (props) => <pre className="docs-pre my-[16px]" {...props} />,
  hr: () => <hr className="my-[32px] border-border-transparent-medium" />,
  blockquote: (props) => (
    <blockquote
      className="my-[16px] rounded-lg-10 bg-bg-transparent-blue-accent-light px-[16px] py-[12px] [&>p]:my-0 [&>p]:text-text-primary"
      {...props}
    />
  ),
  table: (props) => (
    <div className="my-[16px] overflow-x-auto rounded-lg-10 outline-[0.5px] -outline-offset-[0.5px] outline-border-transparent-medium">
      <table className="w-full min-w-[480px] border-collapse text-left" {...props} />
    </div>
  ),
  th: (props) => <th className="px-[12px] py-[8px] body-l-medium text-text-primary" {...props} />,
  td: (props) => (
    <td
      className="border-t-[0.5px] border-border-transparent-medium px-[12px] py-[10px] align-top body-l-regular text-text-secondary [&_strong]:text-text-primary"
      {...props}
    />
  ),
}

export function useMDXComponents(): MDXComponents {
  return components
}
