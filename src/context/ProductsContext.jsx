import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  subscribeToProducts,
  addProductFs,
  setProductFs,
  updateProductFs,
  deleteProductFs,
  deductStockFs,
} from "../data/firestore";
import { LOW_STOCK_THRESHOLD } from "../data/seed";

const ProductsContext = createContext(null);

// Firestore writes wait for the server forever when the browser can't reach it.
// Fail after a timeout so the UI can show a useful message instead of "Saving…".
function withTimeout(promise, ms = 15000) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => {
      const err = new Error("Could not reach the database.");
      err.code = "timeout";
      reject(err);
    }, ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = subscribeToProducts(
      (data) => {
        setProducts(data);
        setError("");
        setLoading(false);
      },
      (err) => {
        setError(
          err?.code === "permission-denied"
            ? "Database access denied. Deploy firestore.rules (or set the rules in the Firebase console)."
            : `Could not load products (${err?.code || err?.message || "unknown error"}).`
        );
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const addProductCtx = useCallback(async (product) => {
    await withTimeout(addProductFs(product));
  }, []);

  const updateProductCtx = useCallback(async (updated) => {
    await withTimeout(setProductFs(updated));
  }, []);

  const deleteProductCtx = useCallback(async (id) => {
    await withTimeout(deleteProductFs(id));
  }, []);

  const deductStockCtx = useCallback(async (cartItems) => {
    return await withTimeout(deductStockFs(cartItems, LOW_STOCK_THRESHOLD));
  }, []);

  return (
    <ProductsContext.Provider
      value={{
        products,
        loading,
        error,
        addProduct: addProductCtx,
        updateProduct: updateProductCtx,
        deleteProduct: deleteProductCtx,
        deductStock: deductStockCtx,
      }}
    >
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts() {
  return useContext(ProductsContext);
}
