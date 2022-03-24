import React, { ReactNode } from 'react'

import './TextInputGroup.css'

type PropTypes = {
  children: ReactNode
}

function TextInputGroup ({ children }: PropTypes) {
  

  return (    
    <div className="text-input-group">{children}</div>    
  )
}

export default TextInputGroup