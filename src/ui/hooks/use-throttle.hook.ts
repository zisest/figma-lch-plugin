import { useRef } from 'react'
import { throttle } from '../../utils'

export function useThrottle<T extends CallableFunction> (delay: number, fn: T): T {
  const throttled = useRef(throttle(delay, fn))
  return throttled.current
}