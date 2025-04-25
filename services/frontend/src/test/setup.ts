import '@testing-library/jest-dom/vitest'
import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'


vi.mock('zustand')


afterEach(() => {
  cleanup()
})
