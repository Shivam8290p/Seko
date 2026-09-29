import React, { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { useProducts } from "../context/ProductsContext";
import { useAuth } from "../context/AuthContext";
import { LOW_STOCK_THRESHOLD } from "../data/seed";
import Toast from "../components/Toast";

export default function SellerDashboard() {
  const { products, updateProduct, deleteProduct } = useProducts();
  const { session } = useAuth();

  const myProducts = products.filter((p) => p.sellerId === session.sellerId);
  const lowStockItems = myProducts.filter((p) => p.quantity <= LOW_STOCK_THRESHOLD);

  const [editingQty, setEditingQty] = useState({}); // { [productId]: value }
  const [toast, setToast] = useState({ msg: "", type: "success" });
  const [confirmDelete, setConfirmDelete] = useState(null); // productId

  const showToast = useCallback((msg, type = "success") => {
    setToast({ msg, type });
  }, []);

  const handleQtyChange = (productId, value) => {
    setEditingQty((prev) => ({ ...prev, [productId]: value }));
  };

  const handleQtySave = async (product) => {
    const raw = editingQty[product.id];
    const newQty = parseInt(raw, 10);
    if (isNaN(newQty) || newQty < 0) {
      showToast("Quantity must be a non-negative number.", "error");
      return;
    }
    const wasLow = product.quantity <= LOW_STOCK_THRESHOLD;
    await updateProduct({ ...product, quantity: newQty });
    setEditingQty((prev) => {
      const next = { ...prev };
      delete next[product.id];
      return next;
    });
    if (newQty <= LOW_STOCK_THRESHOLD && !wasLow) {
      showToast(`⚠ ${product.name} is now low in stock (${newQty} left).`, "warning");
    } else {
      showToast("Quantity updated.");
    }
  };

  const handleQtyStep = async (product, delta) => {
    const current = product.quantity;
    const newQty = Math.max(0, current + delta);
    const wasLow = current <= LOW_STOCK_THRESHOLD;
    await updateProduct({ ...product, quantity: newQty });
    if (newQty <= LOW_STOCK_THRESHOLD && !wasLow) {
      showToast(`⚠ ${product.name} is now low in stock (${newQty} left).`, "warning");
    }
  };

  const handleDelete = (productId) => {
    setConfirmDelete(productId);
  };

  const confirmDeleteAction = async () => {
    await deleteProduct(confirmDelete);
    setConfirmDelete(null);
    showToast("Product deleted.");
  };

  return (
    <main className="page container">
      <Toast
        message={toast.msg}
        type={toast.type}
        onClose={() => setToast({ msg: "", type: "success" })}
      />

      {confirmDelete && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Confirm delete">
          <div className="modal">
            <h3>Delete product?</h3>
            <p>This action cannot be undone.</p>
            <div className="modal-actions">
              <button className="btn btn-danger" onClick={confirmDeleteAction}>Delete</button>
              <button className="btn btn-ghost" onClick={() => setConfirmDelete(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="dashboard-header">
        <div>
          <h2 className="page-title">Your listings</h2>
          <p className="page-subtitle">{myProducts.length} product{myProducts.length !== 1 ? "s" : ""} listed</p>
        </div>
        <Link to="/seller/product/new" className="btn btn-primary">+ Add product</Link>
      </div>

      {lowStockItems.length > 0 && (
        <div className="low-stock-banner" role="alert">
          <strong>⚠ Low stock alert:</strong>{" "}
          {lowStockItems.map((p) => p.name).join(", ")}{" "}
          {lowStockItems.length === 1 ? "is" : "are"} running low (≤ {LOW_STOCK_THRESHOLD} units).
        </div>
      )}

      {myProducts.length === 0 ? (
        <div className="empty-state">
          <p>You have no products listed yet.</p>
          <Link to="/seller/product/new" className="btn btn-primary btn-sm">Add your first product</Link>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="seller-table-wrap">
            <table className="seller-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {myProducts.map((product) => {
                  const isLow = product.quantity <= LOW_STOCK_THRESHOLD;
                  const isEditing = editingQty[product.id] !== undefined;
                  return (
                    <tr key={product.id} className={isLow ? "row-low-stock" : ""}>
                      <td className="td-product">
                        <img src={product.imageUrl} alt={product.name} className="table-thumb" />
                        <div>
                          <span className="table-product-name">{product.name}</span>
                          {isLow && <span className="badge badge-warning">Low stock</span>}
                        </div>
                      </td>
                      <td>{product.category}</td>
                      <td>₹{Number(product.price ?? 0).toLocaleString("en-IN")}</td>
                      <td className="td-qty">
                        <div className="qty-inline">
                          <button
                            className="qty-btn"
                            onClick={() => handleQtyStep(product, -1)}
                            disabled={product.quantity <= 0}
                            aria-label="Decrease stock"
                          >−</button>
                          {isEditing ? (
                            <>
                              <input
                                type="number"
                                min="0"
                                className="qty-input"
                                value={editingQty[product.id]}
                                onChange={(e) => handleQtyChange(product.id, e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleQtySave(product)}
                                aria-label="Edit quantity"
                              />
                              <button className="btn btn-ghost btn-sm" onClick={() => handleQtySave(product)}>Save</button>
                              <button className="btn btn-ghost btn-sm" onClick={() => setEditingQty((prev) => { const n = {...prev}; delete n[product.id]; return n; })}>✕</button>
                            </>
                          ) : (
                            <button
                              className={`qty-display${isLow ? " qty-display--low" : ""}`}
                              onClick={() => handleQtyChange(product.id, String(product.quantity))}
                              title="Click to edit"
                              aria-label={`Edit quantity for ${product.name}`}
                            >
                              {product.quantity}
                            </button>
                          )}
                          <button
                            className="qty-btn"
                            onClick={() => handleQtyStep(product, 1)}
                            aria-label="Increase stock"
                          >+</button>
                        </div>
                      </td>
                      <td className="td-actions">
                        <Link to={`/seller/product/${product.id}/edit`} className="btn btn-ghost btn-sm">Edit</Link>
                        <button className="btn btn-ghost btn-sm text-danger" onClick={() => handleDelete(product.id)}>Delete</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile card list */}
          <div className="seller-card-list">
            {myProducts.map((product) => {
              const isLow = product.quantity <= LOW_STOCK_THRESHOLD;
              return (
                <div key={product.id} className={`seller-card${isLow ? " seller-card--low" : ""}`}>
                  <img src={product.imageUrl} alt={product.name} className="seller-card-img" />
                  <div className="seller-card-body">
                    <div className="seller-card-row">
                      <strong className="seller-card-name">{product.name}</strong>
                      {isLow && <span className="badge badge-warning">Low stock</span>}
                    </div>
                    <p className="seller-card-meta">{product.category} · ₹{Number(product.price ?? 0).toLocaleString("en-IN")}</p>
                    <div className="seller-card-qty-row">
                      <span>Stock:</span>
                      <div className="qty-inline">
                        <button className="qty-btn" onClick={() => handleQtyStep(product, -1)} disabled={product.quantity <= 0}>−</button>
                        <span className={`qty-value${isLow ? " qty-display--low" : ""}`}>{product.quantity}</span>
                        <button className="qty-btn" onClick={() => handleQtyStep(product, 1)}>+</button>
                      </div>
                    </div>
                    <div className="seller-card-actions">
                      <Link to={`/seller/product/${product.id}/edit`} className="btn btn-ghost btn-sm">Edit</Link>
                      <button className="btn btn-ghost btn-sm text-danger" onClick={() => handleDelete(product.id)}>Delete</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </main>
  );
}
