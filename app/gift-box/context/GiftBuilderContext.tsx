"use client"

import {
  createContext,
  useCallback,
  useContext,
  useReducer,
  type ReactNode,
} from "react"
import type { GiftCardStyle, GiftRibbonStyle } from "@/lib/gift-boxes"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SelectedGiftBox {
  id: string
  title: string
  slug: string
  description: string
  image: string
  maxItems: number
  price: number
  theme: string
}

export interface BoxProduct {
  id: string
  name: string
  slug: string
  images: string[]
  price: number
  topNotes: string[]
  heartNotes: string[]
  baseNotes: string[]
  moodTags: string[]
}

export interface GiftCustomization {
  message: string
  cardStyle: GiftCardStyle
  ribbonStyle: GiftRibbonStyle
  deliveryDate: string // ISO date string
  anonymous: boolean
}

export type BuilderStep = "select-box" | "build" | "customize" | "summary"

interface GiftBuilderState {
  step: BuilderStep
  selectedBox: SelectedGiftBox | null
  items: BoxProduct[]
  customization: GiftCustomization
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

type Action =
  | { type: "SET_STEP"; step: BuilderStep }
  | { type: "SELECT_BOX"; box: SelectedGiftBox }
  | { type: "ADD_ITEM"; product: BoxProduct }
  | { type: "REMOVE_ITEM"; productId: string }
  | { type: "CLEAR_ITEMS" }
  | { type: "SET_CUSTOMIZATION"; customization: Partial<GiftCustomization> }
  | { type: "RESET" }

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

const defaultCustomization: GiftCustomization = {
  message: "",
  cardStyle: "MINIMAL",
  ribbonStyle: "BLACK_SATIN",
  deliveryDate: "",
  anonymous: false,
}

const initialState: GiftBuilderState = {
  step: "select-box",
  selectedBox: null,
  items: [],
  customization: defaultCustomization,
}

function reducer(state: GiftBuilderState, action: Action): GiftBuilderState {
  switch (action.type) {
    case "SET_STEP":
      return { ...state, step: action.step }

    case "SELECT_BOX":
      return {
        ...state,
        selectedBox: action.box,
        items: [], // reset items when box changes
        step: "build",
      }

    case "ADD_ITEM": {
      if (!state.selectedBox) return state
      if (state.items.length >= state.selectedBox.maxItems) return state
      return { ...state, items: [...state.items, action.product] }
    }

    case "REMOVE_ITEM": {
      const idx = state.items.findLastIndex((p) => p.id === action.productId)
      if (idx === -1) return state
      const next = [...state.items]
      next.splice(idx, 1)
      return { ...state, items: next }
    }

    case "CLEAR_ITEMS":
      return { ...state, items: [] }

    case "SET_CUSTOMIZATION":
      return {
        ...state,
        customization: { ...state.customization, ...action.customization },
      }

    case "RESET":
      return initialState

    default:
      return state
  }
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface GiftBuilderContextValue {
  state: GiftBuilderState
  setStep: (step: BuilderStep) => void
  selectBox: (box: SelectedGiftBox) => void
  addItem: (product: BoxProduct) => void
  removeItem: (productId: string) => void
  clearItems: () => void
  setCustomization: (customization: Partial<GiftCustomization>) => void
  reset: () => void
  // Derived
  itemCount: number
  remainingCapacity: number
  isFull: boolean
  subtotal: number
  total: number
  canAddItem: boolean
}

const GiftBuilderContext = createContext<GiftBuilderContextValue | null>(null)

export function useGiftBuilder() {
  const ctx = useContext(GiftBuilderContext)
  if (!ctx) throw new Error("useGiftBuilder must be used within GiftBuilderProvider")
  return ctx
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function GiftBuilderProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  const setStep = useCallback((step: BuilderStep) => {
    dispatch({ type: "SET_STEP", step })
  }, [])

  const selectBox = useCallback((box: SelectedGiftBox) => {
    dispatch({ type: "SELECT_BOX", box })
  }, [])

  const addItem = useCallback((product: BoxProduct) => {
    dispatch({ type: "ADD_ITEM", product })
  }, [])

  const removeItem = useCallback((productId: string) => {
    dispatch({ type: "REMOVE_ITEM", productId })
  }, [])

  const clearItems = useCallback(() => {
    dispatch({ type: "CLEAR_ITEMS" })
  }, [])

  const setCustomization = useCallback(
    (customization: Partial<GiftCustomization>) => {
      dispatch({ type: "SET_CUSTOMIZATION", customization })
    },
    []
  )

  const reset = useCallback(() => {
    dispatch({ type: "RESET" })
  }, [])

  const itemCount = state.items.length
  const remainingCapacity = state.selectedBox
    ? state.selectedBox.maxItems - itemCount
    : 0
  const isFull = state.selectedBox ? itemCount >= state.selectedBox.maxItems : false
  const canAddItem = !isFull && state.selectedBox !== null

  const subtotal = state.items.reduce((sum, p) => sum + p.price, 0)
  const total = subtotal + (state.selectedBox?.price ?? 0)

  return (
    <GiftBuilderContext.Provider
      value={{
        state,
        setStep,
        selectBox,
        addItem,
        removeItem,
        clearItems,
        setCustomization,
        reset,
        itemCount,
        remainingCapacity,
        isFull,
        subtotal,
        total,
        canAddItem,
      }}
    >
      {children}
    </GiftBuilderContext.Provider>
  )
}
