import React, { ReactNode, CSSProperties, useRef, useState, useEffect } from 'react'

import './Tooltip.css'

import Portal from '../Portal/Portal'
import clsx from 'clsx'

type PropTypes = {
  text: string,
  children: ReactNode,
  onLeft?: boolean,
  onRight?: boolean
}


function Tooltip ({ text, children, onLeft, onRight }: PropTypes) {
  const [isVisible, setIsVisible] = useState(false)
  const [position, setPosition] = useState(null)
  const [arrowPosition, setArrowPosition] = useState(null)
  const hostRef = useRef(null)

  const [timer, setTimer] = useState(null)

  const MAX_TOOLTIP_WIDTH = 200
  const ARROW_HEIGHT = 5

  
  useEffect(() => {
    let hostRectBox = hostRef.current.getBoundingClientRect()
    let windowWidth = window.innerWidth

    let top = hostRectBox.bottom + ARROW_HEIGHT
    let arrowPos = hostRectBox.width / 2 - 2
    setArrowPosition(arrowPos)

    // Always showing on the bottom
    if (onLeft) {
      let left = hostRectBox.left - 2
      setPosition({ top, left })      
    } else {
      let right = windowWidth - hostRectBox.right - 2
      setPosition({ top, right })
    }
    
  }, [hostRef])


  const showTooltip = () => {
    let delay = setTimeout(() => {
      setIsVisible(true)
    }, 1000)
    setTimer(delay)
  }

  const hideTooltip = () => {
    clearTimeout(timer)
    setIsVisible(false)
  }

  const arrowStyle = { '--arrow-pos': arrowPosition } as CSSProperties
  return (
    <div ref={hostRef} onMouseEnter={showTooltip} onMouseLeave={hideTooltip} className="tooltip-wrapper">
      {children}
      <Portal>
        <div 
          className={clsx('tooltip', isVisible && 'tooltip__visible', onLeft && 'tooltip__left', onRight && 'tooltip__right')} 
          style={{ ...position, ...arrowStyle }}
        >          
          <div className="tooltip_content" style={{ maxWidth: MAX_TOOLTIP_WIDTH + 'px' }}>
            {text}
          </div>      
        </div>
      </Portal> 
    </div>       
  )
}

export default Tooltip