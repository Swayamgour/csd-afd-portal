import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  User, CreditCard, Mail, Lock, Phone, IdCard, ShieldCheck, CheckCircle2, Clock, AlertCircle, Loader2, Eye, EyeOff,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { getRoleNavigatePath } from '../../permissions/roles.js';
import { setCredentials } from './authSlice.js';
import {
  useSendOtpMutation,
  useDigilockerCompleteRegistrationMutation,
} from './authApi.js';
import EmailOtpModal from '../../components/modals/EmailOtpModal.jsx';
import { digilockerMessage } from '../../utils/digilocker.js';

const EMPLOYMENT = [
  { label: 'Serving', value: 'SERVING' },
  { label: 'Retired', value: 'RETIRED' },
  { label: 'Defence Civilian', value: 'DEFENCE_CIVILIAN' },
];
const ORGS = ['Army', 'Navy', 'Air Force', 'Defence Civilian / Other'];
const ENTITLEMENT = [
  'Serving - Armed Forces',
  'Retired - Armed Forces',
  'Serving - Defence Civilian',
  'Retired - Defence Civilian',
];
const PAY_LEVELS = Array.from({ length: 18 }, (_, i) => `Level ${i + 1}`);

// same password rules as the normal registration form / backend
const PW_RULES = [
  [(p) => p.length >= 8, 'at least 8 characters'],
  [(p) => /[A-Z]/.test(p), 'an uppercase letter'],
  [(p) => /[a-z]/.test(p), 'a lowercase letter'],
  [(p) => /\d/.test(p), 'a number'],
];

const toDateInput = (d) => {
  if (!d) return '';
  const x = new Date(d);
  return Number.isNaN(x.getTime()) ? '' : x.toISOString().slice(0, 10);
};

function Field({ id, label, req, hint, err, children }) {
  return (
    <div className="fgrp">
      <label htmlFor={id}>
        {label}
        {req && <span className="req-star" aria-hidden> *</span>}
      </label>
      {children}
      {hint && <p className="small hint">{hint}</p>}
      <p className="err" role={err ? 'alert' : undefined}>{err && `⚠ ${err}`}</p>
    </div>
  );
}

function validate(f) {
  const x = {};
  if (!/^[A-Za-z .]{2,}$/.test(f.name.trim())) x.name = 'Enter your name as printed on the canteen card (alphabets only).';
  if (!f.dob) x.dob = 'Select your date of birth.';
  if (!/^(GA|GB|GC|GE|GM|GR)\d{14}[A-Za-z]\d{2}$/i.test(f.cardId.trim())) x.cardId = 'Enter a valid 19 character Card ID (e.g. GA01052027551000J00).';
  if (!/^\d{16}$/.test(f.chip.trim())) x.chip = 'Enter the 16 digit chip number.';
  if (!f.employment) x.employment = 'Select employment status.';
  if (!f.org) x.org = 'Select organization.';
  if (!f.doe) x.doe = 'Select date of enrollment / commissioning.';
  if (f.employment === 'RETIRED' && !f.dor) x.dor = 'Select date of retirement.';
  if (!f.entitlement) x.entitlement = 'Select entitlement category.';
  if (!f.payLevel) x.payLevel = 'Select pay level.';
  if (!/^[A-Za-z]{5}\d{4}[A-Za-z]$/.test(f.pan.trim())) x.pan = 'Enter a valid PAN number.';
  if (!/^[A-Za-z0-9]{3,}$/.test(f.username)) x.username = 'Use letters and numbers only (min 3).';
  if (!/^\S+@\S+\.\S+$/.test(f.email)) x.email = 'Enter a valid email address.';
  if (!/^[6-9]\d{9}$/.test(f.mobile)) x.mobile = 'Enter a valid 10 digit mobile number.';
  if (f.setPassword) {
    const missing = PW_RULES.filter(([t]) => !t(f.pw)).map(([, m]) => m);
    if (missing.length) x.pw = `Password needs: ${missing.join(', ')}.`;
    if (f.pwC !== f.pw) x.pwC = 'Passwords do not match.';
  }
  if (!f.agree) x.agree = 'Please accept the terms of use and privacy policy.';
  return x;
}

const ERROR_CODE_FIELD = {
  USERNAME_EXISTS: ['username', 'Username is already registered. Please choose another.'],
  EMAIL_EXISTS: ['email', 'Email is already registered.'],
  MOBILE_EXISTS: ['mobile', 'Mobile number is already registered.'],
  CARD_ID_EXISTS: ['cardId', 'Card ID is already registered in the portal.'],
  CHIP_NUMBER_EXISTS: ['chip', 'Chip number is already registered.'],
  PAN_EXISTS: ['pan', 'PAN number is already registered.'],
};

/**
 * Second half of "Register with DigiLocker": name / DOB come from DigiLocker (shown as verified),
 * the rest is the usual canteen-card + service details. The beneficiary account is created as
 * PENDING - the CS Director approval workflow is unchanged.
 */
export default function DigiLockerRegisterForm({ ticket, info }) {
  const [f, setF] = useState({
    name: info?.name || '',
    dob: toDateInput(info?.dob),
    cardId: '', chip: '', employment: '', org: '', doe: '', dor: '', entitlement: '', payLevel: '',
    pan: '', ppo: '', username: '', email: '', mobile: '',
    setPassword: false, pw: '', pwC: '', agree: false,
  });
  const [errs, setErrs] = useState({});
  const [banner, setBanner] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [otpOpen, setOtpOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(null);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { login } = useAuth();
  const [sendOtp] = useSendOtpMutation();
  const [completeRegistration, { isLoading: registering }] = useDigilockerCompleteRegistrationMutation();

  const set = (k) => (e) => {
    const v = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setF((p) => ({ ...p, [k]: v }));
    if (errs[k] || banner) {
      setErrs((p) => { const n = { ...p }; delete n[k]; return n; });
      setBanner('');
    }
  };
  const upper = (k) => (e) => set(k)({ target: { type: 'text', value: e.target.value.toUpperCase() } });

  const submit = async (e) => {
    e.preventDefault();
    const x = validate(f);
    setErrs(x);
    if (Object.keys(x).length) {
      setBanner('Please correct the highlighted fields to continue.');
      document.getElementById('dlrh')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    setSending(true);
    setBanner('');
    try {
      await sendOtp({ target: f.email.trim().toLowerCase(), purpose: 'REGISTER_EMAIL' }).unwrap();
      setOtpOpen(true);
    } catch (err) {
      setBanner(err?.data?.message || err?.message || 'Could not send the verification email. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const onOtpVerified = async (otp) => {
    const body = {
      ticket,
      name: f.name.trim(),
      dob: f.dob,
      cardId: f.cardId.trim().toUpperCase(),
      chipNumber: f.chip.trim(),
      employmentStatus: f.employment,
      organization: f.org,
      dateOfEnrollment: f.doe || undefined,
      dateOfRetirement: f.dor || undefined,
      entitlement: f.entitlement,
      payLevel: f.payLevel,
      ppo: f.ppo.trim() || undefined,
      pan: f.pan.trim().toUpperCase(),
      username: f.username.trim().toLowerCase(),
      email: f.email.trim().toLowerCase(),
      mobile: f.mobile.trim(),
      ...(f.setPassword ? { password: f.pw } : {}),
      emailOtp: otp,
      category: 'OTHER',
    };
    try {
      const res = await completeRegistration(body).unwrap();
      const accessToken = res.accessToken || res.token;
      if (res.user && accessToken) {
        dispatch(setCredentials({ user: res.user, token: accessToken }));
        await login({ authenticatedUser: res.user, authenticatedToken: accessToken, refreshToken: res.refreshToken });
      }
      setOtpOpen(false);
      setDone({ identityReviewRequired: !!res.identityReviewRequired, role: res.user?.role || 'beneficiary' });
    } catch (err) {
      const code = err?.data?.code;
      const msg = digilockerMessage(code, err?.data?.message || err?.message || 'Registration could not be completed.');
      if (code && String(code).includes('OTP')) throw new Error(msg); // keep the OTP box open
      setOtpOpen(false);
      const mapped = ERROR_CODE_FIELD[code];
      if (mapped) setErrs((p) => ({ ...p, [mapped[0]]: mapped[1] }));
      setBanner(msg);
      document.getElementById('dlrh')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (['DIGILOCKER_TICKET_INVALID', 'DIGILOCKER_ALREADY_REGISTERED'].includes(code)) {
        setBanner(`${msg} Please go back and start again.`);
      }
      throw new Error(msg);
    }
  };

  if (done) {
    return (
      <div className="panel logincard authcard reg-success-card">
        <div className="reg-success-icon-wrap"><CheckCircle2 size={40} /></div>
        <h1 className="reg-success-title">Registration Successful!</h1>
        <div className="reg-success-badge"><ShieldCheck size={16} /> Identity verified with DigiLocker</div>
        <div className="reg-pending-alert">
          <div className="row align-center gap-1 mb-1">
            <Clock size={20} color="var(--color-warning)" />
            <strong className="reg-pending-title">Account Status: PENDING CS DIRECTOR APPROVAL</strong>
          </div>
          <p className="reg-pending-desc">
            Your account is active and you can browse products. <strong>Demand generation</strong> opens after the CS
            Director approves your registration. DigiLocker verification does not replace this approval.
          </p>
          {done.identityReviewRequired && (
            <p className="reg-pending-desc">
              The name / date of birth you entered differs from your DigiLocker record, so the approving officer will
              review it manually.
            </p>
          )}
        </div>
        <button type="button" className="btn big wide" onClick={() => navigate(getRoleNavigatePath(done.role), { replace: true })}>
          Go to my dashboard
        </button>
      </div>
    );
  }

  return (
    <form className="panel logincard authcard" onSubmit={submit} noValidate aria-labelledby="dlrh">
      <div className="between">
        <Link to="/register" className="vli">Use the standard registration instead</Link>
      </div>
      <h1 id="dlrh">Register with DigiLocker</h1>

      <div className="alert-banner success small mb-3 row align-center gap-1" role="status">
        <ShieldCheck size={18} className="flex-shrink-0" />
        <span>
          Verified by DigiLocker{info?.name ? <>: <strong>{info.name}</strong></> : ''}
          {info?.dob ? <> · DOB <strong>{new Date(info.dob).toLocaleDateString('en-IN')}</strong></> : ''}
        </span>
      </div>
      <p className="reg-warn">
        Enter your name and date of birth exactly as on your canteen card. Do not use service number / rank. If they
        differ from your DigiLocker record, your registration is flagged for manual review.
      </p>

      {banner && (
        <div className="alert-banner danger mb-3 row align-center gap-1" role="alert">
          <AlertCircle size={18} className="flex-shrink-0" />
          <span>{banner}</span>
        </div>
      )}

      <div className="reg-grid">
        <Field id="dl-name" label="Beneficiary name" req err={errs.name}>
          <div className="fld"><User size={18} aria-hidden />
            <input id="dl-name" value={f.name} onChange={set('name')} autoComplete="name" />
          </div>
        </Field>
        <Field id="dl-dob" label="Date of birth" req err={errs.dob}>
          <input id="dl-dob" type="date" value={f.dob} onChange={set('dob')} max={new Date().toISOString().slice(0, 10)} />
        </Field>
        <Field id="dl-card" label="Grocery Card ID" req err={errs.cardId} hint="19 characters, starts with GA/GB/GC/GE/GM/GR.">
          <div className="fld has-eye"><CreditCard size={18} aria-hidden />
            <input id="dl-card" type={showSecret ? 'text' : 'password'} autoComplete="off" maxLength={19} value={f.cardId} onChange={upper('cardId')} />
            <button type="button" className="eye" aria-label={showSecret ? 'Hide' : 'Show'} onClick={() => setShowSecret((v) => !v)}>
              {showSecret ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </Field>
        <Field id="dl-chip" label="Chip number" req err={errs.chip} hint="16 digits, on the back of the grocery card.">
          <div className="fld"><IdCard size={18} aria-hidden />
            <input id="dl-chip" inputMode="numeric" autoComplete="off" maxLength={16} value={f.chip} onChange={set('chip')} />
          </div>
        </Field>
        <Field id="dl-emp" label="Employment status" req err={errs.employment}>
          <select id="dl-emp" value={f.employment} onChange={set('employment')}>
            <option value="">Select</option>
            {EMPLOYMENT.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </Field>
        <Field id="dl-org" label="Organization" req err={errs.org}>
          <select id="dl-org" value={f.org} onChange={set('org')}>
            <option value="">Select</option>
            {ORGS.map((o) => <option key={o}>{o}</option>)}
          </select>
        </Field>
        <Field id="dl-doe" label="Date of enrollment / commissioning" req err={errs.doe}>
          <input id="dl-doe" type="date" value={f.doe} onChange={set('doe')} />
        </Field>
        <Field id="dl-dor" label="Date of retirement" req={f.employment === 'RETIRED'} err={errs.dor}>
          <input id="dl-dor" type="date" value={f.dor} onChange={set('dor')} />
        </Field>
        <Field id="dl-ent" label="Entitlement category" req err={errs.entitlement}>
          <select id="dl-ent" value={f.entitlement} onChange={set('entitlement')}>
            <option value="">Select</option>
            {ENTITLEMENT.map((o) => <option key={o}>{o}</option>)}
          </select>
        </Field>
        <Field id="dl-pl" label="Pay level" req err={errs.payLevel}>
          <select id="dl-pl" value={f.payLevel} onChange={set('payLevel')}>
            <option value="">Select</option>
            {PAY_LEVELS.map((o) => <option key={o}>{o}</option>)}
          </select>
        </Field>
        <Field id="dl-pan" label="PAN number" req err={errs.pan}>
          <input id="dl-pan" autoComplete="off" maxLength={10} value={f.pan} onChange={upper('pan')} />
        </Field>
        <Field id="dl-ppo" label="PPO number" err={errs.ppo}>
          <input id="dl-ppo" autoComplete="off" value={f.ppo} onChange={set('ppo')} />
        </Field>
        <Field id="dl-user" label="Choose a username" req err={errs.username}>
          <div className="fld"><User size={18} aria-hidden />
            <input id="dl-user" autoComplete="username" value={f.username} onChange={set('username')} />
          </div>
        </Field>
        <Field id="dl-mobile" label="Mobile number" req err={errs.mobile}>
          <div className="fld"><Phone size={18} aria-hidden />
            <input id="dl-mobile" inputMode="numeric" maxLength={10} autoComplete="tel" value={f.mobile} onChange={set('mobile')} />
          </div>
        </Field>
        <Field id="dl-email" label="Email address" req err={errs.email} hint="A 6-digit verification code will be sent here.">
          <div className="fld"><Mail size={18} aria-hidden />
            <input id="dl-email" type="email" autoComplete="email" value={f.email} onChange={set('email')} />
          </div>
        </Field>
      </div>

      <label className="checkbox-label row align-center gap-1 mb-2">
        <input type="checkbox" checked={f.setPassword} onChange={set('setPassword')} />
        <span className="small">Also set a password (optional). Without one you will always sign in with DigiLocker.</span>
      </label>
      {f.setPassword && (
        <div className="reg-grid">
          <Field id="dl-pw" label="Password" req err={errs.pw}>
            <div className="fld has-eye"><Lock size={18} aria-hidden />
              <input id="dl-pw" type={showPw ? 'text' : 'password'} autoComplete="new-password" value={f.pw} onChange={set('pw')} />
              <button type="button" className="eye" aria-label={showPw ? 'Hide password' : 'Show password'} onClick={() => setShowPw((v) => !v)}>
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </Field>
          <Field id="dl-pwc" label="Confirm password" req err={errs.pwC}>
            <div className="fld"><Lock size={18} aria-hidden />
              <input id="dl-pwc" type="password" autoComplete="new-password" value={f.pwC} onChange={set('pwC')} />
            </div>
          </Field>
        </div>
      )}

      <label className="checkbox-label row align-center gap-1 mb-1">
        <input type="checkbox" checked={f.agree} onChange={set('agree')} />
        <span className="small">I accept the <Link to="/info/terms">Terms of Use</Link> and <Link to="/info/privacy">Privacy Policy</Link>.</span>
      </label>
      <p className="err" role={errs.agree ? 'alert' : undefined}>{errs.agree && `⚠ ${errs.agree}`}</p>

      <button className="btn big wide row align-center justify-center gap-1" type="submit" disabled={sending || registering} style={{ display: 'flex' }}>
        {(sending || registering) && <Loader2 size={18} className="spin" />}
        <span>{sending ? 'Sending verification code…' : 'Verify email & complete registration'}</span>
      </button>

      <EmailOtpModal
        isOpen={otpOpen}
        onClose={() => setOtpOpen(false)}
        email={f.email}
        name={f.name}
        onVerified={onOtpVerified}
        onResendOtp={async () => {
          await sendOtp({ target: f.email.trim().toLowerCase(), purpose: 'REGISTER_EMAIL' }).unwrap();
        }}
        isSubmitting={registering}
      />
    </form>
  );
}
