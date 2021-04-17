import { LCH_to_sRGB, sRGB_to_LCH } from './util'

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
  return a < 1 ? `, ${a}` : ''
}
function alpha_to_LCH_string(a = 1) {
  return a < 1 ? ` / ${a}` : ''
}

function check_LCH_bounds(l, c, h, a) {
  if (l == undefined || c == undefined || h == undefined)
    throw 'Incorrect LCH value! (One of the parameters is undefined)'
  if (l < 0 || c < 0 || h < 0 || a < 0) throw 'Incorrect LCH value! (One of the parameters is negative)'
  if (l > L_MAX) throw `Incorrect LCH value! (l is more than ${L_MAX})`
  if (c > C_MAX) throw `Incorrect LCH value! (c is more than ${C_MAX})`
  if (h > H_MAX) throw `Incorrect LCH value! (h is more than ${H_MAX})`
  if (a > A_MAX) throw `Incorrect LCH value! (a is more than ${A_MAX})`
}
export function LCH_to_LCH_string(l: Number, c: Number, h: Number, a = 1) {
  check_LCH_bounds(l, c, h, a)

  return `lch(${l}% ${c} ${h}${alpha_to_LCH_string(a)})`
}
export function LCH_string_to_LCH(LCHString: String) {
  if (LCHString.slice(0, 3).toLowerCase() !== 'lch') throw 'Incorrect LCH string format! (1)'

  let matches = LCHString.match(/\d*\.?\d+/g)
  if (matches.length < 3 || matches.length > 4) throw 'Incorrect LCH string format! (2)'

  let values = matches.map((v) => Number(v))
  let [l, c, h, a] = values

  // Check if Alpha values is in percent or decimal
  if (a != undefined) {
    if (LCHString[LCHString.length - 2] === '%') a = a / 100
  } else a = 1

  check_LCH_bounds(l, c, h, a)

  return <[number, number, number, number]>[l, c, h, a]
}

function check_sRGB_bounds(r, g, b, a) {
  if (r < 0 || r > 1) throw 'Incorrect sRGB value! (r is out of [0,1] interval): ' + r
  if (g < 0 || g > 1) throw 'Incorrect sRGB value! (g is out of [0,1] interval): ' + g
  if (b < 0 || b > 1) throw 'Incorrect sRGB value! (b is out of [0,1] interval): ' + b
  if (a < 0 || a > 1) throw 'Incorrect sRGB value! (a is out of [0,1] interval): ' + a
}
export function sRGB_to_sRGB_string(r: Number, g: Number, b: Number, a = 1, only8bit: Boolean, checkBounds = true) {
  if (checkBounds) check_sRGB_bounds(r, g, b, a)

  const toString = only8bit ? (v) => Math.round(v * 2550) / 10 : (v) => Math.round(v * 10000) / 100 + '%'

  return `rgb(${toString(r)}, ${toString(g)}, ${toString(b)}${alpha_to_sRGB_string(a)})`
}
export function sRGB_string_to_sRGB(sRGBString: String) {
  if (sRGBString.slice(0, 3).toLowerCase() !== 'rgb') throw 'Incorrect sRGB string format! (1)'

  const only8Bit = !(sRGBString.match(/%/g)?.length >= 3)

  let matches = sRGBString.match(/\d*\.?\d+/g)
  if (matches.length < 3 || matches.length > 4) throw 'Incorrect sRGB string format! (2)'

  let values = matches.map((v) => Number(v))
  let [r, g, b, a] = values

  // Check if Alpha values is in percent or decimal
  if (a != undefined) {
    if (sRGBString[sRGBString.length - 2] === '%') a = a / 100
  } else a = 1

  const toString = only8Bit ? (v) => Math.round((v / 255) * 10000) / 10000 : (v) => Math.round(v * 100) / 10000

  ;[r, g, b] = [r, g, b].map(toString)

  check_sRGB_bounds(r, g, b, a)

  return <[number, number, number, number]>[r, g, b, a]
}

export function LCH_to_sRGB_values(l: number, c: number, h: number, a: number = 1, forceInGamut = false) {
  check_LCH_bounds(l, c, h, a)

  if (forceInGamut) {
    ;[l, c, h] = force_into_gamut(l, c, h)
  }
  let sRGB = [...LCH_to_sRGB([l, c, h]), a].map(v => Math.round(v * 100) / 100)
  return <[number, number, number, number]>sRGB
}
export function sRGB_to_LCH_values(r: number, g: number, b: number, a: number = 1) {
  check_sRGB_bounds(r, g, b, a)

  let LCH = [...sRGB_to_LCH([r, g, b]), a].map(v => Math.round(v * 100) / 100)
  return <[number, number, number, number]>LCH
}


function force_into_gamut(l, c, h) {
  // Moves an lch color into the sRGB gamut
  // by holding the l and h steady,
  // and adjusting the c via binary-search
  // until the color is on the sRGB boundary.
  if (isLCH_within_sRGB(l, c, h)) {
    return [l, c, h]
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

  return [l, c, h]
}

export function isLCH_within_sRGB(l, c, h) {
  var rgb = LCH_to_sRGB([+l, +c, +h])
  const ε = 0.000005
  return rgb.reduce((a, b) => a && b >= 0 - ε && b <= 1 + ε, true)
}

// Generate gradient stops for the sliders
// (we need to use more to emulate proper interpolation)
export function range (from, to, stops) {
  let step = (to - from) / (stops - 1)
  return Array(stops).fill(0).map((_, i) => i * step)
}

// @ts-ignore
export function slider_stops(range, l, c, h, a, index) {
  return range
    .map((x) => {
      let forceInGamut = false // don't force into sRGB gamut & don't check if is inside (0,1) bounds
      let args = [l, c, h, a]
      args[index] = x
      let [l1, c1, h1, a1] = args
      return sRGB_to_sRGB_string(...LCH_to_sRGB_values(l1, c1, h1, a1, forceInGamut), true, forceInGamut)
    })
    .join(', ')
}

