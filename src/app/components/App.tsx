import React, { useEffect, useState } from 'react'

import '../styles/ui.css'

declare function require(path: string): any

// Load images
// const Img = require('../assets/logo.svg')

// example usage
// parent.postMessage({ pluginMessage: { type: 'create-rectangles', data } }, '*')

const initialState = {
  RGB: [0, 0, 0, 1],
  LCH: [0, 0, 0, 1],
  RGB_CSS_8: 'rgb(0, 0, 0)',
  RGB_CSS: 'rgb(0%, 0%, 0%)',
  LCH_CSS: 'lch(0% 0 0)',
}

const App = ({}) => {
  const [state, setState] = useState(initialState)

  const [isRGB8Bit, setIsRGB8Bit] = useState(true)
  const [RGBString, setRGBString] = useState(initialState.RGB_CSS_8)
  const [LCHString, setLCHString] = useState(initialState.LCH_CSS)

  // Settings from plugin's clientStorage
  const [autoRepaint, setAutoRepaint] = useState(false)



  function paintSelection () {
    parent.postMessage({ pluginMessage: { type: 'paint-selection', message: { color: state.RGB } } }, '*')
  }
  function switchAutoRepaint (value: boolean) {
    console.log('Request controller to change auto-repaint to: ', value)
    parent.postMessage({ pluginMessage: { type: 'set-auto-repaint', message: { value } } }, '*')
  }


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
    if (e.target.type === 'text') {
      initiator = 'ALPHA'

      if (!/^\d*\.?\d*$/.test(e.target.value)) {
        e.preventDefault()
        return
      }
    } else {
      initiator = 'ALPHA_SLIDER'
    }
    
    let value = e.target.value / 100

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


  useEffect(() => {
    // This is how we read messages sent from the plugin controller
    window.onmessage = (event) => {
      const { type, message } = event.data.pluginMessage
      switch (type) {
        case 'color-update':
          console.log(message)
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


  return (
    <div>
      <div className="color-preview" style={{ backgroundColor: state.RGB_CSS }}></div>
      <input type="range" min="0" step="1" max="100" name="lightness" value={state.LCH[0]} onChange={handleLCH} />
      <input type="range" min="0" step="1" max="132" name="chroma" value={state.LCH[1]} onChange={handleLCH} />
      <input type="range" min="0" step="1" max="360" name="hue" value={state.LCH[2]} onChange={handleLCH} />

      <input type="range" min="0" step="1" max="100" name="alpha"
       value={Math.round(state.LCH[3] * 100)} 
       onChange={handleAlpha}
      />

      <div className="color-inputs">
        <input type="text" name="lightness" value={state.LCH[0]} onChange={handleLCH} />
        <input type="text" name="chroma" value={state.LCH[1]} onChange={handleLCH} />
        <input type="text" name="hue" value={state.LCH[2]} onChange={handleLCH} />
      </div>
      <div className="color-inputs">
        <input type="text" name="red" value={Math.round(state.RGB[0] * 255)} onChange={handleRGB} />
        <input type="text" name="green" value={Math.round(state.RGB[1] * 255)} onChange={handleRGB} />
        <input type="text" name="blue" value={Math.round(state.RGB[2] * 255)} onChange={handleRGB} />
      </div>
      <input type="text" name="alpha" value={Math.round(state.LCH[3] * 100)} onChange={handleAlpha} />

      <input type="text" name="lch-css" value={LCHString} onChange={handleCSSFields} />
      <input type="text" name="rgb-css" value={RGBString} onChange={handleCSSFields} />

      <button onClick={() => setIsRGB8Bit(prev => !prev)}>Change</button>
      <br></br>
      <button onClick={paintSelection}>Paint selection</button>
      <label>auto repaint<input type="checkbox" checked={autoRepaint} onChange={() => switchAutoRepaint(!autoRepaint)} /></label>

    </div>
  )
}

export default App
