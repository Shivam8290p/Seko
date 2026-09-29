import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { getCart, saveCart, clearCart as clearCartDb } from "../data/db";

const CartContext = createContext(null);

export function CartProvider({ children, getProduct }) {
  const [cart, setCart] = useState(() => getCart());

  // Always holds the latest cart so actions can compute their result synchronously.
  const cartRef = useRef(cart);

  const getProductRef = useRef(getProduct);
  useEffect(() => { getProductRef.current = getProduct; }, [getProduct]);

  const commit = useCallback((updated) => {
    cartRef.current = updated;
    setCart(updated);
    saveCart(updated);
  }, []);

  // Returns { added, capped } immediately (the old version returned before React
  // ran the state updater, so it always reported added:false).
  const addToCart = useCallback((productId, quantity) => {
    const prev = cartRef.current;
    const product = getProductRef.current?.(productId);
    if (!product || !product.quantity) return { added: false, capped: false };

    const existing = prev.find((i) => i.productId === productId);
    const alreadyInCart = existing ? existing.quantity : 0;
    const maxCanAdd = product.quantity - alreadyInCart;
    if (maxCanAdd <= 0) return { added: false, capped: true };

    const actualQty = Math.min(quantity, maxCanAdd);
    const updated = existing
      ? prev.map((i) => (i.productId === productId ? { ...i, quantity: i.quantity + actualQty } : i))
      : [...prev, { productId, quantity: actualQty }];

    commit(updated);
    return { added: true, capped: actualQty < quantity };
  }, [commit]);

  const updateCartItem = useCallback((productId, quantity) => {
    const product = getProductRef.current?.(productId);
    const maxQty = product ? product.quantity : quantity;
    const clamped = Math.max(1, Math.min(maxQty, quantity));
    commit(cartRef.current.map((i) => (i.productId === productId ? { ...i, quantity: clamped } : i)));
  }, [commit]);

  const removeFromCart = useCallback((productId) => {
    commit(cartRef.current.filter((i) => i.productId !== productId));
  }, [commit]);

  const clearCart = useCallback(() => {
    clearCartDb();
    cartRef.current = [];
    setCart([]);
  }, []);

  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, updateCartItem, removeFromCart, clearCart, cartCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
