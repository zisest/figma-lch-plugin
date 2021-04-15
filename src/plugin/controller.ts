import { LCH_to_sRGB_string, LCH_to_LCH_string, LCH_string_to_LCH, sRGB_string_to_sRGB, sRGB_to_sRGB_string } from './util/lch'

figma.showUI(__html__)

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

    /*
    console.log(sRGB_string_to_sRGB(rgbStr1))
    console.log(sRGB_string_to_sRGB(rgbStr2))
    console.log(sRGB_string_to_sRGB(rgbStr3))

    console.log(LCH_string_to_LCH(lchStr1))
    console.log(LCH_string_to_LCH(lchStr2))
    */


  }
  
  // console.log(LCH_to_sRGB_string(30, 40, 200, 0.3, true, true))
  // console.log(LCH_to_sRGB_string(30, 40, 200, 0.3, false, true))


}
