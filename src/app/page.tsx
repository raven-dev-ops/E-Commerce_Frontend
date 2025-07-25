// src/app/page.tsx

import React from 'react';

const Page: React.FC = () => (
  <div className="relative w-full h-full"> {/* Simplified container div */}
    <div className="home-background absolute inset-0 z-0" />
    <h1 className="text-3xl text-white text-center drop-shadow-lg z-10 relative">
      Website Development Progression
      Currently
        Updating Products Page
          Adding Product Images, Finalizing UIX
      To Do
        Update Merch Page
        Update Profile Page
        Update Cart Page
        Update Admin Dashboard
      Pending
        Ingredients List
        Vendor Booth Schedule
        Social Media Links
          Facebook
          Instagram
          Tiktok
          Youtube
          X
        Domain Purchase
        Stripe Account
        Fourthwall Account
        Privacy Policy
        Terms of Service
        Refund Policy
        Contact Us
    </h1>
  </div>
);

export default Page;
