export type Color = [number, number, number, number]
export type GradientStops = [string, string, string, string]

export interface PartialColorState {
  RGB: Color,
  LCH: Color,
  RGB_CSS_8: string,
  RGB_CSS_8_OPAQUE: string,
  RGB_CSS: string,
  LCH_CSS: string,
  HEX_CSS: string,
  GRADIENT_STOPS: GradientStops,
  IS_WITHIN_SRGB: boolean,
}

export interface ColorState extends PartialColorState {
  NODE_IDS: string[],
  GRADIENT_HASH?: string,
  GRADIENT_STOP_POS?: number
}



export interface PaintsByColor {
  solid: {
    [RGBA: string]: string[] // node_id[]
  },
  gradient: {
    [gradientHash: string]: { colors: Array<{ RGB: Color, pos: number }>, nodes: string[] }
  }
}

interface SetColorAction {
  type: 'set-color',
  newColor: PartialColorState,
  selectedColors: number[]
}
interface SetAllColorsAction {
  type: 'set-all-colors',
  colors: ColorState[]
}
interface SetFromLCHCalcAction {
  type: 'from-LCH-calc',
  colors: ColorState[],
  except: LCHA_value

}
interface SetFromLCHSliderAction {
  type: 'from-LCH-slider',
  selectedColors: number[],
  value: number,
  valueName: LCHA_value
}
interface SetFromRGBAction {
  type: 'from-RGB',
  colorSpace: 'CIELCH' | 'OKLCH',
  selectedColors: number[],
  value: number,
  valueName: RGBA_value
}
export type ColorAction = SetColorAction | SetAllColorsAction | SetFromLCHCalcAction | SetFromLCHSliderAction | SetFromRGBAction



export interface ColorToController {
  RGB: Color,
  NODE_IDS: string[],
  GRADIENT_STOP_POS?: number
}

export type Boolean4 = [boolean, boolean, boolean, boolean]

export type LCH_value = 'L' | 'C' | 'H'
export type LCHA_value = LCH_value | 'A'
export type RGB_value = 'R' | 'G' | 'B'
export type RGBA_value = RGB_value | 'A'

export type FillsOrStrokes = 'fills' | 'strokes'



// Messages sent from the UI
export interface AutoRepaintFromUI {
  type: 'set-auto-repaint',
  message: { value: boolean }
}

export interface ColorInputFromUI {
  type: 'color-from-ui',
  message: {
    colors: ColorToController[],
    forceRepaint?: boolean
  }
}

export interface ModeFromUI {
  type: 'set-fills-or-strokes'
  message: {
    value: FillsOrStrokes
  }
}

export interface TooltipAlreadyShownFromUI {
  type: 'set-tooltip-already-shown',
}

export interface PickFromSelectionFromUI {
  type: 'pick-from-selection'
}

export type MessageFromUI = AutoRepaintFromUI | ColorInputFromUI | ModeFromUI | TooltipAlreadyShownFromUI | PickFromSelectionFromUI

// Messages sent to the UI
export interface TooltipAlreadyShownToUI {
  type: 'set-tooltip-already-shown-ui',
  value: boolean
}

export interface AutoRepaintToUI {
  type: 'set-auto-repaint-ui',
  value: boolean
}

export interface ModeToUI {
  type: 'set-fills-or-strokes-ui',
  value: FillsOrStrokes
}

export interface ColorInputToUI {
  type: 'color-to-ui',
  allFills: PaintsByColor
}

type MessageToUI = TooltipAlreadyShownToUI | AutoRepaintToUI | ModeToUI | ColorInputToUI

export interface MessageEventToUI {
  pluginMessage: MessageToUI
}

// getFullColorData

interface GetFullColorDataParams1 {
  from: 'LCH' | 'RGB',
  colorSpace: 'CIELCH' | 'OKLCH'
  value: Color,
}
interface GetFullColorDataParams2 {
  from: 'ALPHA',
  value: Color,
  colorSpace: 'CIELCH' | 'OKLCH',
  prevState: ColorState
}
interface GetFullColorDataParams3 {
  from: 'LCH_CSS' | 'RGB_CSS' | 'HEX_CSS',
  colorSpace: 'CIELCH' | 'OKLCH'
  value: string
}
type GetFullColorDataParams = GetFullColorDataParams1 | GetFullColorDataParams2 | GetFullColorDataParams3

export type GetFullColorData = (params: GetFullColorDataParams) => PartialColorState


// figma nodes


type ValidNodeMixin = MinimalFillsMixin & MinimalStrokesMixin
export type ValidNode = Extract<SceneNode, ValidNodeMixin>
export type ValidNodeType = ValidNode['type']
type InvalidNode = Exclude<SceneNode, ValidNodeMixin>
export type NodeWithChildren = Extract<InvalidNode, ChildrenMixin>

export type Mutable<T> = {
  -readonly [K in keyof T]: T[K]
}