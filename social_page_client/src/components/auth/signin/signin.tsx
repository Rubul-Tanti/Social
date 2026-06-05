import { useUserContext } from "../../../contextProvider";
import { useAuthentication } from "../../../hooks/useAuthentication";
import { useGoogleLogin } from "@react-oauth/google";
import { Loader } from "lucide-react";
import InterestsIcon from '@mui/icons-material/Interests';
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./signin.styles.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { registerWithGoogle, loginWithEmail } = useAuthentication();
  const { setUser } = useUserContext();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    loginWithEmail.mutate({ email, password }, {
      onSuccess: (v) => {
        toast("Logged in successfully");
        localStorage.setItem("access_token", v.data.access_token);
        setUser({
          isAuthenticated: true,
          role: v.data.data.role,
          email: v.data.data.email,
          userName: v.data.data.userName,
          profilePicture: v.data.data.profilePicture,
        });
        setLoading(false);
        navigate("/");

      },
      onError: (e: any) => {
        toast.error("email or password is incorrect")
        setLoading(false);
        if (e.response) toast.error(e.response.data.message);
      },
    });
  };

  const handleGoogle = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      registerWithGoogle.mutate(tokenResponse.access_token, {
        onSuccess: (v) => {
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

  return (
    <div className="sp-root " style={{position:"relative",backgroundColor:"#0f0f11"}}>
       <header className="container-custom " style={{ position:"absolute",top:"0px" }}>
        <h1 style={{ fontSize: "24px",color:'#f0f0f2',width:"100%",padding:"10px" }}><Link style={{color:'#f0f0f2'}}to="/"><InterestsIcon />BuBu login </Link></h1>

        </header>
      <div style={{backgroundColor:"#0f0f11",padding:"20px",borderRadius:"8px"}} className="shadow-sm border border-zinc-950  ">

        <div className="sp-card-header">
          <h1 className="sp-card-title" style={{color:'white'}}>Welcome back</h1>
          <p className="sp-card-sub">Sign in to see posts from your community.</p>
        </div>

        <button className="flex w-full justify-center gap-2 items-center border rounded-lg border-zinc-800 mx-auto" style={{color:'white',padding:"8px"}} onClick={() => handleGoogle()} type="button">
          <svg width="17" height="17" viewBox="0 0 18 18" fill="none">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
            <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
          </svg>
          {registerWithGoogle.isPending ? (
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Loader size={14} className="animate-spin" /> Signing in with Google…
            </span>
          ) : "Continue with Google"}
        </button>

        <div className="sp-divider">
          <div className="sp-divider-line" />
          <span className="sp-divider-text">or</span>
          <div className="sp-divider-line" />
        </div>

        <form onSubmit={handleSubmit}>
          <div className="sp-field">
            <label htmlFor="email" className="sp-label" style={{color:"white"}}>Email</label>
            <input
              id="email"
              type="email"
              className="sp-input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="sp-field">
            <label htmlFor="password" className="sp-label" style={{color:"white"}}>Password</label>
            <div className="sp-input-wrap">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                className="sp-input sp-input-pw"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="sp-eye-btn"
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
          </div>

          {/* <div className="sp-row">
            <a href="/forgot-password" className="sp-forgot">Forgot password?</a>
          </div> */}

          <button type="submit" className="sp-btn" disabled={!email || !password || loading}>
            {loading && <span className="sp-spinner" />}
            {loading ? "Signing in…" : "Sign in →"}
          </button>
        </form>

        <div className="sp-card-sep" />

        <p className="sp-register">
          New here? <a href="/signup">Create a free account</a>
        </p>

      </div>
    </div>
  );
}