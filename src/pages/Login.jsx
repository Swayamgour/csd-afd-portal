import React, { useState } from 'react';
import AuthArt from './AuthArt.jsx'; // same AuthArt jo Register page use karta hai (path adjust kar lena)
import LoginForm from '../features/auth/LoginForm.jsx';
import OTPVerification from '../features/auth/OTPVerification.jsx';

export default function Login() {
  const [step, setStep] = useState('login'); // 'login' | 'otp'
  const [sessionData, setSessionData] = useState(null);

  const handleNeedOtp = (data) => {
    setSessionData(data);
    setStep('otp');
  };

  return (
    <div className="wrap auth">
      <AuthArt
        title="Welcome back to CSD AFD."
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