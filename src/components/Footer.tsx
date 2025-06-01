// src/components/Footer.tsx

import React from 'react';

const Footer: React.FC = () => (
  <footer className="h-16 flex items-center justify-center bg-gray-800 text-white mt-auto"> {/* Added mt-auto to push footer to the bottom */}
    <div className="w-full text-center">
      <p>
        &copy; {new Date().getFullYear()} TwiinZ Beard Balm & Essentials. All rights reserved.
      </p>
    </div>
  </footer>
);

export default Footer;
