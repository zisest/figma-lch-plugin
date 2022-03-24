import { ColorState } from '../../../types'

export const LCH_MAP = {
  L: {
    index: 0,
    maxValue: 100,
    otherIndices: [1, 2, 3]
  },
  C: {
    index: 1,
    maxValue: 132,
    otherIndices: [0, 2, 3]
  },
  H: {
    index: 2,
    maxValue: 360,
    otherIndices: [0, 1, 3]
  },
  A: {
    index: 3,
    maxValue: 1,
    otherIndices: [0, 1, 2]
  }
}

export const COLOR_INDEX_MAP = { L: 0, C: 1, H: 2, A: 3, R: 0, G: 1, B: 2 }

export const initialState: ColorState = {
  RGB: [0, 0, 0, 1],
  LCH: [0, 0, 0, 1],
  RGB_CSS_8: 'rgb(0, 0, 0)',
  RGB_CSS_8_OPAQUE: 'rgb(0, 0, 0)',
  RGB_CSS: 'rgb(0%, 0%, 0%)',
  LCH_CSS: 'lch(0% 0 0)',
  HEX_CSS: '#000000',
  GRADIENT_STOPS: ['black, white', 'black, black', 'black, black', 'transparent, black'],
  IS_WITHIN_SRGB: true,
  NODE_IDS: [],
}