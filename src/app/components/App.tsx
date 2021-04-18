import React, { useEffect, useState } from 'react'

import '../styles/variables.css'
import '../styles/ui.css'

import Checkbox from './Checkbox'
import TextInput from './TextInput'
import IconButton from './IconButton'
import Button from './Button'
import SectionTitle from './SectionTitle'
import Icon from './Icon'
import Slider from './Slider'
import Tooltip from './Tooltip'

declare function require(path: string): any

// Load images
// const Img = require('../assets/logo.svg')

// example usage
// parent.postMessage({ pluginMessage: { type: 'create-rectangles', data } }, '*')

const initialState = {
  RGB: [0, 0, 0, 1],
  LCH: [0, 0, 0, 1],
  RGB_CSS_8: 'rgb(0, 0, 0)',
  RGB_CSS_8_OPAQUE: 'rgb(0, 0, 0)',
  RGB_CSS: 'rgb(0%, 0%, 0%)',
  LCH_CSS: 'lch(0% 0 0)',
  GRADIENT_STOPS: ['black, white', 'black, black', 'black, black', 'transparent, black'],
  IS_WITHIN_SRGB: true
}

const App = ({}) => {
  const [state, setState] = useState(initialState)

  const [isRGB8Bit, setIsRGB8Bit] = useState(true)
  const [RGBString, setRGBString] = useState(initialState.RGB_CSS_8)
  const [LCHString, setLCHString] = useState(initialState.LCH_CSS)

  // Settings from plugin's clientStorage
  const [autoRepaint, setAutoRepaint] = useState(false)

  // *Semi-controlled inputs*
  // Handle alpha text field values
  const [alphaFieldValue, setAlphaFieldValue] = useState('100%')
  useEffect(() => {
    setAlphaFieldValue(Math.round(state.LCH[3] * 100) + '%')
  }, [state])
  const parseAlphaField = e => {
    if (!/^\d{0,3}%?$/.test(e.target.value)) {
      e.preventDefault()
      return
    }
    setAlphaFieldValue(e.target.value)
  }

  // *Controlled inputs (handling color)*
  // These trigger color change:
  const handleLCH = (e) => {
    let initiator: String

    if (e.target.type === 'text') {
      initiator = 'LCH'

      if (!/\d*\.?\d*/.test(e.target.value)) {
        e.preventDefault()
        return
      }
    } else {
      initiator = 'LCH_SLIDER'
    }

    const LCH_MAP = {
      lightness: 0,
      chroma: 1,
      hue: 2
    }

    let v = Number(e.target.value)    
    let lch = [...state.LCH]
    lch[LCH_MAP[e.target.name]] = v
    parent.postMessage({ pluginMessage: { type: 'color-input', message: { initiator, value: lch } } }, '*')
  }

  const handleRGB = (e) => {    
    if (!/^\d*\.?\d*$/.test(e.target.value)) {
      e.preventDefault()
      return
    }
    console.log('RGB')
    const RGB_MAP = {
      red: 0,
      green: 1,
      blue: 2
    }

    let v = Number(e.target.value) / 255

    let rgb = [...state.RGB]
    rgb[RGB_MAP[e.target.name]] = v
    parent.postMessage({ pluginMessage: { type: 'color-input', message: { initiator: 'RGB', value: rgb } } }, '*')

    
  }

  const handleAlpha = (e) => {
    let initiator: String
    let value = e.target.value

    if (e.target.type === 'text') {
      initiator = 'ALPHA'
      value = Number.parseInt(value) || 0
    } else {
      initiator = 'ALPHA_SLIDER'
    }
    
    value /= 100

    parent.postMessage({ pluginMessage: {
       type: 'color-input', 
       message: { initiator, value, prevState: state } 
      } }, 
    '*')
  }

  const handleCSSFields = (e) => {
    let { value, name } = e.target
    let initiator = ({
      'lch-css': 'LCH_CSS',
      'rgb-css': 'RGB_CSS'
    })[name]
    if (value.slice(-1) === ')') {
      parent.postMessage({ pluginMessage: { type: 'color-input', message: { initiator, value } } }, '*')
      e.preventDefault()
      return 
    }

    let setter = ({
      'lch-css': setLCHString,
      'rgb-css': setRGBString
    })[name]

    setter(value)
  }


  // update css string fields on color change
  useEffect(() => {
    setRGBString(isRGB8Bit ? state.RGB_CSS_8 : state.RGB_CSS)
    setLCHString(state.LCH_CSS)
  }, [state, isRGB8Bit])


  // *Sending messages to controller*
  // Request to fill selection with current color
  function paintSelection () {
    parent.postMessage({ pluginMessage: { type: 'paint-selection', message: { color: state.RGB } } }, '*')
  }
  function switchAutoRepaint (value: boolean) {
    console.log('Request controller to change auto-repaint to: ', value)
    parent.postMessage({ pluginMessage: { type: 'set-auto-repaint', message: { value } } }, '*')
  }

  // *Handling messages from controller*
  useEffect(() => {    
    window.onmessage = (event) => {
      const { type, message } = event.data.pluginMessage
      switch (type) {
        case 'color-update':
          console.log(message.state, 'RECEIVED FROM CONTROLLER')
          setState(message.state)
          break
        case 'set-auto-repaint-ui':
          console.log('Set autorepaint from controller on ui', message.value)
          setAutoRepaint(message.value)
        default:
          break
      }
    }
  }, [])

  // store current color (and its 100% opaque version as CSS variables)
  let currentColor = { '--current-color': state.RGB_CSS_8, '--current-color-opaque': state.RGB_CSS_8_OPAQUE } as React.CSSProperties
  return (
    <div className="ui" style={currentColor}>
      <div className="color-preview">
        <div className="color-preview_opaque"></div>
        <div className="color-preview_transparent"></div>
      </div>
      <div className="sliders section">
        <Slider 
          min={0} step={1} max={100} name="lightness" value={state.LCH[0]} 
          onChange={handleLCH} gradientStops={state.GRADIENT_STOPS[0]} label="L"
        />
        <Slider 
          min={0} step={1} max={132} name="chroma" value={state.LCH[1]} 
          onChange={handleLCH} gradientStops={state.GRADIENT_STOPS[1]} label="C"
        />
        <Slider 
          min={0} step={1} max={360} name="hue" value={state.LCH[2]} 
          onChange={handleLCH} gradientStops={state.GRADIENT_STOPS[2]} label="H" 
        />
        <div className="alpha-block">
          <Slider 
            min={0} step={1} max={100} name="alpha"
            value={Math.round(state.LCH[3] * 100)} 
            onChange={handleAlpha} gradientStops={state.GRADIENT_STOPS[3]} label="A"
            thumbColor={state.RGB_CSS_8}
          />
          <TextInput 
            name="alpha" value={alphaFieldValue} onBlur={handleAlpha} 
            onChange={parseAlphaField} 
          />
        </div>
      </div>
      
      <div className="section">
        <div className="color-inputs">
          <div className="label">LCH</div>
          <TextInput name="lightness" value={state.LCH[0]} onChange={handleLCH} />
          <TextInput name="chroma" value={state.LCH[1]} onChange={handleLCH} />
          <TextInput name="hue" value={state.LCH[2]} onChange={handleLCH} />
        </div>
        <div className="color-inputs">
          <div className="label">RGB</div>
          <TextInput name="red" value={Math.round(state.RGB[0] * 255)} onChange={handleRGB} />
          <TextInput name="green" value={Math.round(state.RGB[1] * 255)} onChange={handleRGB} />
          <TextInput name="blue" value={Math.round(state.RGB[2] * 255)} onChange={handleRGB} />
          {!state.IS_WITHIN_SRGB && 
            <Tooltip text="Color value is outside sRGB gamut" onRight>
              <Icon color="red" iconName="warning" />
            </Tooltip>
          }
        </div>
      </div>
      
      <div className="section">
        <SectionTitle>CSS strings</SectionTitle>
        <div className="css-string">
          <TextInput value={LCHString} onChange={handleCSSFields} name="lch-css"/>
        </div>
        <div className="css-string css-string__rgb">
          <TextInput value={RGBString} onChange={handleCSSFields} name="rgb-css"/>      
          <IconButton onClick={() => setIsRGB8Bit(prev => !prev)} iconName="swap" />
        </div>
      </div>
      
      

      <div className="section">
        <Button onClick={paintSelection} disabled={autoRepaint}>Paint selection</Button>
        <Checkbox label="Auto-repaint" checked={autoRepaint} onChange={() => switchAutoRepaint(!autoRepaint)} id="input_auto-repaint" />
      </div>
      
    </div>
  )
}

export default App
