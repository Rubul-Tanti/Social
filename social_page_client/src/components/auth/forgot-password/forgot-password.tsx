import { useState } from "react";
import "./fp.styles.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
  };

  return (
    <div className="fp-root">
      <div className="fp-card">

        {!submitted ? (
          <>
            <div className="fp-card-icon">
              <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
                <rect x="2" y="6" width="18" height="13" rx="2" stroke="#d97706" strokeWidth="1.5"/>
                <path d="M2 9l9 5 9-5" stroke="#d97706" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>

            <div className="fp-card-header">
              <div className="fp-card-eyebrow">Account Recovery · Step 1 of 3</div>
              <h1 className="fp-card-title">Forgot your password?</h1>
              <p className="fp-card-sub">
                Enter the email linked to your account and we'll send a reset link.
              </p>
            </div>

            <div className="fp-notice">
              <svg className="fp-notice-icon" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.4"/>
                <path d="M8 5v3.5M8 10.5v.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
              <span className="fp-notice-text">
                The reset link expires in <strong>5 minutes</strong> and can only be used once.
              </span>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="fp-field">
                <label htmlFor="email" className="fp-label">Email address</label>
                <input
                  id="email"
                  type="email"
                  className="fp-input"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  autoFocus
                />
              </div>

              <button type="submit" className="fp-btn" disabled={!email}>
                Send reset link →
              </button>
            </form>

            <div className="fp-card-divider" />

            <a href="/signin" className="fp-back">
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                <path d="M9 3L5 7L9 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Back to sign in
            </a>
          </>
        ) : (
          <>
            <div className="fp-card-icon success">
              <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
                <path d="M4 11L9 16L18 7" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>

            <div className="fp-card-header">
              <div className="fp-card-eyebrow">Account Recovery · Step 2 of 3</div>
              <h1 className="fp-card-title">Check your inbox</h1>
              <p className="fp-card-sub">
                We've sent a reset link to <strong>{email}</strong>.
              </p>
            </div>

            <div className="fp-success-box">
              <div className="fp-success-box-icon">
                <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
                  <path d="M2 5L4 7L8 3" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="fp-success-box-text">
                <strong>Email sent successfully</strong>
                Click the link in the email to set a new password. Check your spam folder if you don't see it.
              </div>
            </div>

            <div className="fp-expiry">
              <div className="fp-expiry-dot" />
              Link expires in 15 minutes
            </div>

            <button
              className="fp-retry-btn"
              onClick={() => { setSubmitted(false); setEmail(""); }}
            >
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                <path d="M2 7a5 5 0 1 0 1-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                <path d="M3 4H1V2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Try a different email
            </button>

            <a href="/signin" className="fp-back">
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                <path d="M9 3L5 7L9 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Back to sign in
            </a>
          </>
        )}

      </div>
    </div>
  );
}