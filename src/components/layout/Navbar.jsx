import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Navbar.css";

const Logo = () => (
  <div className="logo">
    <div className="logo-icon-wrapper">
      <span className="logo-icon-text">C</span>
    </div>
    <span className="logo-text">Custom Clearance</span>
  </div>
);

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleNavigate = (path) => {
    setMenuOpen(false);
    navigate(path);
  };

  const handleLogout = async () => {
    await logout();
    setDropdownOpen(false);
    setMenuOpen(false);
    navigate("/login");
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="site-header">
      <div className="header-container">
        {/* Logo */}
        <Link to="/" aria-label="Home" className="logo-link">
          <Logo />
        </Link>

        {/* Mobile Menu Toggle */}
        <button
          className="menu-toggle"
          aria-label="Toggle navigation"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ☰
        </button>

        {/* Desktop Nav & Actions */}
        <div className="desktop-nav">
          <nav className="header-nav">
            <a href="#how-it-works">How it Works</a>
            <a href="#reviews">Reviews</a>
            <a href="#countries">Countries</a>
            <a href="tradelane">Dashboard</a>
          </nav>

          {!user ? (
            <div id="buton" className="header-actions">
              <button
                className="btn-ghost"
                onClick={() => handleNavigate("/login")}
              >
                Login
              </button>
              <button
                className="btn-accent"
                onClick={() => handleNavigate("/login?mode=signup")}
              >
                Get Started
              </button>
            </div>
          ) : (
            <div className="user-menu">
              <button
                className="avatar-btn"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                aria-label="User menu"
              >
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt="User"
                    className="avatar-img"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextElementSibling.style.display = "flex";
                    }}
                  />
                ) : null}
                <div
                  className="avatar-text"
                  style={{ display: user.photoURL ? "none" : "flex" }}
                >
                  {(user.displayName || user.email || "U")
                    .charAt(0)
                    .toUpperCase()}
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Mobile Menu (Hamburger) */}
        <div className={`mobile-menu ${menuOpen ? "active" : ""}`}>
          {/* Nav Links */}
          <a href="#how-it-works" onClick={() => setMenuOpen(false)}>
            How it Works
          </a>
          <a href="#reviews" onClick={() => setMenuOpen(false)}>
            Reviews
          </a>
          <a href="#countries" onClick={() => setMenuOpen(false)}>
            Countries
          </a>
          <a href="/tradelane" onClick={() => setMenuOpen(false)}>
            Dashboard
          </a>

          {/* Auth Buttons or User Menu */}
          {!user ? (
            <>
              <button
                className="btn-ghost mobile-btn"
                onClick={() => handleNavigate("/login")}
              >
                Login
              </button>
              <button
                className="btn-accent mobile-btn"
                onClick={() => handleNavigate("/login?mode=signup")}
              >
                Get Started
              </button>
            </>
          ) : (
            <div className="mobile-user-section">
              {/* Avatar */}
              <div className="mobile-avatar">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="User" className="avatar-img" />
                ) : (
                  <div className="avatar-text">
                    {(user.displayName || user.email || "U")
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                )}
              </div>

              {/* User Info */}
              <p className="mobile-user-name">{user.displayName || "User"}</p>
              <p className="mobile-user-email">{user.email}</p>

              {/* Logout */}
              <button
                className="logout-btn mobile-logout"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          )}
        </div>
        {/* Dropdown (Desktop Only) */}
        {dropdownOpen && user && (
          <div className="user-dropdown" ref={dropdownRef}>
            <p className="user-name">{user.displayName || "User"}</p>
            <p className="user-email">{user.email}</p>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
