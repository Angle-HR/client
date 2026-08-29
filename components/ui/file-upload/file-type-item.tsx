type FileFormat = 'image' | 'excel' | 'csv' | 'json' | 'word' | 'pdf'

interface FileTypeItemProps {
  type: FileFormat
  className?: string
}

// Flattened exports of Figma's per-format document tiles (node 4935:41804-9,
// each a 40x56 card + branded glyph) — an illustration, not a recolourable
// icon, so it's shipped as a real asset rather than redrawn as a component.
const fileTypeSrc: Record<FileFormat, string> = {
  word: '/icons/file-types/word.svg',
  pdf: '/icons/file-types/pdf.svg',
  csv: '/icons/file-types/csv.svg',
  excel: '/icons/file-types/excel.svg',
  image: '/icons/file-types/image.svg',
  json: '/icons/file-types/json.svg',
}

function FileTypeItem({ type, className = '' }: FileTypeItemProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- framework-agnostic primitive, matches Avatar's convention
    <img
      src={fileTypeSrc[type]}
      alt=""
      aria-hidden="true"
      width={40}
      height={56}
      className={`h-[56px] w-[40px] shrink-0 ${className}`}
    />
  )
}

export { FileTypeItem }
export type { FileTypeItemProps, FileFormat }
