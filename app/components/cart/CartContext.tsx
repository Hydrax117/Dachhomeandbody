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
  variantId?: string | null
  variantName?: string | null
}

export interface CartItem {
  productId: string
  variantId?: string | null
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
  | { type: "UPDATE_QUANTITY"; productId: string; variantId?: string | null; quantity: number }
  | { type: "REMOVE_ITEM"; productId: string; variantId?: string | null }
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

/** Two cart items are the same if they share productId and variantId. */
function isSameItem(a: CartItem, b: { productId: string; variantId?: string | null }): boolean {
  return a.productId === b.productId && (a.variantId ?? null) === (b.variantId ?? null)
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
      const existing = state.items.find((i) => isSameItem(i, { productId: action.product.id, variantId: action.product.variantId }))
      let items: CartItem[]
      let stockNotice: string | null = null

      if (existing) {
        const requested = existing.quantity + action.quantity
        const newQty = Math.min(requested, action.product.stock)
        if (requested > action.product.stock) {
          stockNotice = `Only ${action.product.stock} unit${action.product.stock !== 1 ? "s" : ""} available for "${action.product.name}${action.product.variantName ? ` (${action.product.variantName})` : ""}".`
        }
        items = state.items.map((i) =>
          isSameItem(i, { productId: action.product.id, variantId: action.product.variantId })
            ? { ...i, quantity: newQty }
            : i
        )
      } else {
        const requested = action.quantity
        const qty = Math.min(requested, action.product.stock)
        if (requested > action.product.stock) {
          stockNotice = `Only ${action.product.stock} unit${action.product.stock !== 1 ? "s" : ""} available for "${action.product.name}${action.product.variantName ? ` (${action.product.variantName})` : ""}".`
        }
        items = [
          ...state.items,
          {
            productId: action.product.id,
            variantId: action.product.variantId ?? null,
            product: action.product,
            quantity: qty,
          },
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
          ? state.items.filter((i) => !isSameItem(i, { productId: action.productId, variantId: action.variantId }))
          : state.items.map((i) => {
              if (!isSameItem(i, { productId: action.productId, variantId: action.variantId })) return i
              const qty = Math.min(action.quantity, i.product.stock)
              if (action.quantity > i.product.stock) {
                stockNotice = `Only ${i.product.stock} unit${i.product.stock !== 1 ? "s" : ""} available for "${i.product.name}${i.product.variantName ? ` (${i.product.variantName})` : ""}".`
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
      const items = state.items.filter((i) => !isSameItem(i, { productId: action.productId, variantId: action.variantId }))
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
  updateQuantity: (productId: string, variantId: string | null | undefined, quantity: number) => void
  removeItem: (productId: string, variantId?: string | null) => void
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
          variantId: i.variantId ?? null,
          quantity: i.quantity,
        }))
        guestItemsRef.current = cart.items

        if (guestItems.length > 0) {
          // Merge guest cart into DB cart, then load merged result
          mergeGuestCart(guestItems).then((merged) => {
            const cartItems: CartItem[] = merged.map((item) => ({
              productId: item.productId,
              variantId: item.variantId,
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
              variantId: item.variantId,
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
        const existing = cart.items.find((i) => isSameItem(i, { productId: product.id, variantId: product.variantId }))
        const newQty = existing
          ? Math.min(existing.quantity + quantity, product.stock)
          : Math.min(quantity, product.stock)
        saveCartItem(product.id, product.variantId ?? null, newQty)
      }
    },
    [cart.items, session?.user?.id]
  )

  const updateQuantity = useCallback(
    (productId: string, variantId: string | null | undefined, quantity: number) => {
      dispatch({ type: "UPDATE_QUANTITY", productId, variantId, quantity })

      if (session?.user?.id) {
        if (quantity <= 0) {
          removeCartItem(productId, variantId ?? null)
        } else {
          const item = cart.items.find((i) => isSameItem(i, { productId, variantId }))
          const capped = item ? Math.min(quantity, item.product.stock) : quantity
          saveCartItem(productId, variantId ?? null, capped)
        }
      }
    },
    [cart.items, session?.user?.id]
  )

  const removeItem = useCallback(
    (productId: string, variantId?: string | null) => {
      dispatch({ type: "REMOVE_ITEM", productId, variantId })

      if (session?.user?.id) {
        removeCartItem(productId, variantId ?? null)
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
