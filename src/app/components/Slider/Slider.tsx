import React, { ChangeEventHandler } from 'react'


import './Slider.css'

type PropTypes = {
  min: number,
  step: number,
  max: number,
  name: string,
  value: number,
  gradientStops?: string,
  thumbColor?: string,
  onChange: ChangeEventHandler<HTMLInputElement>
}

function Slider ({gradientStops, thumbColor, ...props}: PropTypes) {
  let gradientStyle = gradientStops ? { '--stops': gradientStops } as React.CSSProperties : null
  let thumbStyle = thumbColor ? { '--thumb-color': thumbColor } as React.CSSProperties : null

  return (
    <div className="slider-container">
      <input style={{...gradientStyle, ...thumbStyle}} className="slider" type="range" {...props} />
    </div>
  )
}

export default Slider