'use client'

import { useEffect, useRef, type ReactElement } from 'react'

interface PdfPagesProps {
  /** The PDF's bytes, fetched by the caller. */
  data: ArrayBuffer
  title: string
}

/**
 * Draws every page of a PDF onto canvases, the full width of the box. The
 * browser's own PDF viewer is not used, so no toolbar or thumbnails show in
 * any browser, as the design draws the resume.
 */
function PdfPages({ data, title }: PdfPagesProps): ReactElement {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    let cancelled = false

    async function draw(target: HTMLDivElement): Promise<void> {
      const pdfjs = await import('pdfjs-dist')
      pdfjs.GlobalWorkerOptions.workerSrc = new URL(
        'pdfjs-dist/build/pdf.worker.min.mjs',
        import.meta.url,
      ).toString()
      // pdf.js takes ownership of the buffer it is given, so it gets a copy.
      const document = await pdfjs.getDocument({ data: data.slice(0) }).promise
      const width = target.clientWidth
      const ratio = window.devicePixelRatio || 1
      target.replaceChildren()
      for (let number = 1; number <= document.numPages; number += 1) {
        if (cancelled) return
        const page = await document.getPage(number)
        const viewport = page.getViewport({
          scale: (width / page.getViewport({ scale: 1 }).width) * ratio,
        })
        const canvas = window.document.createElement('canvas')
        canvas.width = viewport.width
        canvas.height = viewport.height
        canvas.style.width = '100%'
        canvas.setAttribute('aria-label', `${title}, page ${number}`)
        target.appendChild(canvas)
        const context = canvas.getContext('2d')
        if (context) await page.render({ canvasContext: context, viewport }).promise
      }
    }

    void draw(container).catch(() => undefined)
    return () => {
      cancelled = true
    }
  }, [data, title])

  return (
    <div
      ref={containerRef}
      role="document"
      aria-label={title}
      className="flex max-h-[640px] w-full flex-col gap-[8px] overflow-y-auto rounded-lg-10 bg-bg-secondary"
    />
  )
}

export { PdfPages }
export type { PdfPagesProps }
