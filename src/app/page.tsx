// src/app/page.tsx

import React from 'react';
import Layout from '../components/Layout';

const Page: React.FC = () => {
  return (
    <Layout>
      <div
        className="flex-1 flex items-center justify-center relative w-full"
        style={{
          backgroundImage: `url('/images/background-image.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="flex flex-col items-center justify-center text-white text-center w-full h-full bg-black bg-opacity-50">
          <h1 className="text-3xl">Under Construction</h1>
        </div>
      </div>
    </Layout>
  );
};

export default Page;
