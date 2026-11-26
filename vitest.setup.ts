import '@testing-library/jest-dom/vitest'

// jsdom has no ResizeObserver; scrollable Slots lists (the calendar's year and
// month pickers, for one) observe their size.
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
} as unknown as typeof ResizeObserver
