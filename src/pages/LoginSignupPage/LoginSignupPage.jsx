import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginSignupPage.css";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
  GoogleAuthProvider,
} from "firebase/auth";
import { auth, googleProvider } from "../../firebaseConfig";
import { useAuth } from "../../context/AuthContext";

// --- Icons ---
const GoogleIcon = () => (
  <svg className="icon" viewBox="0 0 24 24" fill="currentColor">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

const EyeIcon = ({ slashed = false }) => (
  <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    {slashed ? (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.262-3.262m12.022 3.262a9.97 9.97 0 01-1.563 3.029m0 0A10.055 10.055 0 0112 19c-2.25 0-4.303-.88-5.858-2.288m11.716-4.432a9.97 9.97 0 00-1.563-3.029m-5.858-.908a3 3 0 00-4.243-4.243m4.242 4.242L9.88 9.88"
      />
    ) : (
      <>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
        />
      </>
    )}
  </svg>
);

const LockIcon = () => (
  <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
    />
  </svg>
);

const LoginSignupPage = () => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullname, setFullname] = useState("");
  const [message, setMessage] = useState("");

  const navigate = useNavigate();
  const { user } = useAuth();

  // Detect mode from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const mode = params.get("mode");
    if (mode === "signup") setIsLoginView(false);
  }, []);

  // Redirect logged-in users
  useEffect(() => {
    if (user) {
      navigate("/tradelane");
    }
  }, [user, navigate]);

  const toggleView = () => setIsLoginView(!isLoginView);
  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  // CRITICAL: Force Google to always ask for account + fetch fresh photo
  useEffect(() => {
    googleProvider.setCustomParameters({
      prompt: "select_account",
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      if (isLoginView) {
        await signInWithEmailAndPassword(auth, email, password);
        setMessage("Login successful!");
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const newUser = userCredential.user;

        // Update profile with displayName
        if (fullname.trim()) {
          await updateProfile(newUser, {
            displayName: fullname,
          });
        }

        setMessage("Account created successfully!");
        navigate("/login");
      }
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  };

  const handleGoogleLogin = async () => {
    setMessage("");
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await result.user.getIdToken(true);
      const user = result.user;

      // Force refresh token to ensure photoURL is latest
      await user.getIdToken(true);

      setMessage("Logged in with Google!");
      navigate("/tradelane");
    } catch (error) {
      setMessage(`Google Login Failed: ${error.message}`);
    }
  };

  return (
    <div className="login-page-container">
      <div className="login-card">
        {/* --- Left Visual Side --- */}
        <div className="visual-side">
          <div className="visual-side-content">
            <h1>Simplifying Global Trade</h1>
            <p>Intelligent Customs Clearance at Your Fingertips.</p>
          </div>
          <img
            src="/src/assets/images/login-background.png"
            alt="Global logistics illustration"
            className="visual-side-bg-image"
          />
        </div>

        {/* --- Right Form Side --- */}
        <div className="form-side">
          <div className="form-wrapper">
            <h2 className="form-title">
              {isLoginView ? "Welcome Back!" : "Create an Account"}
            </h2>
            <p className="form-subtitle">
              {isLoginView
                ? "Login to access your dashboard"
                : "Join us to streamline your customs process"}
            </p>

            <form className="auth-form" onSubmit={handleSubmit}>
              {!isLoginView && (
                <div className="input-group">
                  <label htmlFor="fullname">Full Name</label>
                  <input
                    type="text"
                    id="fullname"
                    placeholder="John Doe"
                    value={fullname}
                    onChange={(e) => setFullname(e.target.value)}
                    required
                  />
                </div>
              )}

              <div className="input-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="input-group">
                <label htmlFor="password">Password</label>
                <div className="password-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="password-toggle-btn"
                  >
                    <EyeIcon slashed={showPassword} />
                  </button>
                </div>
              </div>

              {isLoginView && (
                <a href="#" className="forgot-password-link">
                  Forgot Password?
                </a>
              )}

              <button type="submit" className="cta-button">
                {isLoginView ? "Login" : "Create Account"}
              </button>
            </form>

            {message && <p className="feedback-message">{message}</p>}

            <div className="social-login-divider">
              <span>or continue with</span>
            </div>

            <button className="social-login-btn" onClick={handleGoogleLogin}>
              <GoogleIcon />
              Continue with Google
            </button>

            <p className="toggle-view-text">
              {isLoginView ? "Don't have an account?" : "Already have an account?"}
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  toggleView();
                }}
              >
                {isLoginView ? " Sign Up" : " Login"}
              </a>
            </p>

            <div className="trust-signal">
              <LockIcon />
              <span>Your information is securely encrypted.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


export default LoginSignupPage;