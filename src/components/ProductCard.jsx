import React from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import Toast from "./Toast";
import { useState } from "react";

export default function ProductCard({ product }) {
  const { cart, addToCart } = useCart();
  const [toast, setToast] = useState("");
  const [toastType, setToastType] = useState("success");

  const isOutOfStock = product.quantity === 0;

  const cartItem = cart.find((i) => i.productId === product.id);
  const inCartQty = cartItem ? cartItem.quantity : 0;
  const atStockLimit = inCartQty >= product.quantity;

  const handleAddToCart = () => {
    const { added, capped } = addToCart(product.id, 1);
    if (!added && atStockLimit) {
      setToastType("warning");
      setToast(`Only ${product.quantity} in stock — already in your cart!`);
    } else if (added && capped) {
      setToastType("warning");
      setToast(`Added (stock limit: ${product.quantity})`);
    } else if (added) {
      setToastType("success");
      setToast(`${product.name} added to cart`);
    }
  };

  return (
    <article className={`product-card${isOutOfStock ? " product-card--oos" : ""}`}>
      <Toast message={toast} type={toastType} onClose={() => setToast("")} />

      <Link to={`/product/${product.id}`} className="product-card-img-wrap" aria-label={product.name}>
        <img
          src={product.imageUrl}
          alt=""
          className="product-card-img"
          loading="lazy"
          onError={(e) => { e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='150' viewBox='0 0 200 150'%3E%3Crect width='200' height='150' fill='%23e2e8f0'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='13' fill='%234a5568'%3ENo image%3C/text%3E%3C/svg%3E"; }}
        />
        {isOutOfStock && (
          <span className="badge badge-oos">Out of stock</span>
        )}
      </Link>

      <div className="product-card-body">
        <span className="product-card-category">{product.category}</span>
        <Link to={`/product/${product.id}`} className="product-card-name" tabIndex={-1} aria-hidden="true">
          {product.name}
        </Link>
        <div className="product-card-footer">
          <span className="product-card-price">₹{Number(product.price ?? 0).toLocaleString("en-IN")}</span>
          {!isOutOfStock && (
            atStockLimit ? (
              <span className="badge badge-in-cart">Max in cart</span>
            ) : (
              <button
                className="btn btn-primary btn-sm"
                onClick={handleAddToCart}
              >
                Add to cart
              </button>
            )
          )}
        </div>
      </div>
    </article>
  );
}
