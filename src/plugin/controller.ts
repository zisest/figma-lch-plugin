
import { 
  sRGB_to_LCH_values, 
  LCH_to_sRGB_values, 
  sRGB_string_to_sRGB, 
  sRGB_to_sRGB_string, 
  LCH_string_to_LCH, 
  LCH_to_LCH_string 
} from './util/lch'

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


console.log('%c STARTUP', 'color: orange')
let AUTO_REPAINT = false
figma.clientStorage.getAsync('AUTO_REPAINT').then(res => {
  if (res != undefined) AUTO_REPAINT = res
  figma.ui.postMessage({
    type: 'set-auto-repaint-ui',
    message: { value: res },
  })
})


figma.showUI(__html__, { width: 300, height: 400 })

figma.on('selectionchange', () => {
  let node = <RectangleNode>figma.currentPage.selection[0]
  let fill = node?.fills[0]
  let color = fill?.color
  
  if (color)
    console.log(color)
})

figma.ui.onmessage = (msg) => {
  if (msg.type === 'set-auto-repaint') {
    let { value } = msg.message
    figma.clientStorage.setAsync('AUTO_REPAINT', value)
    AUTO_REPAINT = value

    figma.ui.postMessage({
      type: 'set-auto-repaint-ui',
      message: { value },
    })
  }

  if (msg.type === 'cancel')
    figma.closePlugin()

  if (msg.type === 'create-rectangles') {
    const nodes = []

    for (let i = 0; i < msg.count; i++) {
      const rect = figma.createRectangle()
      rect.x = i * 150
      rect.fills = [{ type: 'SOLID', color: { r: 1, g: 0.5, b: 0 } }]
      figma.currentPage.appendChild(rect)
      nodes.push(rect)
    }

    figma.currentPage.selection = nodes
    figma.viewport.scrollAndZoomIntoView(nodes)

    // This is how figma responds back to the ui
    figma.ui.postMessage({
      type: 'create-rectangles',
      message: `Created ${msg.count} Rectangles`,
    })
  }

  if (msg.type === 'color-input') {
    let { initiator, value } = msg.message

    let response = {      
      type: 'color-update'
    }
    let newRGBColor

    switch (initiator) {
      case 'ALPHA_SLIDER':
      case 'ALPHA': {
        let { prevState } = msg.message
        let a = value
        let [r, g, b] = prevState.RGB
        let [l, c, h] = prevState.LCH

        let RGB_CSS = sRGB_to_sRGB_string(r, g, b, a, false)
        let RGB_CSS_8 = sRGB_to_sRGB_string(r, g, b, a, true)
        let LCH_CSS = LCH_to_LCH_string(l, c, h, a)
        
        let newState = {
          RGB: [r, g, b, a],
          RGB_CSS,
          RGB_CSS_8,
          LCH: [l, c, h, a],
          LCH_CSS
        }
        newRGBColor = newState.RGB
        figma.ui.postMessage({ ...response, message: { initiator, state: newState } })

        break
      }
      case 'RGB': {
        let [r, g, b, a] = value
        let RGB_CSS = sRGB_to_sRGB_string(r, g, b, a, false)
        let RGB_CSS_8 = sRGB_to_sRGB_string(r, g, b, a, true)

        let LCH = sRGB_to_LCH_values(r, g, b, a)        
        let LCH_CSS = LCH_to_LCH_string(LCH[0], LCH[1], LCH[2], LCH[3])

        let newState = {
          RGB: value,
          RGB_CSS,
          RGB_CSS_8,
          LCH,
          LCH_CSS
        }
        newRGBColor = newState.RGB
        figma.ui.postMessage({ ...response, message: { initiator, state: newState } })
        break
      }
      case 'LCH_SLIDER':
      case 'LCH': {
        let [l, c, h, a] = value
        let LCH_CSS = LCH_to_LCH_string(l, c, h, a)

        let [r, g, b] = LCH_to_sRGB_values(l, c, h, a, true)
        let RGB_CSS = sRGB_to_sRGB_string(r, g, b, a, false)
        let RGB_CSS_8 = sRGB_to_sRGB_string(r, g, b, a, true)
        
        let newState = {
          RGB: [r, g, b, a],
          RGB_CSS,
          RGB_CSS_8,
          LCH: value,
          LCH_CSS
        }
        newRGBColor = newState.RGB
        figma.ui.postMessage({ ...response, message: { initiator, state: newState } })
        break
      }
      case 'RGB_CSS': {
        let [r, g, b, a] = sRGB_string_to_sRGB(value)
        let RGB_CSS = sRGB_to_sRGB_string(r, g, b, a, false) // recalc rgb strings
        let RGB_CSS_8 = sRGB_to_sRGB_string(r, g, b, a, true)

        let LCH = sRGB_to_LCH_values(r, g, b, a)        
        let LCH_CSS = LCH_to_LCH_string(LCH[0], LCH[1], LCH[2], LCH[3])

        let newState = {
          RGB: [r, g, b, a],
          RGB_CSS,
          RGB_CSS_8,
          LCH,
          LCH_CSS
        }
        newRGBColor = newState.RGB
        figma.ui.postMessage({ ...response, message: { initiator, state: newState } })
        break

      }
      case 'LCH_CSS': {
        let [l, c, h, a] = LCH_string_to_LCH(value)
        let LCH_CSS = LCH_to_LCH_string(l, c, h, a)

        let [r, g, b] = LCH_to_sRGB_values(l, c, h, a, true)
        let RGB_CSS = sRGB_to_sRGB_string(r, g, b, a, false)
        let RGB_CSS_8 = sRGB_to_sRGB_string(r, g, b, a, true)
        
        let newState = {
          RGB: [r, g, b, a],
          RGB_CSS,
          RGB_CSS_8,
          LCH: [l, c, h, a],
          LCH_CSS
        }
        newRGBColor = newState.RGB
        figma.ui.postMessage({ ...response, message: { initiator, state: newState } })

        break
      }
      default:
        throw '!!!!!!!!!'

    }

    let [r, g, b, a] = newRGBColor
    if (AUTO_REPAINT) fillSelection(figma.currentPage.selection, r, g, b, a)    

  }

  if (msg.type === 'paint-selection') {
    let [r, g, b, a] = msg.message.color
    fillSelection(figma.currentPage.selection, r, g, b, a)    
  }

  function fillSelection (selection, r, g, b, a) {
    for (let node of selection) {
      node = <RectangleNode>node
      let fills = fillNode(node, r, g, b, a)
      console.log(node.fills, fills)
      node.fills = fills
    }
  }

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

  /*
  if (msg.type === 'check') {
    let rgbStr1 = 'rgb(200, 70, 81.5, 0.62)'
    let rgbStr2 = 'rgb(78.43137%, 27.45%, 31.96%, 0.62)'
    let rgbStr3 = 'rgb(78.43137%, 27.45%, 31.96%, 62%)'

    let lchStr1 = 'lch(49% 50 146 / 79%)'
    let lchStr2 = 'lch(49% 50 146 / .79)'

    let rgb1 = [0.7843, 0.2745, 0.3196, 0.62]
    let lch1 = [49, 50, 146, 0.79]
    let [r, g, b, a] = rgb1
    
    console.log(sRGB_to_sRGB_string(r, g, b, a, true))
    console.log(sRGB_to_sRGB_string(r, g, b, a, false))

    let [l, c, h, a2] = lch1
    console.log(LCH_to_LCH_string(l, c, h, a2))

    
    console.log(sRGB_string_to_sRGB(rgbStr1))
    console.log(sRGB_string_to_sRGB(rgbStr2))
    console.log(sRGB_string_to_sRGB(rgbStr3))

    console.log(LCH_string_to_LCH(lchStr1))
    console.log(LCH_string_to_LCH(lchStr2))
    

  }
  */
  
  // console.log(LCH_to_sRGB_string(30, 40, 200, 0.3, true, true))
  // console.log(LCH_to_sRGB_string(30, 40, 200, 0.3, false, true))


}
