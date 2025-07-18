// GoogleAuthButton.tsx

import React, { useState } from 'react';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';

interface GoogleAuthButtonProps {
  text?: string;
  onSuccess?: (token: string) => void;
  onError?: (error: string) => void;
  className?: string;
}

export default function GoogleAuthButton({
  text = "Continue with Google",
  onSuccess,
  onError,
  className = '',
}: GoogleAuthButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleSuccess = (credentialResponse: CredentialResponse) => {
    if (credentialResponse.credential) {
      setLoading(true);
      onSuccess && onSuccess(credentialResponse.credential);
      setLoading(false);
    } else {
      onError && onError('No credential received');
    }
  };

  const handleError = () => {
    onError && onError('Google login failed');
  };

  return (
    <div className={`w-full mt-3 ${className}`}>
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={handleError}
        useOneTap
        // You can add additional props like size, theme, etc. if needed
      />
      {loading && (
        <div className="mt-2 text-center text-gray-500 text-sm">Signing in with Google...</div>
      )}
      {/* Optional: Custom text/button (use Google default button for compliance) */}
      {/* If you want a custom button, use Google API for branding rules */}
    </div>
  );
}
