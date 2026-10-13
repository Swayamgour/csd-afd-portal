import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldCheck, ArrowLeft, RefreshCw, User, Lock, KeyRound } from "lucide-react";
import AuthArt from "./AuthArt";
// MOCK flow. No credentials/tokens stored in browser. Wire to a real auth API + server-verified CAPTCHA.

const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const makeCaptcha = () =>
  Array.from({ length: 5 }, () => CHARS[Math.floor(Math.random() * CHARS.length)]).join("");

export default function Login() {
  const [step, setStep] = useState(1),
    [uid, setUid] = useState(""),
    [pw, setPw] = useState(""),
    [cap, setCap] = useState(makeCaptcha),
    [capIn, setCapIn] = useState(""),
    [errs, setErrs] = useState({}),
    [otp, setOtp] = useState(Array(6).fill(""));
  const refs = useRef([]),
    go = useNavigate();

  const refreshCaptcha = () => {
    setCap(makeCaptcha());
    setCapIn("");
  };

  const send = (e) => {
    e.preventDefault();
    const x = {};
    if (!/^[A-Za-z0-9._-]{3,}$/.test(uid.trim()))
      x.uid = "Enter a valid User ID (letters, numbers, . _ - only).";
    if (pw.length < 6) x.pw = "Enter your password (at least 6 characters).";
    if (!capIn.trim()) x.cap = "Enter the captcha text shown above.";
    else if (capIn.trim().toUpperCase() !== cap) {
      x.cap = "Captcha does not match. Try again.";
      refreshCaptcha();
    }
    setErrs(x);
    if (!Object.keys(x).length) setStep(2);
  };
  const ch = (i, v) => {
    if (!/^\d?$/.test(v)) return;
    const n = [...otp];
    n[i] = v;
    setOtp(n);
    if (v && i < 5) refs.current[i + 1].focus();
  };
  const verify = (e) => {
    e.preventDefault();
    if (otp.join("").length < 6) return setErrs({ otp: "Enter all 6 digits." });
    go("/");
  };

  return (
    <div className="wrap auth">
      <AuthArt
        title="Serving those who serve the nation."
        text="Log in to browse the CSD catalogue, place AFD demands and track your orders."
      />
      <div className="panel logincard authcard" aria-labelledby="lh">
        <div className="between">
          <Link to="/info/login-instructions" className="vli">
            View Login Instructions
          </Link>
          <button
            className="circle"
            aria-label="Go back"
            onClick={() => (step === 2 ? setStep(1) : go(-1))}
          >
            <ArrowLeft />
          </button>
        </div>

        {step === 1 ? (
          <form onSubmit={send} noValidate>
            <h1 id="lh">Welcome Back!</h1>
            <p className="muted">Log in to your account</p>

            <label htmlFor="uid">
              User ID <span aria-hidden>*</span>
            </label>
            <div className="fld">
              <User size={18} aria-hidden />
              <input
                id="uid"
                type="text"
                autoComplete="username"
                placeholder="Enter your User ID"
                value={uid}
                onChange={(e) => setUid(e.target.value)}
                aria-invalid={!!errs.uid}
              />
            </div>
            <p className="err" role={errs.uid ? "alert" : undefined}>
              {errs.uid && `⚠ ${errs.uid}`}
            </p>

            <label htmlFor="pw">
              Password <span aria-hidden>*</span>
            </label>
            <div className="fld">
              <Lock size={18} aria-hidden />
              <input
                id="pw"
                type="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                aria-invalid={!!errs.pw}
              />
            </div>
            <p className="err" role={errs.pw ? "alert" : undefined}>
              {errs.pw && `⚠ ${errs.pw}`}
            </p>

            <div className="between small">
              <label className="inline">
                <input type="checkbox" /> Remember Me
              </label>
              <Link to="/info/forgot-password">Forgot Password?</Link>
            </div>

            <label htmlFor="cap">
              Captcha <span aria-hidden>*</span>
            </label>
            <div className="captcha-row">
              <span className="captcha-img" aria-label={`Captcha ${cap.split("").join(" ")}`}>
                {cap}
              </span>
              <button
                type="button"
                className="icon sm"
                aria-label="Refresh captcha"
                onClick={refreshCaptcha}
              >
                <RefreshCw size={18} />
              </button>
            </div>
            <div className="fld">
              <KeyRound size={18} aria-hidden />
              <input
                id="cap"
                autoComplete="off"
                maxLength={5}
                placeholder="Type the captcha text above"
                value={capIn}
                onChange={(e) => setCapIn(e.target.value)}
                aria-invalid={!!errs.cap}
              />
            </div>
            <p className="err" role={errs.cap ? "alert" : undefined}>
              {errs.cap && `⚠ ${errs.cap}`}
            </p>

            <button className="btn big wide" type="submit">
              Send 6-digit code
            </button>
            <p className="orline">
              <span>New to CSD AFD Online?</span>
            </p>
            <Link className="btn out big wide" to="/register">
              New User Register
            </Link>
          </form>
        ) : (
          <form onSubmit={verify} noValidate>
            <h1 id="lh">Enter OTP</h1>
            <p className="muted">you received on your registered email</p>
            <span className="shield">
              <ShieldCheck size={44} aria-hidden />
            </span>
            <fieldset className="otp">
              <legend className="sr">6-digit code</legend>
              {otp.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => (refs.current[i] = el)}
                  inputMode="numeric"
                  maxLength={1}
                  value={d}
                  aria-label={`Digit ${i + 1}`}
                  onChange={(e) => ch(i, e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Backspace" &&
                    !d &&
                    i > 0 &&
                    refs.current[i - 1].focus()
                  }
                />
              ))}
            </fieldset>
            <p className="err" role={errs.otp ? "alert" : undefined}>
              {errs.otp && `⚠ ${errs.otp}`}
            </p>
            <p className="small">
              Didn’t receive OTP ?{" "}
              <button
                type="button"
                className="link"
                onClick={() => setOtp(Array(6).fill(""))}
              >
                Send Again
              </button>
            </p>
            <button className="btn big wide" type="submit">
              Verify
            </button>
          </form>
        )}
      </div>
    </div>
  );
}