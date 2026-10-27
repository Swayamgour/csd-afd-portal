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
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2
} from "lucide-react";
import AuthArt from "./AuthArt";

import {
  useRegisterMutation,
  useSendOtpMutation,
} from "../features/auth/authApi";
import EmailOtpModal from "../components/modals/EmailOtpModal.jsx";
import { userService } from "../services/user.service.js";
import { makeCaptcha } from "../utils/captcha.js";

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
    return { label: "Strong", className: "pw-strength-strong" };
  if (score >= 3) return { label: "Medium", className: "pw-strength-medium" };
  return { label: "Weak", className: "pw-strength-weak" };
}

function Field({ id, label, req, hint, err, children }) {
  return (
    <div className="fgrp">
      <label htmlFor={id}>
        {label}
        {req && (
          <span className="req-star" aria-hidden>
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

const FIELD_LABELS = {
  name: "Beneficiary Name",
  cardId: "Grocery Card ID",
  chip: "Chip Number",
  employment: "Employment Status",
  org: "Organization",
  dob: "Date of Birth",
  doe: "Date of Enrollment",
  dor: "Date of Retirement",
  entitlement: "Entitlement Category",
  payLevel: "Pay Level",
  ppo: "PPO Number",
  pan: "PAN Number",
  panC: "Confirm PAN",
  username: "Username",
  email: "Email Address",
  pw: "Password",
  pwC: "Confirm Password",
  mobile: "Mobile Number",
  agree: "Terms of Use & Privacy Policy",
  cap: "Captcha Verification",
};

// Register
export default function Register() {
  const [f, setF] = useState(INIT),
    [errs, setErrs] = useState({}),
    [topErrorBanner, setTopErrorBanner] = useState(""),
    [formErrorList, setFormErrorList] = useState([]),
    [showPw, setShowPw] = useState(false),
    [showPwC, setShowPwC] = useState(false),
    [cap, setCap] = useState(makeCaptcha),
    [capIn, setCapIn] = useState(""),
    [isOtpModalOpen, setIsOtpModalOpen] = useState(false),
    [isDispatchingOtp, setIsDispatchingOtp] = useState(false),
    [registrationSuccess, setRegistrationSuccess] = useState(false),
    [registeredUser, setRegisteredUser] = useState(null),
    go = useNavigate();

  const pwStrength = getPasswordStrength(f.pw);

  const [register, { isLoading: isRegistering }] = useRegisterMutation();
  const [sendOtpApi] = useSendOtpMutation();

  const set = (k) => (e) => {
    setF({
      ...f,
      [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value,
    });
    if (errs[k] || errs.submit || topErrorBanner) {
      setErrs((prev) => {
        const next = { ...prev };
        delete next[k];
        delete next.submit;
        return next;
      });
      setFormErrorList((prev) => {
        const next = prev.filter((item) => item.field !== (FIELD_LABELS[k] || k));
        if (next.length === 0) setTopErrorBanner("");
        return next;
      });
    }
  };

  const upper = (k) => (e) => {
    setF({ ...f, [k]: e.target.value.toUpperCase() });
    if (errs[k] || errs.submit || topErrorBanner) {
      setErrs((prev) => {
        const next = { ...prev };
        delete next[k];
        delete next.submit;
        return next;
      });
      setFormErrorList((prev) => {
        const next = prev.filter((item) => item.field !== (FIELD_LABELS[k] || k));
        if (next.length === 0) setTopErrorBanner("");
        return next;
      });
    }
  };

  const checkSingleDuplicate = async (field, val) => {
    const value = (val || "").trim();
    if (!value || value.length < 3) return;
    try {
      const res = await userService.checkDuplicates({ [field]: value });
      if (res.conflicts && res.conflicts[field]) {
        setErrs((prev) => ({
          ...prev,
          [field]: res.conflicts[field],
        }));
      }
    } catch (e) {}
  };

  const refreshCaptcha = () => {
    setCap(makeCaptcha());
    setCapIn("");
  };

  const scrollToFormTop = () => {
    setTimeout(() => {
      const topEl = document.getElementById("rh") || document.querySelector(".authcard");
      if (topEl) {
        topEl.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 50);
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

    if (!f.agree) {
      x.agree =
        "Please accept the terms of use and privacy.";
    }

    if (!capIn.trim()) {
      x.cap = "Enter the captcha text.";
    } else if (capIn.trim() !== cap) {
      x.cap = "Captcha does not match. Try again.";
      refreshCaptcha();
    }

    setErrs(x);

    if (Object.keys(x).length) {
      const errorItems = Object.entries(x).map(([key, msg]) => ({
        field: FIELD_LABELS[key] || key,
        message: msg,
      }));
      setTopErrorBanner("Please correct the highlighted field errors below to proceed with registration.");
      setFormErrorList(errorItems);
      scrollToFormTop();
      return;
    }

    // Step 1: Pre-check duplicate fields (username, email, cardId, etc.) BEFORE sending OTP
    setIsDispatchingOtp(true);
    setTopErrorBanner("");
    setFormErrorList([]);
    try {
      const dupCheck = await userService.checkDuplicates({
        username: f.username,
        email: f.email,
        mobile: f.mobile,
        cardId: f.cardId,
        chipNumber: f.chip,
        pan: f.pan,
      });

      if (!dupCheck.available) {
        const conflictItems = Object.entries(dupCheck.conflicts || {}).map(([key, msg]) => ({
          field: FIELD_LABELS[key] || key,
          message: msg,
        }));
        setErrs((prev) => ({
          ...prev,
          ...dupCheck.conflicts,
          submit:
            "Some details (such as username, email or Card ID) are already registered in the CSD AFD Portal. Please correct the highlighted fields.",
        }));
        setTopErrorBanner("Some details are already registered in the CSD AFD Portal. Please review the highlighted fields below.");
        setFormErrorList(conflictItems);
        scrollToFormTop();
        setIsDispatchingOtp(false);
        return;
      }
    } catch (e) {
      // Continue if duplicate check service fails
    }

    // Step 2: Form is validated & unique -> Request backend to create and dispatch OTP securely
    try {
      await sendOtpApi({
        target: f.email.trim(),
        purpose: "REGISTER_EMAIL",
      }).unwrap();

      setTopErrorBanner("");
      setFormErrorList([]);
      setIsOtpModalOpen(true);
    } catch (err) {
      console.error("OTP dispatch error:", err);
      const errMsg = err?.data?.message || err?.message || "Failed to dispatch verification email.";
      setErrs((prev) => ({
        ...prev,
        submit: errMsg,
      }));
      setTopErrorBanner(errMsg);
      setFormErrorList([]);
      scrollToFormTop();
    } finally {
      setIsDispatchingOtp(false);
    }
  };

  const noPaste = (e) => {
    e.preventDefault();
  };

  const handleOtpVerified = async (verifiedOtp) => {
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
      emailOtp: verifiedOtp,
      isEmailVerified: true,
      category: "OTHER",
    };

    // 1. Persist to backend MongoDB
    try {
      await register(payload).unwrap();
    } catch (apiError) {
      console.error("Backend register error:", apiError);
      const apiMsg =
        apiError?.data?.message ||
        apiError?.error ||
        "Registration could not be completed. Please check your details.";
      const errCode = apiError?.data?.code;
      const fieldErrors = {};

      if (errCode === "USERNAME_EXISTS") {
        fieldErrors.username = "Username is already registered. Please choose another username.";
      } else if (errCode === "EMAIL_EXISTS") {
        fieldErrors.email = "Email is already registered. Please sign in or use another email.";
      } else if (errCode === "CARD_ID_EXISTS") {
        fieldErrors.cardId = "Card ID is already registered in the portal.";
      } else if (errCode === "PAN_EXISTS") {
        fieldErrors.pan = "PAN number is already registered.";
      } else if (errCode === "MOBILE_EXISTS") {
        fieldErrors.mobile = "Mobile number is already registered.";
      } else if (errCode === "CHIP_NUMBER_EXISTS") {
        fieldErrors.chip = "Chip number is already registered.";
      }

      const isOtpError =
        errCode === "OTP_INVALID" ||
        errCode === "OTP_EXPIRED" ||
        errCode === "OTP_LOCKED" ||
        (errCode && String(errCode).includes("OTP")) ||
        (apiMsg && apiMsg.toLowerCase().includes("otp"));

      if (isOtpError) {
        // KEEP modal open so the user can easily re-type or correct the OTP!
        throw new Error(apiMsg || "Incorrect OTP. Please check and try again.");
      }

      // If error is for form fields (like duplicate username/card), close modal and display on form
      setIsOtpModalOpen(false);
      setErrs((prev) => ({
        ...prev,
        ...fieldErrors,
        submit: apiMsg,
      }));
      setTopErrorBanner(apiMsg);
      setFormErrorList(
        Object.entries(fieldErrors).map(([key, msg]) => ({
          field: FIELD_LABELS[key] || key,
          message: msg,
        }))
      );
      scrollToFormTop();
      throw new Error(apiMsg);
    }

    // 2. State transition to approval pending state
    setRegisteredUser({
      ...payload,
      id: payload.cardId || payload.username,
      verificationStatus: 'PENDING',
      status: 'Pending',
    });

    // 3. Mark registration completed & transition to approval pending state
    setIsOtpModalOpen(false);
    setRegistrationSuccess(true);
  };

  if (registrationSuccess) {
    return (
      <div className="wrap auth reg">
        <AuthArt
          title="Registration Completed!"
          text="Your email address has been verified. Your account is currently pending administrator verification."
        />

        <div className="panel logincard authcard reg-success-card">
          <div className="reg-success-icon-wrap">
            <CheckCircle2 size={40} />
          </div>

          <h1 className="reg-success-title">
            Registration Successful!
          </h1>

          <div className="reg-success-badge">
            <ShieldCheck size={16} /> Email Verified via OTP
          </div>

          {/* Pending Status Alert Banner */}
          <div className="reg-pending-alert">
            <div className="row align-center gap-1 mb-1">
              <Clock size={20} color="var(--color-warning)" />
              <strong className="reg-pending-title">
                Account Status: PENDING CS DIRECTOR APPROVAL
              </strong>
            </div>
            <p className="reg-pending-desc">
              Your account has been registered and your official email has been verified. You can log in to view products and search the catalog. However, <strong>Demand Generation</strong> will be available after your account is approved by the CS Director.
            </p>
          </div>

          {/* Beneficiary Details Summary Card */}
          <div className="reg-summary-card">
            <div className="reg-summary-row">
              <span className="reg-summary-label">Beneficiary Name:</span>
              <strong className="reg-summary-val">{registeredUser?.name || f.name}</strong>
            </div>
            <div className="reg-summary-row">
              <span className="reg-summary-label">Username:</span>
              <strong className="reg-summary-val">{registeredUser?.username || f.username}</strong>
            </div>
            <div className="reg-summary-row">
              <span className="reg-summary-label">Verified Email:</span>
              <span className="text-green fw-bold">{f.email} ✓</span>
            </div>
            <div className="reg-summary-row">
              <span className="reg-summary-label">Grocery Card ID:</span>
              <strong className="reg-summary-val">{f.cardId}</strong>
            </div>
          </div>

          <Link
            to="/login"
            className="btn big wide row align-center justify-center text-center"
          >
            Proceed to Beneficiary Login
          </Link>
        </div>
      </div>
    );
  }

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

        {/* Top Validation & Submission Error Banner */}
        {topErrorBanner && (
          <div
            className="alert-banner danger mb-3"
            role="alert"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.55rem",
              padding: "1rem 1.25rem",
              borderRadius: "10px",
              backgroundColor: "#fef2f2",
              border: "1.5px solid #fca5a5",
              color: "#991b1b",
            }}
          >
            <div className="row align-center gap-1" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <AlertCircle size={20} className="flex-shrink-0" style={{ color: "#dc2626" }} />
              <strong style={{ fontSize: "0.95rem", color: "#991b1b" }}>
                Form Submission Blocked: Please resolve the following errors:
              </strong>
            </div>
            <p style={{ margin: "0.15rem 0", fontSize: "0.88rem", color: "#7f1d1d" }}>
              {topErrorBanner}
            </p>
            {formErrorList.length > 0 && (
              <ul
                style={{
                  margin: "0.25rem 0 0 0",
                  paddingLeft: "1.35rem",
                  fontSize: "0.85rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.3rem",
                  color: "#991b1b",
                }}
              >
                {formErrorList.map((item, idx) => (
                  <li key={idx}>
                    <strong>{item.field}:</strong> {item.message}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

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
                  onBlur={() => checkSingleDuplicate("cardId", f.cardId)}
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
                  onBlur={() => checkSingleDuplicate("chipNumber", f.chip)}
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
                  onBlur={() => checkSingleDuplicate("pan", f.pan)}
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
                onBlur={() => checkSingleDuplicate("username", f.username)}
                aria-invalid={!!errs.username}
              />
            </div>
          </Field>

          <div className="reg-grid">
            <Field id="email" label="Email" req err={errs.email} hint="A 6-digit OTP will be sent to this email via EmailJS upon submission.">
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
                  aria-invalid={!!errs.email}
                />
              </div>
            </Field>

            <Field id="mobile" label="Mobile number" req err={errs.mobile}>
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
                  aria-invalid={!!errs.mobile}
                />
              </div>
            </Field>
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
                  className={pwStrength?.label === "Strong" ? "input-valid-strong" : ""}
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
                <div className={`pw-strength-badge ${pwStrength.className}`}>
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

        {errs.submit && (
          <div className="alert-banner danger small mb-3 row align-center gap-1" role="alert">
            <AlertCircle size={18} className="flex-shrink-0" />
            <span>{errs.submit}</span>
          </div>
        )}

        <button
          className="btn big wide row align-center justify-center gap-1"
          type="submit"
          disabled={isRegistering || isDispatchingOtp}
          style={{ display: "flex" }}
        >
          {(isDispatchingOtp || isRegistering) && <Loader2 size={18} className="spin" />}
          <span>
            {isDispatchingOtp
              ? "Validating & Sending Email OTP..."
              : isRegistering
                ? "Finalizing Registration..."
                : "Register & Verify Email via OTP"}
          </span>
        </button>
      </form>

      {/* Dedicated EmailJS OTP Verification Modal */}
      <EmailOtpModal
        isOpen={isOtpModalOpen}
        onClose={() => setIsOtpModalOpen(false)}
        email={f.email}
        name={f.name}
        onVerified={handleOtpVerified}
        onResendOtp={async () => {
          await sendOtpApi({
            target: f.email.trim(),
            purpose: "REGISTER_EMAIL",
          }).unwrap();
        }}
        isSubmitting={isRegistering}
      />
    </div>
  );
}
