import React, { useEffect, useReducer, useState, FocusEvent, ChangeEvent } from 'react'

import '../../styles/variables.css'
import '../../styles/ui.css'
import Checkbox from '../Checkbox'
import TextInput from '../TextInput'
import IconButton from '../IconButton'
import Button from '../Button'
import SectionTitle from '../SectionTitle'
import Icon from '../Icon'
import Slider from '../Slider'
import Tooltip from '../Tooltip'
import TextInputGroup from '../TextInputGroup'

import { getFullColorData } from '../../../helpers/colors.helpers'
import ColorSwitcher from '../ColorSwitcher'
import { AutoRepaintFromUI, Color, ColorAction, ColorInputFromUI, ColorState, ColorToController, 
  FillsOrStrokes, LCH_value, MessageEventToUI, ModeFromUI, PartialColorState, PickFromSelectionFromUI, 
  RGB_value, TooltipAlreadyShownFromUI } from '../../../types'
import Switch from '../Switch'
import { useThrottle } from '../../hooks/use-throttle.hook'
import { COLOR_INDEX_MAP, initialState, LCH_MAP } from './App.constants'
import { areLCHValuesMixed, calculateFromLCH, getColorValue, switchColorValues } from './App.helpers'


function stateReducer (state: ColorState[], action: ColorAction): ColorState[] {
  console.log('reducer', 'colors' in action && action.colors)
  switch (action.type) {
    case 'set-color':
      if (!action.selectedColors?.length) return state
      return state.map((color, i) => action.selectedColors.includes(i) ? { ...color, ...action.newColor } : color)
    case 'set-all-colors':
      console.log('Setting new state', action.colors)
      return action.colors    
    case 'from-LCH-slider': {
      let { valueName, value } = action
      return state.map((color, i) => action.selectedColors.includes(i) ? { ...color, LCH: switchColorValues(color.LCH, valueName, value) } : color)
    }
    case 'from-LCH-calc': { // should set all LCH values except the one that initiated calc
      return action.colors.map((color, i) => 
        ({ ...color, LCH: switchColorValues(color.LCH, action.except, getColorValue(state[i].LCH, action.except)) }))
    }
    case 'from-RGB': {
      let { valueName, value, selectedColors } = action
      if (selectedColors.length > 1) return state
      let color = state[selectedColors[0]]
      console.log('!', {color})
      let newColor = getFullColorData({ from: 'RGB', value: switchColorValues(color.RGB, valueName, value) })
      console.log('!', {newColor})

      return [ ...state.slice(0, selectedColors[0]), { ...color, ...newColor }, ...state.slice(selectedColors[0] + 1) ]
    }
    default:
      return state
  }

}


const App = () => {
  const [colors, dispatchColors] = useReducer(stateReducer, [initialState])
  const [selectedColors, setSelectedColors] = useState([0])
  const multipleColorsSelected = selectedColors.length > 1
  console.log({colors})
  // const [state2, dispatch] = useReducer(reducer, initialState)
  const state = colors[selectedColors[0]] || colors[0]
  const LCHValuesMixed = areLCHValuesMixed(colors, selectedColors)
  console.log({LCHValuesMixed})

  const [isRGB8Bit, setIsRGB8Bit] = useState(true)
  const [RGBString, setRGBString] = useState(initialState.RGB_CSS_8)
  const [LCHString, setLCHString] = useState(initialState.LCH_CSS)
  const [hexString, setHexString] = useState(initialState.HEX_CSS)

  // Settings from plugin's clientStorage
  const [autoRepaint, setAutoRepaint] = useState(false)
  const [fillsOrStrokes, setFillsOrStrokes] = useState<FillsOrStrokes>('fills')
  const [tooltipAlreadyShown, setTooltipAlreadyShown] = useState(true)
  console.log({fillsOrStrokes})

  // *Semi-controlled inputs*
  // Handle alpha text field values
  const [alphaFieldValue, setAlphaFieldValue] = useState('100%')

  useEffect(() => {
    setAlphaFieldValue(Math.round(state.LCH[3] * 100) + '%')
  }, [state])

  const parseAlphaField = (e: ChangeEvent<HTMLInputElement>) => {
    let { value } = e.target
    if (!/^\d{0,3}%?$/.test(value) || Number.parseInt(value) > 100) {
      e.preventDefault()
      return
    }
    setAlphaFieldValue(value)
  }



  function sendRGBToController (colors: ColorToController[], forceRepaint: boolean = false) {
    const pluginMessage: ColorInputFromUI = { type: 'color-from-ui', message: { colors, forceRepaint } }
    parent.postMessage({ pluginMessage }, '*')
  }
  
  const throttledSendRGBToController = useThrottle(100, sendRGBToController)

  const handleLCH = (e: ChangeEvent<HTMLInputElement>, currentState: ColorState[], selectedColors: number[]) => {
    let value: string | number = e.target.value
    let valueName = e.target.name as LCH_value
    if (!['L', 'C', 'H'].includes(valueName)) throw new Error('Invalid initiator label @handleLCH')

    const { index, maxValue } = LCH_MAP[valueName]

    if (e.target.type === 'text') {
      if (!/^\d*$/.test(value) || +value > maxValue ) {
        e.preventDefault()
        return
      }
    }

    console.log('%c', 'color: green', index)
    value = Number(value)   
    
    const { allColors, newSelection, colorsToController } = calculateFromLCH(currentState, selectedColors, value, valueName)

    console.log({allColors, newSelection})
    if (newSelection?.length) setSelectedColors(newSelection)
    dispatchColors({ type: 'from-LCH-calc', colors: allColors, except: valueName })
    // dispatchColors({ type: 'set-all-colors', colors: allColors })
    

    throttledSendRGBToController(colorsToController)
  }

  const throttledLCH = useThrottle(50, handleLCH)
  const handleLCHSliders = (e: ChangeEvent<HTMLInputElement>) => {
    const value = +e.target.value
    const valueName = e.target.name as LCH_value
    if (!['L', 'C', 'H'].includes(valueName)) throw new Error('Invalid initiator label @handleLCHSliders')

    dispatchColors({ type: 'from-LCH-slider', selectedColors, value, valueName })
    throttledLCH(e, colors, selectedColors)
  }

  const handleLCHInputs = (e: ChangeEvent<HTMLInputElement>) => {
    const value = +e.target.value
    const valueName = e.target.name as LCH_value
    if (!['L', 'C', 'H'].includes(valueName)) throw new Error('Invalid initiator label @handleLCHInputs')

    dispatchColors({ type: 'from-LCH-slider', selectedColors, value, valueName })
    throttledLCH(e, colors, selectedColors)
  }

  // ALPHA
  const handleAlpha: (e: ChangeEvent<HTMLInputElement>, currentState: ColorState[], selectedColors: number[]) => void = (e, currentState, selectedColors) => {
    let value: number | string = e.target.value

    if (e.target.type === 'text') {
      value = (Number.parseInt(value) || 0) / 100
    } else {
      value = Number(value)
    }
    
    const { allColors, newSelection, colorsToController } = calculateFromLCH(currentState, selectedColors, value, 'A')

    console.log({allColors, newSelection})
    if (newSelection?.length) setSelectedColors(newSelection)
    // dispatchColors({ type: 'set-all-colors', colors: allColors })
    dispatchColors({ type: 'from-LCH-calc', colors: allColors, except: 'A' })
    
    throttledSendRGBToController(colorsToController)
  }

  const throttledAlpha = useThrottle(50, handleAlpha)
  const handleAlphaSlider = (e: ChangeEvent<HTMLInputElement>) => {
    // dispatch({ type: 'ALPHA_SLIDER', value: +e.target.value })
    dispatchColors({ type: 'from-LCH-slider', selectedColors, value: +e.target.value, valueName: 'A' })
    throttledAlpha(e, colors, selectedColors)
  }

  // RGB
  const handleRGB = (e: ChangeEvent<HTMLInputElement>) => {    
    let value: string | number = e.target.value
    const valueName = e.target.name as RGB_value
    if (!['R', 'G', 'B'].includes(valueName)) throw new Error('Invalid initiator label @handleRGB')
    
    if (!/^\d*$/.test(value) || +value > 255) {
      e.preventDefault()
      return
    }
    console.log('RGB')
    value = Number(e.target.value) / 255

    let rgb: Color = [...state.RGB]
    rgb[COLOR_INDEX_MAP[valueName]] = value
    dispatchColors({ type: 'from-RGB', selectedColors, value, valueName })

    sendRGBToController([{ RGB: rgb, NODE_IDS: state.NODE_IDS }])
  }

  // CSS
  type CSSFieldsLabel = 'LCH_CSS' | 'RGB_CSS' | 'HEX_CSS'
  const handleCSSFieldsBlur = (e: FocusEvent<HTMLInputElement>) => {
    const value = e.target.value
    const valueName = e.target.name as CSSFieldsLabel
    if (!['LCH_CSS', 'RGB_CSS', 'HEX_CSS'].includes(valueName)) throw new Error('Invalid initiator label @handleCSSFieldsBlur')

    let newColor: PartialColorState
    try {
      newColor = getFullColorData({ from: valueName, value })
    } catch (err) {
      let setter = ({
        'LCH_CSS': setLCHString,
        'RGB_CSS': setRGBString,
        'HEX_CSS': setHexString
      })[valueName]
      setter(state[valueName])
      return
    }
    dispatchColors({ type: 'set-color', selectedColors, newColor })
    const colorToController: ColorToController[] = [{ RGB: newColor.RGB, NODE_IDS: state.NODE_IDS }]
    sendRGBToController(colorToController)
  }

  // update css string fields on color change
  useEffect(() => {
    setRGBString(isRGB8Bit ? state.RGB_CSS_8 : state.RGB_CSS)
    setLCHString(state.LCH_CSS)
    setHexString(state.HEX_CSS)
  }, [state])

  // update string on RGB display mode change
  useEffect(() => {
    setRGBString(isRGB8Bit ? state.RGB_CSS_8 : state.RGB_CSS)
  }, [isRGB8Bit])

  // *Sending messages to controller*
  // Request to fill selection with current color
  function paintSelection () {
    sendRGBToController(colors, true)
  }
  function pickFromSelection () {
    const pluginMessage: PickFromSelectionFromUI = { type: 'pick-from-selection' }
    parent.postMessage({ pluginMessage }, '*')
  }
  function switchAutoRepaint (value: boolean) {
    console.log('Request controller to change auto-repaint to: ', value)
    const pluginMessage: AutoRepaintFromUI = { type: 'set-auto-repaint', message: { value } }
    parent.postMessage({ pluginMessage }, '*')
  }
  function switchFillsOrStrokes (value: FillsOrStrokes) {
    console.log('Request controller to change fills or strokes to: ', value)
    const pluginMessage: ModeFromUI = { type: 'set-fills-or-strokes', message: { value } }
    parent.postMessage({ pluginMessage }, '*')
  }
  function hideHelpTooltip () {
    const pluginMessage: TooltipAlreadyShownFromUI = { type: 'set-tooltip-already-shown' }
    parent.postMessage({ pluginMessage }, '*')    
  }

  // *Handling messages from controller*
  function handleMessagesToUI (event: MessageEvent<MessageEventToUI>) {
    const pluginMessage = event.data.pluginMessage
    switch (pluginMessage.type) {
      case 'color-to-ui': // get color from selection
        const { allFills } = pluginMessage
        console.log(allFills, 'RECEIVED FROM CONTROLLER')
        // NEW
        // Solid fills
        const solidFills: ColorState[] = []
        Object.entries(allFills.solid).forEach(([RGBString, nodes]) => {
          const RGB = RGBString.split(',').map(Number)
          if (RGB.length !== 4) return
          let colorState = getFullColorData({ from: 'RGB', value: RGB as Color  })
          solidFills.push({...colorState, NODE_IDS: nodes})
        })
        
        // Gradients
        const gradientFills: ColorState[] = []
        Object.entries(allFills.gradient).forEach(([hash, { colors, nodes }]) => {
          for (const { RGB, pos } of colors) {
            let colorState = getFullColorData({ from: 'RGB', value: RGB })
            gradientFills.push({ ...colorState, NODE_IDS: nodes, GRADIENT_HASH: hash, GRADIENT_STOP_POS: pos })
          }
        })

        // Setting state
        if (solidFills?.length || gradientFills?.length) {
          setSelectedColors([0])
          dispatchColors({ type: 'set-all-colors', colors: [...solidFills, ...gradientFills]})
        }
        break
      case 'set-auto-repaint-ui':
        console.log('Set autorepaint from controller on ui', pluginMessage.value)
        setAutoRepaint(pluginMessage.value)
        break
      case 'set-fills-or-strokes-ui':
        console.log('Set fills or strokes` from controller on ui', pluginMessage.value)
        setFillsOrStrokes(pluginMessage.value)
        break
      case 'set-tooltip-already-shown-ui':
        setTooltipAlreadyShown(pluginMessage.value)
        break
      default:
        break
    }
  }

  useEffect(() => {
    window.addEventListener('message', handleMessagesToUI)

    return () => window.removeEventListener('message', handleMessagesToUI)
  }, [])

  // store current color (and its 100% opaque version as CSS variables)
  let currentColor = { '--current-color': state.RGB_CSS_8, '--current-color-opaque': state.RGB_CSS_8_OPAQUE } as React.CSSProperties
  return (
    <div className="ui" style={currentColor}>
      <Tooltip text='Use Ctrl (Cmd) or Shift keys to select multiple colors' pos='center' 
        onHide={hideHelpTooltip} width={140} 
        autoDisplay disabled={tooltipAlreadyShown || colors.length === 1}
      >
        <ColorSwitcher colors={colors} selectedColors={selectedColors} setSelectedColors={selected => setSelectedColors(selected)} />
      </Tooltip>
      <div className="section fills-or-strokes">
        <Switch name="fills-or-strokes" values={['fills', 'strokes']} selected={fillsOrStrokes} onChange={v => switchFillsOrStrokes(v as FillsOrStrokes)} id="input_fills-or-strokes" />
      </div>
      <div className="section">
        <Slider 
          min={0} step={1} max={100} name="L" value={state.LCH[0]} hideKnob={LCHValuesMixed[0]}
          onChange={handleLCHSliders} gradientStops={state.GRADIENT_STOPS[0]}
        />
        <Slider 
          min={0} step={1} max={132} name="C" value={state.LCH[1]} hideKnob={LCHValuesMixed[1]}
          onChange={handleLCHSliders} gradientStops={state.GRADIENT_STOPS[1]}
        />
        <Slider 
          min={0} step={1} max={360} name="H" value={state.LCH[2]} hideKnob={LCHValuesMixed[2]}
          onChange={handleLCHSliders} gradientStops={state.GRADIENT_STOPS[2]}
        />
        <div className="alpha-block">
          <Slider 
            min={0} step={0.01} max={1} name="A" hideKnob={LCHValuesMixed[3]}
            value={state.LCH[3]} 
            onChange={handleAlphaSlider} gradientStops={state.GRADIENT_STOPS[3]}
          />
          <TextInput 
            name="A" value={LCHValuesMixed[3] ? '-' : alphaFieldValue} onBlur={e => handleAlpha(e, colors, selectedColors)} 
            onChange={parseAlphaField} disabled={LCHValuesMixed[3]}
          />
        </div>
      </div>
      
      <div className="section">
        <div className="color-inputs">
          <div className="label">LCH</div>
          <TextInputGroup>
            <TextInput name="L" value={LCHValuesMixed[0] ? '-' : state.LCH[0]} onChange={handleLCHInputs} />
            <TextInput name="C" value={LCHValuesMixed[1] ? '-' : state.LCH[1]} onChange={handleLCHInputs} />
            <TextInput name="H" value={LCHValuesMixed[2] ? '-' : state.LCH[2]} onChange={handleLCHInputs} />
          </TextInputGroup>          
        </div>
        <div className="color-inputs">
          <div className="label">RGB</div>
          <TextInputGroup>
            <TextInput name="R" value={multipleColorsSelected ? '-' : Math.round(state.RGB[0] * 255)} onChange={handleRGB} disabled={multipleColorsSelected} />
            <TextInput name="G" value={multipleColorsSelected ? '-' : Math.round(state.RGB[1] * 255)} onChange={handleRGB} disabled={multipleColorsSelected} />
            <TextInput name="B" value={multipleColorsSelected ? '-' : Math.round(state.RGB[2] * 255)} onChange={handleRGB} disabled={multipleColorsSelected} />
          </TextInputGroup>          
          
          {!state.IS_WITHIN_SRGB && 
            <Tooltip text="Color value is outside sRGB gamut" pos="right">
              <Icon color="red" iconName="warning" />
            </Tooltip>
          }
        </div>
      </div>
      
      <div className="section">
        <SectionTitle>CSS Strings</SectionTitle>
        <div className="css-string">
          <TextInput 
            value={LCHString} disabled={LCHValuesMixed.some(Boolean)} onChange={(e) => setLCHString(e.target.value)}
            onBlur={handleCSSFieldsBlur} name="LCH_CSS" withCopyBtn 
          />
        </div>
        <div className="css-string css-string__rgb">
          <TextInput 
            value={RGBString} disabled={LCHValuesMixed.some(Boolean)} onChange={(e) => setRGBString(e.target.value)}
            onBlur={handleCSSFieldsBlur} name="RGB_CSS" withCopyBtn 
          />      
          <IconButton onClick={() => setIsRGB8Bit(prev => !prev)} iconName="swap" />
        </div>
        <div className="css-string">
          <TextInput 
            value={hexString} disabled={LCHValuesMixed.some(Boolean)} onChange={(e) => setHexString(e.target.value)}
            onBlur={handleCSSFieldsBlur} name="HEX_CSS" withCopyBtn 
          />
        </div>
      </div>    
      
      <div className="section buttons-section">
        <Button onClick={pickFromSelection} secondary>Pick Color</Button>
        <Button onClick={paintSelection} disabled={autoRepaint}>Paint Selection</Button>
        <Checkbox label="Auto-Repaint" checked={autoRepaint} onChange={() => switchAutoRepaint(!autoRepaint)} id="input_auto-repaint" />        
      </div>      
    </div>
  )
}

export default App
