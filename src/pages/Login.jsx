import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../features/auth/LoginForm.jsx';
import OTPVerification from '../features/auth/OTPVerification.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { getRoleNavigatePath } from '../permissions/roles.js';
import AuthArt from './AuthArt';

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
    <div className="wrap auth">
      <AuthArt
        title="Welcome back to CSD AFD."
        text="Sign in with your User ID and password to place demands, track orders and pay in one place."
      />

      {step === 'login' ? (
        <LoginForm onNeedOtp={handleNeedOtp} />
      ) : (
        <OTPVerification sessionData={sessionData} onBack={() => setStep('login')} />
      )}
    </div>
  );
}