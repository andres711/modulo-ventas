import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

describe('api', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.stubEnv('VITE_API_URL', '/api')
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  it('filtra productos inactivos por defecto', async () => {
    fetch.mockResolvedValue({
      json: vi.fn().mockResolvedValue({
        ok: true,
        products: [
          { id: '1', nombre: 'Activo', activo: 'TRUE', precio: '100' },
          { id: '2', nombre: 'Inactivo', activo: 'FALSE', precio: '200' },
        ],
      }),
    })

    const { getProducts } = await import('./features/products/api')
    const products = await getProducts()

    expect(products).toHaveLength(1)
    expect(products[0]).toMatchObject({
      id: '1',
      nombre: 'Activo',
      activo: true,
      precio: 100,
    })
  })

  it('permite incluir productos inactivos cuando se pide explicitamente', async () => {
    fetch.mockResolvedValue({
      json: vi.fn().mockResolvedValue({
        ok: true,
        products: [
          { id: '1', nombre: 'Activo', activo: 'TRUE', precio: '100' },
          { id: '2', nombre: 'Inactivo', activo: 'FALSE', precio: '200' },
        ],
      }),
    })

    const { getProducts } = await import('./features/products/api')
    const products = await getProducts({ includeInactive: true })

    expect(products).toHaveLength(2)
    expect(products[1]).toMatchObject({
      id: '2',
      nombre: 'Inactivo',
      activo: false,
      precio: 200,
    })
  })

  it('envia product_upsert usando text/plain para evitar preflight', async () => {
    fetch.mockResolvedValue({
      text: vi.fn().mockResolvedValue(JSON.stringify({ ok: true })),
    })

    const { upsertProduct } = await import('./features/products/api')
    await upsertProduct({ nombre: 'Milanesa' })

    expect(fetch).toHaveBeenCalledWith('/api', {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        action: 'product_upsert',
        row: { nombre: 'Milanesa' },
      }),
    })
  })
})
