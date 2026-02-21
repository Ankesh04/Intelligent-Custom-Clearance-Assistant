// src/components/Sidebar/Sidebar.jsx
import React, { useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Sidebar.css";
import "../../pages/Dashboard/DashboardPage.css";

/* ── Icon ───────────────────────────────────── */
const Icon = ({ path }) => (
  <svg className="icon1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={path} />
  </svg>
);

/* ── Logo ───────────────────────────────────── */
const Logo = () => {
  const navigate = useNavigate();
  return (
    <div className="logo1" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
      <div className="logo-circle1"><span>C</span></div>
      <span className="logo-text1">Custom Clearance</span>
    </div>
  );
};

/* ── User Section ───────────────────────────── */
const UserSection = ({ user, onLogout }) => (
  <div className="user-section1">
    <img
      src={user.photoURL || "https://placehold.co/40x40"}
      alt="User"
      className="avatar1"
    />
    <div className="user-details1">
      <strong>{user.displayName || "User"}</strong>
      <small>{user.email}</small>
    </div>
    <button className="logout-btn1" onClick={onLogout}>Logout</button>
  </div>
);

/* ── Sidebar ────────────────────────────────── */
const Sidebar = ({ isMobile = false, isOpen = false, onToggle = () => {} }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const menuRef = useRef(null);               // reference to the drawer
  const buttonRef = useRef(null);             // reference to the hamburger button

  /* ── Click-outside handler ───────────────── */
  useEffect(() => {
    if (!isMobile || !isOpen) return;

    const handleClickOutside = (e) => {
      // ignore clicks on the button or inside the drawer
      if (
        (buttonRef.current && buttonRef.current.contains(e.target)) ||
        (menuRef.current && menuRef.current.contains(e.target))
      ) {
        return;
      }
      onToggle(); // close
    };

    // capture phase so overlay clicks register before any inner elements
    document.addEventListener("mousedown", handleClickOutside, true);
    return () => document.removeEventListener("mousedown", handleClickOutside, true);
  }, [isMobile, isOpen, onToggle]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
      if (isMobile) onToggle();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (!user) return null;

  const navItems = [
    {
      to: "/tradelane",
      label: "Dashboard",
      icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3",
    },
    {
      to: "/dashboard/documents",
      label: "Documents",
      icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414",
    },
    {
      to: "/ai-assistant",
      label: "AI Assistant",
      icon: "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8",
    },
  ];

  const sidebarContent = (
    <>
      <div className="sidebar-top1"><Logo /></div>

      <nav className="nav1">
        {navItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={`nav-item1 ${location.pathname === item.to ? "active1" : ""}`}
            onClick={isMobile ? onToggle : undefined}
          >
            <Icon path={item.icon} />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <UserSection user={user} onLogout={handleLogout} />
    </>
  );

  /* ── Mobile Hamburger ─────────────────────── */
  if (isMobile) {
    return (
      <div className={`hamburger-menu1 ${isOpen ? "open1" : ""}`}>
        <button ref={buttonRef} className="hamburger-btn1" onClick={onToggle}>
          <Icon path={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
        </button>

        {isOpen && (
          <div ref={menuRef} className="menu-content1">
            {sidebarContent}
          </div>
        )}
      </div>
    );
  }

  /* ── Desktop Fixed Sidebar ────────────────── */
  return <aside className="sidebar1">{sidebarContent}</aside>;
};

export default Sidebar;