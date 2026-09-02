'use client'

import { useId, useRef, useState, type ChangeEvent, type DragEvent, type KeyboardEvent } from 'react'

import { HelperText } from '../input/helper-text'

import { FileDropzoneText } from './file-dropzone-text'
import { FileTypes, type FileTypesVariant } from './file-types'
import { FileUploadedItem, type FileUploadedItemState } from './file-uploaded-item'

import type { FileFormat } from './file-type-item'

type FileUploadSize = 'button' | 'small' | 'medium' | 'large'
type FileUploadedLayout = 'list' | 'single' | 'grid' | 'list-plain'
type FileUploadFileType = 'document' | 'spreadsheet' | 'all'

interface UploadedFile {
  id: string
  name: string
  type: FileFormat
  state: FileUploadedItemState
  progress?: number
}

interface FileUploadProps {
  label?: string
  helperText?: string
  errorText?: string
  size?: FileUploadSize
  uploadedLayout?: FileUploadedLayout
  fileType?: FileUploadFileType
  wrapped?: boolean
  files?: UploadedFile[]
  onFilesSelected?: (files: File[]) => void
  onRemoveFile?: (fileId: string) => void
  onRetryFile?: (fileId: string) => void
  accept?: string
  multiple?: boolean
  maxSizeMb?: number
  disabled?: boolean
  id?: string
  className?: string
}

// Figma has no room for the File Type(s) illustration or the hint line at
// these two footprints — both are hidden per the File Type(s) doc's own note.
const showIcons: Record<FileUploadSize, boolean> = {
  button: false,
  small: false,
  medium: true,
  large: true,
}

const sizeClasses: Record<FileUploadSize, string> = {
  button: 'w-[186px] h-[62px] justify-center px-[12px] py-[8px]',
  small: 'w-[72px] h-[102px] justify-center px-[8px] py-[12px]',
  medium: 'w-full max-w-[300px] h-[120px] justify-center px-[12px] py-[16px]',
  large: 'w-full max-w-[300px] h-[203px] justify-center px-[12px] py-[24px]',
}

const defaultFormats: Record<FileUploadFileType, string[] | undefined> = {
  document: ['DOC', 'DOCX', 'PDF'],
  spreadsheet: ['JSON', 'CSV', 'XLS', 'XLSX'],
  all: undefined,
}

const acceptFor: Record<FileUploadFileType, string> = {
  document: '.doc,.docx,.pdf',
  spreadsheet: '.json,.csv,.xls,.xlsx',
  all: '*',
}

// No Figma variant represents "any format" — showing a specific format pair
// here would falsely promise only those formats are accepted, so "all" gets
// no illustration rather than one borrowed from another fileType.
const fileTypesVariantFor: Record<FileUploadFileType, FileTypesVariant | undefined> = {
  document: 'document',
  spreadsheet: 'spreadsheet',
  all: undefined,
}

const layoutContainerClasses: Record<FileUploadedLayout, string> = {
  list: 'flex flex-col gap-[8px]',
  'list-plain': 'flex flex-col gap-[8px]',
  grid: 'flex flex-row flex-wrap gap-[8px]',
  single: 'flex flex-col',
}

function FileUpload({
  label,
  helperText,
  errorText,
  size = 'large',
  uploadedLayout = 'list',
  fileType = 'all',
  wrapped = false,
  files = [],
  onFilesSelected,
  onRemoveFile,
  onRetryFile,
  accept,
  multiple = true,
  maxSizeMb,
  disabled = false,
  id: externalId,
  className = '',
}: FileUploadProps) {
  const generatedId = useId()
  const inputId = externalId || generatedId
  const hintId = `${inputId}-hint`
  const helperId = `${inputId}-helper`
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)

  const hasError = Boolean(errorText)
  const isUploaded = files.length > 0
  const visibleFiles = uploadedLayout === 'single' ? files.slice(0, 1) : files

  function openPicker() {
    if (!disabled) inputRef.current?.click()
  }

  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      openPicker()
    }
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const list = Array.from(e.target.files ?? [])
    if (list.length) onFilesSelected?.(list)
    e.target.value = ''
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setDragOver(false)
    if (disabled) return
    const list = Array.from(e.dataTransfer.files)
    if (list.length) onFilesSelected?.(list)
  }

  return (
    <div className={`flex flex-col gap-[6px] ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="h-[9px] pl-[3px] text-[12px] leading-none font-semibold text-text-tertiary"
        >
          {label}
        </label>
      )}

      {isUploaded ? (
        <div role="list" className={layoutContainerClasses[uploadedLayout]}>
          {visibleFiles.map((file) => (
            <FileUploadedItem
              key={file.id}
              fileName={file.name}
              fileType={file.type}
              state={file.state}
              progress={file.progress}
              wrapped={wrapped || uploadedLayout === 'list'}
              onRemove={() => onRemoveFile?.(file.id)}
              onRetry={() => onRetryFile?.(file.id)}
              className={uploadedLayout === 'grid' ? 'w-[140px]' : ''}
            />
          ))}
        </div>
      ) : (
        <div
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-disabled={disabled}
          aria-describedby={hintId}
          onClick={openPicker}
          onKeyDown={handleKeyDown}
          onDragEnter={() => !disabled && setDragOver(true)}
          onDragOver={(e) => e.preventDefault()}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          data-state={hasError ? 'error' : dragOver ? 'hover' : 'rest'}
          className={`flex cursor-pointer flex-col items-center gap-[14px] rounded-sm-8 border border-dashed bg-bg-transparent-light transition-colors ${
            hasError ? 'border-border-input-error' : 'border-border-transparent-medium'
          } ${disabled ? 'pointer-events-none opacity-40' : ''} ${sizeClasses[size]}`}
        >
          {showIcons[size] && fileTypesVariantFor[fileType] && (
            <FileTypes fileTypes={fileTypesVariantFor[fileType]} />
          )}
          {size === 'button' ? (
            <p id={hintId} className="text-[12px] leading-[16px]">
              <span className="text-[13px] font-medium text-btn-blue-tertiary">Attach</span>{' '}
              <span className="text-text-secondary">or drag and drop here</span>
            </p>
          ) : (
            <div id={hintId}>
              <FileDropzoneText
                state={hasError ? 'error' : 'rest'}
                formats={defaultFormats[fileType]}
                maxSizeMb={maxSizeMb}
              />
            </div>
          )}
          <input
            ref={inputRef}
            id={inputId}
            type="file"
            hidden
            multiple={multiple}
            accept={accept ?? acceptFor[fileType]}
            disabled={disabled}
            onChange={handleChange}
          />
        </div>
      )}

      {(helperText || errorText) && (
        <HelperText id={helperId} state={hasError ? 'error' : 'neutral'} className="pl-[3px]">
          {hasError ? errorText : helperText}
        </HelperText>
      )}
    </div>
  )
}

export { FileUpload }
export type { FileUploadProps, FileUploadSize, FileUploadedLayout, FileUploadFileType, UploadedFile }
