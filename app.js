const { useState } = React;

// --- Mock Data ---
const MOCK_COLLECTIONS = [
  {
    id: 1,
    title: 'Urban Commuter',
    description: 'Electric-assisted city bikes with integrated storage solutions for daily professionals.',
    currentPhase: 1,
    totalPhases: 3,
    statusText: 'Concept Phase'
  },
  {
    id: 2,
    title: 'Gravel Explorer',
    description: 'Off-road capable long-distance geometry frames designed for ultimate durability.',
    currentPhase: 2,
    totalPhases: 3,
    statusText: 'Bike Selection'
  },
  {
    id: 3,
    title: 'Fixie Custom',
    description: 'Collaboration with local street artists featuring minimalist fixed-gear geometry.',
    currentPhase: 3,
    totalPhases: 3,
    statusText: 'Artist Scouting'
  }
];

// --- Components ---

const CollectionCard = ({ collection }) => {
  // Calculate progress percentage
  const progressPercentage = (collection.currentPhase / collection.totalPhases) * 100;

  return (
    <div className="collection-card">
      <h3 className="card-title">{collection.title}</h3>
      <p className="card-description">{collection.description}</p>

      <div className="progress-wrapper">
        <span className="progress-text">
          {collection.currentPhase}/{collection.totalPhases} phases completed
        </span>
        <div className="progress-bar-bg">
          <div
            className="progress-bar-fill"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

const Homepage = () => {
  const [collections] = useState(MOCK_COLLECTIONS);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Bicycle Collections</h1>
        <p>Manage and track the creative phases of your active bicycle portfolio.</p>
      </div>

      <div className="collections-grid">
        {collections.map(collection => (
          <CollectionCard key={collection.id} collection={collection} />
        ))}
      </div>
    </div>
  );
};

// --- App Component ---
const App = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' }
  ];

  return (
    <div className="app-container">
      <div className="mobile-header">
        <span className="mobile-title">Menu</span>
        <button className="menu-toggle" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          <span className="material-icons-round">menu</span>
        </button>
      </div>

      <div
        className={`sidebar-overlay ${isSidebarOpen ? 'open' : ''}`}
        onClick={() => setIsSidebarOpen(false)}
      ></div>

      <nav className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>Bicycle Co.</h2>
          <button className="menu-close" onClick={() => setIsSidebarOpen(false)}>
            <span className="material-icons-round">close</span>
          </button>
        </div>
        <ul className="sidebar-menu">
          {menuItems.map(item => (
            <li key={item.id} className="sidebar-item active">
              <span className="material-icons-round">{item.icon}</span>
              <span>{item.label}</span>
            </li>
          ))}
        </ul>
      </nav>

      <main className="main-content">
        <Homepage />
      </main>
    </div>
  );
};

// --- Mount Application ---
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
