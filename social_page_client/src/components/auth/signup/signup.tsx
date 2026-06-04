import { useUserContext } from "../../../contextProvider";
import { useGoogleLogin } from "@react-oauth/google";
import { Loader } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import InterestsIcon from '@mui/icons-material/Interests';
import { toast } from "react-toastify";
import { useAuthentication } from "../../../hooks/useAuthentication";
import { Link, useNavigate } from "react-router-dom";
import "./signup.styles.css";

export default function Register() {
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [form, setForm] = useState({ userName: "", email: "", password: "" });
  const [otpTimer, setOtpTimer] = useState(5 * 60);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { registerUserWithEmail: emailVerification, otpVerifation, registerWithGoogle } = useAuthentication();
  const { setUser } = useUserContext();
  const navigate = useNavigate();

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setOtpTimer(5 * 60);
    timerRef.current = setInterval(() => {
      setOtpTimer((prev) => {
        if (prev <= 1) { clearInterval(timerRef.current!); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const formatTimer = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const timerExpired = otpTimer === 0;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setLoading(true);
    emailVerification.mutate(form, {
      onSuccess: () => {
        toast("OTP has been sent to your email");
        setLoading(false);
        setStep(2);
        startTimer();
      },
      onError: (err: any) => {
        toast.error(err.response.data.message);
        setLoading(false);
      },
    });
  };

  const handleResend = (e: React.MouseEvent<HTMLButtonElement>) => {
    setOtp(["", "", "", "", "", ""]);
    handleSubmit(e);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(""));
      otpRefs.current[5]?.focus();
    }
  };

  const handleVerify = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (otp.join("").length < 6) return;
    setLoading(true);
    const otpString = otp.join("");
    otpVerifation.mutate({ ...form, otp: otpString }, {
      onSuccess: (v: any) => {
        const data = v.data.data;
        setUser({ role: data.role, userName: data.userName, email: data.email, profilePicture: data.profilePicture, isAuthenticated: true });
        localStorage.setItem("access_token", v.data.access_token);
        toast("User created successfully");
        setStep(3);
        navigate("/");
      },
      onError: (e: any) => { toast.error(e.message); },
    });
  };

  const handleGoogle = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      registerWithGoogle.mutate(tokenResponse.access_token, {
        onSuccess: (v: any) => {
          toast(v.data.message);
          localStorage.setItem("access_token", v.data.access_token);
          setUser({
            isAuthenticated: true,
            role: v.data.data.role,
            email: v.data.data.email,
            userName: v.data.data.userName,
            profilePicture: v.data.data.profilePicture,
          });
          navigate("/");
        },
        onError: (e: any) => {
          if (e.response) toast.error(e.response.data.message);
        },
      });
    },
    onError: () => console.log("Login Failed"),
  });

  const filledOtp = otp.every((d) => d !== "");

  const passwordStrength = (pw: string) => {
    if (!pw) return 0;
    let s = 0;
    if (pw.length >= 8) s++;
    if (/[A-Z]/.test(pw)) s++;
    if (/[0-9]/.test(pw)) s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    return s;
  };

  const strength = passwordStrength(form.password);
  const strengthColors = ["", "#ef4444", "#f97316", "#eab308", "#22c55e"];
  const strengthLabels = ["", "Weak", "Fair", "Good", "Strong"];

  const steps = [
    { n: 1, label: "Account" },
    { n: 2, label: "Verify" },
    { n: 3, label: "Done" },
  ];

  return (
    <div className="sl-root">
             <header className="container-custom " style={{ position:"absolute",top:"0px" }}>
        <h1 style={{ fontSize: "24px",width:"100%",padding:"10px" }}><Link to="/"><InterestsIcon />SOCIAL</Link></h1>

        </header>
      <div className="sl-card" key={step}>

        {/* Step Indicator */}
        <div className="sl-steps">
          {steps.map(({ n, label }, i) => (
            <React.Fragment key={n}>
              {i > 0 && <div className={`sl-step-line ${step > n - 1 ? "done" : ""}`} />}
              <div className="sl-step">
                <div className={`sl-step-bubble ${step === n ? "active" : step > n ? "done" : ""}`}>
                  {step > n ? (
                    <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                      <path d="M2.5 6L5 8.5L9.5 3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : n}
                </div>
                <span className={`sl-step-label ${step === n ? "active" : step > n ? "done" : ""}`}>{label}</span>
              </div>
            </React.Fragment>
          ))}
        </div>

        {/* ── STEP 1 ── */}
        {step === 1 && (
          <>
            <div className="sl-card-header">
              <h1 className="sl-card-title">Create your account</h1>
              <p className="sl-card-sub">Join the community. It's free.</p>
            </div>

            <button className="sl-google-btn" onClick={() => handleGoogle()} type="button">
              <svg width="17" height="17" viewBox="0 0 18 18" fill="none">
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
                <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
              </svg>
              {registerWithGoogle.isPending ? (
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Loader size={14} className="animate-spin" /> Signing up with Google...
                </span>
              ) : "Continue with Google"}
            </button>

            <div className="sl-divider">
              <div className="sl-divider-line" />
              <span className="sl-divider-text">or</span>
              <div className="sl-divider-line" />
            </div>

            <form>
              <div className="sl-row-2">
                <div className="sl-field">
                  <label className="sl-label" htmlFor="userName">Username</label>
                  <input
                    id="userName" name="userName" type="text"
                    className="sl-input" placeholder="e.g. john_doe"
                    value={form.userName} onChange={handleChange}
                    required autoComplete="username"
                  />
                </div>
                <div className="sl-field">
                  <label className="sl-label" htmlFor="email">Email</label>
                  <input
                    id="email" name="email" type="email"
                    className="sl-input" placeholder="you@example.com"
                    value={form.email} onChange={handleChange}
                    required autoComplete="email"
                  />
                </div>
              </div>

              <div className="sl-field">
                <label className="sl-label" htmlFor="password">Password</label>
                <div className="sl-input-wrap">
                  <input
                    id="password" name="password"
                    type={showPassword ? "text" : "password"}
                    className="sl-input sl-input-pw"
                    placeholder="Min. 8 characters"
                    value={form.password} onChange={handleChange}
                    required autoComplete="new-password"
                  />
                  <button
                    type="button" className="sl-eye-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
                        <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    ) : (
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
                {form.password && (
                  <div className="sl-strength-wrap">
                    <div className="sl-strength-bars">
                      {[1, 2, 3, 4].map((lvl) => (
                        <div
                          key={lvl}
                          className="sl-strength-bar"
                          style={{ background: strength >= lvl ? strengthColors[strength] : undefined }}
                        />
                      ))}
                    </div>
                    <span className="sl-strength-label" style={{ color: strengthColors[strength] }}>
                      {strengthLabels[strength]}
                    </span>
                  </div>
                )}
              </div>

              <button
                type="submit"
                onClick={handleSubmit}
                className="sl-btn"
                disabled={!form.userName || !form.email || !form.password || loading}
              >
                {loading && <span className="sl-spinner" />}
                {loading ? "Creating account..." : "Create account →"}
              </button>
            </form>

            <p className="sl-footer-link">
              Already have an account? <a href="/signin">Sign in</a>
            </p>
          </>
        )}

        {/* ── STEP 2 ── */}
        {step === 2 && (
          <>
            <div className="sl-card-header">
              <h1 className="sl-card-title">Verify your email</h1>
              <p className="sl-card-sub">
                We sent a 6-digit code to <strong>{form.email}</strong>.
              </p>
            </div>

            <div className="sl-otp-timer">
              <div className="sl-timer-icon">
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="6.5" stroke={timerExpired ? "#dc2626" : "#2563eb"} strokeWidth="1.5"/>
                  <path d="M8 4.5V8L10.5 10" stroke={timerExpired ? "#dc2626" : "#2563eb"} strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <div className="sl-timer-digits" style={{ color: timerExpired ? "var(--danger)" : "var(--text-primary)" }}>
                {formatTimer(otpTimer)}
              </div>
              <div className="sl-timer-track">
                <div className="sl-timer-bar-bg">
                  <div
                    className="sl-timer-bar-fill"
                    style={{
                      background: timerExpired ? "var(--danger)" : "var(--accent)",
                      transform: `scaleX(${otpTimer / 300})`,
                    }}
                  />
                </div>
                <div className="sl-timer-caption" style={{ color: timerExpired ? "var(--danger)" : undefined }}>
                  {timerExpired ? "Code expired — request a new one" : "Code expires in"}
                </div>
              </div>
            </div>

            <form onSubmit={handleVerify}>
              <div className="sl-otp-grid" onPaste={handleOtpPaste}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el: HTMLInputElement | null) => { otpRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    className={`sl-otp-cell ${digit ? "filled" : ""}`}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    autoFocus={i === 0}
                    disabled={timerExpired}
                  />
                ))}
              </div>

              <button
                type="submit"
                className="sl-btn"
                disabled={!filledOtp || otpVerifation.isPending || timerExpired}
              >
                {otpVerifation.isPending && <span className="sl-spinner" />}
                {otpVerifation.isPending ? "Verifying..." : "Verify & continue →"}
              </button>
            </form>

            <p className="sl-resend">
              Didn't receive a code?{" "}
              <button type="button" disabled={!timerExpired} onClick={handleResend}>
                {timerExpired ? "Resend code" : `Resend in ${formatTimer(otpTimer)}`}
              </button>
            </p>

            <button
              className="sl-back-btn"
              disabled={!timerExpired}
              onClick={() => { if (timerExpired) { clearInterval(timerRef.current!); setStep(1); } }}
            >
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                <path d="M9 3L5 7L9 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {timerExpired ? "Back to registration" : "Back (locked until timer expires)"}
            </button>
          </>
        )}

        {/* ── STEP 3 ── */}
        {step === 3 && (
          <>
            <div className="sl-success-icon">
              <svg width="22" height="22" viewBox="0 0 26 26" fill="none">
                <path d="M5 13L10.5 18.5L21 8" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>

            <div className="sl-card-header">
              <h1 className="sl-card-title">You're all set, {form.userName}!</h1>
              <p className="sl-card-sub">Your account is ready. Start posting and connecting.</p>
            </div>

            <ul className="sl-success-features">
              {["Create posts with text or images", "Like and comment on posts", "See your community's feed"].map((f) => (
                <li className="sl-success-feature" key={f}>
                  <div className="sl-success-feature-dot" />
                  {f}
                </li>
              ))}
            </ul>

            <a
              href="/"
              className="sl-btn"
              style={{ display: "flex", textDecoration: "none" }}
            >
              Go to Feed →
            </a>
          </>
        )}

      </div>
    </div>
  );
}