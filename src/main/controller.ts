
import { AutoRepaintToUI, Color, ColorInputToUI, ColorToController, PaintsByColor, FillsOrStrokes, MessageFromUI, ModeToUI, Mutable, TooltipAlreadyShownToUI, ValidNode } from '../types'
import { clone } from '../helpers/nodes.helpers'
import { COMPATIBLE_TYPES } from './constants'

figma.skipInvisibleInstanceChildren = true

let FILLS_OR_STROKES: FillsOrStrokes = 'fills'

try {
  // *Plugin startup*
  console.log('%c STARTUP', 'color: orange')
  figma.showUI(__html__, { width: 240, height: 526 })

  // Setting TOOLTIP_ALREADY_SHOWN from clientStorage
  figma.clientStorage.getAsync('TOOLTIP_ALREADY_SHOWN').then((res?: boolean)=> {
    res ??= false
    const message: TooltipAlreadyShownToUI = {
      type: 'set-tooltip-already-shown-ui',
      value: res
    }
    figma.ui.postMessage(message)
  })

  // Setting AUTO_REPAINT from clientStorage
  let AUTO_REPAINT = true
  figma.clientStorage.getAsync('AUTO_REPAINT').then((res?: boolean) => {
    if (res != undefined) AUTO_REPAINT = res
    const message: AutoRepaintToUI = {
      type: 'set-auto-repaint-ui',
      value: AUTO_REPAINT,
    }
    figma.ui.postMessage(message)
  })


  // Setting FILL_OR_STROKE from clientStorage
  figma.clientStorage.getAsync('FILLS_OR_STROKES').then((res?: FillsOrStrokes) => {
    if (res != undefined) FILLS_OR_STROKES = res
    const message: ModeToUI = {
      type: 'set-fills-or-strokes-ui',
      value: FILLS_OR_STROKES
    }
    figma.ui.postMessage(message)
    // Check if something is selected on startup => use that fill color
    // and disable/enable 'Pick color' button
    handleSelection()
  })


  // On selection change => update color
  // and disable/enable 'Pick color' button
  figma.on('selectionchange', () => {  
    handleSelection()
  })

  figma.ui.onmessage = (msg: MessageFromUI) => {
    // *Settings*
    // AUTO_REPAINT
    switch (msg.type) {
      case 'set-auto-repaint': {
        let { value } = msg.message
        figma.clientStorage.setAsync('AUTO_REPAINT', value)
        AUTO_REPAINT = value
        
        const message: AutoRepaintToUI = {
          type: 'set-auto-repaint-ui',
          value,
        }
        figma.ui.postMessage(message)
        break
      }
      case 'color-from-ui': {
        console.log('!')
        const colors: ColorToController[] = msg.message.colors
        if (AUTO_REPAINT || msg.message.forceRepaint) {
          for (const { RGB, NODE_IDS, GRADIENT_STOP_POS } of colors) {     
            console.log('!!', colors)          
            paintSelection(figma.currentPage.selection, ...RGB, NODE_IDS, GRADIENT_STOP_POS)                
          }
        }
        break
      }
      case 'set-fills-or-strokes': {
        let { value } = msg.message
        figma.clientStorage.setAsync('FILLS_OR_STROKES', value)
        FILLS_OR_STROKES = value
        console.log('Setting fills or stroke on controller to', value)
        const message: ModeToUI = {
          type: 'set-fills-or-strokes-ui',
          value,
        }
        figma.ui.postMessage(message)
        handleSelection()
        break
      }
      case 'set-tooltip-already-shown':
        figma.clientStorage.setAsync('TOOLTIP_ALREADY_SHOWN', true).then(() => {
          const message: TooltipAlreadyShownToUI = {
            type: 'set-tooltip-already-shown-ui',
            value: true
          }
          figma.ui.postMessage(message)  
        })
        break     
      case 'pick-from-selection':
        handleSelection()
        break
    }
  }

} catch (err) {
  console.error(err)
}


// Check if selection is valid & update the color
function handleSelection () {
  let { selection } = figma.currentPage
  console.log('handleSelection', {selection})
  setColorFromSelection(selection)
}


// Fill nodes
function getNewNodePaints (node: ValidNode, r: number, g: number, b: number, a: number): Paint[] {
  const FILL_TEMPLATE = (r: number, g: number, b: number, a: number): SolidPaint => ({
    blendMode: 'NORMAL',
    color: { r, g, b },
    opacity: a,
    type: 'SOLID',
    visible: true
  })
  const PARTIAL_FILL_TEMPLATE = (r: number, g: number, b: number, a: number) => ({
    color: { r, g, b },
    opacity: a
  })

  const paints = clone(node[FILLS_OR_STROKES])
  console.log({fills: paints}) 
  if (paints === figma.mixed) return []
  
  if (!paints.length) return [FILL_TEMPLATE(r, g, b, a)]
  if (paints[paints.length - 1].type !== 'SOLID') return [...paints.slice(0, paints.length - 1), FILL_TEMPLATE(r, g, b, a)]

  return [...paints.slice(0, paints.length - 1), { ...paints[paints.length - 1], ...PARTIAL_FILL_TEMPLATE(r, g, b, a) }] 
}

function getNewNodeGradientPaints (node: ValidNode, r: number, g: number, b: number, a: number, GRADIENT_STOP_POS: number): Paint[] {
  const paints = clone(node[FILLS_OR_STROKES])
  console.log('cloned paints', node[FILLS_OR_STROKES], paints)
  if (paints === figma.mixed) return []

  const topPaint = paints[paints.length - 1]
  if (!paints.length || !('gradientStops' in topPaint)) return paints

  const gradientStop = topPaint.gradientStops.find(s => s.position === GRADIENT_STOP_POS)
  if (gradientStop) (gradientStop as Mutable<ColorStop>).color = { r, g, b, a }

  return paints
}

function paintNode (node: ValidNode, r :number, g :number, b :number, a :number, GRADIENT_STOP_POS?: number) {
  // if (!('fills' in node) || !('strokes' in node)) return
  // node as ValidNode
  console.log(GRADIENT_STOP_POS, 'r3')
  let fills = GRADIENT_STOP_POS == null ? getNewNodePaints(node, r, g, b, a) : getNewNodeGradientPaints(node, r, g, b, a, GRADIENT_STOP_POS)
  console.log({fills}, 'r4')
  node[FILLS_OR_STROKES] = fills
}

function paintSelection (selection: ReadonlyArray<SceneNode>, r: number, g: number, b: number, a: number, nodes: string[], GRADIENT_STOP_POS?: number) {
  for (const node of selection) {
    console.log({node})
    if (!('fills' in node) || !('strokes' in node)) {
      if ('children' in node) {
        const nodesInGroup = node.findAllWithCriteria({ types: COMPATIBLE_TYPES })
        for (const node of nodesInGroup) {
          if (nodes.includes(node.id)) {
            paintNode(node, r, g, b, a, GRADIENT_STOP_POS)
          }    
        }
      }
    } else if (nodes.includes(node.id)) {
      paintNode(node, r, g, b, a, GRADIENT_STOP_POS)
    } 
  }
}



// Pick color from selection
function setColorFromSelection (selection: ReadonlyArray<SceneNode>) {
  let allPaints: PaintsByColor = {
    solid: {}, gradient: {}
  }
  let count = 0
  const MAX_COLORS = 10

  function getColorFromNode (node: SceneNode) {    
    console.log({node}, {FILLS_OR_STROKES}, {count}, 'in getColorFromNode')

    if (!('fills' in node) || !('strokes' in node)) {
      if ('children' in node) {
        let allNodes = node.findAllWithCriteria({ types: COMPATIBLE_TYPES })
        console.log({allNodes})
        for (const node of allNodes) {
          getColorFromNode(node)
        }
        return
      }
    } else {
      let paints = node[FILLS_OR_STROKES]
      if (paints === figma.mixed || !paints.length) return

      const topPaint = paints[paints.length - 1]

      if ('gradientStops' in topPaint) {
        // GRADIENT PAINT
        let hash = JSON.stringify(topPaint.gradientStops) + topPaint.type

        if (!allPaints.gradient[hash]) {
          console.log('count >= 8?', count + topPaint.gradientStops.length)
          if (count + topPaint.gradientStops.length > MAX_COLORS) return
          allPaints.gradient[hash] = { colors: [], nodes: [] }
        }
        
        topPaint.gradientStops.forEach(stop => {
          const { r, g, b, a } = stop.color
          if (!allPaints.gradient[hash].colors.find(v => v.pos === stop.position)) {
            allPaints.gradient[hash].colors.push({ RGB: [r, g, b, a], pos: stop.position })
            ++count
            console.log('++count')
          }
        })

        console.log('count', count)
        allPaints.gradient[hash].nodes.push(node.id)
        console.log('allGradients on controller', allPaints.gradient)

      } else if (topPaint.type === 'SOLID') {
        // SOLID PAINT
        const opacity = topPaint.opacity === undefined ? 1 : Math.round(topPaint.opacity * 100) / 100
        const color = topPaint.color
        const RGB: Color = [color.r, color.g, color.b, opacity]
        const id = node.id
    
        const colorHash = RGB.toString()

        const fillsWithThisColor = allPaints.solid[colorHash]
        if (fillsWithThisColor?.length) {
          allPaints.solid[colorHash].push(id)
        } else if (count < MAX_COLORS) {
          ++count
          allPaints.solid[colorHash] = [id]
        }   

      }
    }

  }

  for (const node of selection) {
    getColorFromNode(node)
  }

  const message: ColorInputToUI = { type: 'color-to-ui', allFills: allPaints }
  figma.ui.postMessage(message)

  return true
}
