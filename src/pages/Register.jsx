import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  RefreshCw,
  ArrowLeft,
  User,
  CreditCard,
  Mail,
  Lock,
  Phone,
  KeyRound,
  IdCard,
  Calendar,
} from "lucide-react";
import AuthArt from "./AuthArt";

import {
  useRegisterMutation,
  useSendOtpMutation,
} from "../features/auth/authApi";

// MOCK flow. Wire OTP, validation and CAPTCHA to a real server-side API before production.

const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const makeCaptcha = () =>
  Array.from(
    { length: 5 },
    () => CHARS[Math.floor(Math.random() * CHARS.length)],
  ).join("");

const EMPLOYMENT = ["Serving", "Retired", "Defence Civilian"];
const ORGS = ["Army", "Navy", "Air Force", "Defence Civilian / Other"];
const ENTITLEMENT = [
  "Serving - Armed Forces",
  "Retired - Armed Forces",
  "Serving - Defence Civilian",
  "Retired - Defence Civilian",
];
const PAY_LEVELS = Array.from({ length: 18 }, (_, i) => `Level ${i + 1}`);

const INIT = {
  name: "",
  cardId: "",
  employment: "",
  chip: "",
  org: "",
  dob: "",
  doe: "",
  dor: "",
  entitlement: "",
  payLevel: "",
  pan: "",
  panC: "",
  ppo: "",
  username: "",
  email: "",
  pw: "",
  pwC: "",
  mobile: "",
  agree: false,
  emailOtp: "",
  mobileOtp: "",
};

function getPasswordStrength(pw) {
  if (!pw) return null;
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[a-z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score >= 4 && pw.length >= 8)
    return { label: "Strong", color: "#166534", bg: "#dcfce7" };
  if (score >= 3) return { label: "Medium", color: "#854d0e", bg: "#fef9c3" };
  return { label: "Weak", color: "#991b1b", bg: "#fee2e2" };
}

function Field({ id, label, req, hint, err, children }) {
  return (
    <div className="fgrp">
      <label htmlFor={id}>
        {label}
        {req && (
          <span style={{ color: "#e8503a" }} aria-hidden>
            {" "}
            *
          </span>
        )}
      </label>
      {children}
      {hint && <p className="small hint">{hint}</p>}
      <p className="err" role={err ? "alert" : undefined}>
        {err && `⚠ ${err}`}
      </p>
    </div>
  );
}

function Section({ n, title, children }) {
  return (
    <section className="rsec">
      <h2>
        <span>{n}</span> {title}
      </h2>
      {children}
    </section>
  );
}


// Register


export default function Register() {
  const [f, setF] = useState(INIT),
    [errs, setErrs] = useState({}),
    [showPw, setShowPw] = useState(false),
    [showPwC, setShowPwC] = useState(false),
    [cap, setCap] = useState(makeCaptcha),
    [capIn, setCapIn] = useState(""),
    [otpSent, setOtpSent] = useState({ email: false, mobile: false }),
    [otpMsg, setOtpMsg] = useState({}),
    go = useNavigate();

  const pwStrength = getPasswordStrength(f.pw);

  const [register, { isLoading: isRegistering }] = useRegisterMutation();

  const [sendOtpApi, { isLoading: isSendingOtp }] = useSendOtpMutation();

  const set = (k) => (e) =>
    setF({
      ...f,
      [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value,
    });
  const upper = (k) => (e) => setF({ ...f, [k]: e.target.value.toUpperCase() });
  const refreshCaptcha = () => {
    setCap(makeCaptcha());
    setCapIn("");
  };
  const noPaste = (e) => e.preventDefault();

  const sendOtp = async (type) => {
    const value = type === "email" ? f.email.trim() : f.mobile.trim();

    const isValid =
      type === "email"
        ? /^\S+@\S+\.\S+$/.test(value)
        : /^[6-9]\d{9}$/.test(value);

    if (!isValid) {
      setErrs((prev) => ({
        ...prev,
        [type]:
          type === "email"
            ? "Enter a valid email address."
            : "Enter a valid 10 digit mobile number.",
      }));

      return;
    }

    try {
      setErrs((prev) => ({
        ...prev,
        [type]: undefined,
      }));

      const response = await sendOtpApi({
        [type]: value,
        purpose:
          type === "email"
            ? "REGISTER_EMAIL"
            : "REGISTER_MOBILE",
      }).unwrap();

      setOtpSent((prev) => ({
        ...prev,
        [type]: true,
      }));

      setOtpMsg((prev) => ({
        ...prev,
        [type]:
          response?.message ||
          `OTP sent successfully to your ${type}.`,
      }));
    } catch (error) {
      setErrs((prev) => ({
        ...prev,
        [type]:
          error?.data?.message ||
          error?.data?.error ||
          `Failed to send ${type} OTP.`,
      }));

      setOtpSent((prev) => ({
        ...prev,
        [type]: false,
      }));
    }
  };

  const submit = async (e) => {
    e.preventDefault();

    const x = {};

    if (!/^[A-Za-z ]+$/.test(f.name.trim())) {
      x.name = "Only alphabets are allowed.";
    }

    if (
      !/^(GA|GB|GC|GE|GM|GR)\d{14}[A-Za-z]\d{2}$/i.test(
        f.cardId.trim()
      )
    ) {
      x.cardId =
        "Enter a valid 19 character Card ID (e.g. GA01052027551000J00).";
    }

    if (!f.employment) {
      x.employment = "Select employment status.";
    }

    if (!/^\d{16}$/.test(f.chip.trim())) {
      x.chip = "Enter the 16 digit chip number.";
    }

    if (!f.org) {
      x.org = "Select organization.";
    }

    if (!f.dob) {
      x.dob = "Select date of birth.";
    }

    if (!f.doe) {
      x.doe = "Select date of enrollment/commissioning.";
    }

    if (!f.dor) {
      x.dor = "Select date of retirement.";
    }

    if (!f.entitlement) {
      x.entitlement = "Select entitlement category.";
    }

    if (!f.payLevel) {
      x.payLevel = "Select pay level.";
    }

    if (!/^[A-Za-z]{5}\d{4}[A-Za-z]$/.test(f.pan.trim())) {
      x.pan = "Enter a valid PAN number.";
    }

    if (!f.panC || f.panC.trim() !== f.pan.trim()) {
      x.panC = "PAN numbers do not match.";
    }

    if (!/^[A-Za-z0-9]{3,}$/.test(f.username)) {
      x.username =
        "Use letters and numbers only (min 3).";
    }

    if (!/^\S+@\S+\.\S+$/.test(f.email)) {
      x.email = "Enter a valid email address.";
    }

    if (!otpSent.email) {
      x.emailOtp = "Please send and verify your email OTP.";
    } else if (!f.emailOtp?.trim()) {
      x.emailOtp = "Enter the OTP sent to your email.";
    }

    if (f.pw.length < 8) {
      x.pw = "Password must be at least 8 characters.";
    }

    if (!f.pwC || f.pwC !== f.pw) {
      x.pwC = "Passwords do not match.";
    }

    if (f.mobile && !/^[6-9]\d{9}$/.test(f.mobile)) {
      x.mobile = "Enter a valid 10 digit mobile number.";
    }

    if (!f.mobile) {
      x.mobile = "Mobile number is required.";
    }

    if (!otpSent.mobile) {
      x.mobileOtp = "Please send and verify your mobile OTP.";
    } else if (!f.mobileOtp?.trim()) {
      x.mobileOtp =
        "Enter the OTP sent to your mobile.";
    }

    if (!f.agree) {
      x.agree =
        "Please accept the terms of use and privacy.";
    }

    if (!capIn.trim()) {
      x.cap = "Enter the captcha text.";
    } else if (capIn.trim().toUpperCase() !== cap) {
      x.cap = "Captcha does not match. Try again.";
      refreshCaptcha();
    }

    setErrs(x);

    if (Object.keys(x).length) {
      return;
    }

    try {
      const payload = {
        name: f.name.trim(),

        cardId: f.cardId.trim().toUpperCase(),

        chipNumber: f.chip.trim(),

        employmentStatus:
          f.employment === "Serving"
            ? "SERVING"
            : f.employment === "Retired"
              ? "RETIRED"
              : "DEFENCE_CIVILIAN",

        organization: f.org,

        dob: f.dob,

        dateOfEnrollment: f.doe,

        dateOfRetirement: f.dor,

        entitlement: f.entitlement,

        payLevel: f.payLevel,

        ppo: f.ppo.trim() || undefined,

        pan: f.pan.trim().toUpperCase(),

        username: f.username.trim().toLowerCase(),

        email: f.email.trim().toLowerCase(),

        mobile: f.mobile.trim(),

        password: f.pw,

        mobileOtp: f.mobileOtp.trim(),

        emailOtp: f.emailOtp.trim(),

        category: "OTHER",
      };

      const response = await register(payload).unwrap();

      console.log("Registration successful:", response);

      alert(
        response?.message ||
        "Registration successful. Your account is pending admin approval."
      );

      go("/login");
    } catch (error) {
      console.error("Registration error:", error);

      const message =
        error?.data?.message ||
        error?.data?.error ||
        "Registration failed. Please try again.";

      setErrs((prev) => ({
        ...prev,
        submit: message,
      }));
    }
  };

  return (
    <div className="wrap auth reg">
      <AuthArt
        title="Create your CSD AFD account."
        text="Register with your grocery canteen card details. Registration is absolutely free."
      />

      <form
        className="panel logincard authcard"
        onSubmit={submit}
        noValidate
        aria-labelledby="rh"
      >
        <div className="between">
          <Link to="/login" className="vli">
            Already registered? Login
          </Link>
          <button
            type="button"
            className="circle"
            aria-label="Go back"
            onClick={() => go(-1)}
          >
            <ArrowLeft />
          </button>
        </div>

        <h1 id="rh">Register</h1>
        <p className="reg-warn">
          Canteen card holders are requested not to use service number / service
          particulars like rank etc while filling up the Sign up request and
          check out forms. Your login/AFD Demand will be rejected/cancelled if
          service particulars are used.
        </p>

        <Section n="1" title="Card details">
          <Field
            id="name"
            label="Name as printed on front face of grocery canteen card"
            req
            err={errs.name}
          >
            <div className="fld">
              <User size={18} aria-hidden />
              <input
                id="name"
                placeholder="(Only Alphabets allowed)"
                value={f.name}
                onChange={set("name")}
                aria-invalid={!!errs.name}
              />
            </div>
          </Field>
          <div className="reg-grid">
            <Field
              id="cardId"
              label="Card ID printed on front face of the grocery card"
              req
              err={errs.cardId}
              hint="( Alphanumeric no. starting with GA/GB/GC/GE/GM/GR like grocery card id GA01052027551000J00. Third last is alphabet not number. )"
            >
              <div className="fld">
                <CreditCard size={18} aria-hidden />
                <input
                  id="cardId"
                  placeholder="(19 digit Alphanumeric)"
                  maxLength={19}
                  value={f.cardId}
                  onChange={upper("cardId")}
                  aria-invalid={!!errs.cardId}
                />
              </div>
            </Field>
            <Field
              id="chip"
              label="Chip number printed on back of canteen card or printed on the grocery bill"
              req
              err={errs.chip}
              hint="( 16 Digit No. (5312120004689336). Given on reverse of grocery card at bottom right. Also given on grocery bill.)"
            >
              <div className="fld">
                <IdCard size={18} aria-hidden />
                <input
                  id="chip"
                  inputMode="numeric"
                  placeholder="(16 digit Numeric)"
                  maxLength={16}
                  value={f.chip}
                  onChange={set("chip")}
                  aria-invalid={!!errs.chip}
                />
              </div>
            </Field>
          </div>
        </Section>

        <Section n="2" title="Service details">
          <div className="reg-grid">
            <Field
              id="employment"
              label="Employment status"
              req
              err={errs.employment}
            >
              <select
                id="employment"
                value={f.employment}
                onChange={set("employment")}
              >
                <option value="">Select</option>
                {EMPLOYMENT.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </Field>
            <Field id="org" label="Organization" req err={errs.org}>
              <select id="org" value={f.org} onChange={set("org")}>
                <option value="">Select</option>
                {ORGS.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </Field>
            <Field id="dob" label="Date of birth" req err={errs.dob}>
              <div className="fld">
                <Calendar size={18} aria-hidden />
                <input
                  id="dob"
                  type="date"
                  value={f.dob}
                  onChange={set("dob")}
                />
              </div>
            </Field>
            <Field
              id="doe"
              label="Date of Enrollment/Commissioning"
              req
              err={errs.doe}
              hint="( It is date of joining service. Not Date of Promotion to JCO. Not Date of Joining DSC/other service. )"
            >
              <div className="fld">
                <Calendar size={18} aria-hidden />
                <input
                  id="doe"
                  type="date"
                  value={f.doe}
                  onChange={set("doe")}
                />
              </div>
            </Field>
            <Field id="dor" label="Date of retirement" req err={errs.dor}>
              <div className="fld">
                <Calendar size={18} aria-hidden />
                <input
                  id="dor"
                  type="date"
                  value={f.dor}
                  onChange={set("dor")}
                />
              </div>
            </Field>
            <Field
              id="ent"
              label="Entitlement category* Serving & Retired (Armed Forces/Defence Civilians)"
              req
              err={errs.entitlement}
            >
              <select
                id="ent"
                value={f.entitlement}
                onChange={set("entitlement")}
              >
                <option value="">Select</option>
                {ENTITLEMENT.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </Field>
            <Field id="pl" label="Pay Level" req err={errs.payLevel}>
              <select id="pl" value={f.payLevel} onChange={set("payLevel")}>
                <option value="">Select</option>
                {PAY_LEVELS.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </Field>
            <Field id="ppo" label="PPO/Discharge No. (Ex. Servicemen)">
              <div className="fld">
                <IdCard size={18} aria-hidden />
                <input id="ppo" value={f.ppo} onChange={set("ppo")} />
              </div>
            </Field>
          </div>
        </Section>

        <Section n="3" title="Identity">
          <div className="reg-grid">
            <Field id="pan" label="PAN number" req err={errs.pan}>
              <div className="fld">
                <IdCard size={18} aria-hidden />
                <input
                  id="pan"
                  maxLength={10}
                  value={f.pan}
                  onChange={upper("pan")}
                  aria-invalid={!!errs.pan}
                />
              </div>
            </Field>
            <Field
              id="panC"
              label="Confirm PAN number"
              err={errs.panC}
              hint="( Copy paste is not allowed )"
            >
              <div className="fld">
                <IdCard size={18} aria-hidden />
                <input
                  id="panC"
                  maxLength={10}
                  autoComplete="off"
                  value={f.panC}
                  onChange={upper("panC")}
                  onPaste={noPaste}
                  onDrop={noPaste}
                  aria-invalid={!!errs.panC}
                />
              </div>
            </Field>
          </div>
        </Section>

        <Section n="4" title="Account details">
          <Field
            id="username"
            label="Username"
            req
            err={errs.username}
            hint="Please do not use special characters in User Name"
          >
            <div className="fld">
              <User size={18} aria-hidden />
              <input
                id="username"
                autoComplete="username"
                value={f.username}
                onChange={set("username")}
                aria-invalid={!!errs.username}
              />
            </div>
          </Field>

          <div className="reg-grid">
            <Field id="email" label="Email" req err={errs.email}>
              <div className="fld has-btn">
                <Mail size={18} aria-hidden />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={f.email}
                  onChange={set("email")}
                  aria-invalid={!!errs.email}
                  style={otpSent.email ? { borderColor: "#16a34a" } : undefined}
                />
                <button
                  type="button"
                  className="otp-btn"
                  // onClick={() =>
                  //   sendOtp(
                  //     "email",
                  //     /^\S+@\S+\.\S+$/.test(f.email),
                  //     "Enter a valid email address.",
                  //   )
                  // }

                  onClick={() => sendOtp("email")}
                >
                  {otpSent.email ? "Resend OTP" : "Send OTP"}
                </button>
              </div>
              {otpMsg.email && (
                <p
                  style={{
                    color: "#0b8457",
                    fontSize: "0.88rem",
                    fontWeight: 600,
                    margin: "0.35rem 0 0",
                  }}
                >
                  {otpMsg.email}
                </p>
              )}
            </Field>

            {otpSent.email ? (
              <Field id="emailOtp" label="Enter OTP" req err={errs.emailOtp}>
                <input
                  id="emailOtp"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="Enter OTP"
                  value={f.emailOtp}
                  onChange={set("emailOtp")}
                  aria-invalid={!!errs.emailOtp}
                />
              </Field>
            ) : (
              <div />
            )}
          </div>

          <div className="reg-grid">
            <Field id="pw" label="Password" req err={errs.pw}>
              <div className="fld has-eye">
                <Lock size={18} aria-hidden />
                <input
                  id="pw"
                  type={showPw ? "text" : "password"}
                  autoComplete="new-password"
                  value={f.pw}
                  onChange={set("pw")}
                  aria-invalid={!!errs.pw}
                  style={
                    pwStrength?.label === "Strong"
                      ? { borderColor: "#16a34a" }
                      : undefined
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
              {pwStrength && (
                <div
                  style={{
                    marginTop: "6px",
                    display: "inline-block",
                    padding: "4px 14px",
                    borderRadius: "6px",
                    background: pwStrength.bg,
                    color: pwStrength.color,
                    fontSize: "0.85rem",
                    fontWeight: 600,
                  }}
                >
                  {pwStrength.label}
                </div>
              )}
            </Field>
            <Field id="pwC" label="Confirm password" req err={errs.pwC}>
              <div className="fld has-eye">
                <Lock size={18} aria-hidden />
                <input
                  id="pwC"
                  type={showPwC ? "text" : "password"}
                  autoComplete="new-password"
                  value={f.pwC}
                  onChange={set("pwC")}
                  aria-invalid={!!errs.pwC}
                  style={
                    f.pwC && f.pwC === f.pw
                      ? { borderColor: "#16a34a" }
                      : undefined
                  }
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

          <div className="reg-grid">
            <Field id="mobile" label="Mobile number" err={errs.mobile}>
              <div className="fld has-btn">
                <Phone size={18} aria-hidden />
                <input
                  id="mobile"
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  value={f.mobile}
                  onChange={set("mobile")}
                  aria-invalid={!!errs.mobile}
                  style={
                    otpSent.mobile ? { borderColor: "#16a34a" } : undefined
                  }
                />
                <button
                  type="button"
                  className="otp-btn"
                  // onClick={() =>
                  //   sendOtp(
                  //     "mobile",
                  //     /^[6-9]\d{9}$/.test(f.mobile),
                  //     "Enter a valid 10 digit mobile number.",
                  //   )
                  // }
                  onClick={() => sendOtp("mobile")}
                >
                  {otpSent.mobile ? "Resend OTP" : "Send OTP"}
                </button>
              </div>
              {otpMsg.mobile && (
                <p
                  style={{
                    color: "#0b8457",
                    fontSize: "0.88rem",
                    fontWeight: 600,
                    margin: "0.35rem 0 0",
                  }}
                >
                  {otpMsg.mobile}
                </p>
              )}
            </Field>

            {otpSent.mobile ? (
              <Field id="mobileOtp" label="Enter OTP" err={errs.mobileOtp}>
                <input
                  id="mobileOtp"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="Enter OTP"
                  value={f.mobileOtp}
                  onChange={set("mobileOtp")}
                  aria-invalid={!!errs.mobileOtp}
                />
              </Field>
            ) : (
              <div />
            )}
          </div>
        </Section>

        <label className="inline agree">
          <input type="checkbox" checked={f.agree} onChange={set("agree")} /> I
          agree with <Link to="/info/terms">terms of use and privacy</Link>
        </label>
        <p className="err" role={errs.agree ? "alert" : undefined}>
          {errs.agree && `⚠ ${errs.agree}`}
        </p>

        <label htmlFor="cap">
          Captcha <span aria-hidden>*</span>
        </label>
        <div className="captcha-row">
          <span
            className="captcha-img"
            aria-label={`Captcha ${cap.split("").join(" ")}`}
          >
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
            placeholder="Type the captcha text displayed above"
            value={capIn}
            onChange={(e) => setCapIn(e.target.value)}
            aria-invalid={!!errs.cap}
          />
        </div>
        <p className="err" role={errs.cap ? "alert" : undefined}>
          {errs.cap && `⚠ ${errs.cap}`}
        </p>

        {/* <button className="btn big wide" type="submit">
          Submit
        </button> */}

        <button
          className="btn big wide"
          type="submit"
          disabled={isRegistering}
        >
          {isRegistering ? "Creating Account..." : "Submit"}
        </button>
      </form>
    </div>
  );
}
