import { useCallback, useLayoutEffect, useRef } from 'react'
import { throttle } from '../../utils'

type AnyFunction = (...args: any[]) => any;
export type ArgsType<T> = T extends (...args: infer A) => unknown ? A : never;

export function useEvent<T extends AnyFunction>(handler: T): T {
  const handlerRef = useRef<T>(handler)

  // In a real implementation, this would run before layout effects
  useLayoutEffect(() => {
    handlerRef.current = handler
  }, [handler])

  return useCallback((...args: ArgsType<T>) => {
    // In a real implementation, this would throw if called during render
    return handlerRef.current(...args)
  }, []) as T
}

export function useThrottle<T extends AnyFunction>(delay: number, fn: T): T {
  const memoized = useEvent(fn)
  return throttle(delay, memoized)
}