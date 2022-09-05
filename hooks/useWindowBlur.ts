import { useLayoutEffect } from 'react'

const useWindowBlur = (handleBlur: () => void) => {
  useLayoutEffect(() => {
    window.addEventListener('blur', handleBlur)
    return () => {
      window.removeEventListener('blur', handleBlur)
    }
  }, [handleBlur])
}

export default useWindowBlur
