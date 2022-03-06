const throttle = (ms: number, fn: (...args: any[]) => any) => {
  let lastCall = 0
  return function (...args: any) {
    const now = new Date().getTime()
    if (now - lastCall < ms) return
    lastCall = now
    return fn(...args)
  }
}

export default throttle
