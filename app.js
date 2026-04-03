const { useState, useEffect } = React;

// --- Mock Data ---
const MOCK_COLLECTIONS = [
  { 
    id: 1, 
    title: 'Urban Commuter Series', 
    phase: 1, 
    status: 'Concept Phase', 
    description: 'Electric-assisted city bikes with integrated storage solutions.',
  },
  { 
    id: 2, 
    title: 'Gravel Explorer', 
    phase: 2, 
    status: 'Bike Selection', 
    description: 'Off-road capable long-distance geometry frames.',
  },
  { 
    id: 3, 
    title: 'Fixie Custom', 
    phase: 3, 
    status: 'Artist Scouting', 
    description: 'Collaboration with local street artists for unique frame artwork.',
  }
];

// --- Components ---
const Sidebar = () => {
  return (
    <div className="sidebar">
      <div className="brand">
        <span className="material-icons-round">pedal_bike</span>
        <h1>Velocite</h1>
      </div>
      <div className="nav-menu">
        <a href="#" className="nav-item active">
          <span className="material-icons-round">space_dashboard</span>
          Collections
        </a>
        <a href="#" className="nav-item">
          <span className="material-icons-round">inventory_2</span>
          Bikes
        </a>
        <a href="#" className="nav-item">
          <span className="material-icons-round">people</span>
          Artists
        </a>
      </div>
    </div>
  );
};

const Topbar = () => {
  return (
    <div className="topbar">
      <div className="topbar-info">
        <h2>Active Portfolios</h2>
        <p>Manage your bicycle curations across different phases</p>
      </div>
      <button className="btn-primary">
        <span className="material-icons-round">add</span>
        New Collection
      </button>
    </div>
  );
};

const CollectionCard = ({ collection }) => {
  return (
    <div className="glass-card">
      <div className="card-header">
        <h3>{collection.title}</h3>
        <span className={`badge phase-${collection.phase}`}>
          {collection.status}
        </span>
      </div>
      <p className="card-description">{collection.description}</p>
      
      {/* We will build these specific phase views step-by-step later */}
      <div className="placeholder-box">
        {collection.phase === 1 && "Content: Moodboard & Notes (Pending)"}
        {collection.phase === 2 && "Content: Predefined Models (Pending)"}
        {collection.phase === 3 && "Content: Artist List & Bio (Pending)"}
      </div>
    </div>
  );
};

// --- Main Application ---
const App = () => {
  const [collections, setCollections] = useState(MOCK_COLLECTIONS);

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="main-content">
        <Topbar />
        <div className="workspace">
          <div className="collections-grid">
            {collections.map(collection => (
              <CollectionCard key={collection.id} collection={collection} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Mount App
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
