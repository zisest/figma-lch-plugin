import React from 'react'
import clsx from 'clsx'

import './Icon.css'

type PropTypes = {
  iconName?: string,
  color?: string,
  text?: string
}

function Icon ({ iconName, color, text }: PropTypes) {
  let classNames = clsx('icon', color && `icon--${color}`, iconName && `icon--${iconName}`)

  return (    
    <div className={classNames}>{text}</div>    
  )
}

export default Icon