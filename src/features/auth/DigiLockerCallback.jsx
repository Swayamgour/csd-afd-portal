import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { AlertCircle, Loader2, ShieldCheck, ArrowLeft } from 'lucide-react';
import AuthArt from '../../pages/AuthArt.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { getRoleNavigatePath } from '../../permissions/roles.js';
import { setCredentials } from './authSlice.js';
import {
  useDigilockerTicketInfoMutation,
  useDigilockerCompleteLoginMutation,
  useDigilockerLinkCompleteMutation,
} from './authApi.js';
import { digilockerMessage, startDigiLocker } from '../../utils/digilocker.js';
import DigiLockerRegisterForm from './DigiLockerRegisterForm.jsx';

/**
 * Landing page for the DigiLocker round trip:
 *   /auth/digilocker/callback?status=ok&mode=LOGIN|REGISTER|LINK&ticket=...
 *   /auth/digilocker/callback?status=error&code=...&mode=...
 * The ticket is single-use, so every ticket is processed exactly once even under React StrictMode.
 */
const jobs = new Map();
const runOnce = (key, fn) => {
  if (!jobs.has(key)) jobs.set(key, fn());
  return jobs.get(key);
};

const errMsg = (e) => digilockerMessage(e?.data?.code, e?.data?.message || e?.message);

export default function DigiLockerCallback() {
  const [params] = useSearchParams();
  // read once, then take the ticket out of the address bar / history
  const initial = useRef(null);
  if (!initial.current) {
    initial.current = {
      status: params.get('status'),
      mode: String(params.get('mode') || '').toUpperCase(),
      code: params.get('code'),
      ticket: params.get('ticket'),
    };
  }
  const { status, mode, code, ticket } = initial.current;

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { login, refreshMe, token } = useAuth();
  const [ticketInfo] = useDigilockerTicketInfoMutation();
  const [completeLogin] = useDigilockerCompleteLoginMutation();
  const [completeLink] = useDigilockerLinkCompleteMutation();

  const [phase, setPhase] = useState(status === 'ok' && ticket ? 'working' : 'error');
  const [error, setError] = useState(
    status === 'ok' && ticket ? '' : digilockerMessage(code, 'The DigiLocker response was incomplete. Please try again.')
  );
  const [info, setInfo] = useState(null);

  useEffect(() => {
    window.history.replaceState({}, document.title, window.location.pathname);
  }, []);

  useEffect(() => {
    if (!(status === 'ok' && ticket)) return;

    runOnce(`${mode}:${ticket}`, async () => {
      try {
        if (mode === 'LOGIN') {
          const res = await completeLogin({ ticket }).unwrap();
          const user = res.user;
          const accessToken = res.accessToken || res.token;
          if (!user || !accessToken) throw new Error('Sign-in response is missing credentials.');
          dispatch(setCredentials({ user, token: accessToken }));
          await login({ authenticatedUser: user, authenticatedToken: accessToken, refreshToken: res.refreshToken });
          navigate(getRoleNavigatePath(user.role), { replace: true });
          return {};
        }
        if (mode === 'REGISTER') {
          return { info: await ticketInfo({ ticket }).unwrap() };
        }
        if (mode === 'LINK') {
          await completeLink({ ticket }).unwrap();
          await refreshMe(token);
          navigate('/beneficiary/settings', { replace: true, state: { digilocker: 'linked' } });
          return {};
        }
        return { error: 'Unknown DigiLocker request. Please start again.' };
      } catch (e) {
        return { error: e?.data ? errMsg(e) : e?.message || 'DigiLocker verification failed.' };
      }
    }).then((r) => {
      if (r?.error) {
        setError(r.error);
        setPhase('error');
      } else if (r?.info) {
        setInfo(r.info);
        setPhase('register');
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (phase === 'register' && info) {
    return (
      <div className="wrap auth reg">
        <AuthArt
          title="Complete your registration."
          text="Your identity has been verified with DigiLocker. Add your canteen card and service details to finish."
        />
        <DigiLockerRegisterForm ticket={ticket} info={info} />
      </div>
    );
  }

  return (
    <div className="wrap auth">
      <AuthArt
        title="DigiLocker verification"
        text="We are verifying your identity securely with DigiLocker. Your Aadhaar number is never stored by this portal."
      />
      <div className="panel logincard authcard" role="status" aria-live="polite">
        {phase === 'working' && (
          <div className="row align-center justify-center gap-1" style={{ padding: '2rem 0' }}>
            <Loader2 size={22} className="spin" aria-hidden />
            <span>
              {mode === 'LOGIN' ? 'Signing you in…' : mode === 'LINK' ? 'Linking your DigiLocker account…' : 'Verifying with DigiLocker…'}
            </span>
          </div>
        )}

        {phase === 'error' && (
          <>
            <div className="alert-banner danger mb-3 row align-center gap-1" role="alert">
              <AlertCircle size={18} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
            <div className="row gap-1 flex-wrap">
              {mode === 'LOGIN' && code !== 'DIGILOCKER_DISABLED' && (
                <button type="button" className="btn out" onClick={() => startDigiLocker('LOGIN')}>
                  <ShieldCheck size={16} /> <span>Try DigiLocker again</span>
                </button>
              )}
              {mode === 'LOGIN' && ['NOT_LINKED', 'DIGILOCKER_NOT_LINKED'].includes(code) && (
                <button type="button" className="btn" onClick={() => startDigiLocker('REGISTER')}>
                  <span>Register with DigiLocker</span>
                </button>
              )}
              {mode === 'REGISTER' && code !== 'DIGILOCKER_DISABLED' && (
                <button type="button" className="btn out" onClick={() => startDigiLocker('REGISTER')}>
                  <ShieldCheck size={16} /> <span>Try DigiLocker again</span>
                </button>
              )}
              {mode === 'LINK' ? (
                <Link to="/beneficiary/settings" className="btn">
                  <ArrowLeft size={16} /> <span>Back to Account Settings</span>
                </Link>
              ) : (
                <Link to={mode === 'REGISTER' ? '/register' : '/login'} className="btn">
                  <ArrowLeft size={16} /> <span>{mode === 'REGISTER' ? 'Back to registration' : 'Back to sign in'}</span>
                </Link>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
