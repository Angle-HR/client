import { FileTypeItem } from './file-type-item'

type FileTypesVariant = 'image' | 'document' | 'spreadsheet'

interface FileTypesProps {
  fileTypes: FileTypesVariant
  className?: string
}

/**
 * The decorative tile cluster at the top of an empty dropzone. Figma's own
 * "📊 JSON-CSV-Excel" variant renders three tiles fanned out, not the two the
 * Outline doc's prose describes — built to match Figma (the visual source of
 * truth) and flagging the mismatch here rather than picking one silently.
 */
function FileTypes({ fileTypes, className = '' }: FileTypesProps) {
  return (
    <div aria-hidden="true" className={`relative h-[70px] w-[138px] shrink-0 ${className}`}>
      {fileTypes === 'image' && (
        <FileTypeItem
          type="image"
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        />
      )}
      {fileTypes === 'document' && (
        <>
          <FileTypeItem
            type="word"
            className="absolute top-1/2 left-1/2 -translate-x-[38px] -translate-y-1/2 -rotate-6"
          />
          <FileTypeItem
            type="pdf"
            className="absolute top-1/2 left-1/2 z-10 -translate-x-[2px] -translate-y-1/2 rotate-6"
          />
        </>
      )}
      {fileTypes === 'spreadsheet' && (
        <>
          <FileTypeItem
            type="json"
            className="absolute top-1/2 left-1/2 -translate-x-[58px] -translate-y-1/2 -rotate-6"
          />
          <FileTypeItem
            type="csv"
            className="absolute top-1/2 left-1/2 z-10 -translate-x-1/2 -translate-y-1/2"
          />
          <FileTypeItem
            type="excel"
            className="absolute top-1/2 left-1/2 translate-x-[18px] -translate-y-1/2 rotate-6"
          />
        </>
      )}
    </div>
  )
}

export { FileTypes }
export type { FileTypesProps, FileTypesVariant }
