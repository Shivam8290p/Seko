import {
  collection,
  doc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  runTransaction,
} from "firebase/firestore";
import { db } from "../firebase";

const PRODUCTS_COL = "products";

export function subscribeToProducts(onData, onError) {
  const q = query(collection(db, PRODUCTS_COL), orderBy("name"));
  return onSnapshot(
    q,
    (snapshot) => {
      const products = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      onData(products);
    },
    (err) => {
      console.error("Firestore products listener failed:", err);
      onError?.(err);
    }
  );
}

export async function fetchProducts() {
  const snapshot = await getDocs(collection(db, PRODUCTS_COL));
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function addProductFs(productData) {
  const { id: _unused, ...data } = productData;
  const ref = await addDoc(collection(db, PRODUCTS_COL), data);
  return ref.id;
}

export async function setProductFs(product) {
  const { id, ...data } = product;
  await setDoc(doc(db, PRODUCTS_COL, id), data);
}

export async function updateProductFs(product) {
  const { id, ...data } = product;
  await updateDoc(doc(db, PRODUCTS_COL, id), data);
}

export async function deleteProductFs(id) {
  await deleteDoc(doc(db, PRODUCTS_COL, id));
}

export async function deductStockFs(cartItems, LOW_STOCK_THRESHOLD) {
  const warned = [];

  await runTransaction(db, async (txn) => {
    const refs = cartItems.map(({ productId }) =>
      doc(db, PRODUCTS_COL, productId)
    );
    const snaps = await Promise.all(refs.map((r) => txn.get(r)));

    for (let i = 0; i < cartItems.length; i++) {
      const { productId, quantity } = cartItems[i];
      const snap = snaps[i];
      if (!snap.exists()) {
        throw new Error(`Product ${productId} no longer exists.`);
      }
      const available = snap.data().quantity ?? 0;
      if (available < quantity) {
        const name = snap.data().name ?? productId;
        throw new Error(
          `"${name}" only has ${available} unit${available !== 1 ? "s" : ""} left. Please update your cart and try again.`
        );
      }
    }

    for (let i = 0; i < cartItems.length; i++) {
      const { productId, quantity } = cartItems[i];
      const snap = snaps[i];
      const prevQty = snap.data().quantity;
      const newQty = prevQty - quantity;

      if (newQty <= LOW_STOCK_THRESHOLD && prevQty > LOW_STOCK_THRESHOLD) {
        warned.push(snap.data().name);
      }

      txn.update(refs[i], { quantity: newQty });
    }
  });

  return warned;
}
