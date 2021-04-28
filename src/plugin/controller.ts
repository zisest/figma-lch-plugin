
import { 
  sRGB_to_LCH_values, 
  LCH_to_sRGB_values, 
  sRGB_string_to_sRGB, 
  sRGB_to_sRGB_string, 
  LCH_string_to_LCH, 
  LCH_to_LCH_string,
  range, slider_stops
} from './util/lch'


try {
  // *Plugin startup*
  console.log('%c STARTUP', 'color: orange')
  figma.showUI(__html__, { width: 240, height: 455 })

  // Setting AUTO_REPAINT from clientStorage
  let AUTO_REPAINT = false
  figma.clientStorage.getAsync('AUTO_REPAINT').then(res => {
    if (res != undefined) AUTO_REPAINT = res
    figma.ui.postMessage({
      type: 'set-auto-repaint-ui',
      message: { value: res },
    })
  })

  // Check if something is selected on startup => use that fill color
  // and disable/enable 'Pick color' button
  handleSelection()
  // On selection change => update color
  // and disable/enable 'Pick color' button
  figma.on('selectionchange', () => {  
    handleSelection()
  })

  figma.ui.onmessage = (msg) => {
    // *Settings*
    // AUTO_REPAINT
    if (msg.type === 'set-auto-repaint') {
      let { value } = msg.message
      figma.clientStorage.setAsync('AUTO_REPAINT', value)
      AUTO_REPAINT = value

      figma.ui.postMessage({
        type: 'set-auto-repaint-ui',
        message: { value },
      })
    }

    // *Main*
    // Color input from UI
    if (msg.type === 'color-input') {
      let { initiator, value, prevState } = msg.message

      let response = {      
        type: 'color-update'
      }   

      let newState = getFullColorData(initiator, value, prevState)
      initiator += '_CALC'
      console.log(newState, 'right before sending from controller')
      figma.ui.postMessage({ ...response, message: { initiator, state: newState } })

      if (AUTO_REPAINT) fillSelection(figma.currentPage.selection, ...newState.RGB)    
    }

    // Fill selection with color when requested
    if (msg.type === 'paint-selection') {
      let [r, g, b, a] = msg.message.color
      fillSelection(figma.currentPage.selection, r, g, b, a)    
    }

    // Pick color from selection
    if (msg.type === 'pick-from-selection') {
      setColorFromSelection(figma.currentPage.selection)  
    }

  }



} catch (err) {
  // Not handling errors totally on purpose
  console.error(err)
}



// Check if selection is valid & update the color
function handleSelection () {
  let { selection } = figma.currentPage
  let selectionValid = setColorFromSelection(selection) && selection.length === 1

  figma.ui.postMessage({
    type: 'set-selection-valid',
    message: { value: selectionValid },
  })
}

// Calculate color sets
function colorsToStrings (RGB: [number, number, number, number], LCH: [number, number, number, number]) {  
  return {
    LCH_CSS: LCH_to_LCH_string(...LCH),
    RGB_CSS: sRGB_to_sRGB_string(...RGB, false),
    RGB_CSS_8: sRGB_to_sRGB_string(...RGB, true),
    RGB_CSS_8_OPAQUE: sRGB_to_sRGB_string(RGB[0], RGB[1], RGB[2], 1, true)
  }
}
function getFullColorData (from, value, prevState = null) {
  let RGB: [number, number, number, number], 
  LCH: [number, number, number, number], 
  GRADIENT_STOPS: [string, string, string, string],
  IS_WITHIN_SRGB: boolean

  switch (from) {
    case 'RGB':
      RGB = value    
      LCH = sRGB_to_LCH_values(...RGB)
      break
    case 'LCH':
    case 'L_SLIDER':
    case 'C_SLIDER':
    case 'H_SLIDER':
      LCH = value
      console.log({ LCH }, 'controller switch')
      ;({ RGB, IS_WITHIN_SRGB } = LCH_to_sRGB_values(...LCH, true))
      break
    case 'RGB_CSS':
      RGB = sRGB_string_to_sRGB(value)
      LCH = sRGB_to_LCH_values(...RGB)
      break
    case 'LCH_CSS':
      LCH = LCH_string_to_LCH(value)
      ;({ RGB, IS_WITHIN_SRGB } = LCH_to_sRGB_values(...LCH, true))
      break
    case 'ALPHA':
    case 'ALPHA_SLIDER':
      RGB = prevState.RGB
      LCH = prevState.LCH
      RGB[3] = value
      LCH[3] = value
      GRADIENT_STOPS = prevState.GRADIENT_STOPS
      IS_WITHIN_SRGB = prevState.IS_WITHIN_SRGB
      break
    default:
      throw 'default @ getFullColorData: ' + from

  }

  // Generate CSS strings
  let strings = colorsToStrings(RGB, LCH)
  // Generate gradient stops for sliders
  GRADIENT_STOPS ||= getGradientStops(LCH[0], LCH[1], LCH[2])
  // Setting IS_WITHIN_SRGB if not already defined
  //console.log({IS_WITHIN_SRGB}, 'case before ??=')
  IS_WITHIN_SRGB ??= true
  

  let newState = {
    RGB, LCH, ...strings, GRADIENT_STOPS, IS_WITHIN_SRGB
  }

  return newState
}

// Calculate gradient color stops
function getGradientStops (l: number, c: number, h: number): [string, string, string, string] {
    console.log('calc stops')
    const L = slider_stops(range(0, 100, 6), null, c, h, 1, 0)
    const C = slider_stops(range(0, 132, 6), l, null, h, 1, 1)
    const H = slider_stops(range(0, 360, 13), l, c, null, 1, 2)
    const A = slider_stops(range(0, 1, 3), l, c, h, null, 3)

    return [L, C, H, A]
}


// Fill nodes
function fillNode (node: RectangleNode, r, g, b, a) {
  const FILL_TEMPLATE = (r, g, b, a) => ({
    blendMode: 'NORMAL',
    color: { r, g, b },
    opacity: a,
    type: 'SOLID',
    visible: true
  })
  const PARTIAL_FILL_TEMPLATE = (r, g, b, a) => ({
    color: { r, g, b },
    opacity: a
  })


  const fills = clone(node.fills)
  
  if (!fills.length) return [FILL_TEMPLATE(r, g, b, a)]

  if (fills[fills.length - 1].type !== 'SOLID') return [...fills.slice(0, fills.length - 1), FILL_TEMPLATE(r, g, b, a)]

  return [...fills.slice(0, fills.length - 1), { ...fills[fills.length - 1], ...PARTIAL_FILL_TEMPLATE(r, g, b, a) }]         
  
}
function fillSelection (selection, r, g, b, a) {
  for (let node of selection) {
    node = <RectangleNode>node
    let fills = fillNode(node, r, g, b, a)
    console.log(node.fills, fills)
    node.fills = fills
  }
}

// Pick color from selection
function setColorFromSelection (selection) {
  let node = <RectangleNode>selection[0]
  let fill = node?.fills[0]
  let color = fill?.color
  
  if (color) {
    let opacity = Math.round(fill.opacity * 100) / 100
    let newState = getFullColorData('RGB', [color.r, color.g, color.b, opacity])

    figma.ui.postMessage({ type: 'color-update', message: { initiator: 'SELECTION', state: newState } })
    return true
  }    
  return false
}

// util
// clone properties from Figma nodes
function clone (val) {
  const type = typeof val
  if (val === null) {
    return null
  } else if (type === 'undefined' || type === 'number' ||
             type === 'string' || type === 'boolean') {
    return val
  } else if (type === 'object') {
    if (val instanceof Array) {
      return val.map(x => clone(x))
    } else if (val instanceof Uint8Array) {
      return new Uint8Array(val)
    } else {
      let o = {}
      for (const key in val) {
        o[key] = clone(val[key])
      }
      return o
    }
  }
  throw 'unknown'
}