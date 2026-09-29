import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useProducts } from "../context/ProductsContext";
import { useAuth } from "../context/AuthContext";
import { CATEGORIES } from "../data/seed";

function genId() {
  return "p" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

// Resize + compress an uploaded photo into a small JPEG data URL so it can be
// stored directly in the Firestore document (limit 1 MB per doc, this is ~50-150 KB).
function fileToCompressedDataUrl(file, maxSide = 800, quality = 0.78) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("Please choose an image file."));
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(img.width * scale));
      canvas.height = Math.max(1, Math.round(img.height * scale));
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(objectUrl);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Could not read that image."));
    };
    img.src = objectUrl;
  });
}

const EMPTY_FORM = {
  name: "",
  description: "",
  imageUrl: "",
  price: "",
  category: "Books",
  quantity: "",
};

export default function ProductFormPage() {
  const { id } = useParams(); // present when editing
  const isEdit = !!id;
  const { products, loading, addProduct, updateProduct } = useProducts();
  const { session } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const initializedRef = React.useRef(false);

  useEffect(() => {
    if (isEdit) {
      if (loading) return; // wait for Firestore before deciding the product is missing
      const existing = products.find((p) => p.id === id);
      if (!existing) { navigate("/seller/dashboard"); return; }
      if (existing.sellerId !== session.sellerId) { navigate("/seller/dashboard"); return; }
      if (initializedRef.current) return;
      initializedRef.current = true;
      setForm({
        name: existing.name ?? "",
        description: existing.description ?? "",
        imageUrl: existing.imageUrl ?? "",
        price: String(existing.price),
        category: existing.category,
        quantity: String(existing.quantity),
      });
      setImagePreview(existing.imageUrl ?? "");
    }
  }, [id, isEdit, loading, products, session, navigate]);

  const set = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (field === "imageUrl") setImagePreview(e.target.value);
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await fileToCompressedDataUrl(file);
      setForm((prev) => ({ ...prev, imageUrl: dataUrl }));
      setImagePreview(dataUrl);
      setErrors((prev) => ({ ...prev, imageUrl: "" }));
    } catch (err) {
      setErrors((prev) => ({ ...prev, imageUrl: err.message }));
    }
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) {
      e.name = "Name is required.";
    } else if (form.name.trim().length > 120) {
      e.name = "Name must be 120 characters or fewer.";
    }
    if (!form.description.trim()) {
      e.description = "Description is required.";
    } else if (form.description.trim().length > 1000) {
      e.description = "Description must be 1000 characters or fewer.";
    }
    if (!form.imageUrl.trim()) {
      e.imageUrl = "Upload a photo or paste an image URL.";
    } else if (!/^(https:\/\/|data:image\/)/i.test(form.imageUrl.trim())) {
      e.imageUrl = "Image URL must start with https://.";
    }
    const price = parseFloat(form.price);
    if (isNaN(price) || price <= 0) {
      e.price = "Enter a valid price greater than 0.";
    } else if (price > 999999) {
      e.price = "Price cannot exceed ₹9,99,999.";
    }
    if (!/^\d+$/.test(String(form.quantity).trim())) {
      e.quantity = "Enter a whole number (0 or more).";
    } else {
      const qty = Number(form.quantity);
      if (qty < 0 || qty > 9999) e.quantity = "Quantity must be between 0 and 9999.";
    }
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    const productData = {
      id: isEdit ? id : genId(),
      name: form.name.trim(),
      description: form.description.trim(),
      imageUrl: form.imageUrl.trim(),
      price: parseFloat(form.price),
      category: form.category,
      quantity: parseInt(form.quantity, 10),
      sellerId: session.sellerId,
      sellerName: session.name,
    };

    setSaving(true);
    setSaveError("");
    try {
      if (isEdit) {
        await updateProduct(productData);
      } else {
        await addProduct(productData);
      }
      navigate("/seller/dashboard");
    } catch (err) {
      console.error("Failed to save product:", err);
      setSaveError(
        err?.code === "permission-denied"
          ? "Firestore rejected the save. Publish firestore.rules in the Firebase console and try again."
          : err?.code === "timeout" && !import.meta.env.VITE_FIREBASE_PROJECT_ID
          ? "Firebase settings are missing: create a file named .env.local (copy your original one, or copy .env.example and fill in the values), then stop and restart npm run dev."
          : err?.code === "timeout"
          ? "Can't reach Firestore. In Firebase console make sure a Firestore Database is created (Build → Firestore Database → Create database), then disable any ad-blocker/VPN for localhost and retry."
          : `Could not save the product (${err?.code || err?.message || "unknown error"}).`
      );
      setSaving(false);
    }
  };

  return (
    <main className="page container">
      <button className="back-link" onClick={() => navigate("/seller/dashboard")}>← Back to dashboard</button>
      <h2 className="page-title">{isEdit ? "Edit product" : "Add product"}</h2>

      <div className="product-form-layout">
        <form className="product-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="pf-name" className="form-label">Product name *</label>
            <input
              id="pf-name"
              className={`form-input${errors.name ? " input-error" : ""}`}
              value={form.name}
              onChange={set("name")}
              placeholder="e.g. Engineering Mathematics Vol. 1"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? "pf-name-err" : undefined}
              maxLength={120}
            />
            {errors.name && <span id="pf-name-err" className="field-error" role="alert">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="pf-desc" className="form-label">Description *</label>
            <textarea
              id="pf-desc"
              className={`form-input form-textarea${errors.description ? " input-error" : ""}`}
              value={form.description}
              onChange={set("description")}
              placeholder="Describe the item's condition, usage, what's included…"
              rows={4}
              aria-invalid={!!errors.description}
              aria-describedby={errors.description ? "pf-desc-err" : undefined}
              maxLength={1000}
            />
            {errors.description && <span id="pf-desc-err" className="field-error" role="alert">{errors.description}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="pf-file" className="form-label">Product photo *</label>
            <input
              id="pf-file"
              type="file"
              accept="image/*"
              className="form-input"
              onChange={handleFile}
            />
            <label htmlFor="pf-image" className="form-label" style={{ marginTop: "0.5rem" }}>
              …or paste an image URL (https://)
            </label>
            <input
              id="pf-image"
              type="url"
              className={`form-input${errors.imageUrl ? " input-error" : ""}`}
              value={form.imageUrl.startsWith("data:") ? "" : form.imageUrl}
              onChange={set("imageUrl")}
              placeholder={form.imageUrl.startsWith("data:") ? "Using uploaded photo" : "https://example.com/image.jpg"}
              aria-invalid={!!errors.imageUrl}
              aria-describedby={errors.imageUrl ? "pf-image-err" : undefined}
            />
            {errors.imageUrl && <span id="pf-image-err" className="field-error" role="alert">{errors.imageUrl}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="pf-price" className="form-label">Price (₹) *</label>
              <input
                id="pf-price"
                type="number"
                min="1"
                max="999999"
                step="1"
                className={`form-input${errors.price ? " input-error" : ""}`}
                value={form.price}
                onChange={set("price")}
                placeholder="e.g. 450"
                aria-invalid={!!errors.price}
                aria-describedby={errors.price ? "pf-price-err" : undefined}
              />
              {errors.price && <span id="pf-price-err" className="field-error" role="alert">{errors.price}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="pf-qty" className="form-label">Quantity *</label>
              <input
                id="pf-qty"
                type="number"
                min="0"
                max="9999"
                step="1"
                className={`form-input${errors.quantity ? " input-error" : ""}`}
                value={form.quantity}
                onChange={set("quantity")}
                placeholder="e.g. 5"
                aria-invalid={!!errors.quantity}
                aria-describedby={errors.quantity ? "pf-qty-err" : undefined}
              />
              {errors.quantity && <span id="pf-qty-err" className="field-error" role="alert">{errors.quantity}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="pf-category" className="form-label">Category *</label>
            <select id="pf-category" className="form-input form-select" value={form.category} onChange={set("category")}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {saveError && <p className="form-error" role="alert">{saveError}</p>}

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Saving…" : isEdit ? "Save changes" : "List product"}
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => navigate("/seller/dashboard")} disabled={saving}>Cancel</button>
          </div>
        </form>

        {imagePreview && (
          <div className="product-form-preview">
            <p className="form-label">Image preview</p>
            <img
              src={imagePreview}
              alt={form.name ? `Preview of ${form.name}` : "Product image preview"}
              className="preview-img"
              onError={(e) => { e.target.style.display = "none"; }}
              onLoad={(e) => { e.target.style.display = "block"; }}
            />
          </div>
        )}
      </div>
    </main>
  );
}
