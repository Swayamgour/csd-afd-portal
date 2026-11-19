import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  RefreshCw, ArrowLeft, KeyRound, AlertCircle
} from "lucide-react";
import AuthArt from "./AuthArt";

import { useRegisterMutation, useSendOtpMutation, useCheckDuplicatesMutation } from "../redux/api/authApi";
import EmailOtpModal from "../components/modals/EmailOtpModal.jsx";
import { makeCaptcha } from "../utils/captcha.js";
import DigiLockerButton from "../components/common/DigiLockerButton.jsx";
import { RegisterCardSection, RegisterServiceSection, RegisterIdentitySection, RegisterAccountSection, RegisterSuccessCard } from "../components/register";
import Loader from '../components/common/Loader.jsx';

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

// ---- password rules: must match the backend (auth.routes.js) -------------------
export const PW_RULES = [
  { key: "len", label: "At least 8 characters", need: "at least 8 characters", test: (p) => p.length >= 8 },
  { key: "upper", label: "One uppercase letter (A-Z)", need: "an uppercase letter (A-Z)", test: (p) => /[A-Z]/.test(p) },
  { key: "lower", label: "One lowercase letter (a-z)", need: "a lowercase letter (a-z)", test: (p) => /[a-z]/.test(p) },
  { key: "digit", label: "One number (0-9)", need: "a number (0-9)", test: (p) => /\d/.test(p) },
];
const passwordError = (pw) => {
  const missing = PW_RULES.filter((r) => !r.test(pw || ""));
  return missing.length ? `Password needs: ${missing.map((r) => r.need).join(", ")}.` : "";
};

// Pure validation of the whole form (captcha handled separately). {} => everything is valid.
function validateForm(f) {
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

  const pwMsg = passwordError(f.pw);
  if (pwMsg) {
    x.pw = pwMsg;
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
  return x;
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
    [showCardId, setShowCardId] = useState(false),
    [showChip, setShowChip] = useState(false),
    [showPan, setShowPan] = useState(false),
    [showPanC, setShowPanC] = useState(false),
    [cap, setCap] = useState(makeCaptcha),
    [capIn, setCapIn] = useState(""),
    [isOtpModalOpen, setIsOtpModalOpen] = useState(false),
    [isDispatchingOtp, setIsDispatchingOtp] = useState(false),
    [registrationSuccess, setRegistrationSuccess] = useState(false),
    [registeredUser, setRegisteredUser] = useState(null),
    go = useNavigate();

  const pwStrength = getPasswordStrength(f.pw);

  // live validation: errors show after a field is left, and the submit button stays disabled until everything is valid
  const [touched, setTouched] = useState({});
  const live = validateForm(f);
  const capOk = capIn.trim() === cap;
  const missingCount = Object.keys(live).length + (capOk ? 0 : 1);
  const canSubmit = missingCount === 0;
  const shown = (k) => errs[k] || (touched[k] ? live[k] : "");
  const ID_TO_KEY = { ent: "entitlement", pl: "payLevel" };
  const markTouched = (e) => {
    const id = e.target?.id;
    if (!id || id === "cap") return;
    const k = ID_TO_KEY[id] || id;
    setTouched((t) => (t[k] ? t : { ...t, [k]: true }));
  };

  const [register, { isLoading: isRegistering }] = useRegisterMutation();
  const [sendOtpApi] = useSendOtpMutation();
  const [checkDuplicatesMutation] = useCheckDuplicatesMutation();

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
      const res = await checkDuplicatesMutation({ [field]: value }).unwrap();
      const conflicts = res?.data?.conflicts || {};
      if (conflicts[field]) {
        setErrs((prev) => ({
          ...prev,
          [field]: conflicts[field],
        }));
      }
    } catch (e) {
      console.warn("Duplicate check network notice:", e?.message || e);
    }
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

    const x = validateForm(f);

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
      const dupRes = await checkDuplicatesMutation({
        username: f.username,
        email: f.email,
        mobile: f.mobile,
        cardId: f.cardId,
        chipNumber: f.chip,
        pan: f.pan,
      }).unwrap();
      const dupConflicts = dupRes?.data?.conflicts || {};

      if (Object.keys(dupConflicts).length > 0) {
        const conflictItems = Object.entries(dupConflicts).map(([key, msg]) => ({
          field: FIELD_LABELS[key] || key,
          message: msg,
        }));
        setErrs((prev) => ({
          ...prev,
          ...dupConflicts,
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
        <RegisterSuccessCard registeredUser={registeredUser} f={f} />
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
        onBlurCapture={markTouched}
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

        {/* Faster route: identity verified through DigiLocker, then only card & service details */}
        <div className="reg-digilocker mb-3">
          <DigiLockerButton mode="REGISTER" />
          <p className="small hint" style={{ textAlign: "center", marginTop: ".4rem" }}>
            Verify your identity with DigiLocker, then add your card details. Your Aadhaar number is not stored.
            Or fill the form below.
          </p>
        </div>

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

        <RegisterCardSection
          f={f}
          shown={shown}
          set={set}
          upper={upper}
          checkSingleDuplicate={checkSingleDuplicate}
          showCardId={showCardId}
          setShowCardId={setShowCardId}
          showChip={showChip}
          setShowChip={setShowChip}
        />

        <RegisterServiceSection
          f={f}
          shown={shown}
          set={set}
        />

        <RegisterIdentitySection
          f={f}
          shown={shown}
          upper={upper}
          noPaste={noPaste}
          checkSingleDuplicate={checkSingleDuplicate}
          showPan={showPan}
          setShowPan={setShowPan}
          showPanC={showPanC}
          setShowPanC={setShowPanC}
        />

        <RegisterAccountSection
          f={f}
          shown={shown}
          set={set}
          checkSingleDuplicate={checkSingleDuplicate}
          touched={touched}
          showPw={showPw}
          setShowPw={setShowPw}
          showPwC={showPwC}
          setShowPwC={setShowPwC}
          pwStrength={pwStrength}
          PW_RULES={PW_RULES}
        />

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
          disabled={!canSubmit || isRegistering || isDispatchingOtp}
          title={!canSubmit ? `${missingCount} required item(s) still pending` : undefined}
          style={{ display: "flex" }}
        >
          {(isDispatchingOtp || isRegistering) && <Loader variant="inline" size="sm" />}
          <span>
            {isDispatchingOtp
              ? "Validating & Sending Email OTP..."
              : isRegistering
                ? "Finalizing Registration..."
                : "Register & Verify Email via OTP"}
          </span>
        </button>
        {!canSubmit && (
          <p className="reg-submit-hint" role="status">
            <AlertCircle size={14} aria-hidden /> Complete all required fields correctly ({missingCount} pending) to enable registration.
          </p>
        )}
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