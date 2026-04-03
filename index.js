import React from 'react';

// --- MOCK DATA ---
const MOCK_COLLECTIONS = [
  {
    id: 'col-1',
    name: 'Urban Commuter Series',
    description: 'Sleek, lightweight city bikes focusing on utility and minimalist aesthetics.',
    phasesCompleted: 1,
    totalPhases: 3,
  },
  {
    id: 'col-2',
    name: 'Gravel Explorer',
    description: 'Rugged all-terrain models designed for endurance and off-road capability.',
    phasesCompleted: 2,
    totalPhases: 3,
  },
  {
    id: 'col-3',
    name: 'Track Sprinter',
    description: 'Aerodynamic, fixed-gear track bicycles optimized for velodrome racing.',
    phasesCompleted: 3,
    totalPhases: 3,
  }
];

// --- COMPONENTS ---

const CollectionCard = ({ collection }) => {
  const { name, description, phasesCompleted, totalPhases } = collection;
  const progressPercentage = (phasesCompleted / totalPhases) * 100;

  return (
    <div className="flex flex-col h-full p-6 bg-white border border-gray-200 rounded-2xl transition-all duration-300 hover:shadow-md hover:-translate-y-1 cursor-pointer group">
      {/* Header & Description */}
      <div className="flex-grow">
        <h3 className="text-lg font-semibold text-gray-900 tracking-tight mb-2 group-hover:text-black transition-colors">
          {name}
        </h3>
        <p className="text-sm text-gray-500 leading-relaxed mb-6">
          {description}
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="mt-auto">
        <div className="flex justify-between items-end mb-2">
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
            Progress
          </span>
          <span className="text-sm font-medium text-gray-900">
            {phasesCompleted} / {totalPhases}
          </span>
        </div>
        
        {/* Minimal Progress Bar */}
        <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gray-900 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      {/* Centered Container (Max width ~1200px) */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        
        {/* Page Header */}
        <header className="mb-12">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
            Active Collections
          </h1>
          <p className="text-gray-500 text-base md:text-lg max-w-2xl">
            Manage your current bicycle concepts, bike selections, and artist scouting phases.
          </p>
        </header>

        {/* Grid Layout: 
          1 column on mobile (stacked)
          3 columns on desktop (md breakpoint and up) 
        */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {MOCK_COLLECTIONS.map((collection) => (
            <CollectionCard 
              key={collection.id} 
              collection={collection} 
            />
          ))}
        </div>

      </main>
    </div>
  );
}