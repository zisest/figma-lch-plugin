import React, { MouseEventHandler } from 'react'
import clsx from 'clsx'

import './Icon.css'

type PropTypes = {
  iconName?: string,
  color?: string,
  text?: string,
  onClick?: MouseEventHandler,
}

function Icon ({ iconName, color, text, onClick }: PropTypes) {
  let classNames = clsx('icon', color && `icon--${color}`, iconName && `icon--${iconName}`)

  return (    
    <div className={classNames} onClick={onClick}>{text}</div>    
  )
}

export default Icon