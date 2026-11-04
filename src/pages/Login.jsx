import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Phone, Mail } from 'lucide-react';
import LoginForm from '../features/auth/LoginForm.jsx';
import OTPVerification from '../features/auth/OTPVerification.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { getRoleNavigatePath } from '../permissions/roles.js';

const STEPS = [
  { title: 'Enter your details', text: 'Your User ID and password.' },
  { title: 'Type the captcha', text: 'Copy the letters shown on screen.' },
  { title: 'Confirm with a code', text: 'Enter the 6-digit code sent to your email, if asked.' },
];

export default function Login() {
  const { isAuthenticated, user, loading } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState('login'); // 'login' | 'otp'
  const [sessionData, setSessionData] = useState(null);

  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      const dest = getRoleNavigatePath(user.role);
      navigate(dest, { replace: true });
    }
  }, [isAuthenticated, user, loading, navigate]);

  const handleNeedOtp = (data) => {
    setSessionData(data);
    setStep('otp');
  };

  return (
    <div className="av2">
      <aside className="av2-side">
        <div className="av2-side-inner">
          <div className="av2-brand">
            <span className="av2-brand-mark" aria-hidden="true">
              <ShieldCheck size={26} />
            </span>
            <span className="av2-brand-text">
              <strong>CSD AFD Portal</strong>
              <small>Canteen Stores Department · Ministry of Defence</small>
            </span>
          </div>

          <h2 className="av2-headline">Place demands, track orders and pay in one place.</h2>
          <p className="av2-lead">
            One account for beneficiaries, depots, canteens, dealers and officials.
          </p>

          <ol className="av2-steps" aria-label="How sign-in works">
            {STEPS.map((s, i) => (
              <li key={s.title}>
                <span className="av2-step-no" aria-hidden="true">{i + 1}</span>
                <span className="av2-step-body">
                  <strong>{s.title}</strong>
                  <small>{s.text}</small>
                </span>
              </li>
            ))}
          </ol>

          <div className="av2-help">
            <p className="av2-help-title">Need help signing in?</p>
            <p className="av2-help-row">
              <Phone size={16} aria-hidden="true" />
              <span>1800-180-5555 (toll free)</span>
            </p>
            <p className="av2-help-row">
              <Mail size={16} aria-hidden="true" />
              <span>afd.helpdesk@csdindia.gov.in</span>
            </p>
          </div>
        </div>
      </aside>

      <main className="av2-main">
        <div className="av2-card">
          {step === 'login' ? (
            <LoginForm onNeedOtp={handleNeedOtp} />
          ) : (
            <OTPVerification sessionData={sessionData} onBack={() => setStep('login')} />
          )}
        </div>
      </main>
    </div>
  );
}
