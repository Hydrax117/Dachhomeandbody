"use client"

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from "react"
import { useSession } from "next-auth/react"
import {
  loadCart,
  saveCartItem,
  removeCartItem,
  clearPersistedCart,
  mergeGuestCart,
} from "@/app/actions/cart"

// ── Types ──────────────────────────────────────────────────────────────────

export interface CartProduct {
  id: string
  name: string
  slug: string
  price: number
  images: string[]
  stock: number
}

export interface CartItem {
  productId: string
  product: CartProduct
  quantity: number
}

export interface Cart {
  items: CartItem[]
  subtotal: number
  discount: number
  total: number
  couponCode?: string
  couponError?: string
  stockNotice?: string | null
}

// ── Actions ────────────────────────────────────────────────────────────────

type CartAction =
  | { type: "ADD_ITEM"; product: CartProduct; quantity: number }
  | { type: "UPDATE_QUANTITY"; productId: string; quantity: number }
  | { type: "REMOVE_ITEM"; productId: string }
  | { type: "APPLY_COUPON"; code: string; discount: number }
  | { type: "COUPON_ERROR"; error: string }
  | { type: "REMOVE_COUPON" }
  | { type: "CLEAR_CART" }
  | { type: "LOAD_CART"; items: CartItem[] }
  | { type: "SET_STOCK_NOTICE"; message: string | null }

// ── Helpers ────────────────────────────────────────────────────────────────

function calcSubtotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
}

// ── Reducer ────────────────────────────────────────────────────────────────

function cartReducer(state: Cart, action: CartAction): Cart {
  switch (action.type) {
    case "LOAD_CART": {
      const subtotal = calcSubtotal(action.items)
      return {
        ...state,
        items: action.items,
        subtotal,
        total: Math.max(0, subtotal - state.discount),
      }
    }

    case "ADD_ITEM": {
      const existing = state.items.find((i) => i.productId === action.product.id)
      let items: CartItem[]
      let stockNotice: string | null = null

      if (existing) {
        const requested = existing.quantity + action.quantity
        const newQty = Math.min(requested, action.product.stock)
        if (requested > action.product.stock) {
          stockNotice = `Only ${action.product.stock} unit${action.product.stock !== 1 ? "s" : ""} available for "${action.product.name}".`
        }
        items = state.items.map((i) =>
          i.productId === action.product.id ? { ...i, quantity: newQty } : i
        )
      } else {
        const requested = action.quantity
        const qty = Math.min(requested, action.product.stock)
        if (requested > action.product.stock) {
          stockNotice = `Only ${action.product.stock} unit${action.product.stock !== 1 ? "s" : ""} available for "${action.product.name}".`
        }
        items = [
          ...state.items,
          { productId: action.product.id, product: action.product, quantity: qty },
        ]
      }

      const subtotal = calcSubtotal(items)
      return {
        ...state,
        items,
        subtotal,
        total: Math.max(0, subtotal - state.discount),
        stockNotice,
      }
    }

    case "UPDATE_QUANTITY": {
      let stockNotice: string | null = null
      const items =
        action.quantity <= 0
          ? state.items.filter((i) => i.productId !== action.productId)
          : state.items.map((i) => {
              if (i.productId !== action.productId) return i
              const qty = Math.min(action.quantity, i.product.stock)
              if (action.quantity > i.product.stock) {
                stockNotice = `Only ${i.product.stock} unit${i.product.stock !== 1 ? "s" : ""} available for "${i.product.name}".`
              }
              return { ...i, quantity: qty }
            })

      const subtotal = calcSubtotal(items)
      return {
        ...state,
        items,
        subtotal,
        total: Math.max(0, subtotal - state.discount),
        stockNotice,
      }
    }

    case "REMOVE_ITEM": {
      const items = state.items.filter((i) => i.productId !== action.productId)
      const subtotal = calcSubtotal(items)
      return {
        ...state,
        items,
        subtotal,
        total: Math.max(0, subtotal - state.discount),
      }
    }

    case "APPLY_COUPON": {
      const subtotal = calcSubtotal(state.items)
      return {
        ...state,
        couponCode: action.code,
        discount: action.discount,
        total: Math.max(0, subtotal - action.discount),
        couponError: undefined,
      }
    }

    case "COUPON_ERROR": {
      return { ...state, couponError: action.error }
    }

    case "REMOVE_COUPON": {
      const subtotal = calcSubtotal(state.items)
      return {
        ...state,
        couponCode: undefined,
        discount: 0,
        total: subtotal,
        couponError: undefined,
      }
    }

    case "CLEAR_CART": {
      return initialState
    }

    case "SET_STOCK_NOTICE": {
      return { ...state, stockNotice: action.message }
    }

    default:
      return state
  }
}

// ── Initial state ──────────────────────────────────────────────────────────

const initialState: Cart = {
  items: [],
  subtotal: 0,
  discount: 0,
  total: 0,
}

// ── Context ────────────────────────────────────────────────────────────────

interface CartContextValue {
  cart: Cart
  isOpen: boolean
  openCart: () => void
  closeCart: () => void
  addItem: (product: CartProduct, quantity?: number) => void
  updateQuantity: (productId: string, quantity: number) => void
  removeItem: (productId: string) => void
  applyCoupon: (code: string) => Promise<void>
  removeCoupon: () => void
  clearCart: () => void
  dismissStockNotice: () => void
  itemCount: number
}

const CartContext = createContext<CartContextValue | null>(null)

// ── Provider ───────────────────────────────────────────────────────────────

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, dispatch] = useReducer(cartReducer, initialState)
  const [isOpen, setIsOpen] = useReducerState(false)
  const { data: session, status } = useSession()

  // Track previous auth status to detect login transitions
  const prevStatusRef = useRef<string>("loading")
  // Snapshot of guest items at the moment the user logs in
  const guestItemsRef = useRef<CartItem[]>([])

  // ── Load cart when user authenticates ─────────────────────────────────

  useEffect(() => {
    const prevStatus = prevStatusRef.current
    prevStatusRef.current = status

    if (status === "authenticated" && session?.user?.id) {
      if (prevStatus !== "authenticated") {
        // User just logged in — capture current guest cart before merging
        const guestItems = cart.items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
        }))
        guestItemsRef.current = cart.items

        if (guestItems.length > 0) {
          // Merge guest cart into DB cart, then load merged result
          mergeGuestCart(guestItems).then((merged) => {
            const cartItems: CartItem[] = merged.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              product: item.product,
            }))
            dispatch({ type: "LOAD_CART", items: cartItems })
          })
        } else {
          // No guest items — just load the user's saved cart
          loadCart().then((items) => {
            const cartItems: CartItem[] = items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              product: item.product,
            }))
            dispatch({ type: "LOAD_CART", items: cartItems })
          })
        }
      }
    } else if (status === "unauthenticated" && prevStatus === "authenticated") {
      // User logged out — clear local cart state
      dispatch({ type: "CLEAR_CART" })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, session?.user?.id])

  // ── Cart operations ────────────────────────────────────────────────────

  const openCart = useCallback(() => setIsOpen(true), [setIsOpen])
  const closeCart = useCallback(() => setIsOpen(false), [setIsOpen])

  const addItem = useCallback(
    (product: CartProduct, quantity = 1) => {
      dispatch({ type: "ADD_ITEM", product, quantity })

      if (session?.user?.id) {
        // Compute new quantity after add (mirrors reducer logic)
        const existing = cart.items.find((i) => i.productId === product.id)
        const newQty = existing
          ? Math.min(existing.quantity + quantity, product.stock)
          : Math.min(quantity, product.stock)
        saveCartItem(product.id, newQty)
      }
    },
    [cart.items, session?.user?.id]
  )

  const updateQuantity = useCallback(
    (productId: string, quantity: number) => {
      dispatch({ type: "UPDATE_QUANTITY", productId, quantity })

      if (session?.user?.id) {
        if (quantity <= 0) {
          removeCartItem(productId)
        } else {
          const item = cart.items.find((i) => i.productId === productId)
          const capped = item ? Math.min(quantity, item.product.stock) : quantity
          saveCartItem(productId, capped)
        }
      }
    },
    [cart.items, session?.user?.id]
  )

  const removeItem = useCallback(
    (productId: string) => {
      dispatch({ type: "REMOVE_ITEM", productId })

      if (session?.user?.id) {
        removeCartItem(productId)
      }
    },
    [session?.user?.id]
  )

  const applyCoupon = useCallback(async (code: string) => {
    // Coupon validation will be wired to server action in task 3.7
    if (!code.trim()) {
      dispatch({ type: "COUPON_ERROR", error: "Please enter a coupon code." })
      return
    }
    dispatch({ type: "COUPON_ERROR", error: "Invalid or expired coupon code." })
  }, [])

  const removeCoupon = useCallback(() => {
    dispatch({ type: "REMOVE_COUPON" })
  }, [])

  const clearCart = useCallback(() => {
    dispatch({ type: "CLEAR_CART" })

    if (session?.user?.id) {
      clearPersistedCart()
    }
  }, [session?.user?.id])

  const dismissStockNotice = useCallback(() => {
    dispatch({ type: "SET_STOCK_NOTICE", message: null })
  }, [])

  const itemCount = cart.items.reduce((sum, i) => sum + i.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        cart,
        isOpen,
        openCart,
        closeCart,
        addItem,
        updateQuantity,
        removeItem,
        applyCoupon,
        removeCoupon,
        clearCart,
        dismissStockNotice,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

// Simple useState wrapper to avoid importing useState separately
function useReducerState<T>(initial: T): [T, (v: T) => void] {
  const [state, dispatch] = useReducer((_: T, v: T) => v, initial)
  return [state, dispatch]
}

// ── Hook ───────────────────────────────────────────────────────────────────

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error("useCart must be used within CartProvider")
  return ctx
}
