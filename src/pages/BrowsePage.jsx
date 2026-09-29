import React, { useState, useMemo } from "react";
import { useProducts } from "../context/ProductsContext";
import ProductCard from "../components/ProductCard";
import { CATEGORIES } from "../data/seed";

export default function BrowsePage() {
  const { products, loading, error } = useProducts();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      const matchesQuery =
        !q ||
        (p.name ?? "").toLowerCase().includes(q) ||
        (p.description ?? "").toLowerCase().includes(q);
      const matchesCat = category === "All" || p.category === category;
      return matchesQuery && matchesCat;
    });
  }, [products, query, category]);

  return (
    <main className="page container">
      <div className="browse-header">
        <h2 className="page-title">Marketplace</h2>
        <p className="page-subtitle">
          {loading ? "Loading…" : `${filtered.length} item${filtered.length !== 1 ? "s" : ""} available`}
        </p>
      </div>

      <div className="browse-filters">
        <div className="search-wrap">
          <svg className="search-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <circle cx="8.5" cy="8.5" r="5.5" />
            <path d="M14 14l3.5 3.5" strokeLinecap="round" />
          </svg>
          <input
            id="browse-search"
            type="search"
            className="form-input search-input"
            placeholder="Search products…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search products"
          />
        </div>

        <div className="filter-chips" role="group" aria-label="Category filter">
          {["All", ...CATEGORIES].map((cat) => (
            <button
              key={cat}
              className={`chip${category === cat ? " chip-active" : ""}`}
              onClick={() => setCategory(cat)}
              aria-pressed={category === cat}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="form-error" role="alert">{error}</p>}

      {!loading && filtered.length === 0 ? (
        <div className="empty-state">
          <p>{products.length === 0 ? "No products have been listed yet." : "No products match your filters."}</p>
          <button className="btn btn-ghost btn-sm" onClick={() => { setQuery(""); setCategory("All"); }}>
            Clear filters
          </button>
        </div>
      ) : (
        <div className="product-grid">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </main>
  );
}
