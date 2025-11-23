import React, { useState, useEffect } from 'react';
import { HashRouter } from 'react-router-dom';
import { Home, Zap, User, Film, Award, CheckCircle, Search, Play, Info, Filter, XCircle, Check } from 'lucide-react';
import { Movie, UserProfile, Tab } from './types';
import { MOCK_MOVIES, MOCK_USERS } from './constants';
import { generateDailyPicks } from './services/geminiService';
import MovieDetailModal from './components/MovieDetailModal';
import PremiumModal from './components/PremiumModal';
import QuizCard from './components/QuizCard';
import AuthScreen from './components/AuthScreen';
import AdminDashboard from './components/AdminDashboard';

// --- Toast Notification Component ---
const NotificationToast = ({ message, type, onClose }: { message: string, type: 'success' | 'error' | 'info', onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-cine-accent'
  };

  return (
    <div className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-4 py-3 rounded-lg shadow-2xl text-white animate-slide-up ${bgColors[type]}`}>
      {type === 'success' && <Check size={18} />}
      {type === 'error' && <XCircle size={18} />}
      {type === 'info' && <Info size={18} />}
      <span className="font-medium text-sm">{message}</span>
    </div>
  );
};

// --- Components ---

const BottomNav = ({ activeTab, setTab }: { activeTab: Tab, setTab: (t: Tab) => void }) => {
  const navItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'picks', icon: Zap, label: 'Daily Picks' },
    { id: 'quiz', icon: Award, label: 'Trivia' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  return (
    <div className="fixed bottom-0 w-full bg-cine-card border-t border-white/5 pb-safe pt-2 px-6 flex justify-between items-center z-50 h-16 backdrop-blur-lg bg-opacity-90">
      {navItems.map((item) => {
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setTab(item.id as Tab)}
            className={`flex flex-col items-center space-y-1 transition-colors duration-200 ${isActive ? 'text-cine-accent' : 'text-cine-muted'}`}
          >
            <item.icon size={24} fill={isActive ? "currentColor" : "none"} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};

const Header = ({ isPremium, setShowPremium, user }: { isPremium: boolean, setShowPremium: (v: boolean) => void, user: UserProfile | null }) => (
  <header className="fixed top-0 w-full z-40 bg-gradient-to-b from-cine-bg via-cine-bg/80 to-transparent px-4 py-4 flex justify-between items-center">
    <div className="flex items-center space-x-2">
      <Film className="text-cine-accent" size={28} />
      <h1 className="text-xl font-bold tracking-wider text-shadow-lg">Cine<span className="text-cine-accent">Vault</span></h1>
    </div>
    <div className="flex items-center gap-2">
        {user && <span className="text-xs text-gray-400 hidden md:block">Hi, {user.name}</span>}
        <button
        onClick={() => setShowPremium(true)}
        className={`px-3 py-1 rounded-full text-xs font-bold border transition-all shadow-lg ${
            isPremium 
            ? 'bg-cine-gold/20 text-cine-gold border-cine-gold' 
            : 'bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700'
        }`}
        >
        {isPremium ? 'PREMIUM MEMBER' : 'GO PREMIUM'}
        </button>
    </div>
  </header>
);

const HeroSection = ({ movie, onPlay, onDetails }: { movie: Movie, onPlay: () => void, onDetails: () => void }) => {
    if (!movie) return null;
    return (
        <div className="relative h-[60vh] w-full mb-6">
            <div className="absolute inset-0">
                <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover opacity-80" />
                <div className="absolute inset-0 bg-gradient-to-t from-cine-bg via-cine-bg/60 to-transparent"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-cine-bg via-transparent to-transparent"></div>
            </div>
            <div className="absolute bottom-0 left-0 p-6 w-full animate-slide-up">
                <span className="bg-cine-accent text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider mb-2 inline-block">Featured</span>
                <h1 className="text-4xl font-black text-white mb-2 leading-tight drop-shadow-lg max-w-sm">{movie.title}</h1>
                <p className="text-gray-300 text-sm line-clamp-2 max-w-md mb-4 drop-shadow">{movie.synopsis}</p>
                <div className="flex items-center gap-3">
                    <button onClick={onPlay} className="bg-white text-black px-6 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-gray-200 transition-colors">
                        <Play size={18} fill="black" /> Play
                    </button>
                    <button onClick={onDetails} className="bg-white/20 backdrop-blur-md text-white border border-white/20 px-6 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-white/30 transition-colors">
                        <Info size={18} /> Details
                    </button>
                </div>
            </div>
        </div>
    );
};

const SearchFilterBar = ({ searchQuery, setSearchQuery, selectedGenre, setSelectedGenre, genres }: any) => (
    <div className="px-4 mb-6 space-y-4">
        <div className="relative">
            <Search className="absolute left-3 top-3 text-cine-muted" size={18} />
            <input 
                type="text" 
                placeholder="Search movies, actors..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-cine-card border border-white/5 rounded-xl py-3 pl-10 pr-4 text-white placeholder-cine-muted focus:outline-none focus:border-cine-accent transition-colors"
            />
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
            <button 
                onClick={() => setSelectedGenre('All')}
                className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors border ${
                    selectedGenre === 'All' ? 'bg-white text-black border-white' : 'bg-transparent text-gray-400 border-gray-700'
                }`}
            >
                All
            </button>
            {genres.map((g: string) => (
                <button 
                    key={g}
                    onClick={() => setSelectedGenre(g)}
                    className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors border ${
                        selectedGenre === g ? 'bg-cine-accent text-white border-cine-accent' : 'bg-transparent text-gray-400 border-gray-700'
                    }`}
                >
                    {g}
                </button>
            ))}
        </div>
    </div>
);

const MovieCard: React.FC<{ movie: Movie, onClick: () => void }> = ({ movie, onClick }) => (
  <div 
    onClick={onClick}
    className="relative group aspect-[2/3] bg-gray-800 rounded-xl overflow-hidden shadow-lg cursor-pointer transition-transform duration-300 hover:scale-105 hover:shadow-cine-accent/20 border border-white/5"
  >
    <img 
      src={movie.posterUrl} 
      alt={movie.title} 
      className="w-full h-full object-cover"
      loading="lazy"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
      <h3 className="text-sm font-bold text-white leading-tight">{movie.title}</h3>
      <div className="flex justify-between items-center mt-1 text-xs text-gray-300">
        <span>{movie.year}</span>
        <span className="flex items-center text-yellow-400">★ {movie.rating}</span>
      </div>
    </div>
    <div className="absolute bottom-0 w-full p-2 bg-gradient-to-t from-black/90 to-transparent lg:hidden">
       <h3 className="text-xs font-bold truncate">{movie.title}</h3>
    </div>
  </div>
);

// --- Main Sections ---

const HomeSection = ({ 
    movies, 
    onMovieClick, 
    onPlayMovie 
}: { 
    movies: Movie[], 
    onMovieClick: (m: Movie) => void,
    onPlayMovie: (m: Movie) => void 
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedGenre, setSelectedGenre] = useState('All');
    const [randomHero, setRandomHero] = useState<Movie | null>(null);

    // Derive genres from available movies
    const genres = Array.from(new Set(movies.map(m => m.genre).filter(Boolean)));

    useEffect(() => {
        if (movies.length > 0) {
            const random = movies[Math.floor(Math.random() * movies.length)];
            setRandomHero(random);
        }
    }, [movies]);

    // Filtering logic
    const filteredMovies = movies.filter(m => {
        const matchesSearch = m.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              m.cast?.some(c => c.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesGenre = selectedGenre === 'All' || m.genre === selectedGenre;
        return matchesSearch && matchesGenre;
    });

    if (movies.length === 0) return null;

    return (
        <div className="pb-24 animate-fade-in">
            {randomHero && !searchQuery && selectedGenre === 'All' && (
                <HeroSection 
                    movie={randomHero} 
                    onPlay={() => onPlayMovie(randomHero)} 
                    onDetails={() => onMovieClick(randomHero)} 
                />
            )}
            
            <div className={!searchQuery && selectedGenre === 'All' ? "" : "pt-24"}>
                <SearchFilterBar 
                    searchQuery={searchQuery} 
                    setSearchQuery={setSearchQuery} 
                    selectedGenre={selectedGenre} 
                    setSelectedGenre={setSelectedGenre}
                    genres={genres}
                />
                
                <h2 className="text-lg font-bold mb-4 px-4 border-l-4 border-cine-accent ml-4">
                    {searchQuery ? `Results for "${searchQuery}"` : selectedGenre === 'All' ? 'Trending Now' : `${selectedGenre} Movies`}
                </h2>
                
                {filteredMovies.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-4">
                        {filteredMovies.map(movie => (
                            <MovieCard key={movie.id} movie={movie} onClick={() => onMovieClick(movie)} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10 text-cine-muted">
                        <p>No movies found matching criteria.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const DailyPicksSection = ({ movies, isLoading, onGenerate, isPremium, onMovieClick }: any) => {
  if (!isPremium) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center space-y-4 animate-fade-in pt-24">
        <Zap size={48} className="text-cine-gold mb-2" />
        <h2 className="text-2xl font-bold text-cine-gold">Premium Feature</h2>
        <p className="text-cine-muted max-w-xs">
          Unlock AI-powered daily movie picks personalized just for you. Join Premium to access this feature.
        </p>
      </div>
    );
  }

  return (
    <div className="pt-24 px-4 pb-20 animate-fade-in min-h-screen">
       <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Today's AI Picks</h2>
        <button 
          onClick={onGenerate}
          disabled={isLoading}
          className="bg-cine-accent/20 text-cine-accent px-4 py-2 rounded-lg text-sm font-bold hover:bg-cine-accent hover:text-white transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Generating...' : 'Refresh Picks'}
        </button>
      </div>
      
      {movies.length > 0 ? (
        <div className="space-y-6">
           {movies.map((movie: Movie) => (
             <div key={movie.id} onClick={() => onMovieClick(movie)} className="bg-cine-card rounded-xl overflow-hidden flex h-40 cursor-pointer hover:bg-white/5 transition-colors border border-white/5">
                <img src={movie.posterUrl} className="w-28 object-cover" alt={movie.title} />
                <div className="p-4 flex-1 flex flex-col justify-center">
                   <h3 className="text-lg font-bold text-white mb-1">{movie.title}</h3>
                   <p className="text-xs text-cine-muted line-clamp-2 mb-2">{movie.synopsis}</p>
                   <div className="flex items-center gap-2 text-xs">
                      <span className="bg-cine-accent px-2 py-0.5 rounded text-white">{movie.genre}</span>
                      <span className="text-yellow-400">★ {movie.rating}</span>
                   </div>
                </div>
             </div>
           ))}
        </div>
      ) : (
        <div className="text-center mt-20 text-cine-muted border border-dashed border-white/10 rounded-xl p-8">
          <p>Tap refresh to get your personalized list.</p>
        </div>
      )}
    </div>
  );
};

const ProfileSection = ({ user, isPremium, watchlist, onRemoveFromWatchlist, onLogout }: any) => (
  <div className="p-4 pt-24 pb-24 animate-fade-in">
    <div className="flex items-center space-x-4 mb-8 bg-cine-card p-6 rounded-2xl border border-white/5 shadow-lg">
      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cine-accent to-purple-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-purple-500/20">
        {user.name.charAt(0)}
      </div>
      <div>
        <h2 className="text-xl font-bold">{user.name}</h2>
        <div className="flex items-center mt-1">
          {isPremium ? (
             <span className="flex items-center text-cine-gold text-sm font-medium">
               <Award size={14} className="mr-1" /> Premium Member
             </span>
          ) : (
            <span className="text-cine-muted text-sm">Free Plan</span>
          )}
        </div>
        {user.paymentStatus === 'pending' && (
             <span className="text-xs text-yellow-500 mt-2 block">Premium Request Pending...</span>
        )}
      </div>
    </div>

    <h3 className="text-lg font-bold mb-4 flex items-center">
      <CheckCircle size={20} className="mr-2 text-green-500" />
      My Watchlist ({watchlist.length})
    </h3>
    
    {watchlist.length === 0 ? (
       <p className="text-cine-muted text-sm italic">Your watchlist is empty. Start exploring!</p>
    ) : (
      <div className="space-y-3">
        {watchlist.map((movie: Movie) => (
          <div key={movie.id} className="flex justify-between items-center bg-cine-card p-3 rounded-lg border border-white/5">
            <div className="flex items-center space-x-3">
               <img src={movie.posterUrl} className="w-10 h-14 object-cover rounded" alt="" />
               <span className="font-medium text-sm">{movie.title}</span>
            </div>
            <button 
              onClick={() => onRemoveFromWatchlist(movie.id)}
              className="text-red-400 text-xs hover:text-red-300"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    )}

    <button 
        onClick={onLogout}
        className="mt-8 w-full bg-red-900/20 text-red-500 py-3 rounded-lg text-sm font-bold hover:bg-red-900/40 transition-colors border border-red-900/30"
    >
        Sign Out
    </button>
  </div>
);

// --- Main App Component ---

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [allUsers, setAllUsers] = useState<UserProfile[]>(MOCK_USERS);
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [movies, setMovies] = useState<Movie[]>(MOCK_MOVIES);
  const [dailyPicks, setDailyPicks] = useState<Movie[]>([]);
  const [watchlist, setWatchlist] = useState<Movie[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [isLoadingPicks, setIsLoadingPicks] = useState(false);
  
  // Notification State
  const [notification, setNotification] = useState<{message: string, type: 'success'|'error'|'info'} | null>(null);

  const showToast = (message: string, type: 'success'|'error'|'info' = 'info') => {
      setNotification({ message, type });
  };

  // Check auth persistence (simplified)
  useEffect(() => {
    const storedUser = localStorage.getItem('cinevault_user');
    if (storedUser) {
      const u = JSON.parse(storedUser);
      setUser(u);
      setIsPremium(u.isPremium);
    }
  }, []);

  const handleLogin = (u: UserProfile) => {
      // Check if banned
      const existing = allUsers.find(au => au.email === u.email);
      if (existing && existing.status === 'banned') {
          showToast("This account has been banned.", 'error');
          return;
      }
      
      setUser(u);
      setIsPremium(u.isPremium);
      localStorage.setItem('cinevault_user', JSON.stringify(u));
      showToast(`Welcome back, ${u.name}!`, 'success');
  };

  const handleRegister = (u: UserProfile) => {
      setAllUsers([...allUsers, u]);
      showToast("Account created successfully", 'success');
  };

  const handleLogout = () => {
      setUser(null);
      setIsPremium(false);
      setDailyPicks([]);
      localStorage.removeItem('cinevault_user');
      localStorage.removeItem('cinevault_premium');
      showToast("Signed out successfully", 'info');
  };

  const handlePremiumRequest = (tid: string, screenshotUrl: string) => {
    if (!user) return;
    
    const updatedUser: UserProfile = { 
        ...user, 
        paymentStatus: 'pending',
        paymentProof: {
            transactionId: tid,
            screenshotUrl: screenshotUrl
        }
    };

    setUser(updatedUser);
    localStorage.setItem('cinevault_user', JSON.stringify(updatedUser));
    
    // Update global list for Admin visibility
    setAllUsers(allUsers.map(u => u.id === user.id ? updatedUser : u));
    
    setShowPremiumModal(false);
    showToast("Premium Request Submitted for Verification", 'success');
  };

  const generatePicks = async () => {
    setIsLoadingPicks(true);
    try {
      const picks = await generateDailyPicks();
      setDailyPicks(picks);
      showToast("Daily picks generated!", 'success');
    } catch (error) {
      console.error("Failed to generate picks", error);
      showToast("Could not generate AI picks.", 'error');
    } finally {
      setIsLoadingPicks(false);
    }
  };
  
  const addToWatchlist = (movie: Movie) => {
    if (!watchlist.find(m => m.id === movie.id)) {
      setWatchlist([...watchlist, movie]);
      showToast("Added to Watchlist", 'success');
    }
  };

  const removeFromWatchlist = (id: string) => {
    setWatchlist(watchlist.filter(m => m.id !== id));
    showToast("Removed from Watchlist", 'info');
  };

  const handleReviewSubmit = (movieId: string, rating: number, comment: string) => {
      if (!user) return;
      
      const newReview = {
          id: `rev-${Date.now()}`,
          userId: user.id,
          userName: user.name,
          rating,
          comment,
          date: new Date().toLocaleDateString()
      };

      setMovies(movies.map(m => {
          if (m.id === movieId) {
              const prevReviews = m.reviews || [];
              return { ...m, reviews: [...prevReviews, newReview] };
          }
          return m;
      }));
      
      showToast("Review posted successfully!", 'success');
  };

  // Quick Play handler for Hero Section
  const handlePlayMovie = (movie: Movie) => {
      if (movie.trailerUrl) {
          // Open details which has the player
          setSelectedMovie(movie); 
      } else {
          showToast("Trailer unavailable for this title.", 'error');
      }
  };

  const renderContent = () => {
    if (movies.length === 0 && activeTab === 'home') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-8 animate-fade-in pt-24">
                <Film size={48} className="text-cine-muted mb-4 opacity-50" />
                <h3 className="text-xl font-bold text-white mb-2">No Movies Available</h3>
                <p className="text-cine-muted">The vault is currently empty. Check back later or generate new picks!</p>
            </div>
        )
    }

    switch(activeTab) {
      case 'home':
        return (
            <HomeSection 
                movies={movies} 
                onMovieClick={setSelectedMovie} 
                onPlayMovie={handlePlayMovie}
            />
        );
      case 'picks':
        return (
          <DailyPicksSection 
            movies={dailyPicks} 
            isLoading={isLoadingPicks} 
            onGenerate={generatePicks} 
            isPremium={isPremium}
            onMovieClick={setSelectedMovie}
          />
        );
      case 'quiz':
        return (
            <div className="pt-24">
                <QuizCard isPremium={isPremium} onUnlock={() => setShowPremiumModal(true)} showToast={showToast} />
            </div>
        );
      case 'profile':
        return (
          <ProfileSection 
            user={user} 
            isPremium={isPremium} 
            watchlist={watchlist}
            onRemoveFromWatchlist={removeFromWatchlist}
            onLogout={handleLogout}
          />
        );
      default:
        return null;
    }
  };

  // --- Render Logic ---

  if (!user) {
      return <AuthScreen onLogin={handleLogin} onRegister={handleRegister} showToast={showToast} />;
  }

  if (user.role === 'admin') {
      return (
        <>
            {notification && <NotificationToast message={notification.message} type={notification.type} onClose={() => setNotification(null)} />}
            <AdminDashboard 
                user={user} 
                movies={movies} 
                setMovies={setMovies} 
                allUsers={allUsers}
                setAllUsers={setAllUsers}
                onLogout={handleLogout}
                showToast={showToast}
            />
        </>
      );
  }

  return (
    <HashRouter>
      <div className="min-h-screen bg-cine-bg text-cine-text">
        {notification && <NotificationToast message={notification.message} type={notification.type} onClose={() => setNotification(null)} />}
        
        <Header isPremium={isPremium} setShowPremium={setShowPremiumModal} user={user} />
        
        <main className="h-screen overflow-y-auto no-scrollbar scroll-smooth">
          <div className="w-full">
             {renderContent()}
          </div>
        </main>

        <BottomNav activeTab={activeTab} setTab={setActiveTab} />

        {selectedMovie && (
          <MovieDetailModal 
            movie={selectedMovie} 
            user={user}
            onClose={() => setSelectedMovie(null)} 
            onAddToWatchlist={() => addToWatchlist(selectedMovie)}
            inWatchlist={!!watchlist.find(m => m.id === selectedMovie.id)}
            isPremium={isPremium}
            onAddReview={handleReviewSubmit}
            showToast={showToast}
          />
        )}

        {showPremiumModal && (
          <PremiumModal 
            user={user}
            onClose={() => setShowPremiumModal(false)} 
            onSubmitRequest={handlePremiumRequest}
            showToast={showToast}
          />
        )}
      </div>
    </HashRouter>
  );
}