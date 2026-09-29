# Seko — Campus Marketplace

A React + Firebase campus marketplace for students to buy and sell second-hand books, electronics, lab equipment, and more.

## Tech stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + React Router 7 |
| Build | Vite 8 |
| Database | Cloud Firestore (real-time) |
| Hosting | Firebase Hosting (recommended) |
| Styling | Vanilla CSS with design tokens |

## Setup

### 1. Firebase project

1. Go to [Firebase Console](https://console.firebase.google.com/) and create a project.
2. Add a Web app and copy the config values.
3. Create a **Firestore database** in **Production mode** (not test mode).
4. Deploy the Firestore rules: `firebase deploy --only firestore:rules`
5. Restrict the API key to your hosting domain in [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials).

### 2. Environment variables

```bash
cp .env.example .env
```

Fill in your Firebase values in `.env`. **Never commit `.env` to version control.**

### 3. Development

```bash
npm install
npm run dev
```

### 4. Production deploy

```bash
npm run build
firebase deploy
```

Replace `YOUR_DOMAIN` in `public/robots.txt`, `public/sitemap.xml`, and `index.html` with your actual hosting domain before deploying.

## Demo credentials

| Role | Email | Password |
|------|-------|----------|
| Student | `student@seko.app` | `demo123` |
| Seller | `seller@seko.app` | `sell123` |

> **Note:** Authentication is demo-only (localStorage). Integrate Firebase Authentication before real production use — see the commented-out rules in `firestore.rules`.

## Security notes

- Stock deduction uses a Firestore **transaction** to prevent concurrent buyers from overselling.
- Firebase config is loaded from `VITE_FIREBASE_*` environment variables.
- See `firestore.rules` for the current rules and the production-ready rules to enable once Firebase Auth is integrated.

## Project structure

```
src/
  components/    # Navbar, Footer, ProductCard, Toast, Guards
  context/       # AuthContext, CartContext, ProductsContext
  data/          # firestore.js (Firestore layer), db.js (localStorage helpers), seed.js
  pages/         # BrowsePage, CartPage, LoginPage, ProductDetailPage,
                 # ProductFormPage, SellerDashboard, PrivacyPage, TermsPage, NotFoundPage
  firebase.js    # Firebase init (reads VITE_FIREBASE_* env vars)
  App.jsx        # Routes
  index.css      # Design system + component styles
public/
  og-image.jpg   # Social preview (1200×630)
  robots.txt
  sitemap.xml
firestore.rules  # Firestore security rules
firebase.json    # Firebase Hosting config (SPA rewrites + security headers)
.env.example     # Environment variable template
```
