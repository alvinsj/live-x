import { useEffect, useState } from 'react'

const useMatchMedia = (query: string) => {
  const [isSmallScreen, setIsSmallScreen] = useState(
    window?.matchMedia('(max-width: 600px)').matches
  )

  useEffect(() => {
    const mediaQuery = window?.matchMedia(query)
    const handleSmallScreenSchange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        setIsSmallScreen(true)
      } else setIsSmallScreen(false)
    }
    mediaQuery.addEventListener('change', handleSmallScreenSchange)

    return () => {
      mediaQuery.removeEventListener('change', handleSmallScreenSchange)
    }
  }, [query])

  return { isSmallScreen }
}

export default useMatchMedia
