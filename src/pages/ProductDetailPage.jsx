import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useProducts } from "../context/ProductsContext";
import { useCart } from "../context/CartContext";
import Toast from "../components/Toast";

export default function ProductDetailPage() {
  const { id } = useParams();
  const { products, loading } = useProducts();
  const { cart, addToCart } = useCart();
  const navigate = useNavigate();

  const product = products.find((p) => p.id === id);
  const [qty, setQty] = useState(1);
  const [toast, setToast] = useState("");

  if (loading && !product) {
    return (
      <main className="page container">
        <div className="empty-state"><p>Loading…</p></div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="page container">
        <div className="empty-state">
          <p>Product not found.</p>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate("/")}>← Back to browse</button>
        </div>
      </main>
    );
  }

  const cartItem = cart.find((i) => i.productId === id);
  const alreadyInCart = cartItem?.quantity || 0;
  const maxAddable = Math.max(0, product.quantity - alreadyInCart);
  const isOutOfStock = product.quantity === 0;

  const handleAddToCart = () => {
    const { added, capped } = addToCart(product.id, qty);
    if (added && capped) {
      setToast(`Added ${Math.min(qty, maxAddable)} (stock limit reached)`);
    } else if (added) {
      setToast(`${product.name} added to cart`);
    } else {
      setToast(`Stock limit reached — only ${product.quantity} available`);
    }
    setQty(1);
  };

  return (
    <main className="page container">
      <Toast message={toast} onClose={() => setToast("")} />

      <button className="back-link" onClick={() => navigate(-1)}>← Back</button>

      <div className="product-detail">
        <div className="product-detail-img-wrap">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="product-detail-img"
          />
          {isOutOfStock && <span className="badge badge-oos badge-detail">Out of stock</span>}
        </div>

        <div className="product-detail-info">
          <span className="product-card-category">{product.category}</span>
          <h1 className="product-detail-name">{product.name}</h1>
          <p className="product-detail-price">₹{Number(product.price ?? 0).toLocaleString("en-IN")}</p>

          <p className="product-detail-desc">{product.description}</p>

          <dl className="product-detail-meta">
            <div className="meta-row">
              <dt>Seller</dt>
              <dd>{product.sellerName}</dd>
            </div>
            <div className="meta-row">
              <dt>Available</dt>
              <dd className={product.quantity === 0 ? "text-danger" : product.quantity <= 5 ? "text-warning" : ""}>
                {product.quantity === 0 ? "Out of stock" : `${product.quantity} in stock`}
              </dd>
            </div>
          </dl>

          {!isOutOfStock && maxAddable > 0 && (
            <div className="product-detail-actions">
              <div className="qty-selector">
                <button
                  className="qty-btn"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  disabled={qty <= 1}
                  aria-label="Decrease quantity"
                >−</button>
                <span className="qty-value">{qty}</span>
                <button
                  className="qty-btn"
                  onClick={() => setQty((q) => Math.min(maxAddable, q + 1))}
                  disabled={qty >= maxAddable}
                  aria-label="Increase quantity"
                >+</button>
              </div>
              <button className="btn btn-primary" onClick={handleAddToCart}>
                Add to cart
              </button>
            </div>
          )}

          {!isOutOfStock && maxAddable === 0 && (
            <p className="form-error">You already have all available stock in your cart.</p>
          )}
        </div>
      </div>
    </main>
  );
}
