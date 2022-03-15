import { useEffect, useRef, useState, useMemo } from 'react'

const useFPS = (initialFPS = 30, initialSampleSize = 30) => {
  const requestRef = useRef<number>()
  const previousTimeRef = useRef<number>()
  const sampleSizeRef = useRef<number>(initialSampleSize)
  const averageRef = useRef<number[]>([])

  const [fps, setFPS] = useState(initialFPS)

  const animate = (time: number) => {
    if (typeof previousTimeRef.current !== 'undefined') {
      const deltaTime = time - previousTimeRef.current
      averageRef.current.push(Math.round(1000 / deltaTime))

      if (sampleSizeRef.current === 0) {
        const avg = Math.round(
          averageRef.current.reduce((sum, item) => sum + item, 0) /
            initialSampleSize
        )
        setFPS(avg)
        return
      }
    }
    previousTimeRef.current = time
    if (sampleSizeRef.current > 0) {
      requestRef.current = requestAnimationFrame(animate)
      sampleSizeRef.current--
    }
  }

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate)
    return () =>
      requestRef.current ? cancelAnimationFrame(requestRef.current) : undefined
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { fps, ms: useMemo(() => Math.round(1000 / fps), [fps]) }
}

export default useFPS
