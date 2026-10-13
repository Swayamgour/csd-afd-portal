import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye, EyeOff, RefreshCw, ArrowLeft, User, CreditCard, Mail, Lock,
  Phone, KeyRound, IdCard, Calendar,
} from "lucide-react";
import AuthArt from "./AuthArt";
// MOCK flow. Wire OTP, validation and CAPTCHA to a real server-side API before production.

const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const makeCaptcha = () =>
  Array.from({ length: 5 }, () => CHARS[Math.floor(Math.random() * CHARS.length)]).join("");

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
  name: "", cardId: "", employment: "", chip: "", org: "",
  dob: "", doe: "", dor: "", entitlement: "", payLevel: "",
  pan: "", panC: "", ppo: "", username: "", email: "",
  pw: "", pwC: "", mobile: "", agree: false,
};

function Field({ id, label, req, hint, err, children }) {
  return (
    <div className="fgrp">
      <label htmlFor={id}>
        {label}
        {req && <span aria-hidden> *</span>}
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

export default function Register() {
  const [f, setF] = useState(INIT),
    [errs, setErrs] = useState({}),
    [showPw, setShowPw] = useState(false),
    [showPwC, setShowPwC] = useState(false),
    [cap, setCap] = useState(makeCaptcha),
    [capIn, setCapIn] = useState(""),
    [otpMsg, setOtpMsg] = useState({}),
    go = useNavigate();

  const set = (k) => (e) =>
    setF({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });
  const upper = (k) => (e) => setF({ ...f, [k]: e.target.value.toUpperCase() });
  const refreshCaptcha = () => {
    setCap(makeCaptcha());
    setCapIn("");
  };
  const noPaste = (e) => e.preventDefault();

  const sendOtp = (k, ok, msg) => {
    if (!ok) return setErrs({ ...errs, [k]: msg });
    setErrs({ ...errs, [k]: undefined });
    setOtpMsg({ ...otpMsg, [k]: "OTP sent (mock)." });
  };

  const submit = (e) => {
    e.preventDefault();
    const x = {};
    if (!/^[A-Za-z ]+$/.test(f.name.trim())) x.name = "Only alphabets are allowed.";
    if (!/^(GA|GB|GC|GE|GM|GR)\d{14}[A-Za-z]\d{2}$/i.test(f.cardId.trim()))
      x.cardId = "Enter a valid 19 character Card ID (e.g. GA01052027551000J00).";
    if (!f.employment) x.employment = "Select employment status.";
    if (!/^\d{16}$/.test(f.chip.trim())) x.chip = "Enter the 16 digit chip number.";
    if (!f.org) x.org = "Select organization.";
    if (!f.dob) x.dob = "Select date of birth.";
    if (!f.doe) x.doe = "Select date of enrollment/commissioning.";
    if (!f.dor) x.dor = "Select date of retirement.";
    if (!f.entitlement) x.entitlement = "Select entitlement category.";
    if (!f.payLevel) x.payLevel = "Select pay level.";
    if (!/^[A-Za-z]{5}\d{4}[A-Za-z]$/.test(f.pan.trim())) x.pan = "Enter a valid PAN number.";
    if (!f.panC || f.panC.trim() !== f.pan.trim()) x.panC = "PAN numbers do not match.";
    if (!/^[A-Za-z0-9]{3,}$/.test(f.username)) x.username = "Use letters and numbers only (min 3).";
    if (!/^\S+@\S+\.\S+$/.test(f.email)) x.email = "Enter a valid email address.";
    if (f.pw.length < 8) x.pw = "Password must be at least 8 characters.";
    if (!f.pwC || f.pwC !== f.pw) x.pwC = "Passwords do not match.";
    if (f.mobile && !/^[6-9]\d{9}$/.test(f.mobile)) x.mobile = "Enter a valid 10 digit mobile number.";
    if (!f.agree) x.agree = "Please accept the terms of use and privacy.";
    if (!capIn.trim()) x.cap = "Enter the captcha text.";
    else if (capIn.trim().toUpperCase() !== cap) {
      x.cap = "Captcha does not match. Try again.";
      refreshCaptcha();
    }
    setErrs(x);
    if (!Object.keys(x).length) {
      alert("Registration submitted (mock).");
      go("/login");
    }
  };

  return (
    <div className="wrap auth reg">
      <AuthArt
        title="Create your CSD AFD account."
        text="Register with your grocery canteen card details. Registration is absolutely free."
      />

      <form className="panel logincard authcard" onSubmit={submit} noValidate aria-labelledby="rh">
        <div className="between">
          <Link to="/login" className="vli">
            Already registered? Login
          </Link>
          <button type="button" className="circle" aria-label="Go back" onClick={() => go(-1)}>
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
          <Field id="name" label="Name as printed on front face of grocery canteen card" req err={errs.name}>
            <div className="fld">
              <User size={18} aria-hidden />
              <input id="name" placeholder="(Only Alphabets allowed)" value={f.name} onChange={set("name")} aria-invalid={!!errs.name} />
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
                <input id="cardId" placeholder="(19 digit Alphanumeric)" maxLength={19} value={f.cardId} onChange={upper("cardId")} aria-invalid={!!errs.cardId} />
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
                <input id="chip" inputMode="numeric" placeholder="(16 digit Numeric)" maxLength={16} value={f.chip} onChange={set("chip")} aria-invalid={!!errs.chip} />
              </div>
            </Field>
          </div>
        </Section>

        <Section n="2" title="Service details">
          <div className="reg-grid">
            <Field id="employment" label="Employment status" req err={errs.employment}>
              <select id="employment" value={f.employment} onChange={set("employment")}>
                <option value="">Select</option>
                {EMPLOYMENT.map((o) => <option key={o}>{o}</option>)}
              </select>
            </Field>
            <Field id="org" label="Organization" req err={errs.org}>
              <select id="org" value={f.org} onChange={set("org")}>
                <option value="">Select</option>
                {ORGS.map((o) => <option key={o}>{o}</option>)}
              </select>
            </Field>
            <Field id="dob" label="Date of birth" req err={errs.dob}>
              <div className="fld">
                <Calendar size={18} aria-hidden />
                <input id="dob" type="date" value={f.dob} onChange={set("dob")} />
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
                <input id="doe" type="date" value={f.doe} onChange={set("doe")} />
              </div>
            </Field>
            <Field id="dor" label="Date of retirement" req err={errs.dor}>
              <div className="fld">
                <Calendar size={18} aria-hidden />
                <input id="dor" type="date" value={f.dor} onChange={set("dor")} />
              </div>
            </Field>
            <Field id="ent" label="Entitlement category* Serving & Retired (Armed Forces/Defence Civilians)" req err={errs.entitlement}>
              <select id="ent" value={f.entitlement} onChange={set("entitlement")}>
                <option value="">Select</option>
                {ENTITLEMENT.map((o) => <option key={o}>{o}</option>)}
              </select>
            </Field>
            <Field id="pl" label="Pay Level" req err={errs.payLevel}>
              <select id="pl" value={f.payLevel} onChange={set("payLevel")}>
                <option value="">Select</option>
                {PAY_LEVELS.map((o) => <option key={o}>{o}</option>)}
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
                <input id="pan" maxLength={10} value={f.pan} onChange={upper("pan")} aria-invalid={!!errs.pan} />
              </div>
            </Field>
            <Field id="panC" label="Confirm PAN number" err={errs.panC} hint="( Copy paste is not allowed )">
              <div className="fld">
                <IdCard size={18} aria-hidden />
                <input id="panC" maxLength={10} autoComplete="off" value={f.panC} onChange={upper("panC")} onPaste={noPaste} onDrop={noPaste} aria-invalid={!!errs.panC} />
              </div>
            </Field>
          </div>
        </Section>

        <Section n="4" title="Account details">
          <Field id="username" label="Username" req err={errs.username} hint="Please do not use special characters in User Name">
            <div className="fld">
              <User size={18} aria-hidden />
              <input id="username" autoComplete="username" value={f.username} onChange={set("username")} aria-invalid={!!errs.username} />
            </div>
          </Field>
          <Field id="email" label="Email" req err={errs.email}>
            <div className="fld has-btn">
              <Mail size={18} aria-hidden />
              <input id="email" type="email" autoComplete="email" value={f.email} onChange={set("email")} aria-invalid={!!errs.email} />
              <button type="button" className="otp-btn" onClick={() => sendOtp("email", /^\S+@\S+\.\S+$/.test(f.email), "Enter a valid email address.")}>
                Send OTP
              </button>
            </div>
            {otpMsg.email && <p className="small muted">{otpMsg.email}</p>}
          </Field>
          <div className="reg-grid">
            <Field id="pw" label="Password" req err={errs.pw}>
              <div className="fld has-eye">
                <Lock size={18} aria-hidden />
                <input id="pw" type={showPw ? "text" : "password"} autoComplete="new-password" value={f.pw} onChange={set("pw")} aria-invalid={!!errs.pw} />
                <button type="button" className="eye" aria-label={showPw ? "Hide password" : "Show password"} onClick={() => setShowPw(!showPw)}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </Field>
            <Field id="pwC" label="Confirm password" req err={errs.pwC}>
              <div className="fld has-eye">
                <Lock size={18} aria-hidden />
                <input id="pwC" type={showPwC ? "text" : "password"} autoComplete="new-password" value={f.pwC} onChange={set("pwC")} aria-invalid={!!errs.pwC} />
                <button type="button" className="eye" aria-label={showPwC ? "Hide password" : "Show password"} onClick={() => setShowPwC(!showPwC)}>
                  {showPwC ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </Field>
          </div>
          <Field id="mobile" label="Mobile number" err={errs.mobile}>
            <div className="fld has-btn">
              <Phone size={18} aria-hidden />
              <input id="mobile" type="tel" inputMode="numeric" maxLength={10} value={f.mobile} onChange={set("mobile")} aria-invalid={!!errs.mobile} />
              <button type="button" className="otp-btn" onClick={() => sendOtp("mobile", /^[6-9]\d{9}$/.test(f.mobile), "Enter a valid 10 digit mobile number.")}>
                Send OTP
              </button>
            </div>
            {otpMsg.mobile && <p className="small muted">{otpMsg.mobile}</p>}
          </Field>
        </Section>

        <label className="inline agree">
          <input type="checkbox" checked={f.agree} onChange={set("agree")} /> I agree with{" "}
          <Link to="/info/terms">terms of use and privacy</Link>
        </label>
        <p className="err" role={errs.agree ? "alert" : undefined}>
          {errs.agree && `⚠ ${errs.agree}`}
        </p>

        <label htmlFor="cap">
          Captcha <span aria-hidden>*</span>
        </label>
        <div className="captcha-row">
          <span className="captcha-img" aria-label={`Captcha ${cap.split("").join(" ")}`}>{cap}</span>
          <button type="button" className="icon sm" aria-label="Refresh captcha" onClick={refreshCaptcha}>
            <RefreshCw size={18} />
          </button>
        </div>
        <div className="fld">
          <KeyRound size={18} aria-hidden />
          <input id="cap" autoComplete="off" maxLength={5} placeholder="Type the captcha text displayed above" value={capIn} onChange={(e) => setCapIn(e.target.value)} aria-invalid={!!errs.cap} />
        </div>
        <p className="err" role={errs.cap ? "alert" : undefined}>
          {errs.cap && `⚠ ${errs.cap}`}
        </p>

        <button className="btn big wide" type="submit">
          Submit
        </button>
      </form>
    </div>
  );
}