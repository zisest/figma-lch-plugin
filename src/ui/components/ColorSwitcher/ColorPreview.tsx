import React, { MouseEventHandler } from 'react'
import c from 'clsx'
import './ColorPreview.css'

interface PropTypes {
  color: string,
  colorOpaque: string,
  selected: boolean,
  fromGradient?: boolean,
  onClick: MouseEventHandler
}

function ColorPreview ({ color, colorOpaque, selected, onClick, fromGradient, ...props }: PropTypes) {

  return (    
    <div onClick={onClick} className={c('color-preview', selected && 'color-preview_selected', fromGradient && 'color-preview_gradient')} {...props}>      
      <div className="color-preview_transparent" style={{ background: color }}></div>
      <div className="color-preview_opaque" style={{ background: colorOpaque }}></div>
    </div>
  )
}

export default ColorPreview