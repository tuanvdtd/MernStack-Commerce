import { logger } from '~/config/logger'
import { prisma } from '~/lib/prisma'
import { redis } from '~/lib/redis'
import type {
  AttributeDictionary,
  AttributeDictionaryEntry,
} from '~/modules/search/search.types'

const CACHE_KEY = 'product:attribute_dictionary'
const CACHE_TTL_SECONDS = 300

type CachedPayload = [string, AttributeDictionaryEntry[]][]

/** In-flight promise để chống cache stampede khi nhiều request cùng miss cache. */
let loadingPromise: Promise<AttributeDictionary> | null = null

function parseSynonyms(raw: unknown, value: string): string[] {
  let synonyms: string[] = []

  if (raw) {
    if (Array.isArray(raw)) {
      synonyms = raw as string[]
    } else if (typeof raw === 'string') {
      try {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) synonyms = parsed as string[]
      } catch {
        synonyms = []
      }
    }
  }

  synonyms = synonyms.map((synonym) => String(synonym).toLowerCase())

  const normalized = value.toLowerCase()
  if (!synonyms.includes(normalized)) {
    synonyms.push(normalized)
  }

  return synonyms
}

async function loadFromDb(): Promise<AttributeDictionary> {
  const options = await prisma.option.findMany({ include: { values: true } })

  const dictionary: AttributeDictionary = new Map()
  for (const option of options) {
    const entries: AttributeDictionaryEntry[] = option.values.map((value) => ({
      normalizedValue: value.value,
      synonyms: parseSynonyms(value.synonyms, value.value),
    }))
    dictionary.set(option.name, entries)
  }

  return dictionary
}

async function readFromCache(): Promise<AttributeDictionary | null> {
  const cached = await redis.get(CACHE_KEY)
  if (!cached) return null

  try {
    const entries = JSON.parse(cached) as CachedPayload
    return new Map(entries)
  } catch (err) {
    logger.warn({ err }, `Invalid Redis cache for "${CACHE_KEY}", dropping it`)
    await redis.del(CACHE_KEY)
    return null
  }
}

async function loadAndCache(): Promise<AttributeDictionary> {
  const dictionary = await loadFromDb()
  const payload = JSON.stringify(Array.from(dictionary.entries()))
  await redis.set(CACHE_KEY, payload, CACHE_TTL_SECONDS)
  return dictionary
}

export const AttributeDictionaryService = {
  /** Lấy dictionary: ưu tiên Redis → fallback DB (kèm cache lại) với stampede guard. */
  async getDictionary(): Promise<AttributeDictionary> {
    const cached = await readFromCache()
    if (cached) return cached

    if (loadingPromise) return loadingPromise

    loadingPromise = loadAndCache()
    try {
      return await loadingPromise
    } finally {
      loadingPromise = null
    }
  },

  /** Xóa cache — gọi sau khi create/update/delete product làm đổi option/value. */
  async invalidate(): Promise<void> {
    await redis.del(CACHE_KEY)
  },
}
