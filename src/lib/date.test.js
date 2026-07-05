import { describe, expect, it } from 'vitest'
import { formatDateTimeAr, toYmd } from './date'

describe('date helpers', () => {
  it('convierte Date a yyy-mm-dd', () => {
    expect(toYmd(new Date(2026, 5, 10))).toBe('2026-06-10')
  })

  it('formatea fecha y hora del backend', () => {
    expect(formatDateTimeAr('2026-06-10 14:35:00')).toBe('10/06/2026 14:35:00')
  })

  it('devuelve string vacio cuando no recibe valor', () => {
    expect(formatDateTimeAr('')).toBe('')
  })
})
