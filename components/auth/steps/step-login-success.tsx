'use client'

import { useEffect, useState } from 'react'

function StepLoginSuccess({ onDone }: { onDone?: () => void }) {
  const [progress, setProgress] = useState(8)

  useEffect(() => {
    const id = window.setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          window.clearInterval(id)
          return 100
        }
        return Math.min(100, prev + 8)
      })
    }, 100)
    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    if (progress < 100) return
    const timeout = window.setTimeout(() => onDone?.(), 300)
    return () => window.clearTimeout(timeout)
  }, [progress, onDone])

  return (
    <div className="flex w-[200px] flex-col items-center gap-[32px]">
      <div
        className="relative h-[4px] w-[100px] overflow-clip rounded-all border-[0.5px] border-border-light bg-bg-primary"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
        aria-label="Logging you in"
      >
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-8 to-blue-9 transition-[width] duration-150"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-center text-subtitle-s font-semibold leading-23 text-text-primary">
        Logging you in…
      </p>
    </div>
  )
}

export { StepLoginSuccess }
