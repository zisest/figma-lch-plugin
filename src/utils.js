/**
 * Simple throttling function with (the trailing call is preserved)
 * @param {number} delay Throttling limit in ms
 * @param {function} fn Function to throttle
 * @returns {function} Throttled function
 */
export function throttle (delay, fn) {
  let timeoutID
  let lastExec = 0

  function wrapper () {
    const args = arguments
    const self = this

    let elapsed = Date.now() - lastExec

    function exec () {
      lastExec = Date.now()
      fn.apply(self, args)
    }

    // Clear existing timeout
    if (timeoutID) {
      clearTimeout(timeoutID)
    }

    if (elapsed > delay) {
      exec()
    } else {
      timeoutID = setTimeout(exec, delay - elapsed)
    }
  }

  return wrapper
}
