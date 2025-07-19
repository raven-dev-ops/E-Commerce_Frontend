// GoogleAuthButton.tsx

import React from 'react';
import { useGoogleLogin } from '@react-oauth/google';

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
  const login = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      if ('code' in tokenResponse && tokenResponse.code) {
        fetch('https://twiinz-beard-backend-11dfd7158830.herokuapp.com/users/auth/google/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: tokenResponse.code }),
          credentials: 'include',
        })
          .then(async (res) => {
            const contentType = res.headers.get('Content-Type');
            const isJSON = contentType && contentType.includes('application/json');
            const rawText = await res.text();

            if (!isJSON) {
              console.error('❌ Unexpected response type:', rawText);
              onError?.(`Unexpected non-JSON response: ${rawText}`);
              return;
            }

            try {
              const data = JSON.parse(rawText);
              if (!res.ok) {
                console.error('❌ Backend error:', data);
                onError?.(`Backend error: ${JSON.stringify(data)}`);
              } else {
                const token = data.key || data.access || data.token || '';
                if (token) {
                  console.log('✅ Logged in successfully!', token);
                  onSuccess?.(token);
                } else {
                  onError?.('Login succeeded but no token returned.');
                }
              }
            } catch (e) {
              console.error('❌ Invalid JSON response:', rawText);
              onError?.(`Invalid JSON from backend: ${rawText}`);
            }
          })
          .catch((e) => {
            console.error('❌ Network error:', e);
            onError?.(`Network error: ${e.message}`);
          });
      } else {
        onError?.('No code received from Google');
      }
    },
    onError: () => {
      onError?.('Google login failed');
    },
    flow: 'auth-code',
  });

  return (
    <button
      type="button"
      onClick={() => login()}
      className={`w-full flex justify-center items-center py-2 px-4 bg-white border border-gray-300 rounded shadow text-gray-700 font-medium hover:bg-gray-50 transition ${className}`}
    >
      <svg className="w-6 h-6 mr-2" viewBox="0 0 48 48">
        <g>
          <path fill="#4285F4" d="M44.5 20H24v8.5h11.7C34.7 33.5 29.8 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.1 8 2.9l6-6C34.6 5.1 29.6 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.5 0 20.1-8 20.1-20 0-1.3-.1-2.3-.3-3z" />
          <path fill="#34A853" d="M6.3 14.6l7 5.1C15.2 16.2 19.2 13 24 13c3.1 0 5.9 1.1 8 2.9l6-6C34.6 5.1 29.6 3 24 3 16.3 3 9.3 7.7 6.3 14.6z" />
          <path fill="#FBBC05" d="M24 45c5.6 0 10.6-1.8 14.7-4.8l-6.8-5.6c-2.1 1.4-4.8 2.4-7.9 2.4-5.8 0-10.7-3.9-12.5-9.2l-7 5.4C9.3 40.3 16.3 45 24 45z" />
          <path fill="#EA4335" d="M44.5 20H24v8.5h11.7C34.7 33.5 29.8 36 24 36c-6.6 0-12-5.4-12-12 0-1.4.2-2.8.5-4.1l-7-5.1C3.9 18.2 3 21 3 24c0 11.6 9.4 21 21 21 10.5 0 20.1-8 20.1-20 0-1.3-.1-2.3-.3-3z" />
        </g>
      </svg>
      {text}
    </button>
  );
}
