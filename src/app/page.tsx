'use client';

import { useState } from 'react';
import { CompanyList } from '@/components/CompanyList';
import { URLInput } from '@/components/URLInput';

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSuccess = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <main className="w-full p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Lead Finder</h1>
        <p className="text-gray-600">
          Submit company URLs to get comprehensive research powered by Parallel.ai
        </p>
      </div>
      
      <div className="mb-8 bg-white p-6 rounded-lg shadow-md max-w-2xl">
        <URLInput onSuccess={handleSuccess} />
      </div>

      <CompanyList key={refreshKey} />
    </main>
  );
}