import React, { MouseEventHandler } from 'react'

import './IconButton.css'

import Icon from '../Icon'

type PropTypes = {
  onClick: MouseEventHandler,
  iconName: string,
  color: string,
  text: string
}

function IconButton ({ onClick, ...props }: PropTypes) {


  return (
    <div className="icon-button" onClick={onClick}> 
      <Icon {...props} />
    </div>
  )
}

export default IconButton