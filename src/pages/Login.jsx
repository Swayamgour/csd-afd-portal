import React, { useState } from 'react';
import LoginLayout from '../features/auth/LoginLayout.jsx';
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
    <LoginLayout>
      {step === 'login' ? (
        <LoginForm onNeedOtp={handleNeedOtp} />
      ) : (
        <OTPVerification
          sessionData={sessionData}
          onBack={() => setStep('login')}
        />
      )}
    </LoginLayout>
  );
}