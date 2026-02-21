import React from "react";
import { Link } from "react-router-dom";
import "./Footer.css";

const Logo = () => (
  <div className="logo">
    <div className="logo-icon-wrapper">
      <span className="logo-icon-text">C</span>
    </div>
    <span className="logo-text">Custom Clearance</span>
  </div>
);

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-container">
        <div className="footer-grid">

          {/* --- Logo & Tagline --- */}
          <div className="footer-column">
            <Link to="/" aria-label="Home">
              <Logo />
            </Link>
            <p className="footer-tagline">
              Simplifying global trade, one shipment at a time.
            </p>
          </div>

          {/* --- Navigation Links --- */}
          <div className="footer-column">
            <h4 className="footer-heading">Navigation</h4>
            <ul className="footer-links">
              <li><a href="#how-it-works">How it Works</a></li>
              <li><a href="#features">Features</a></li>
              <li><a href="#reviews">Reviews</a></li>
            </ul>
          </div>

          {/* --- Contact Info --- */}
          <div className="footer-column">
            <h4 className="footer-heading">Contact</h4>
            <ul className="footer-links">
              <li><a href="https://github.com/Ankesh04">GitHub</a></li>
              <li><a href="#">Email</a></li>
              <li><a href="#">LinkedIn</a></li>
            </ul>
          </div>

          {/* --- Legal Section --- */}
          <div className="footer-column">
            <h4 className="footer-heading">Legal</h4>
            <ul className="footer-links">
              <li><a href="#privacy">Privacy Policy</a></li>
              <li><a href="#terms">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        {/* --- Bottom Bar --- */}
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Custom Clearance. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
