import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
// src/components/layout/PageLayout.jsx
import { useAuth } from "../../context/AuthContext";
import Navbar from "./Navbar";
import Footer from "./Footer";
import "./PageLayout.css";


const StarIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="currentColor"
    viewBox="0 0 20 20"
    className="star-icon"
  >
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.966a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.966c.3.921-.755 1.688-1.54 1.118l-3.38-2.455a1 1 0 00-1.175 0l-3.38 2.455c-.785.57-1.84-.197-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.05 9.393c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.286-3.966z" />
  </svg>
);

export default function PageLayout() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleNavigate = (path) => {
    navigate(path);
  };
  // SCROLL ANIMATION OBSERVER
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            // Optional: Stop observing after animation
            // observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.15, // Trigger when 15% of element is visible
        rootMargin: "0px 0px -50px 0px", // Trigger a bit early
      }
    );

    // Observe all elements with animate-on-scroll
    document.querySelectorAll(".animate-on-scroll").forEach((el) => {
      observer.observe(el);
    });

    // Cleanup
    return () => observer.disconnect();
  }, []);

  return (
    <div  className="page-wrapper">
      <Navbar />
      <main>
        {/* --- Hero Section --- */}
        <section id="heros" className="hero-section">
          <div className="glow glow-accent"></div>
          <div className="glow glow-primary"></div>

          <div className="hero-grid">
            <div className="hero-content">
              <span className="pill-trust fade-in-up">
                Trusted by shippers worldwide
              </span>

              <h1
                className="hero-title fade-in-up"
                style={{ animationDelay: "0.2s" }}
              >
                The Smartest Way to Clear Customs
              </h1>

              <p
                className="hero-subtitle fade-in-up"
                style={{ animationDelay: "0.4s" }}
              >
                Verify documents, book appointments, and track your goods with
                our intelligent AI Assistant.
              </p>

              <div
                className="hero-actions fade-in-up"
                style={{ animationDelay: "0.6s" }}
              >
                <button
                  className="btn-accent-gradient"
                  onClick={() => handleNavigate("/login?mode=signup")}
                >
                  Get Started
                </button>
                <button
                  className="btn-ghost"
                  onClick={() => handleNavigate("/about")}
                >
                  Learn More
                </button>
              </div>

              <div
                className="hero-stats fade-in-up"
                style={{ animationDelay: "0.8s" }}
              >
                <div className="pill-stat">
                  <strong>99.9%</strong> Verification accuracy
                </div>
                <div className="pill-stat">
                  <strong>24/7</strong> AI guidance
                </div>
              </div>
            </div>

            <div
              className="hero-image-container fade-in-up"
              style={{ animationDelay: "0.5s" }}
            >
              <img
                src="/src/assets/images/login-background.png"
                alt="Trucks at a shipping port"
                className="hero-image"
              />
            </div>
          </div>
        </section>

        {/* --- How It Works Section --- */}
        <section
          id="how-it-works"
          className="section section-white glow-accent"
        >
          <div className="section-container text-center">
            <h2 className="section-title animate-on-scroll">How it Works</h2>

            <div className="video-container animate-on-scroll">
              <video autoPlay muted loop playsInline>
                <source src="/hiw_video.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>

            <div className="features-grid">
              {/* Card 1 */}
              <div
                className="card-feature animate-on-scroll"
                style={{ animationDelay: "0.1s" }}
              >
                <div className="icon-chip">
                  <svg
                    className="icon"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 2a7 7 0 00-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 00-7-7z M12 12a2 2 0 100-4 2 2 0 000 4z"
                    />
                  </svg>
                </div>
                <h3 className="card-title">Trade Lane</h3>
                <p>
                  Define From → To → Product → Get docs, HS codes & duties
                  instantly.
                </p>
              </div>

              {/* Card 2 */}
              <div
                className="card-feature animate-on-scroll"
                style={{ animationDelay: "0.2s" }}
              >
                <div className="icon-chip">
                  <svg
                    className="icon"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                    />
                  </svg>
                </div>
                <h3 className="card-title">Upload & Verify</h3>
                <p>
                  Upload documents and let our system validate them instantly.
                </p>
              </div>

              {/* Card 3 */}
              <div
                className="card-feature animate-on-scroll"
                style={{ animationDelay: "0.3s" }}
              >
                <div className="icon-chip">
                  <svg
                    className="icon"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                </div>
                <h3 className="card-title">Get AI Guidance</h3>
                <p>
                  Receive AI-backed guidance on regulations and requirements.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* --- Testimonials Section --- */}
        <section id="reviews" className="section section-testimonials">
          <div className="section-container">
            <h2 className="section-title animate-on-scroll">
              What Our Customers Say
            </h2>

            <div className="testimonials-grid">
              {[
                {
                  name: "Amara S.",
                  title: "Logistics Manager",
                  text: "Cut our clearance time by 50%. A game changer for our logistics.",
                  avatar: "A",
                },
                {
                  name: "John M.",
                  title: "Import/Export Specialist",
                  text: "The AI document verification is instant and reliable. Highly recommended!",
                  avatar: "J",
                },
                {
                  name: "Sophia L.",
                  title: "Supply Chain Director",
                  text: "The AI assistant is a game changer. We love it.",
                  avatar: "S",
                },
              ].map((t, i) => (
                <div
                  className="card-testimonial animate-on-scroll"
                  key={i}
                  style={{ animationDelay: `${i * 0.15}s` }}
                >
                  <img
                    src={`https://placehold.co/64x64/EBF1F6/2D3A5D?text=${t.avatar}`}
                    alt={t.name}
                    className="testimonial-avatar"
                  />
                  <div className="testimonial-stars">
                    {[...Array(5)].map((_, j) => (
                      <StarIcon key={j} />
                    ))}
                  </div>
                  <p>"{t.text}"</p>
                  <h4 className="testimonial-name">{t.name}</h4>
                  <span className="testimonial-title">{t.title}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- Countries Section (India & Nepal) --- */}
        <section id="countries" className="section section-countries">
          <div className="countries-content">
            <h2 id="country1" className="section-title animate-on-scroll">
              Your Trade Partner
            </h2>

            <div className="country-pair">
              <div className="country-card animate-on-scroll">
                <div className="flag">India</div>
                <h3>India</h3>
                <p>500+ Monthly Shipments</p>
              </div>

              <div className="trade-arrow animate-on-scroll">→</div>

              <div className="country-card animate-on-scroll">
                <div className="flag">Nepal</div>
                <h3>Nepal</h3>
                <p>24-Hour Clearance</p>
              </div>

              <div className="trade-arrow animate-on-scroll">→</div>

              <div className="country-card animate-on-scroll">
                <div className="flag">China</div>
                <h3>China</h3>
                <p>Coming Soon</p>
              </div>

              <div className="trade-arrow animate-on-scroll">→</div>

              <div className="country-card animate-on-scroll">
                <div className="flag">Sri Lanka</div>
                <h3>Sri Lanka</h3>
                <p>Coming Soon</p>
              </div>
            </div>

            <button
              className="btn-start animate-on-scroll"
              onClick={() => handleNavigate("/login?mode=signup")}
            >
              Start Your Shipment
            </button>
          </div>
        </section>

        {/* --- CTA Section --- */}
        <section className="cta-section">
          <div className="cta-bg-overlay"></div>

          <div className="section-container text-center">
            <h2 className="section-title animate-on-scroll">
              Ready to clear customs faster?
            </h2>

            <p
              className="cta-subtitle animate-on-scroll"
              style={{ animationDelay: "0.2s" }}
            >
              Manage documents, AI Suggestions, and Know Terms & Conditions, all
              in one place.
            </p>

            <div
              className="cta-actions animate-on-scroll"
              style={{ animationDelay: "0.4s" }}
            >
              {/* Show only if NOT logged in */}
              {!user ? (
                <>
                  <button
                    className="btn-accent-gradient"
                    onClick={() => handleNavigate("/login?mode=signup")}
                  >
                    Create Account
                  </button>
                  <button
                    className="btn-ghost"
                    onClick={() => handleNavigate("/login")}
                  >
                    Login
                  </button>
                </>
              ) : (
                // Show only if logged in
                <button
                  className="btn-accent-gradient"
                  onClick={() => handleNavigate("/dashboard")}
                >
                  Get Started
                </button>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* --- Footer --- */}
      <Footer />
    </div>
  );
}
