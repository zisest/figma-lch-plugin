import React, { ChangeEventHandler } from 'react'

//import Icon from '../Icon'

import './Slider.css'

type PropTypes = {
  min: number,
  step: number,
  max: number,
  name: string,
  value: number,
  gradientStops?: string,
  thumbColor?: string,
  label?: string,
  onChange: ChangeEventHandler<HTMLInputElement>
}

function Slider ({gradientStops, thumbColor, label, ...props}: PropTypes) {
  let gradientStyle = gradientStops ? { '--stops': gradientStops } as React.CSSProperties : null
  let thumbStyle = thumbColor ? { '--thumb-color': thumbColor } as React.CSSProperties : null

  return (
    <label className="slider-label">
      <div className="label height-28">{label}</div>
      <div className="slider-container">
        <input style={{...gradientStyle, ...thumbStyle}} className="slider" type="range" {...props} />
      </div>
    </label>
  )
}

export default Slider