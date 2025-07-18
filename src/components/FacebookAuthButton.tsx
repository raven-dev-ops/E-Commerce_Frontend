import React from 'react';

interface FacebookAuthButtonProps {
  text?: string;
}

const FACEBOOK_AUTH_URL =
  'https://twiinz-beard-backend-11dfd7158830.herokuapp.com/users/auth/login/facebook/';

export default function FacebookAuthButton({ text = "Continue with Facebook" }: FacebookAuthButtonProps) {
  return (
    <a
      href={FACEBOOK_AUTH_URL}
      className="w-full flex justify-center items-center py-2 px-4 mt-3 bg-blue-600 border border-blue-700 rounded shadow text-white font-medium hover:bg-blue-700 transition"
      style={{ textDecoration: "none", opacity: 0.6, cursor: "not-allowed" }} // visually disabled
      tabIndex={-1} // makes it unreachable for now
      aria-disabled="true"
    >
      <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24">
        <path d="M22 12c0-5.522-4.477-10-10-10S2 6.478 2 12c0 4.991 3.657 9.128 8.438 9.877v-6.987h-2.54v-2.89h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562v1.875h2.773l-.443 2.89h-2.33V21.877C18.343 21.128 22 16.991 22 12"/>
      </svg>
      {text}
    </a>
  );
}
