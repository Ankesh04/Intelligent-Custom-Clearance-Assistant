// src/pages/Dashboard/DashboardPage.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // <-- useNavigate added
import { useAuth } from "../../context/AuthContext";
import TradeLane from "./TradeLane";
import "./DashboardPage.css";

// ── Icon ─────────────────────────────────────
const Icon = ({ path }) => (
  <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d={path}
    />
  </svg>
);

// ── Logo ─────────────────────────────────────
const Logo = () => {
  const navigate = useNavigate();
  return (
    <div
      className="logo"
      onClick={() => navigate("/")}
      style={{ cursor: "pointer" }}
    >
      <div className="logo-circle">
        <span>C</span>
      </div>
      <span className="logo-text">Custom Clearance</span>
    </div>
  );
};

// ── User Dropdown ────────────────────────────
const UserDropdown = ({ user, onLogout }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="user-dropdown1">
      <img
        src={user.photoURL || "https://placehold.co/40x40"}
        alt="User"
        className="avatar"
        onClick={() => setOpen(!open)}
      />
      {open && (
        <div className="dropdown-menu">
          <div className="user-info">
            <strong>{user.displayName || "User"}</strong>
            <small>{user.email}</small>
          </div>
          <button className="logout-btn" onClick={onLogout}>
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

// ── Dashboard ─────────────────────────────────
const DashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showTradeLane, setShowTradeLane] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Show login prompt
  if (!user) {
    return (
      <div className="dashboard">
        <aside className="sidebar">
          <div className="sidebar-top">
            <Logo />
          </div>
          <nav className="nav">
            <Link to="/dashboard" className="nav-item active">
              <Icon path="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3" />
              <span>Dashboard</span>
            </Link>
          </nav>
        </aside>
        <main className="main" style={{ padding: "2rem", textAlign: "center" }}>
          <p>
            Please <Link to="/login">log in</Link> to use the dashboard.
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* ── Sidebar ── */}
      <aside className="sidebar">
        <div className="sidebar-top">
          <Logo />
        </div>
        <nav className="nav">
          <Link to="/dashboard" className="nav-item active">
            <Icon path="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3" />
            <span>Dashboard</span>
          </Link>

          {/* Documents Section with Submenu */}
          <div className="nav-group">
            <Link to="/dashboard/documents" className="nav-item active">
              <Icon path="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414" />
              <span>Documents</span>
            </Link>
          </div>

          <Link to="/ai-assistant" className="nav-item active">
            <Icon path="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8" />
            <span>AI Assistant</span>
          </Link>
        </nav>
      </aside>
      {/* ── Main ── */}
      <main className="main">
        <header className="header">
          <h1>Customs Clearance Wizard</h1>
          <UserDropdown user={user} onLogout={handleLogout} />
        </header>

        {/* Trade-Lane Feature */}
        <TradeLane
          showWizard={showTradeLane}
          onToggleWizard={() => setShowTradeLane(!showTradeLane)}
        />

        {/* Quick Widgets */}
        <div className="widgets">
          <div className="widget">
            <h4>Recent Documents</h4>
            <ul>
              <li>
                <span className="status ok">OK</span> Invoice.pdf
              </li>
              <li>
                <span className="status err">Error</span> Packing.docx
              </li>
            </ul>
          </div>
          <div className="widget ai">
            <h4>Ask AI</h4>
            <p>"EU food export rules?"</p>
            <Link to="/ai-assistant" className="btn-green small">
              Chat Now
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
