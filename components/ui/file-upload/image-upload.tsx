'use client'

import { useId, useRef, useState, type ChangeEvent, type DragEvent, type KeyboardEvent } from 'react'

import { IconButton } from '../button/icon-button'
import { XMark } from '../icons'
import { HelperText } from '../input/helper-text'

import { FileDropzoneText } from './file-dropzone-text'
import { FileTypes } from './file-types'

type ImageUploadSize = 'button' | 'small' | 'medium' | 'large'

interface ImageUploadProps {
  label?: string
  helperText?: string
  errorText?: string
  size?: ImageUploadSize
  imageUrl?: string
  imageAlt?: string
  onImageSelected?: (file: File) => void
  onRemoveImage?: () => void
  accept?: string
  maxSizeMb?: number
  disabled?: boolean
  id?: string
  className?: string
}

const emptySizeClasses: Record<ImageUploadSize, string> = {
  button: 'w-[186px] h-[62px] justify-center px-[12px] py-[8px]',
  small: 'w-[72px] h-[102px] justify-center px-[8px] py-[12px]',
  medium: 'w-full max-w-[300px] h-[120px] justify-center px-[12px] py-[16px]',
  large: 'w-full max-w-[300px] h-[203px] justify-center px-[12px] py-[24px]',
}

// The Uploaded state collapses to a compact thumbnail footprint rather than
// keeping the empty dropzone's height — Button has no Uploaded state in Figma.
const uploadedSizeClasses: Record<Exclude<ImageUploadSize, 'button'>, string> = {
  small: 'h-[102px] w-[72px]',
  medium: 'h-[50px] w-[107px]',
  large: 'h-[50px] w-[127px]',
}

const showIcons: Record<ImageUploadSize, boolean> = {
  button: false,
  small: false,
  medium: true,
  large: true,
}

function ImageUpload({
  label,
  helperText,
  errorText,
  size = 'large',
  imageUrl,
  imageAlt,
  onImageSelected,
  onRemoveImage,
  accept = 'image/*',
  maxSizeMb,
  disabled = false,
  id: externalId,
  className = '',
}: ImageUploadProps) {
  const generatedId = useId()
  const inputId = externalId || generatedId
  const hintId = `${inputId}-hint`
  const helperId = `${inputId}-helper`
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)

  const hasError = Boolean(errorText)
  const isUploaded = Boolean(imageUrl)
  const uploadedSize = size === 'button' ? 'medium' : size

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
    const file = e.target.files?.[0]
    if (file) onImageSelected?.(file)
    e.target.value = ''
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setDragOver(false)
    if (disabled) return
    const file = e.dataTransfer.files[0]
    if (file) onImageSelected?.(file)
  }

  const hiddenInput = (
    <input
      ref={inputRef}
      id={inputId}
      type="file"
      hidden
      accept={accept}
      disabled={disabled}
      onChange={handleChange}
    />
  )

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
        <div
          className={`group relative overflow-clip rounded-sm-8 bg-bg-transparent-light ${uploadedSizeClasses[uploadedSize]}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- framework-agnostic design-system primitive, matches Avatar's convention */}
          <img
            src={imageUrl}
            alt={imageAlt ?? (label ? `${label} preview` : 'Uploaded image preview')}
            className="size-full object-cover"
          />
          <div className="absolute top-[4px] right-[4px] z-10 flex gap-[2px] opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
            <IconButton
              variant="light"
              size="sm"
              icon={<XMark />}
              aria-label={label ? `Remove ${label}` : 'Remove image'}
              onClick={onRemoveImage}
            />
          </div>
          <button
            type="button"
            onClick={openPicker}
            disabled={disabled}
            aria-label={label ? `Change ${label}` : 'Change image'}
            className="absolute inset-0 opacity-0 transition-opacity group-hover:bg-black/20 group-hover:opacity-100 group-focus-within:opacity-100"
          >
            <span className="text-[12px] font-medium text-white">Change</span>
          </button>
          {hiddenInput}
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
          } ${disabled ? 'pointer-events-none opacity-40' : ''} ${emptySizeClasses[size]}`}
        >
          {showIcons[size] && <FileTypes fileTypes="image" />}
          {size === 'button' ? (
            <p id={hintId} className="text-[12px] leading-[16px]">
              <span className="text-[13px] font-medium text-btn-blue-tertiary">Attach</span>{' '}
              <span className="text-text-secondary">or drag and drop here</span>
            </p>
          ) : (
            <div id={hintId}>
              <FileDropzoneText
                state={hasError ? 'error' : 'rest'}
                formats={['SVG', 'WebP', 'PNG', 'JPEG']}
                maxSizeMb={maxSizeMb}
              />
            </div>
          )}
          {hiddenInput}
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

export { ImageUpload }
export type { ImageUploadProps, ImageUploadSize }
