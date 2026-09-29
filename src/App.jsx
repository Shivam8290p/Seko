import React, { useCallback, lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import { ProductsProvider, useProducts } from "./context/ProductsContext";
import { CartProvider } from "./context/CartContext";

import { RequireAuth, RequireGuest } from "./components/Guards";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import LoginPage from "./pages/LoginPage";
import BrowsePage from "./pages/BrowsePage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CartPage from "./pages/CartPage";
import PrivacyPage from "./pages/PrivacyPage";
import TermsPage from "./pages/TermsPage";
import NotFoundPage from "./pages/NotFoundPage";

const SellerDashboard = lazy(() => import("./pages/SellerDashboard"));
const ProductFormPage = lazy(() => import("./pages/ProductFormPage"));

function SellerFallback() {
  return (
    <main className="page container">
      <div className="empty-state"><p>Loading…</p></div>
    </main>
  );
}

function AppRoutes() {
  const { products } = useProducts();

  const getProduct = useCallback(
    (id) => products.find((p) => p.id === id) ?? null,
    [products]
  );

  return (
    <CartProvider getProduct={getProduct}>
      <Navbar />
      <Routes>
        {/* Fully public — no auth required */}
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />

        {/* Public auth page */}
        <Route
          path="/login"
          element={
            <RequireGuest>
              <LoginPage />
            </RequireGuest>
          }
        />

        {/* User routes */}
        <Route
          path="/"
          element={
            <RequireAuth role="user">
              <BrowsePage />
            </RequireAuth>
          }
        />
        <Route
          path="/browse"
          element={
            <RequireAuth role="user">
              <BrowsePage />
            </RequireAuth>
          }
        />
        <Route
          path="/product/:id"
          element={
            <RequireAuth role="user">
              <ProductDetailPage />
            </RequireAuth>
          }
        />
        <Route
          path="/cart"
          element={
            <RequireAuth role="user">
              <CartPage />
            </RequireAuth>
          }
        />

        {/* Seller routes — lazy loaded */}
        <Route
          path="/seller/dashboard"
          element={
            <RequireAuth role="seller">
              <Suspense fallback={<SellerFallback />}>
                <SellerDashboard />
              </Suspense>
            </RequireAuth>
          }
        />
        <Route
          path="/seller/product/new"
          element={
            <RequireAuth role="seller">
              <Suspense fallback={<SellerFallback />}>
                <ProductFormPage />
              </Suspense>
            </RequireAuth>
          }
        />
        <Route
          path="/seller/product/:id/edit"
          element={
            <RequireAuth role="seller">
              <Suspense fallback={<SellerFallback />}>
                <ProductFormPage />
              </Suspense>
            </RequireAuth>
          }
        />

        {/* Real 404 — no silent redirect to /login */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Footer />
    </CartProvider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ProductsProvider>
          <AppRoutes />
        </ProductsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
