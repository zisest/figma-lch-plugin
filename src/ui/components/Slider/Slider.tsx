import React, { ChangeEventHandler } from 'react'
import c from 'clsx'

//import Icon from '../Icon'

import './Slider.css'

type PropTypes = {
  min: number,
  step: number,
  max: number,
  name: string,
  value: number,
  gradientStops?: string,
  hideKnob?: boolean,
  onChange: ChangeEventHandler<HTMLInputElement>
}

function Slider ({gradientStops, hideKnob, name, ...props}: PropTypes) {
  let gradientStyle = gradientStops ? { '--stops': gradientStops } as React.CSSProperties : undefined

  return (
    <label className="slider-label">
      <label htmlFor={`slider-${name}`} className="label height-28">{name}</label>
      <div className="slider-container">
        <input style={gradientStyle} id={`slider-${name}`} className={c('slider', hideKnob && 'slider_hide-knob')} type="range" name={name} {...props} />
      </div>
    </label>
  )
}

export default Slider