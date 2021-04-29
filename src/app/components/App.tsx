import React, { useEffect, useReducer, useState, useRef } from 'react'
import { debounce, throttle } from 'throttle-debounce'

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
import TextInputGroup from './TextInputGroup'

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

function reducer (state, action) {
  console.log('%c reducer: ', 'color: tomato', { state, action })
  switch (action.type) {
    case 'L_SLIDER':
    case 'C_SLIDER':
    case 'H_SLIDER':
    case 'ALPHA_SLIDER': { 
      // L, C or H slider sets value
      let index = ({ L_SLIDER: 0, C_SLIDER: 1, H_SLIDER: 2, ALPHA_SLIDER: 3 })[action.type]
      let { LCH } = state
      LCH[index] = action.value
      return { ...state, LCH }
    }
    case 'L_SLIDER_CALC':
    case 'C_SLIDER_CALC':
    case 'H_SLIDER_CALC':
    case 'ALPHA_SLIDER_CALC': { 
      // controller sets state (triggered by L slider)
      let index = ({ L_SLIDER_CALC: 0, C_SLIDER_CALC: 1, H_SLDIER_CALC: 2, ALPHA_SLIDER_CALC: 3 })[action.type]
      let { LCH } = action.state
      LCH[index] = state.LCH[index]
      return { ...action.state, LCH }
    }
    case 'RGB_CSS_CALC':
    case 'LCH_CSS_CALC':
    case 'RGB_CALC':
    case 'LCH_CALC':
    case 'ALPHA_CALC':    
    case 'SELECTION':
      return action.state

  }
}

const useDebounce = (delay, fn) => {
  const debounced = useRef(debounce(delay, fn))
  return debounced.current
}

const useThrottle = (delay, fn) => {
  const throttled = useRef(throttle(delay, fn))
  return throttled.current
}

const App = ({}) => {
  const [state, dispatch] = useReducer(reducer, initialState)

  const [isRGB8Bit, setIsRGB8Bit] = useState(true)
  const [RGBString, setRGBString] = useState(initialState.RGB_CSS_8)
  const [LCHString, setLCHString] = useState(initialState.LCH_CSS)

  // Settings from plugin's clientStorage
  const [autoRepaint, setAutoRepaint] = useState(false)
  const [selectionValid, setSelectionValid] = useState(false)

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

  // LCH
  const handleLCH = (e, currentState) => {
    let initiator: String

    if (e.target.type === 'text') {
      initiator = 'LCH'

      if (!/\d*\.?\d*/.test(e.target.value)) {
        e.preventDefault()
        return
      }
    } else {
      initiator = e.target.name + '_SLIDER'
    }

    const LCH_MAP = {
      L: 0,
      C: 1,
      H: 2
    }
    console.log('%c', 'color: green', LCH_MAP[e.target.name])
    let v = Number(e.target.value)    
    let lch = [...currentState.LCH]
    lch[LCH_MAP[e.target.name]] = v
    console.log('CLient sending LCH to controller', lch)
    parent.postMessage({ pluginMessage: { type: 'color-input', message: { initiator, value: lch } } }, '*')
  }
  
  const throttledLCH = useThrottle(300, handleLCH)
  const handleSliders = (e) => {
    dispatch({ type: e.target.name + '_SLIDER', value: +e.target.value })
    throttledLCH(e, state)
  }

  // ALPHA
  const handleAlpha = (e, currentState) => {
    let initiator: String
    let value = e.target.value

    if (e.target.type === 'text') {
      initiator = 'ALPHA'
      value = (Number.parseInt(value) || 0) / 100
    } else {
      initiator = 'ALPHA_SLIDER'
      value = Number(value)
    }
    

    parent.postMessage({ pluginMessage: {
       type: 'color-input', 
       message: { initiator, value, prevState: currentState } 
      } }, 
    '*')
  }

  const throttledAlpha = useThrottle(300, handleAlpha)
  const handleAlphaSlider = (e) => {
    dispatch({ type: 'ALPHA_SLIDER', value: +e.target.value })
    throttledAlpha(e, state)
  }

  // RGB
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

  // CSS
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
  function pickFromSelection () {
    parent.postMessage({ pluginMessage: { type: 'pick-from-selection' } }, '*')
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
          dispatch({ type: message.initiator, state: message.state})
          break
        case 'set-auto-repaint-ui':
          console.log('Set autorepaint from controller on ui', message.value)
          setAutoRepaint(message.value)
          break
        case 'set-selection-valid':
          console.log('Set selectionValid from controller on ui', message.value)
          setSelectionValid(message.value)
          break
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
          min={0} step={1} max={100} name="L" value={state.LCH[0]} 
          onChange={handleSliders} gradientStops={state.GRADIENT_STOPS[0]} label="L"
        />
        <Slider 
          min={0} step={1} max={132} name="C" value={state.LCH[1]} 
          onChange={handleSliders} gradientStops={state.GRADIENT_STOPS[1]} label="C"
        />
        <Slider 
          min={0} step={1} max={360} name="H" value={state.LCH[2]} 
          onChange={handleSliders} gradientStops={state.GRADIENT_STOPS[2]} label="H" 
        />
        <div className="alpha-block">
          <Slider 
            min={0} step={0.01} max={1} name="alpha"
            value={state.LCH[3]} 
            onChange={handleAlphaSlider} gradientStops={state.GRADIENT_STOPS[3]} label="A"
          />
          <TextInput 
            name="alpha" value={alphaFieldValue} onBlur={e => handleAlpha(e, state)} 
            onChange={parseAlphaField} 
          />
        </div>
      </div>
      
      <div className="section">
        <div className="color-inputs">
          <div className="label">LCH</div>
          <TextInputGroup>
            <TextInput name="L" value={state.LCH[0]} onChange={(e) => handleLCH(e, state)} />
            <TextInput name="C" value={state.LCH[1]} onChange={(e) => handleLCH(e, state)} />
            <TextInput name="H" value={state.LCH[2]} onChange={(e) => handleLCH(e, state)} />
          </TextInputGroup>          
        </div>
        <div className="color-inputs">
          <div className="label">RGB</div>
          <TextInputGroup>
            <TextInput name="red" value={Math.round(state.RGB[0] * 255)} onChange={handleRGB} />
            <TextInput name="green" value={Math.round(state.RGB[1] * 255)} onChange={handleRGB} />
            <TextInput name="blue" value={Math.round(state.RGB[2] * 255)} onChange={handleRGB} />
          </TextInputGroup>          
          
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
          <TextInput value={LCHString} onChange={handleCSSFields} name="lch-css" withCopyBtn />
        </div>
        <div className="css-string css-string__rgb">
          <TextInput value={RGBString} onChange={handleCSSFields} name="rgb-css" withCopyBtn />      
          <IconButton onClick={() => setIsRGB8Bit(prev => !prev)} iconName="swap" />
        </div>
      </div>
      
      
      <div className="section buttons-section">
        <Button onClick={pickFromSelection} disabled={!selectionValid}>Pick color</Button>
        <Button onClick={paintSelection} disabled={autoRepaint}>Paint selection</Button>
        <Checkbox label="Auto-repaint" checked={autoRepaint} onChange={() => switchAutoRepaint(!autoRepaint)} id="input_auto-repaint" />
      </div>
      
    </div>
  )
}

export default App
