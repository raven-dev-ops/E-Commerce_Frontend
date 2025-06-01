// src/app/page.tsx

import React from 'react';
import Layout from '../components/Layout';

const Page: React.FC = () => {
  return (
    <Layout>
      <div className="home-background" />
      <div className="flex flex-1 items-center justify-center w-full h-[calc(100vh-64px-64px)]"> 
        {/* Replace 64px with your navbar/footer height if fixed, or remove if they're static */}
        <h1 className="text-3xl text-white text-center drop-shadow-lg">
          Under Construction
        </h1>
      </div>
    </Layout>
  );
};

export default Page;
