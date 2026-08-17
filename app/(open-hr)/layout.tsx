import './theme.css'

// Favicon is now handled site-wide by the root layout (app/layout.tsx),
// so this segment doesn't need its own override.
//
// flex-col + min-h-screen here, paired with flex-1 on each page's <main>,
// is the standard sticky-footer pattern — it pushes FooterBottom to the
// true bottom of the viewport when content is shorter than the screen
// (e.g. the success page), instead of leaving empty space below it.
export default function OpenHrLayout({ children }: { children: React.ReactNode }) {
  return <div className="open-hr flex min-h-screen flex-col bg-[#000000]">{children}</div>
}
