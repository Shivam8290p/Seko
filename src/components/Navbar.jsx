import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function Navbar() {
  const { session, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="navbar">
      <div className="navbar-inner container">
        <Link to={session?.role === "seller" ? "/seller/dashboard" : "/"} className="navbar-brand">
          Seko
        </Link>

        {session && (
          <nav className="navbar-nav">
            {session.role === "user" && (
              <>
                <Link to="/" className="nav-link">Browse</Link>
                <Link to="/cart" className="nav-link nav-cart">
                  Cart
                  {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                </Link>
              </>
            )}
            {session.role === "seller" && (
              <>
                <Link to="/seller/dashboard" className="nav-link">Dashboard</Link>
                <Link to="/seller/product/new" className="nav-link">+ Add Product</Link>
              </>
            )}
            <span className="nav-user">{session.name}</span>
            <button className="btn btn-ghost btn-sm" onClick={handleLogout}>Log out</button>
          </nav>
        )}
      </div>
    </header>
  );
}
