import Image from 'next/image'

// Flattened screenshot of the OpenHR product UI, exported directly from
// Figma as a single image — it's decorative marketing content, not a real
// interactive form, so it's not worth reconstructing node-for-node.
function ProductPreview() {
  return (
    <section
      id="product-preview"
      className="flex justify-center px-[20px] pb-[64px] md:px-[32px] md:pb-[110px]"
    >
      <div className="w-full max-w-[1116px]">
        <Image
          src="/open-hr/mockup-mobile.webp"
          alt="OpenHR application form builder"
          width={329}
          height={189}
          className="w-full md:hidden"
        />
        <Image
          src="/open-hr/mockup-desktop.webp"
          alt="OpenHR application form builder"
          width={1116}
          height={653}
          className="hidden w-full md:block"
        />
      </div>
    </section>
  )
}

export { ProductPreview }
