import React from 'react';

interface InstagramAuthButtonProps {
  text?: string;
}

const INSTAGRAM_AUTH_URL =
  'https://twiinz-beard-backend-11dfd7158830.herokuapp.com/users/auth/login/instagram/';

export default function InstagramAuthButton({ text = "Continue with Instagram" }: InstagramAuthButtonProps) {
  return (
    <a
      href={INSTAGRAM_AUTH_URL}
      className="w-full flex justify-center items-center py-2 px-4 mt-3 bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 border border-pink-700 rounded shadow text-white font-medium hover:from-pink-600 hover:to-yellow-400 transition"
      style={{ textDecoration: "none", opacity: 0.6, cursor: "not-allowed" }} // visually disabled
      tabIndex={-1}
      aria-disabled="true"
    >
      <svg className="w-6 h-6 mr-2" viewBox="0 0 448 512" fill="currentColor">
        <path d="M224,202.66A53.34,53.34,0,1,0,277.34,256,53.38,53.38,0,0,0,224,202.66Zm124.71-41a54,54,0,0,0-30.19-30.19C293,117.44,265.09,112,224,112s-69,5.44-94.52,19.47A54,54,0,0,0,99.29,161.66C85.26,187.21,80,215.13,80,256s5.26,68.79,19.29,94.34a54,54,0,0,0,30.19,30.19C155,394.56,182.91,400,224,400s69-5.44,94.52-19.47a54,54,0,0,0,30.19-30.19C362.74,324.79,368,296.87,368,256S362.74,187.21,348.71,161.66ZM224,338a82,82,0,1,1,82-82A82,82,0,0,1,224,338Zm85.41-148.61a19.42,19.42,0,1,1-19.42-19.42A19.42,19.42,0,0,1,309.41,189.39Z" />
      </svg>
      {text}
    </a>
  );
}
