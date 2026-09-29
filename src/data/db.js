import { SEED_PRODUCTS } from "./seed";

function safeParse(raw, fallback) {
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch (err) {
    console.error("Corrupted localStorage value, resetting:", err);
    return fallback;
  }
}

const PRODUCTS_KEY = "seko_products";
const CART_KEY     = "seko_cart";
const SESSION_KEY  = "seko_session";
const VERSION_KEY  = "seko_data_version";

const DATA_VERSION = "2";

export function initProducts() {
  const storedVersion = localStorage.getItem(VERSION_KEY);
  if (storedVersion !== DATA_VERSION) {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(SEED_PRODUCTS));
    localStorage.setItem(VERSION_KEY, DATA_VERSION);
    return;
  }
  const raw = localStorage.getItem(PRODUCTS_KEY);
  if (!raw) {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(SEED_PRODUCTS));
  }
}

export function getProducts() {
  return safeParse(localStorage.getItem(PRODUCTS_KEY), []);
}

export function getProductById(id) {
  return getProducts().find((p) => p.id === id) || null;
}

export function saveProducts(products) {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
}

export function addProduct(product) {
  const products = getProducts();
  products.push(product);
  saveProducts(products);
}

export function updateProduct(updated) {
  const products = getProducts().map((p) => (p.id === updated.id ? updated : p));
  saveProducts(products);
}

export function deleteProduct(id) {
  const products = getProducts().filter((p) => p.id !== id);
  saveProducts(products);
}

export function getCart() {
  return safeParse(localStorage.getItem(CART_KEY), []);
}

export function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

export function clearCart() {
  localStorage.removeItem(CART_KEY);
}

export function getSession() {
  return safeParse(localStorage.getItem(SESSION_KEY), null);
}

export function saveSession(session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}
