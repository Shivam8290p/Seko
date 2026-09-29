import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useProducts } from "../context/ProductsContext";

const PLATFORM_FEE = 5;

export default function CartPage() {
  const { cart, updateCartItem, removeFromCart, clearCart } = useCart();
  const { products, deductStock } = useProducts();
  const navigate = useNavigate();
  const [ordered, setOrdered] = useState(false);
  const [warnedProducts, setWarnedProducts] = useState([]);
  const [placing, setPlacing] = useState(false);
  const [orderError, setOrderError] = useState("");

  const enrichedCart = cart
    .map((item) => {
      const product = products.find((p) => p.id === item.productId);
      return product ? { ...item, product } : null;
    })
    .filter(Boolean);

  const subtotal = enrichedCart.reduce(
    (sum, item) => sum + Number(item.product.price ?? 0) * item.quantity,
    0
  );
  const total = subtotal + PLATFORM_FEE;

  const handleQtyChange = (productId, newQty, maxQty) => {
    const clamped = Math.max(1, Math.min(maxQty, newQty));
    updateCartItem(productId, clamped);
  };

  const handlePlaceOrder = async () => {
    setPlacing(true);
    setOrderError("");
    try {
      const warned = await deductStock(
        enrichedCart.map((i) => ({ productId: i.productId, quantity: i.quantity }))
      );
      setWarnedProducts(warned);
      clearCart();
      setOrdered(true);
    } catch (err) {
      console.error("Order failed:", err);
      setOrderError(err.message || "Order failed. Please try again.");
      setPlacing(false);
    }
  };

  if (ordered) {
    return (
      <main className="page container">
        <div className="order-confirm">
          <div className="order-confirm-icon" aria-hidden="true">✓</div>
          <h2>Order placed!</h2>
          <p>Your items have been reserved. The seller will be in touch shortly.</p>
          {warnedProducts.length > 0 && (
            <p className="text-warning" style={{ marginTop: "0.5rem" }}>
              Note: {warnedProducts.join(", ")} {warnedProducts.length === 1 ? "is" : "are"} now low in stock.
            </p>
          )}
          <button className="btn btn-primary" style={{ marginTop: "1.5rem" }} onClick={() => navigate("/")}>
            Continue shopping
          </button>
        </div>
      </main>
    );
  }

  if (enrichedCart.length === 0) {
    return (
      <main className="page container">
        <div className="empty-state">
          <p>Your cart is empty.</p>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate("/")}>Browse products</button>
        </div>
      </main>
    );
  }

  return (
    <main className="page container">
      <h2 className="page-title">Your cart</h2>

      <div className="cart-layout">
        <div className="cart-items">
          {enrichedCart.map(({ productId, quantity, product }) => (
            <div key={productId} className="cart-item">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="cart-item-img"
              />
              <div className="cart-item-info">
                <p className="cart-item-name">{product.name}</p>
                <p className="cart-item-unit">₹{Number(product.price ?? 0).toLocaleString("en-IN")} each</p>
              </div>
              <div className="cart-item-qty">
                <button
                  className="qty-btn"
                  onClick={() => handleQtyChange(productId, quantity - 1, product.quantity)}
                  disabled={quantity <= 1}
                  aria-label="Decrease"
                >−</button>
                <span className="qty-value">{quantity}</span>
                <button
                  className="qty-btn"
                  onClick={() => handleQtyChange(productId, quantity + 1, product.quantity)}
                  disabled={quantity >= product.quantity}
                  aria-label="Increase"
                >+</button>
              </div>
              <p className="cart-item-subtotal">₹{(Number(product.price ?? 0) * quantity).toLocaleString("en-IN")}</p>
              <button
                className="cart-item-remove"
                onClick={() => removeFromCart(productId)}
                aria-label={`Remove ${product.name}`}
              >×</button>
            </div>
          ))}
        </div>

        <aside className="cart-summary">
          <h3 className="summary-title">Order summary</h3>
          <dl className="summary-rows">
            <div className="summary-row">
              <dt>Subtotal</dt>
              <dd>₹{subtotal.toLocaleString("en-IN")}</dd>
            </div>
            <div className="summary-row">
              <dt>Platform fee</dt>
              <dd>₹{PLATFORM_FEE}</dd>
            </div>
            <div className="summary-row summary-total">
              <dt>Total</dt>
              <dd>₹{total.toLocaleString("en-IN")}</dd>
            </div>
          </dl>
          {orderError && (
            <p className="form-error" role="alert" style={{ marginTop: "0.25rem" }}>
              {orderError}
            </p>
          )}
          <button className="btn btn-primary btn-full" onClick={handlePlaceOrder} disabled={placing}>
            {placing ? "Placing order…" : "Place order"}
          </button>
        </aside>
      </div>
    </main>
  );
}
