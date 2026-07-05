import { describe, expect, it } from 'vitest'
import { formatMoney, formatStock, getNameInitials } from './format'

function normalizeSpaces(value) {
  return value.replace(/\s/g, ' ')
}

describe('formatMoney', () => {
  it('formatea numeros en pesos argentinos', () => {
    expect(normalizeSpaces(formatMoney(12345))).toBe('$ 12.345')
  })

  it('tolera valores vacios', () => {
    expect(normalizeSpaces(formatMoney())).toBe('$ 0')
  })
})

describe('formatStock', () => {
  it('muestra stock de unidad sin decimales', () => {
    expect(normalizeSpaces(formatStock(12.4, 'UN'))).toBe('12')
  })

  it('muestra stock por kilo con dos decimales', () => {
    expect(normalizeSpaces(formatStock(12.4, 'KG'))).toBe('12,40')
  })
})

describe('getNameInitials', () => {
  it('usa todas las palabras que empiezan en mayuscula', () => {
    expect(getNameInitials('Milanesa de Pollo Premium')).toBe('MPP')
  })

  it('tolera nombres simples', () => {
    expect(getNameInitials('Coca')).toBe('C')
  })

  it('si no hay mayusculas usa las palabras disponibles como fallback', () => {
    expect(getNameInitials('milanesa de pollo')).toBe('MDP')
  })
})
