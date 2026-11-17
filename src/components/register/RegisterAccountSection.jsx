import React from "react";
import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Field, Section } from "./RegisterField.jsx";

export function RegisterAccountSection({
  f,
  shown,
  set,
  checkSingleDuplicate,
  touched,
  showPw,
  setShowPw,
  showPwC,
  setShowPwC,
  pwStrength,
  PW_RULES,
}) {
  return (
    <Section n="4" title="Account details">
      <Field
        id="username"
        label="Username"
        req
        err={shown("username")}
        hint="Please do not use special characters in User Name"
      >
        <div className="fld">
          <User size={18} aria-hidden />
          <input
            id="username"
            autoComplete="username"
            value={f.username}
            onChange={set("username")}
            onBlur={() => checkSingleDuplicate("username", f.username)}
            aria-invalid={!!shown("username")}
          />
        </div>
      </Field>

      <div className="reg-grid">
        <Field
          id="email"
          label="Email"
          req
          err={shown("email")}
          hint="A 6-digit OTP will be sent to this email via EmailJS upon submission."
        >
          <div className="fld">
            <Mail size={18} aria-hidden />
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="name@example.com"
              value={f.email}
              onChange={set("email")}
              onBlur={() => checkSingleDuplicate("email", f.email)}
              aria-invalid={!!shown("email")}
            />
          </div>
        </Field>

        <Field id="mobile" label="Mobile number" req err={shown("mobile")}>
          <div className="fld">
            <Phone size={18} aria-hidden />
            <input
              id="mobile"
              type="tel"
              inputMode="numeric"
              maxLength={10}
              placeholder="10-digit mobile number"
              value={f.mobile}
              onChange={set("mobile")}
              onBlur={() => checkSingleDuplicate("mobile", f.mobile)}
              aria-invalid={!!shown("mobile")}
            />
          </div>
        </Field>
      </div>

      <div className="reg-grid">
        <Field id="pw" label="Password" req err={shown("pw")}>
          <div className="fld has-eye">
            <Lock size={18} aria-hidden />
            <input
              id="pw"
              type={showPw ? "text" : "password"}
              autoComplete="new-password"
              value={f.pw}
              onChange={set("pw")}
              aria-invalid={!!shown("pw")}
              className={
                pwStrength?.label === "Strong" ? "input-valid-strong" : ""
              }
            />
            <button
              type="button"
              className="eye"
              aria-label={showPw ? "Hide password" : "Show password"}
              onClick={() => setShowPw(!showPw)}
            >
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {(f.pw || touched?.pw) && (
            <>
              <div className="pw-meter" aria-hidden>
                {[0, 1, 2, 3].map((i) => (
                  <span
                    key={i}
                    className={
                      i < (PW_RULES || []).filter((r) => r.test(f.pw)).length
                        ? `on ${pwStrength?.className || ""}`
                        : ""
                    }
                  />
                ))}
              </div>
              <ul className="pw-rules" aria-label="Password requirements">
                {(PW_RULES || []).map((r) => {
                  const ok = r.test(f.pw);
                  return (
                    <li key={r.key} className={ok ? "ok" : "bad"}>
                      {ok ? (
                        <CheckCircle2 size={14} aria-hidden />
                      ) : (
                        <AlertCircle size={14} aria-hidden />
                      )}{" "}
                      {r.label}
                    </li>
                  );
                })}
              </ul>
              {pwStrength && (
                <div className={`pw-strength-badge ${pwStrength.className}`}>
                  {pwStrength.label}
                  {pwStrength.label !== "Strong" &&
                    " · add @ # $ ! to make it stronger"}
                </div>
              )}
            </>
          )}
        </Field>
        <Field id="pwC" label="Confirm password" req err={shown("pwC")}>
          <div className="fld has-eye">
            <Lock size={18} aria-hidden />
            <input
              id="pwC"
              type={showPwC ? "text" : "password"}
              autoComplete="new-password"
              value={f.pwC}
              onChange={set("pwC")}
              aria-invalid={!!shown("pwC")}
              className={f.pwC && f.pwC === f.pw ? "input-valid-strong" : ""}
            />
            <button
              type="button"
              className="eye"
              aria-label={showPwC ? "Hide password" : "Show password"}
              onClick={() => setShowPwC(!showPwC)}
            >
              {showPwC ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </Field>
      </div>
    </Section>
  );
}

export default RegisterAccountSection;
