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
  label?: string,
  onChange: ChangeEventHandler<HTMLInputElement>
}

function Slider ({gradientStops, label, ...props}: PropTypes) {
  let gradientStyle = gradientStops ? { '--stops': gradientStops } as React.CSSProperties : null

  return (
    <label className="slider-label">
      <div className="label height-28">{label}</div>
      <div className="slider-container">
        <input style={gradientStyle} className="slider" type="range" {...props} />
      </div>
    </label>
  )
}

export default Slider