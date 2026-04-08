const { useState, useEffect } = React;

// --- Supabase Initialization ---
const supabaseUrl = window.SUPABASE_URL || '';
const supabaseKey = window.SUPABASE_ANON_KEY || '';
const supabase = window.supabase ? window.supabase.createClient(supabaseUrl, supabaseKey) : null;

// --- Auth Component ---
const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    if (!supabase) {
      setMessage('Supabase client not initialized. Check config.js.');
      return;
    }
    setLoading(true);
    setMessage('');
    
    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setMessage(error.message);
      else setMessage('Registration successful! Check your email to confirm your account.');
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMessage(error.message);
    }
    setLoading(false);
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <h2>{isSignUp ? 'Create Account' : 'Welcome Back'}</h2>
          <p>{isSignUp ? 'Sign up to manage your bicycle collections.' : 'Enter your credentials to access the dashboard.'}</p>
        </div>
        <form className="auth-form" onSubmit={handleAuth}>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength="6" />
          </div>
          {message && <div className={`auth-message ${message.includes('success') ? 'success' : 'error'}`}>{message}</div>}
          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Sign In')}
          </button>
        </form>
        <div className="auth-toggle">
          <span>{isSignUp ? 'Already have an account?' : "Don't have an account?"}</span>
          <button type="button" onClick={() => setIsSignUp(!isSignUp)}>
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </div>
      </div>
    </div>
  );
};

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

// --- Dashboard Component ---
const Dashboard = () => {
  const handleSignOut = async () => {
    if (supabase) await supabase.auth.signOut();
  };
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
          <li className="sidebar-item logout-item" onClick={handleSignOut}>
            <span className="material-icons-round">logout</span>
            <span>Sign Out</span>
          </li>
        </ul>
      </nav>

      <main className="main-content">
        <Homepage />
      </main>
    </div>
  );
};

// --- Root App Component ---
const App = () => {
  const [session, setSession] = useState(null);
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setInitialLoad(false);
      return;
    }
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setInitialLoad(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (initialLoad) {
    return <div className="loading-screen">Loading application...</div>;
  }

  return !session ? <Auth /> : <Dashboard />;
};

// --- Mount Application ---
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
