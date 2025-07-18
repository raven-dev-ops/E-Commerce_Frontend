// GoogleAuthButton.tsx

import React from 'react';
import { GoogleLogin } from '@react-oauth/google';

interface GoogleAuthButtonProps {
  text?: string;
  onSuccess?: (token: string) => void;
  onError?: (error: string) => void;
}

export default function GoogleAuthButton({ text = "Continue with Google", onSuccess, onError }: GoogleAuthButtonProps) {
  return (
    <div className="w-full mt-3">
      <GoogleLogin
        onSuccess={credentialResponse => {
          if (credentialResponse.credential) {
            onSuccess && onSuccess(credentialResponse.credential);
          } else {
            onError && onError('No credential received');
          }
        }}
        onError={() => onError && onError('Google login failed')}
        useOneTap
      />
    </div>
  );
}
