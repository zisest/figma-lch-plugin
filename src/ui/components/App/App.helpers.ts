import { getFullColorData } from '../../../helpers/colors.helpers'
import { Boolean4, Color, ColorState, ColorToController, LCHA_value, RGBA_value } from '../../../types'
import { COLOR_INDEX_MAP, LCH_MAP } from './App.constants'


export function calculateFromLCH(currentState: ColorState[], selectedColors: number[], value: number, valueName: 'L' | 'C' | 'H' | 'A', colorSpace: 'CIELCH' | 'OKLCH') {
  let { index, otherIndices } = LCH_MAP[valueName]
  const initiator = valueName === 'A' ? 'ALPHA' : 'LCH'
  console.log('calculateFromLCH', colorSpace)

  // Checking if colors will merge
  const mergeMap: { [hash: string]: number[] } = {}
  let shouldMerge = false
  if (selectedColors.length !== 1) {
    for (const colorIndex of selectedColors) {
      let color = currentState[colorIndex]
      const unchangedValuesHash = color.LCH.reduce((prev, curr, i) => otherIndices.includes(i) ? prev + '-' + curr : prev, '')
        + color.GRADIENT_HASH + color.GRADIENT_STOP_POS

      if (!(unchangedValuesHash in mergeMap))
        mergeMap[unchangedValuesHash] = [colorIndex]
      else {
        mergeMap[unchangedValuesHash].push(colorIndex)
        shouldMerge = true
      }
    }
    console.log({ mergeMap })
  }

  // No need to merge colors
  if (!shouldMerge) {
    console.log('SHOULD NOT MERGE COLORS')
    const newColors: { [key: number]: ColorState } = {}
    const colorsToController: ColorToController[] = []
    for (const colorIndex of selectedColors) {
      // Calculating new colors
      let lch = currentState[colorIndex].LCH
      lch[index] = value

      let newState: ColorState = {
        ...currentState[colorIndex], ...getFullColorData({
          from: initiator,
          value: lch,
          prevState: currentState[colorIndex],
          colorSpace,
        }),
      }
      newColors[colorIndex] = newState
      console.log('!shouldMerge', { newState })

      // Send to controller
      let colorToController: ColorToController = { RGB: newState.RGB, NODE_IDS: newState.NODE_IDS }
      if ('GRADIENT_STOP_POS' in newState) colorToController.GRADIENT_STOP_POS = newState.GRADIENT_STOP_POS
      colorsToController.push(colorToController)
    }
    const allColors: ColorState[] = []
    currentState.forEach((color, i) => {
      if (i in newColors) allColors.push(newColors[i])
      else allColors.push(color)
    })
    console.log('!shouldMerge', { allColors })
    // dispatchColors({ type: 'set-all-colors', colors: allColors })
    // throttledSendRGBToController(colorsToController)
    return { allColors, colorsToController }
  }

  // Merging colors
  const removedFromSelection: number[] = []
  const newColors: { [key: number]: ColorState } = {}
  for (const indices of Object.values(mergeMap)) {
    if (indices.length > 1) { // Removing extra colors
      removedFromSelection.push(...indices.slice(1))
    }
    // Calculating new colors
    let lch = currentState[indices[0]].LCH
    lch[index] = value

    let newState: ColorState = {
      ...getFullColorData({
        from: initiator,
        value: lch,
        prevState: currentState[indices[0]],
        colorSpace,
      }), NODE_IDS: [],
    }
    indices.forEach(i => newState.NODE_IDS?.push(...currentState[i].NODE_IDS))
    newColors[indices[0]] = newState
  }
  console.log({ newColors })
  // Resulting color states and new selection
  let allColors: ColorState[] = []
  let newSelection: number[] = []

  const colorsToController: ColorToController[] = [] // To contoller
  currentState.forEach((color, i) => {
    if (i in newColors) {
      allColors.push(newColors[i])
      newSelection.push(allColors.length - 1)

      // Send to controller
      let colorToController: ColorToController = { RGB: newColors[i].RGB, NODE_IDS: newColors[i].NODE_IDS }
      if ('GRADIENT_STOP_POS' in newColors[i]) colorToController.GRADIENT_STOP_POS = newColors[i].GRADIENT_STOP_POS
      colorsToController.push(colorToController)
    } else if (!removedFromSelection.includes(i)) {
      allColors.push(color)
    }
  })

  return { allColors, newSelection, colorsToController }
}


export function areLCHValuesMixed(colors: ColorState[], selectedColors: number[]): Boolean4 {
  if (selectedColors.length === 1) return [false, false, false, false]
  let LCHA: Array<number | boolean> = colors[selectedColors[0]].LCH
  let result: Boolean4 = [false, false, false, false]

  for (let i = 1; i < selectedColors.length; ++i) {
    const colorIndex = selectedColors[i]
    colors[colorIndex].LCH.forEach((v, j) => {
      if (v !== LCHA[j])
        result[j] = true
    })
  }
  return result
}

export const switchColorValues = (color: Color, valueName: LCHA_value | RGBA_value, value: number) => {
  let index = COLOR_INDEX_MAP[valueName]
  color[index] = value
  return color
}
export const getColorValue = (color: Color, valueName: LCHA_value | RGBA_value) => color[COLOR_INDEX_MAP[valueName]]



