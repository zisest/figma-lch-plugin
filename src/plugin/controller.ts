import { 
  sRGB_to_LCH_values, 
  LCH_to_sRGB_values, 
  sRGB_string_to_sRGB, 
  sRGB_to_sRGB_string, 
  LCH_string_to_LCH, 
  LCH_to_LCH_string 
} from './util/lch'

figma.showUI(__html__, { width: 300, height: 400 })

figma.ui.onmessage = (msg) => {
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
    

    switch (initiator) {
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
        figma.ui.postMessage({ ...response, message: newState })

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
        figma.ui.postMessage({ ...response, message: newState })
        break
      }
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
        figma.ui.postMessage({ ...response, message: newState })
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
        figma.ui.postMessage({ ...response, message: newState })
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
        figma.ui.postMessage({ ...response, message: newState })

        break
      }
      default:
        throw '!!!!!!!!!'

    }

    
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
