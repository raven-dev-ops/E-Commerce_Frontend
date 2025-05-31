// src/app/page.tsx

import React from 'react';
import Layout from '../components/Layout';

const Page: React.FC = () => {
  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center overflow-hidden" style={{
        backgroundImage: `url('/images/background-image.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        width: '100vw',
        height: '100vh',
        position: 'relative',
      }}>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center">
          <h1 className="text-3xl">Under Construction</h1>
        </div>
      </div>
    </Layout>
  );
};

export default Page;
