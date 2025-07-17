// app/merch/page.tsx

import { Shirt } from 'lucide-react';

export default function MerchPage() {
  return (
    <div className="container mx-auto py-20 px-4 flex flex-col items-center">
      <div className="flex items-center gap-4 mb-8">
        <Shirt className="w-14 h-14 text-gray-800" />
        <h1 className="text-4xl font-bold text-gray-900">Official Merch</h1>
      </div>
      <p className="max-w-2xl text-lg text-center text-gray-700 mb-10">
        Shop our exclusive merchandise and support the community! New styles and classic favorites available soon.
      </p>
      {/* Merch grid will go here */}
      <div className="mt-10">
        <span className="text-gray-400 italic">Merch shop coming soon...</span>
      </div>
    </div>
  );
}
