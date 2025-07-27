// src/app/page.tsx

import React from 'react';

const Page: React.FC = () => (
  <div className="relative w-full h-full min-h-screen">
    {/* Background overlay */}
    <div className="home-background absolute inset-0 z-0" />
    {/* Content container */}
    <div className="relative z-10 flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl text-white font-bold text-center drop-shadow-lg mb-8">
        Website Development Progression
      </h1>
      <section className="w-full max-w-xl bg-black/70 rounded-xl p-6 shadow-xl">
        <div className="mb-4">
          <h2 className="text-2xl text-yellow-300 font-semibold mb-2">Currently</h2>
          <ul className="list-disc list-inside text-white pl-4 space-y-1">
            <li>Now Updating Profile Page</li>
            <li>Next Updating Cart Page</li>
          </ul>
        </div>
        <div className="mb-4">
          <h2 className="text-2xl text-green-300 font-semibold mb-2">Soon</h2>
          <ul className="list-disc list-inside text-white pl-4 space-y-1">
            <li>Update Merch Page</li>
            <li>Update Profile Page</li>
            <li>Update Admin Dashboard</li>
          </ul>
        </div>
        <div>
          <h2 className="text-2xl text-blue-300 font-semibold mb-2">Pending</h2>
          <ul className="list-disc list-inside text-white pl-4 space-y-1">
            <li>Ingredients List</li>
            <li>Vendor Booth Schedule</li>
            <li>Social Media Links
              <ul className="list-disc list-inside ml-6 text-gray-200">
                <li>Facebook</li>
                <li>Instagram</li>
                <li>Tiktok</li>
                <li>Youtube</li>
                <li>X</li>
              </ul>
            </li>
            <li>Domain Purchase</li>
            <li>Stripe Account</li>
            <li>Fourthwall Account</li>
          </ul>
        </div>
      </section>
    </div>
  </div>
);

export default Page;
