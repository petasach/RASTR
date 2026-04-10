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
      else setMessage('Registration successful! Your account is pending admin approval. Please wait to be confirmed.');
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

const CollectionCard = ({ collection, onSelect }) => {
  // Calculate progress percentage
  const progressPercentage = (collection.currentPhase / collection.totalPhases) * 100;

  return (
    <div className="collection-card" onClick={() => onSelect(collection)}>
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

const Homepage = ({ onSelectCollection }) => {
  const [collections] = useState(MOCK_COLLECTIONS);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Bicycle Collections</h1>
        <p>Manage and track the creative phases of your active bicycle portfolio.</p>
      </div>

      <div className="collections-grid">
        {collections.map(collection => (
          <CollectionCard key={collection.id} collection={collection} onSelect={onSelectCollection} />
        ))}
      </div>
    </div>
  );
};

// --- Moodboard & Collection Detail Components ---
const Moodboard = ({ collectionId }) => {
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);

  const fetchImages = async () => {
    const { data, error } = await supabase
      .from('moodboard_images')
      .select('*')
      .eq('collection_id', collectionId);
    if (data) setImages(data);
  };

  useEffect(() => {
    fetchImages();

    const channel = supabase
      .channel('moodboard_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'moodboard_images', filter: `collection_id=eq.${collectionId}` }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setImages(prev => [...prev, payload.new]);
        } else if (payload.eventType === 'UPDATE') {
          setImages(prev => prev.map(img => img.id === payload.new.id ? payload.new : img));
        } else if (payload.eventType === 'DELETE') {
          setImages(prev => prev.filter(img => img.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [collectionId]);

  const handleUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${collectionId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('moodboard')
      .upload(filePath, file);

    if (uploadError) {
      alert('Error uploading image: ' + uploadError.message);
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('moodboard')
      .getPublicUrl(filePath);

    const { data: { session } } = await supabase.auth.getSession();

    const { error: dbError } = await supabase
      .from('moodboard_images')
      .insert([
        { collection_id: collectionId, image_url: publicUrl, uploaded_by: session.user.id }
      ]);

    if (dbError) {
      alert('Error saving image record: ' + dbError.message);
    }
    setUploading(false);
  };

  const handleImageClick = async (image) => {
    const newTier = image.scale_tier >= 4 ? 1 : image.scale_tier + 1;
    setImages(prev => prev.map(img => img.id === image.id ? { ...img, scale_tier: newTier } : img));
    await supabase.from('moodboard_images').update({ scale_tier: newTier }).eq('id', image.id);
  };

  const sortedImages = [...images].sort((a, b) => b.scale_tier - a.scale_tier);
  const arrangedImages = [];
  sortedImages.forEach((img, index) => {
    if (index % 2 === 0) arrangedImages.push(img);
    else arrangedImages.unshift(img);
  });

  return (
    <div className="moodboard-container">
      <div className="moodboard-toolbar">
        <label className={`upload-btn ${uploading ? 'uploading' : ''}`}>
          {uploading ? 'Uploading...' : 'Upload Concept Photo'}
          <input type="file" accept="image/*" onChange={handleUpload} style={{ display: 'none' }} disabled={uploading} />
        </label>
        <div className="toolbar-info">Click any image to resize. Syncs instantly for all users.</div>
      </div>

      <div className="moodboard-grid">
        {arrangedImages.map(img => (
          <div
            key={img.id}
            className={`moodboard-item scale-${img.scale_tier}`}
            onClick={() => handleImageClick(img)}
            title="Click to change size"
          >
            <div className="image-wrapper">
              <img src={img.image_url} alt="Concept" loading="lazy" />
            </div>
          </div>
        ))}
        {images.length === 0 && !uploading && (
          <div className="empty-state">No concept photos uploaded yet.</div>
        )}
      </div>
    </div>
  );
};

const CollectionDetail = ({ collection, onBack }) => {
  const [currentTab, setCurrentTab] = useState('concept');

  return (
    <div className="page-container collection-detail-page">
      <div className="page-header detail-header">
        <button className="back-button" onClick={onBack}>
          <span className="material-icons-round">arrow_back</span> Back to Collections
        </button>
        <div className="detail-title-row">
          <h1>{collection.title}</h1>
          <span className="phase-badge">{collection.statusText}</span>
        </div>
        <p>{collection.description}</p>
      </div>
      <div className="tabs">
        <button className={`tab ${currentTab === 'concept' ? 'active' : ''}`} onClick={() => setCurrentTab('concept')}>Moodboard</button>
        <button className={`tab ${currentTab === 'bike' ? 'active' : ''}`} onClick={() => setCurrentTab('bike')}>Bike Selection</button>
        <button className={`tab ${currentTab === 'artist' ? 'active' : ''}`} onClick={() => setCurrentTab('artist')}>Artist Scouting</button>
      </div>

      <div className="tab-content">
        {currentTab === 'concept' && <Moodboard collectionId={collection.id} />}
        {currentTab === 'bike' && <div className="empty-tab">Bike Selection tools coming soon...</div>}
        {currentTab === 'artist' && <div className="empty-tab">Artist Scouting tools coming soon...</div>}
      </div>
    </div>
  );
};

// --- Pending Approval Component ---
const PendingApproval = () => {
  const handleSignOut = async () => {
    if (supabase) await supabase.auth.signOut();
  };
  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Account Pending</h2>
          <p>Your account is currently waiting for administrator approval. You will be notified once you are confirmed.</p>
        </div>
        <button onClick={handleSignOut} className="auth-button">
          Sign Out
        </button>
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
  const [selectedCollection, setSelectedCollection] = useState(null);

  const menuItems = [
    { id: 'dashboard', label: 'Home', icon: 'dashboard', action: () => setSelectedCollection(null) }
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
            <li key={item.id} className="sidebar-item active" onClick={() => { item.action(); setIsSidebarOpen(false); }}>
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
        {selectedCollection ? (
          <CollectionDetail collection={selectedCollection} onBack={() => setSelectedCollection(null)} />
        ) : (
          <Homepage onSelectCollection={setSelectedCollection} />
        )}
      </main>
    </div>
  );
};

// --- Root App Component ---
const App = () => {
  const [session, setSession] = useState(null);
  const [isApproved, setIsApproved] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('is_approved')
        .eq('id', userId)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
      }

      if (data) {
        setIsApproved(data.is_approved);
      } else {
        setIsApproved(false);
      }
    } catch (err) {
      console.error("Fetch profile exception:", err);
      setIsApproved(false);
    }
  };

  useEffect(() => {
    if (!supabase) {
      setInitialLoad(false);
      return;
    }

    supabase.auth.getSession().then(async ({ data: { session }, error }) => {
      if (error) console.error("Session error:", error);
      if (session) await fetchProfile(session.user.id);
      setSession(session);
      setInitialLoad(false);
    }).catch(err => {
      console.error("Unhandled session error:", err);
      setInitialLoad(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) await fetchProfile(session.user.id);
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (initialLoad) {
    return <div className="loading-screen">Loading application...</div>;
  }

  if (!session) return <Auth />;
  if (!isApproved) return <PendingApproval />;
  return <Dashboard />;
};

// --- Mount Application ---
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
