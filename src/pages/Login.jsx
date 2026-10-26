import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthArt from './AuthArt.jsx';
import LoginForm from '../features/auth/LoginForm.jsx';
import OTPVerification from '../features/auth/OTPVerification.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { getRoleNavigatePath } from '../permissions/roles.js';

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
        title="Welcome  to CSD AFD Portal"
        text="Login with your portal role and credentials to access your account."
      />

      {step === 'login' ? (
        <LoginForm onNeedOtp={handleNeedOtp} />
      ) : (
        <OTPVerification
          sessionData={sessionData}
          onBack={() => setStep('login')}
        />
      )}
    </div>
  );
}