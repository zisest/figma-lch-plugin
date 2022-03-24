import React, { ReactNode, CSSProperties, useRef, useState, useEffect } from 'react'

import './Tooltip.css'

import Portal from '../Portal'
import clsx from 'clsx'


type Position = { top: number, left: number | string, transform?: string } | { top: number, right: number }

interface CommonProps {
  text: string,
  children: ReactNode,
  pos: 'left' | 'right' | 'center',
  disabled?: boolean,
  autoDisplay?: boolean,
  onHide?: () => void
}
type PosProps = { pos: 'left' | 'right', width?: number } | { pos: 'center', width: number }
type PropTypes = CommonProps & PosProps


function Tooltip ({ text, children, pos, disabled, autoDisplay, width, onHide }: PropTypes) {
  const [isVisible, setIsVisible] = useState(autoDisplay)
  const [position, setPosition] = useState<Position>({ top: 0, right: 0 })
  const [arrowPosition, setArrowPosition] = useState(0)
  const hostRef = useRef<HTMLDivElement>(null)

  const [timer, setTimer] = useState(0)

  const MAX_TOOLTIP_WIDTH = 200
  const ARROW_HEIGHT = 5

  
  useEffect(() => {
    if (!hostRef.current) return

    const hostRectBox = hostRef.current.getBoundingClientRect()
    const windowWidth = window.innerWidth

    const top = hostRectBox.bottom + ARROW_HEIGHT + 1
    console.log('tooltip hostRectBox', { hostRectBox })
    
    // Default arrow position: either near the left or the right side
    // Arrow position is relative to the tooltip
    setArrowPosition(hostRectBox.width / 2 - 2)

    switch (pos) {
      case 'center': {
        if (width == undefined) throw new Error('Centered Tooltip should be provided with a width value')
        if (width > windowWidth - 10) throw new Error('Tooltip is wider than the window')

        let hostCenter = hostRectBox.left + hostRectBox.width / 2
        let left = hostCenter - width / 2
        let right = windowWidth - (hostCenter + width / 2)

        if (left < 5) {
          setPosition({ top, left: 5 })
          pos = 'left'
          break
        }
        if (right < 5) {
          setPosition({ top, right: 5 })
          pos = 'right'
          break
        }

        setPosition({ top, left })
        // Set arrow to the middle of the tooltip
        setArrowPosition(width / 2 - 5) 
        break
      }
      case 'left': {
        let left = hostRectBox.left - 2
        if (left < 5) left = 5
        setPosition({ top, left })  
        break
      }
      case 'right': {
        let right = windowWidth - hostRectBox.right - 2
        if (right < 5) right = 5
        setPosition({ top, right })
        break
      }
      
    }
    
  }, [hostRef.current])


  const showTooltip = () => {
    let delay = setTimeout(() => {
      setIsVisible(true)
    }, 1000)
    setTimer(delay)
  }

  const hideTooltip = () => {
    clearTimeout(timer)
    let delay = setTimeout(() => {
      setIsVisible(false)
      onHide?.()
    }, 300)
    setTimer(delay)    
  }

  useEffect(() => {
    return () => clearTimeout(timer)
  }, [timer])

  if (disabled) return <>{children}</>

  const arrowStyle = { '--arrow-pos': arrowPosition } as CSSProperties
  return (
    <div ref={hostRef} onMouseEnter={showTooltip} onMouseLeave={hideTooltip} className="tooltip-wrapper">
      {children}
      <Portal>
        <div 
          className={clsx('tooltip', isVisible && hostRef.current && 'tooltip__visible', 'tooltip__' + pos)} 
          style={{ ...position, ...arrowStyle }}
        >          
          <div className="tooltip_content" style={{ maxWidth: MAX_TOOLTIP_WIDTH + 'px', width: width ? width + 'px' : 'auto' }}>
            {text}
          </div>      
        </div>
      </Portal> 
    </div>       
  )
}

export default Tooltip