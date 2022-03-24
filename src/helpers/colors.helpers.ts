import { Color, GetFullColorData, GradientStops } from '../types'
import { LCH_to_sRGB, sRGB_to_LCH } from './conversion/utilities.helpers.js'

// *sRGB*:
// MAIN:
// r, g, b, a : 0 to 1
// STRING (8-bit color):
// rgb(250, 40, 110, 0.2)
// STRING (universal):
// rgb(45%, 50%, 20%, 0.2)

// *LCH*:
// MAIN:
// l : 0 to 100
// c : 0 to 132
// h : 0 to 360
// a : 0 to 1
// STRING:
// lch(30% 50 200 / 0.5)

// LCH max values
const L_MAX = 100
const C_MAX = 132
const H_MAX = 360
const A_MAX = 1

// *Conversion functions*

// Alpha value to string
function alpha_to_sRGB_string(a = 1) {
  return a < 1 ? `, ${Math.round(a * 100) / 100}` : ''
}
function alpha_to_LCH_string(a = 1) {
  return a < 1 ? ` / ${Math.round(a * 100) / 100}` : ''
}

function check_LCH_bounds(l: number, c: number, h: number, a: number) {
  // if (l == undefined || c == undefined || h == undefined)
  //   throw 'Incorrect LCH value! (One of the parameters is undefined)'
  if (l < 0 || c < 0 || h < 0 || a < 0) throw 'Incorrect LCH value! (One of the parameters is negative)'
  if (l > L_MAX) throw `Incorrect LCH value! (l is more than ${L_MAX})`
  if (c > C_MAX) throw `Incorrect LCH value! (c is more than ${C_MAX})`
  if (h > H_MAX) throw `Incorrect LCH value! (h is more than ${H_MAX})`
  if (a > A_MAX) throw `Incorrect LCH value! (a is more than ${A_MAX})`
}

export function LCH_to_LCH_string(l: number, c: number, h: number, a = 1) {
  check_LCH_bounds(l, c, h, a)

  return `lch(${l}% ${c} ${h}${alpha_to_LCH_string(a)})`
}
export function LCH_string_to_LCH(LCHString: string) {
  if (LCHString.slice(0, 3).toLowerCase() !== 'lch') throw 'Incorrect LCH string format! (1)'

  let matches = LCHString.match(/\d*\.?\d+/g)
  if (!matches || matches.length < 3 || matches.length > 4) throw 'Incorrect LCH string format! (2)'

  let values = matches.map((v) => Number(v))
  let [l, c, h, a] = values

  // Check if Alpha values is in percent or decimal
  if (a != undefined) {
    if (LCHString[LCHString.length - 2] === '%') 
      a = Math.round(a) / 100
    else 
      a = Math.round(a * 100) / 100
  } else a = 1

  ;[l, c, h] = [l, c, h].map(v => Math.round(v))
  
  check_LCH_bounds(l, c, h, a)

  return <Color>[l, c, h, a]
}

function check_sRGB_bounds(r: number, g: number, b: number, a: number) {
  if (r < 0 || r > 1) throw 'Incorrect sRGB value! (r is out of [0,1] interval): ' + r
  if (g < 0 || g > 1) throw 'Incorrect sRGB value! (g is out of [0,1] interval): ' + g
  if (b < 0 || b > 1) throw 'Incorrect sRGB value! (b is out of [0,1] interval): ' + b
  if (a < 0 || a > 1) throw 'Incorrect sRGB value! (a is out of [0,1] interval): ' + a
}
export function sRGB_to_sRGB_string(r: number, g: number, b: number, a = 1, only8bit: boolean, checkBounds = true) {
  if (checkBounds) check_sRGB_bounds(r, g, b, a)

  const toString = only8bit ? (v: number) => Math.round(v * 255).toString() : (v: number) => Math.round(v * 10000) / 100 + '%'

  return `rgb(${toString(r)}, ${toString(g)}, ${toString(b)}${alpha_to_sRGB_string(a)})`
}
export function sRGB_string_to_sRGB(sRGBString: string) {
  if (!sRGBString || !sRGBString.length) throw 'Incorrect sRGB string format! (0)'
  if (sRGBString.slice(0, 3).toLowerCase() !== 'rgb') throw 'Incorrect sRGB string format! (1)'

  const only8Bit = !(Number(sRGBString.match(/%/g)?.length) >= 3)

  let matches = sRGBString.match(/\d*\.?\d+/g)
  if (!matches || matches.length < 3 || matches.length > 4) throw 'Incorrect sRGB string format! (2)'

  let values = matches.map((v) => Number(v))
  let [r, g, b, a] = values

  // Check if Alpha values is in percent or decimal
  if (a != undefined) {
    if (sRGBString[sRGBString.length - 2] === '%') a = a / 100
  } else a = 1

  const round = only8Bit ? (v: number) => Math.round((v / 255) * 10000) / 10000 : (v: number) => Math.round(v * 100) / 10000

  ;[r, g, b] = [r, g, b].map(round)

  check_sRGB_bounds(r, g, b, a)

  return <Color>[r, g, b, a]
}

// HEX
function hex_to_sRGB (hex: string): Color {
  hex = hex.replace('#', '').toUpperCase()
  if (!hex || typeof hex !== 'string' || !hex.length) throw 'Incorrect Hex string format! (0)'
  if (!/^[A-F\d]+$/.test(hex)) throw 'Incorrect Hex string format! (1)'
  
  if (hex.length < 3) 
    hex = hex.padStart(6, hex)
  else if (hex.length < 6) 
    hex = hex.slice(0, 3)
  else if (hex.length === 7)
    hex = hex.slice(0, 6)
  else if (hex.length > 8) 
    hex = hex.slice(0, 8)

  if (hex.length === 3)
    hex += hex  
  
  const channels = hex.match(/.{2}/g)
  if (!channels || channels.length < 3) throw 'Incorrect Hex string format! (2)'

  const values = channels.map(x => parseInt(x, 16) / 255)
  if (values.some(Number.isNaN)) throw 'Incorrect Hex string format! (3)'
  
  let [r, g, b, a] = values
  a ??= 1

  check_sRGB_bounds(r, g, b, a)
  return [r, g, b, a]
}

function sRGB_to_hex (rgb: Color) {
  check_sRGB_bounds(...rgb)
  let values = rgb[3] !== 1 ? rgb : rgb.slice(0, 3)

  return '#' + values.map(x => Math.round(x * 255).toString(16).toUpperCase().padStart(2, '0')).join('')
}


export function LCH_to_sRGB_values(l: number, c: number, h: number, a: number = 1, forceInGamut = false) {
  check_LCH_bounds(l, c, h, a)
  let is_within_sRGB: boolean | undefined

  if (forceInGamut) {
    ;[l, c, h, is_within_sRGB] = force_into_gamut(l, c, h)
  }
  let sRGB = [...LCH_to_sRGB([l, c, h]), a].map(v => Math.round(v * 100) / 100) as Color
  //console.log({is_within_sRGB})
  return { RGB: sRGB, IS_WITHIN_SRGB: is_within_sRGB }
}
export function sRGB_to_LCH_values(r: number, g: number, b: number, a: number = 1) {
  check_sRGB_bounds(r, g, b, a)

  let LCH = [...sRGB_to_LCH([r, g, b]).map(v => Math.round(v)), a] as Color
  return LCH
}


function force_into_gamut (l: number, c: number, h: number): [number, number, number, boolean] {
  // Moves an lch color into the sRGB gamut
  // by holding the l and h steady,
  // and adjusting the c via binary-search
  // until the color is on the sRGB boundary.
  if (isLCH_within_sRGB(l, c, h)) {
    return [l, c, h, true]
  }

  let hiC = c
  let loC = 0
  const ε = 0.0001
  c /= 2

  // .0001 chosen fairly arbitrarily as "close enough"
  while (hiC - loC > ε) {
    if (isLCH_within_sRGB(l, c, h)) {
      loC = c
    } else {
      hiC = c
    }
    c = (hiC + loC) / 2
  }

  return [l, c, h, false]
}

export function isLCH_within_sRGB(l: number, c: number, h: number) {
  var rgb = LCH_to_sRGB([+l, +c, +h])
  const ε = 0.000005
  return rgb.reduce((a, b) => a && b >= 0 - ε && b <= 1 + ε, true)
}

// Generate gradient stops for the sliders
// (we need to use more to emulate proper interpolation)
export function range (from: number, to: number, stops: number) {
  let step = (to - from) / (stops - 1)
  return Array.from({ length: stops }, (_, i) => i * step)
}

type NullNumber = number | null
export function slider_stops(range: number[], l: NullNumber, c: NullNumber, h: NullNumber, a: NullNumber) {
  let args = [l, c, h, a]
  let index = args.findIndex(v => v === null)
  if (index === -1) throw new Error('Incorrect arguments @slider_stops: one of the arguments should be null')

  return range
    .map((x) => {
      let forceInGamut = false // don't force into sRGB gamut & don't check if it's inside (0,1) bounds
      args[index] = x
      const LCH = args as Color
      
      let { RGB } = LCH_to_sRGB_values(...LCH, forceInGamut)
      return sRGB_to_sRGB_string(...RGB, true, forceInGamut)
    })
    .join(', ')
}


function colorsToStrings (RGB: Color, LCH: Color) {  
  return {
    LCH_CSS: LCH_to_LCH_string(...LCH),
    RGB_CSS: sRGB_to_sRGB_string(...RGB, false),
    RGB_CSS_8: sRGB_to_sRGB_string(...RGB, true),
    RGB_CSS_8_OPAQUE: sRGB_to_sRGB_string(RGB[0], RGB[1], RGB[2], 1, true),
    HEX_CSS: sRGB_to_hex(RGB)
  }
}

// RGB, LCH, ALPHA, LCH_CSS, RGB_CSS, 
// When using function overloads TS doesn't deduce values' types inside the function propely
// Same thing when destructuring value typed using discriminated unions
// That's why getFullColorData has 1 parameter
export const getFullColorData: GetFullColorData = (params) => {
  const { from } = params
  
  let RGB: Color = [0, 0, 0, 1], LCH: Color = [0, 0, 0, 1], 
  GRADIENT_STOPS: GradientStops, IS_WITHIN_SRGB: boolean | undefined
  console.log('getFullColorData', from, params.value)
  if (from === 'RGB') {
    params.value
  }
  switch (from) {
    case 'RGB':
      RGB = params.value
      LCH = sRGB_to_LCH_values(...RGB)
      break
    case 'LCH':
    // case 'L_SLIDER':
    // case 'C_SLIDER':
    // case 'H_SLIDER':
      LCH = params.value
      console.log({ LCH }, 'controller switch')
      ;({ RGB, IS_WITHIN_SRGB } = LCH_to_sRGB_values(...LCH, true))
      break
    case 'RGB_CSS':
      RGB = sRGB_string_to_sRGB(params.value)
      LCH = sRGB_to_LCH_values(...RGB)
      break
    case 'LCH_CSS':
      LCH = LCH_string_to_LCH(params.value)
      ;({ RGB, IS_WITHIN_SRGB } = LCH_to_sRGB_values(...LCH, true))
      break
    case 'HEX_CSS':
      RGB = hex_to_sRGB(params.value)
      LCH = sRGB_to_LCH_values(...RGB)
      break
    case 'ALPHA':
    // case 'ALPHA_SLIDER':
      if (!params.prevState) break
      console.log('getFullColorData', {prevState: params.prevState, value: params.value})
      RGB = params.prevState.RGB
      LCH = params.prevState.LCH
      RGB[3] = params.value[3]
      LCH[3] = params.value[3]
      GRADIENT_STOPS = params.prevState.GRADIENT_STOPS
      IS_WITHIN_SRGB = params.prevState.IS_WITHIN_SRGB
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
  console.log('getFullColorData', newState)

  return newState
}

// Calculate gradient color stops
function getGradientStops (l: number, c: number, h: number): GradientStops {
    // return ['black, white', 'black, black', 'black, black', 'transparent, black']
    console.log('calc stops')
    const L = slider_stops(range(0, 100, 6), null, c, h, 1)
    const C = slider_stops(range(0, 132, 6), l, null, h, 1)
    const H = slider_stops(range(0, 360, 13), l, c, null, 1)
    const A = slider_stops(range(0, 1, 3), l, c, h, null)

    return [L, C, H, A]
}
