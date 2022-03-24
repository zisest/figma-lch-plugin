import React, { MouseEvent } from 'react'
import { ColorState } from '../../../types'
import ColorPreview from './ColorPreview'

import './ColorSwitcher.css'


interface PropTypes {
  colors: ColorState[],
  selectedColors: number[],
  setSelectedColors: (selected: number[]) => void
}


/**
* @returns int range from `curr` to `prev` (can be ascending or descending), e.g. `[2, 3, 4]` or `[4, 3, 2]`
*/
function range (prev: number, curr: number): number[] {
  if (prev === curr) return [prev] 
  const length = Math.abs(curr - prev) + 1
  const sign = prev < curr ? -1 : 1
  return Array.from({ length }, (_, key) => curr + sign * key)
}


function ColorSwitcher ({ colors, selectedColors, setSelectedColors }: PropTypes) {

  /**
   * @param clicked index of the color that was clicked
   * @param ctrlKey is Ctrl key pressed
   * @param shiftKey is Shift key pressed
   * @returns new color selection
   */
  function getNewSelectedColors (clicked: number, ctrlKey: boolean, shiftKey: boolean): number[] {
    if (selectedColors.includes(clicked) && selectedColors.length === 1)
      return selectedColors

    // Shift
    if (shiftKey) {
      const lastSelected = selectedColors[selectedColors.length - 1]
      const newShiftSelection = range(lastSelected, clicked)
      // Shift + Ctrl
      if (ctrlKey) {
        return [...selectedColors.filter(i => !newShiftSelection.includes(i)), ...newShiftSelection]
      }
      return newShiftSelection
    }

    // Ctrl
    if (ctrlKey) {
      if (selectedColors.includes(clicked)) {
        return selectedColors.filter(el => el !== clicked)
      }
      return [...selectedColors, clicked]
    }    

    return [clicked]
  }

  function handleClick (event: MouseEvent, index: number) {
    console.log(event, event.metaKey)
    console.log('before', selectedColors)
    let newSelectedColors = getNewSelectedColors(index, event.ctrlKey || event.metaKey, event.shiftKey)
    console.log('after', newSelectedColors)
    setSelectedColors(newSelectedColors)    
  }

  return (    
    <div className="color-switcher">
      {colors.map((color, i) => 
        <ColorPreview fromGradient={!!color.GRADIENT_HASH && color.GRADIENT_HASH === colors[i - 1]?.GRADIENT_HASH}
          onClick={(e) => handleClick(e, i)}
          key={i} selected={selectedColors.includes(i)} 
          color={color.RGB_CSS_8} colorOpaque={color.RGB_CSS_8_OPAQUE} 
        />
      )}      
    </div>       
  )
}

export default ColorSwitcher