import { describe, expect, it, vi } from 'vitest'
import { buildExportPayload, serializeBackup, payloadToJson, downloadBackup } from '../backup'
import type { Config, Entry } from '../../types'

const cfg = (): Config => ({
  classPrice: 100,
  gamePrice: 50,
  currency: 'BRL',
  professorName: 'Davi',
  notificationHourOffset: 1,
  schedule: [],
})

const entry = (date: string, klass = false, game = false): Entry => ({
  date,
  class: klass,
  game,
  extras: [],
  updatedAt: date,
})

describe('buildExportPayload', () => {
  it('includes version, exportedAt, config, entries, paidMonths', () => {
    const payload = buildExportPayload({
      config: cfg(),
      entries: { '2026-08-28': entry('2026-08-28', true) },
      paidMonths: { '2026-08': '2026-08-30T12:00:00Z' },
    })
    expect(payload.version).toBe(1)
    expect(payload.exportedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/)
    expect(payload.config).toEqual(cfg())
    expect(payload.entries['2026-08-28'].class).toBe(true)
    expect(payload.paidMonths['2026-08']).toBeDefined()
  })

  it('handles empty state', () => {
    const payload = buildExportPayload({
      config: cfg(),
      entries: {},
      paidMonths: {},
    })
    expect(payload.entries).toEqual({})
    expect(payload.paidMonths).toEqual({})
  })
})

describe('serializeBackup', () => {
  it('produces valid JSON string', () => {
    const json = serializeBackup({
      config: cfg(),
      entries: { '2026-08-28': entry('2026-08-28') },
      paidMonths: {},
    })
    expect(() => JSON.parse(json)).not.toThrow()
  })

  it('is pretty-printed for human readability', () => {
    const json = serializeBackup({
      config: cfg(),
      entries: {},
      paidMonths: {},
    })
    expect(json).toContain('\n')
    expect(json).toContain('  ')
  })
})

describe('payloadToJson', () => {
  it('builds export with the right filename-friendly timestamp', () => {
    const payload = buildExportPayload(
      { config: cfg(), entries: {}, paidMonths: {} },
      new Date('2026-08-30T15:30:00Z'),
    )
    const json = payloadToJson(payload, new Date('2026-08-30T15:30:00Z'))
    const parsed = JSON.parse(json)
    expect(parsed.exportedAt).toBe('2026-08-30T15:30:00.000Z')
  })
})

describe('buildExportPayload fields', () => {
  it('returns the fields needed for round-trip import', () => {
    const payload = buildExportPayload(
      {
        config: cfg(),
        entries: {},
        paidMonths: {},
      },
      new Date('2026-08-30T15:30:00Z'),
    )
    expect(payload).toHaveProperty('version')
    expect(payload).toHaveProperty('exportedAt')
    expect(payload).toHaveProperty('config')
    expect(payload).toHaveProperty('entries')
    expect(payload).toHaveProperty('paidMonths')
  })
})

describe('downloadBackup', () => {
  it('triggers a download with sensible filename', () => {
    let downloadedName = ''
    let blobType = ''

    vi.stubGlobal('URL', {
      createObjectURL: vi.fn(() => 'blob:url'),
      revokeObjectURL: vi.fn(),
    })

    const originalCreateElement = document.createElement.bind(document)
    const clickSpy = vi.fn(function click(this: HTMLAnchorElement) {
      downloadedName = this.download
    })
    const setHref = vi.fn()
    const setDownload = vi.fn(function setDownload(this: HTMLAnchorElement, val: string) {
      this.download = val
    })

    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      if (tag === 'a') {
        return Object.assign(originalCreateElement(tag), {
          click: clickSpy,
          set href(v: string) {
            setHref(v)
          },
          set download(v: string) {
            setDownload.call(this, v)
          },
        }) as HTMLAnchorElement
      }
      return originalCreateElement(tag)
    })

    const originalBlob = globalThis.Blob
    globalThis.Blob = class MockBlob {
      type!: string
      constructor(_parts: BlobPart[], options?: BlobPropertyBag) {
        blobType = options?.type ?? ''
      }
    } as unknown as typeof Blob

    try {
      downloadBackup(
        {
          config: cfg(),
          entries: {},
          paidMonths: {},
        },
        new Date('2026-08-30T15:30:00Z'),
      )
    } finally {
      globalThis.Blob = originalBlob
    }

    expect(downloadedName).toMatch(/^conta-backup-2026-08-30\.json$/)
    expect(blobType).toBe('application/json')
  })
})