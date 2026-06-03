import Image from "next/image";

export default function Home() {
  return (
    <>
      {/* // Tailwind utilities (auto light/dark) */}
      <div className="bg-bg-primary text-text-primary border border-border-light rounded-lg shadow-sm">
        {/* // Typography classes from design system */}
        <h1 className="heading-h1-semibold">Title</h1>
        <p className="body-l-regular">Body text</p>
        <code className="mono-body-m-regular">code</code>

        {/* // Direct CSS variable access */}
        <div
          style={{ gap: "var(--gap-sm-8)", padding: "var(--padding-xl-16)" }}
        ></div>
      </div>
    </>
  );
}
