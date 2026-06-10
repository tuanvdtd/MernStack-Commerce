import { useCallback, useEffect, useRef } from "react"

import { deleteProductImage } from "~/apis/uploadApi"

export function useOrphanImageTracker(committedUrls: string[] = []) {
  const pendingPublicIds = useRef<Set<string>>(new Set())
  const urlToPublicId = useRef<Map<string, string>>(new Map())
  const committedUrlsRef = useRef<Set<string>>(new Set(committedUrls))

  useEffect(() => {
    committedUrlsRef.current = new Set(committedUrls.filter(Boolean))
  }, [committedUrls])

  const releaseByUrl = useCallback(async (url: string) => {
    if (!url || committedUrlsRef.current.has(url)) return

    const publicId = urlToPublicId.current.get(url)
    if (!publicId) return

    urlToPublicId.current.delete(url)
    pendingPublicIds.current.delete(publicId)

    try {
      await deleteProductImage(publicId)
    } catch {
      // Best-effort cleanup — không chặn UX
    }
  }, [])

  const onFieldChange = useCallback(
    async (previousUrl: string, newUrl: string, newPublicId?: string) => {
      if (previousUrl && previousUrl !== newUrl) {
        await releaseByUrl(previousUrl)
      }

      if (newUrl && newPublicId) {
        urlToPublicId.current.set(newUrl, newPublicId)
        if (!committedUrlsRef.current.has(newUrl)) {
          pendingPublicIds.current.add(newPublicId)
        }
      }
    },
    [releaseByUrl]
  )

  const markAllCurrentAsCommitted = useCallback((urls: string[]) => {
    urls.filter(Boolean).forEach((url) => {
      committedUrlsRef.current.add(url)
      const publicId = urlToPublicId.current.get(url)
      if (publicId) pendingPublicIds.current.delete(publicId)
    })
  }, [])

  const cleanupPending = useCallback(async () => {
    const ids = [...pendingPublicIds.current]
    pendingPublicIds.current.clear()

    await Promise.allSettled(ids.map((id) => deleteProductImage(id)))
  }, [])

  useEffect(() => {
    return () => {
      void cleanupPending()
    }
  }, [cleanupPending])

  return {
    onFieldChange,
    markAllCurrentAsCommitted,
    cleanupPending,
  }
}
