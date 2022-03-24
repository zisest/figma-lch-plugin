import React, { MouseEventHandler, ReactNode } from 'react'

import './Button.css'

type PropTypes = {
  onClick: MouseEventHandler,
  secondary?: boolean,
  disabled?: boolean,
  children: ReactNode
}

function Button ({ onClick, children, secondary, disabled }: PropTypes) {
  let classNames = 'button ' + (secondary ? 'button--secondary' : 'button--primary')

  return (
    <button className={classNames} disabled={disabled} onClick={onClick}>{children}</button> 
  )
}

export default Button