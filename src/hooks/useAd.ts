import { useCallback, useRef, useState } from 'react'
import { loadFullScreenAd, showFullScreenAd } from '@apps-in-toss/web-framework'

// 광고 그룹 ID
const AD_GROUP_ID = 'ait.v2.live.a5a8926d9a4d4e1a'

// 광고 지원 여부 체크
const isAdSupported = () => {
  try {
    return loadFullScreenAd?.isSupported?.() ?? false
  } catch {
    return false
  }
}

export function useAd() {
  const [isAdLoaded, setIsAdLoaded] = useState(false)
  const [isShowingAd, setIsShowingAd] = useState(false)
  const adLoadedRef = useRef(false)
  const adSupported = isAdSupported()

  // 광고 미리 로드
  const loadAd = useCallback(() => {
    try {
      if (!loadFullScreenAd?.isSupported?.()) {
        return
      }

      if (adLoadedRef.current) return // 이미 로드됨

      loadFullScreenAd({
        options: { adGroupId: AD_GROUP_ID },
        onEvent: (event) => {
          if (event.type === 'loaded') {
            adLoadedRef.current = true
            setIsAdLoaded(true)
          }
        },
        onError: () => {
          adLoadedRef.current = false
          setIsAdLoaded(false)
        },
      })
    } catch {
      // 광고 로드 실패
    }
  }, [])

  // 광고 보여주기
  const showAd = useCallback((onComplete?: () => void) => {
    try {
      if (!showFullScreenAd?.isSupported?.()) {
        onComplete?.()
        return
      }

      if (!adLoadedRef.current) {
        onComplete?.()
        return
      }

      setIsShowingAd(true)

      showFullScreenAd({
        options: { adGroupId: AD_GROUP_ID },
        onEvent: (event) => {
          if (event.type === 'dismissed' || event.type === 'failedToShow') {
            setIsShowingAd(false)
            adLoadedRef.current = false
            setIsAdLoaded(false)
            onComplete?.()
            // 다음 광고를 위해 다시 로드
            loadAd()
          }
        },
        onError: () => {
          setIsShowingAd(false)
          adLoadedRef.current = false
          setIsAdLoaded(false)
          onComplete?.()
        },
      })
    } catch {
      onComplete?.()
    }
  }, [loadAd])

  return { loadAd, showAd, isAdLoaded, isShowingAd, isAdSupported: adSupported }
}
