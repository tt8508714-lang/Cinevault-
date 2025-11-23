import React, { useState, useRef } from 'react';
import { LayoutDashboard, Database, Users, Settings, PlusCircle, LogOut, Trash2, Upload, X, Play, Image as ImageIcon, Search, Film, Ban, CheckCircle, Smartphone, Eye } from 'lucide-react';
import { UserProfile, Movie } from '../types';
import { generateDailyPicks } from '../services/geminiService';

interface Props {
  user: UserProfile;
  movies: Movie[];
  setMovies: (movies: Movie[]) => void;
  allUsers: UserProfile[];
  setAllUsers: (users: UserProfile[]) => void;
  onLogout: () => void;
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

const AdminDashboard: React.FC<Props> = ({ user, movies, setMovies, allUsers, setAllUsers, onLogout, showToast }) => {
  const [activeTab, setActiveTab] = useState<'movies' | 'users'>('movies');
  const [isSyncing, setIsSyncing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Review Modal State
  const [reviewUser, setReviewUser] = useState<UserProfile | null>(null);
  
  // File References
  const posterInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [newMovie, setNewMovie] = useState<Partial<Movie>>({
    title: '',
    year: new Date().getFullYear().toString(),
    genre: '',
    rating: '',
    posterUrl: '',
    trailerUrl: '',
    synopsis: '',
    director: '',
    cast: [],
    trivia: ''
  });

  // --- Handlers ---

  const handleSyncDatabase = async () => {
    setIsSyncing(true);
    try {
      const newMovies = await generateDailyPicks();
      setMovies([...movies, ...newMovies]);
      showToast(`Database updated. Added ${newMovies.length} new titles.`, 'success');
    } catch (e) {
      showToast("Sync failed.", 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'poster' | 'video') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === 'poster') {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewMovie({ ...newMovie, posterUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    } else {
      // For video, we create a local object URL to stream directly from device memory
      const videoUrl = URL.createObjectURL(file);
      setNewMovie({ ...newMovie, trailerUrl: videoUrl, isLocalVideo: true });
    }
  };

  const handleAddMovie = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMovie.title || !newMovie.posterUrl) {
      showToast("Title and Poster are required.", 'error');
      return;
    }

    const movieToAdd: Movie = {
      id: `manual-${Date.now()}`,
      title: newMovie.title || 'Untitled',
      year: newMovie.year || '2024',
      genre: newMovie.genre || 'Action',
      rating: newMovie.rating || 'N/A',
      posterUrl: newMovie.posterUrl,
      trailerUrl: newMovie.trailerUrl,
      synopsis: newMovie.synopsis || 'No synopsis available.',
      director: newMovie.director,
      cast: typeof newMovie.cast === 'string' ? (newMovie.cast as string).split(',').map((s: string) => s.trim()) : [],
      trivia: newMovie.trivia,
      isLocalVideo: newMovie.isLocalVideo,
      reviews: []
    };

    setMovies([movieToAdd, ...movies]);
    setShowAddModal(false);
    setNewMovie({
        title: '',
        year: new Date().getFullYear().toString(),
        genre: '',
        rating: '',
        posterUrl: '',
        trailerUrl: '',
        synopsis: '',
        director: '',
        cast: [],
        trivia: ''
    });
    showToast("Movie uploaded successfully!", 'success');
  };

  const handleDeleteMovie = (id: string) => {
    if (confirm("Are you sure you want to delete this movie?")) {
      setMovies(movies.filter(m => m.id !== id));
      showToast("Movie deleted.", 'info');
    }
  };

  const handleBanUser = (userId: string) => {
      if(confirm("Are you sure you want to BAN this user?")) {
          setAllUsers(allUsers.map(u => u.id === userId ? { ...u, status: 'banned' } : u));
          showToast("User has been banned.", 'success');
      }
  };

  const handleApprovePremium = (userId: string) => {
      setAllUsers(allUsers.map(u => {
          if (u.id === userId) {
              return { ...u, isPremium: true, paymentStatus: 'approved' };
          }
          return u;
      }));
      setReviewUser(null);
      showToast("Premium Approved for User.", 'success');
  };

  const handleRejectPremium = (userId: string) => {
      setAllUsers(allUsers.map(u => {
          if (u.id === userId) {
              return { ...u, paymentStatus: 'rejected' };
          }
          return u;
      }));
      setReviewUser(null);
      showToast("Premium Request Rejected.", 'info');
  };

  const clearDatabase = () => {
    if(confirm("WARNING: This will delete ALL movies. Are you sure?")) {
        setMovies([]);
        showToast("Database cleared.", 'info');
    }
  };

  const filteredMovies = movies.filter(m => m.title.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredUsers = allUsers.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase()));
  
  // Sort users: Pending requests first
  const sortedUsers = [...filteredUsers].sort((a, b) => {
      if (a.paymentStatus === 'pending' && b.paymentStatus !== 'pending') return -1;
      if (a.paymentStatus !== 'pending' && b.paymentStatus === 'pending') return 1;
      return 0;
  });

  // Dynamic Stats
  const activeUsers = allUsers.filter(u => u.status === 'active').length;
  const premiumUsers = allUsers.filter(u => u.isPremium).length;
  const pendingRequests = allUsers.filter(u => u.paymentStatus === 'pending').length;

  return (
    <div className="min-h-screen bg-cine-bg text-cine-text p-6">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 border-b border-white/10 pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <LayoutDashboard className="text-cine-accent" />
            CineVault <span className="text-cine-muted font-normal">Admin Panel</span>
          </h1>
          <p className="text-sm text-cine-muted">Management Access: Full Control</p>
        </div>
        <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
                <p className="text-sm font-bold text-white">{user.name}</p>
                <p className="text-xs text-green-500">Admin Authenticated</p>
            </div>
            <button onClick={onLogout} className="flex items-center gap-2 bg-white/5 hover:bg-red-500/20 text-white px-4 py-2 rounded-lg transition-colors">
            <LogOut size={16} /> Logout
            </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex space-x-4 mb-6">
          <button 
            onClick={() => setActiveTab('movies')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-all ${activeTab === 'movies' ? 'bg-cine-accent text-white' : 'bg-cine-card text-cine-muted hover:bg-white/5'}`}
          >
              <Film size={18} /> Movies
          </button>
          <button 
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-all ${activeTab === 'users' ? 'bg-cine-accent text-white' : 'bg-cine-card text-cine-muted hover:bg-white/5'}`}
          >
              <Users size={18} /> Users
              {pendingRequests > 0 && <span className="bg-red-500 text-white text-xs px-2 rounded-full">{pendingRequests}</span>}
          </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-cine-card p-5 rounded-xl border border-white/5 flex items-center justify-between">
           <div>
              <p className="text-cine-muted text-xs uppercase font-bold">Movies</p>
              <p className="text-2xl font-bold text-white">{movies.length}</p>
           </div>
           <Database className="text-blue-500 opacity-50" size={32} />
        </div>
        <div className="bg-cine-card p-5 rounded-xl border border-white/5 flex items-center justify-between">
           <div>
              <p className="text-cine-muted text-xs uppercase font-bold">Total Users</p>
              <p className="text-2xl font-bold text-white">{allUsers.length}</p>
           </div>
           <Users className="text-green-500 opacity-50" size={32} />
        </div>
        <div className="bg-cine-card p-5 rounded-xl border border-white/5 flex items-center justify-between">
           <div>
              <p className="text-cine-muted text-xs uppercase font-bold">Premium</p>
              <p className="text-2xl font-bold text-white">{premiumUsers}</p>
           </div>
           <Settings className="text-cine-gold opacity-50" size={32} />
        </div>
         <div className="bg-cine-card p-5 rounded-xl border border-white/5 flex items-center justify-between">
           <div>
              <p className="text-cine-muted text-xs uppercase font-bold">Pending Requests</p>
              <p className="text-2xl font-bold text-white">{pendingRequests}</p>
           </div>
           <CheckCircle className="text-teal-500 opacity-50" size={32} />
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'movies' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Actions */}
            <div className="space-y-6">
                <div className="bg-cine-card rounded-xl border border-white/5 overflow-hidden">
                    <div className="p-4 bg-white/5 font-bold text-white flex items-center gap-2">
                        <Settings size={18} /> Quick Actions
                    </div>
                    <div className="p-4 space-y-3">
                        <button 
                            onClick={() => setShowAddModal(true)}
                            className="w-full bg-cine-accent hover:bg-red-700 text-white p-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors"
                        >
                            <PlusCircle size={20} /> Upload New Movie
                        </button>
                        <button 
                            onClick={handleSyncDatabase}
                            disabled={isSyncing}
                            className="w-full bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 border border-blue-600/50 p-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors"
                        >
                            {isSyncing ? <span className="animate-spin">⟳</span> : <Database size={20} />}
                            {isSyncing ? 'Syncing...' : 'AI Auto-Sync'}
                        </button>
                        <button 
                            onClick={clearDatabase}
                            className="w-full bg-red-900/20 hover:bg-red-900/40 text-red-500 border border-red-900/50 p-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors"
                        >
                            <Trash2 size={20} /> Delete All Data
                        </button>
                    </div>
                </div>
            </div>

            {/* Right Column: Movie List */}
            <div className="lg:col-span-2 bg-cine-card rounded-xl border border-white/5 flex flex-col h-[600px]">
                <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/5">
                    <h2 className="font-bold text-white">Movie Database</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 text-gray-500" size={16} />
                        <input 
                            type="text" 
                            placeholder="Search titles..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-black/50 border border-white/10 rounded-full py-2 pl-9 pr-4 text-sm text-white focus:outline-none focus:border-cine-accent w-48 md:w-64"
                        />
                    </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4">
                    {filteredMovies.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-cine-muted">
                            <Database size={48} className="mb-4 opacity-20" />
                            <p>No movies found in database.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredMovies.map(movie => (
                                <div key={movie.id} className="flex items-center justify-between bg-black/20 p-3 rounded-lg border border-white/5 hover:border-white/10 transition-colors group">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <img src={movie.posterUrl} alt="" className="w-10 h-14 object-cover rounded bg-gray-800" />
                                        <div className="min-w-0">
                                            <h3 className="font-bold text-white text-sm truncate">{movie.title}</h3>
                                            <div className="flex items-center gap-2 text-xs text-cine-muted">
                                                <span>{movie.year}</span>
                                                <span>•</span>
                                                <span>{movie.genre}</span>
                                                {movie.isLocalVideo && <span className="text-green-400 border border-green-500/30 px-1 rounded">Local Video</span>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button 
                                            onClick={() => handleDeleteMovie(movie.id)}
                                            className="p-2 text-red-500 hover:bg-red-500/10 rounded transition-colors"
                                            title="Delete Movie"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
      ) : (
          /* USERS TAB */
          <div className="bg-cine-card rounded-xl border border-white/5 flex flex-col h-[600px]">
            <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/5">
                <h2 className="font-bold text-white">Registered Users</h2>
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 text-gray-500" size={16} />
                    <input 
                        type="text" 
                        placeholder="Search users..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-black/50 border border-white/10 rounded-full py-2 pl-9 pr-4 text-sm text-white focus:outline-none focus:border-cine-accent w-48 md:w-64"
                    />
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="text-cine-muted text-xs uppercase border-b border-white/10">
                            <th className="p-3">User</th>
                            <th className="p-3">Email</th>
                            <th className="p-3">Plan</th>
                            <th className="p-3">Joined</th>
                            <th className="p-3">Status / Proof</th>
                            <th className="p-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {sortedUsers.map(u => (
                            <tr key={u.id} className={`border-b border-white/5 transition-colors ${u.paymentStatus === 'pending' ? 'bg-yellow-500/10' : 'hover:bg-white/5'}`}>
                                <td className="p-3 font-bold flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cine-accent to-purple-600 flex items-center justify-center text-xs">
                                        {u.name.charAt(0)}
                                    </div>
                                    {u.name}
                                    {u.paymentStatus === 'pending' && <span className="text-[10px] bg-yellow-500 text-black px-1.5 rounded font-bold">REQ</span>}
                                </td>
                                <td className="p-3 text-gray-400">{u.email}</td>
                                <td className="p-3">
                                    {u.isPremium ? 
                                        <span className="text-cine-gold text-xs border border-cine-gold/30 px-2 py-1 rounded-full">Premium</span> : 
                                        <span className="text-gray-500 text-xs">Free</span>
                                    }
                                </td>
                                <td className="p-3 text-gray-500">{u.joinedAt || '2024-03-01'}</td>
                                <td className="p-3">
                                    {u.paymentStatus === 'pending' ? (
                                        <div className="flex items-center gap-3 bg-black/20 p-1.5 rounded-lg border border-cine-gold/20 max-w-fit">
                                            {u.paymentProof?.screenshotUrl ? (
                                                <div className="relative group cursor-pointer" onClick={() => setReviewUser(u)}>
                                                    <img 
                                                        src={u.paymentProof.screenshotUrl} 
                                                        alt="Proof" 
                                                        className="w-12 h-12 object-cover rounded border border-white/10" 
                                                    />
                                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded">
                                                        <Eye size={16} className="text-white"/>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="w-12 h-12 bg-white/5 rounded flex items-center justify-center text-[9px] text-gray-500">
                                                    No Img
                                                </div>
                                            )}
                                            <div className="flex flex-col">
                                                <span className="text-[9px] text-cine-muted uppercase tracking-wider">Transaction ID</span>
                                                <span className="font-mono text-xs font-bold text-cine-gold">{u.paymentProof?.transactionId || '---'}</span>
                                            </div>
                                        </div>
                                    ) : (
                                        u.status === 'banned' ? 
                                            <span className="text-red-500 font-bold text-xs px-2 py-1 bg-red-500/10 rounded">BANNED</span> : 
                                            <span className="text-green-500 font-bold text-xs px-2 py-1 bg-green-500/10 rounded">Active</span>
                                    )}
                                </td>
                                <td className="p-3 text-right">
                                    {u.role !== 'admin' && (
                                        <div className="flex justify-end gap-2">
                                            {u.paymentStatus === 'pending' && (
                                                <button
                                                    onClick={() => setReviewUser(u)}
                                                    className="bg-cine-gold hover:bg-yellow-400 text-black px-3 py-1 rounded text-xs font-bold flex items-center gap-1"
                                                >
                                                    <CheckCircle size={12} /> Review
                                                </button>
                                            )}
                                            <button 
                                                onClick={() => handleBanUser(u.id)}
                                                className="text-red-400 hover:text-white hover:bg-red-500/20 px-3 py-1 rounded transition-colors text-xs"
                                            >
                                                {u.status === 'banned' ? 'Unban' : 'Ban'}
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      )}

      {/* Review Payment Proof Modal */}
      {reviewUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
              <div className="bg-cine-card w-full max-w-md rounded-2xl border border-cine-gold overflow-hidden">
                  <div className="bg-cine-gold p-4 flex justify-between items-center text-black">
                      <h3 className="font-bold uppercase">Payment Verification</h3>
                      <button onClick={() => setReviewUser(null)}><X size={20} /></button>
                  </div>
                  <div className="p-6">
                      <p className="text-gray-400 text-sm mb-4">User: <span className="text-white font-bold">{reviewUser.name}</span></p>
                      
                      <div className="bg-black/30 p-3 rounded-lg mb-4">
                          <p className="text-xs text-gray-500 uppercase">Transaction ID</p>
                          <p className="text-lg font-mono text-white">{reviewUser.paymentProof?.transactionId}</p>
                      </div>

                      <div className="mb-6">
                          <p className="text-xs text-gray-500 uppercase mb-2">Screenshot Proof</p>
                          <div className="w-full h-48 bg-black rounded-lg overflow-hidden border border-white/10">
                              {reviewUser.paymentProof?.screenshotUrl ? (
                                  <img src={reviewUser.paymentProof.screenshotUrl} alt="Proof" className="w-full h-full object-contain" />
                              ) : (
                                  <div className="flex items-center justify-center h-full text-gray-500">No Image</div>
                              )}
                          </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                          <button 
                             onClick={() => handleRejectPremium(reviewUser.id)}
                             className="py-3 rounded-lg bg-red-900/30 text-red-500 hover:bg-red-900/50 font-bold border border-red-900/50"
                          >
                              Reject
                          </button>
                          <button 
                             onClick={() => handleApprovePremium(reviewUser.id)}
                             className="py-3 rounded-lg bg-green-600 hover:bg-green-500 text-white font-bold"
                          >
                              Approve Premium
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* Add Movie Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-cine-card w-full max-w-lg rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
                <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                    <h2 className="font-bold text-white flex items-center gap-2">
                        <Upload size={20} className="text-cine-accent" /> Upload Movie
                    </h2>
                    <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-white">
                        <X size={24} />
                    </button>
                </div>
                
                <form onSubmit={handleAddMovie} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    {/* File Upload Section */}
                    <div className="grid grid-cols-2 gap-4 bg-black/20 p-4 rounded-xl border border-white/5">
                         <div className="col-span-1">
                             <label className="text-xs font-bold text-cine-muted uppercase mb-2 block">Movie Poster</label>
                             <div 
                                onClick={() => posterInputRef.current?.click()}
                                className="h-32 border-2 border-dashed border-white/20 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-cine-accent hover:bg-white/5 transition-colors relative overflow-hidden"
                             >
                                 {newMovie.posterUrl ? (
                                     <img src={newMovie.posterUrl} className="absolute inset-0 w-full h-full object-cover" alt="Preview" />
                                 ) : (
                                     <>
                                        <ImageIcon className="text-gray-500 mb-1" />
                                        <span className="text-[10px] text-gray-500">Select Image</span>
                                     </>
                                 )}
                             </div>
                             <input 
                                type="file" 
                                ref={posterInputRef} 
                                accept="image/*" 
                                className="hidden" 
                                onChange={(e) => handleFileSelect(e, 'poster')} 
                             />
                         </div>

                         <div className="col-span-1">
                             <label className="text-xs font-bold text-cine-muted uppercase mb-2 block">Video File / URL</label>
                             <div 
                                onClick={() => videoInputRef.current?.click()}
                                className="h-32 border-2 border-dashed border-white/20 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-cine-accent hover:bg-white/5 transition-colors relative overflow-hidden"
                             >
                                 {newMovie.isLocalVideo ? (
                                      <div className="flex flex-col items-center text-green-500">
                                          <CheckCircle />
                                          <span className="text-[10px] mt-1">Video Selected</span>
                                      </div>
                                 ) : (
                                     <>
                                        <Play className="text-gray-500 mb-1" />
                                        <span className="text-[10px] text-gray-500">Select Video (MP4)</span>
                                     </>
                                 )}
                             </div>
                             <input 
                                type="file" 
                                ref={videoInputRef} 
                                accept="video/*" 
                                className="hidden" 
                                onChange={(e) => handleFileSelect(e, 'video')} 
                             />
                             <p className="text-[10px] text-gray-500 mt-2 text-center">or paste Embed URL below</p>
                         </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="text-xs font-bold text-cine-muted uppercase mb-1 block">Movie Title</label>
                            <input 
                                required
                                type="text" 
                                className="w-full bg-black/40 border border-white/10 rounded p-3 text-white focus:border-cine-accent outline-none"
                                placeholder="e.g. Inception"
                                value={newMovie.title}
                                onChange={e => setNewMovie({...newMovie, title: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-cine-muted uppercase mb-1 block">Year</label>
                            <input 
                                type="number" 
                                className="w-full bg-black/40 border border-white/10 rounded p-3 text-white focus:border-cine-accent outline-none"
                                placeholder="2024"
                                value={newMovie.year}
                                onChange={e => setNewMovie({...newMovie, year: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-cine-muted uppercase mb-1 block">Rating (0-10)</label>
                            <input 
                                type="text" 
                                className="w-full bg-black/40 border border-white/10 rounded p-3 text-white focus:border-cine-accent outline-none"
                                placeholder="8.5"
                                value={newMovie.rating}
                                onChange={e => setNewMovie({...newMovie, rating: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-cine-muted uppercase mb-1 block">Genre</label>
                            <input 
                                type="text" 
                                className="w-full bg-black/40 border border-white/10 rounded p-3 text-white focus:border-cine-accent outline-none"
                                placeholder="Sci-Fi"
                                value={newMovie.genre}
                                onChange={e => setNewMovie({...newMovie, genre: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-cine-muted uppercase mb-1 block">Director</label>
                            <input 
                                type="text" 
                                className="w-full bg-black/40 border border-white/10 rounded p-3 text-white focus:border-cine-accent outline-none"
                                placeholder="Christopher Nolan"
                                value={newMovie.director}
                                onChange={e => setNewMovie({...newMovie, director: e.target.value})}
                            />
                        </div>
                    </div>

                    {!newMovie.isLocalVideo && (
                        <div>
                            <label className="text-xs font-bold text-cine-muted uppercase mb-1 flex items-center gap-2">
                                Trailer URL (Optional if file uploaded)
                            </label>
                            <input 
                                type="url" 
                                className="w-full bg-black/40 border border-white/10 rounded p-3 text-white focus:border-cine-accent outline-none"
                                placeholder="https://www.youtube.com/embed/..."
                                value={newMovie.trailerUrl}
                                onChange={e => setNewMovie({...newMovie, trailerUrl: e.target.value})}
                            />
                        </div>
                    )}

                    <div>
                        <label className="text-xs font-bold text-cine-muted uppercase mb-1 block">Synopsis</label>
                        <textarea 
                            className="w-full bg-black/40 border border-white/10 rounded p-3 text-white focus:border-cine-accent outline-none h-24 resize-none"
                            placeholder="Movie plot summary..."
                            value={newMovie.synopsis}
                            onChange={e => setNewMovie({...newMovie, synopsis: e.target.value})}
                        ></textarea>
                    </div>

                    <button 
                        type="submit" 
                        className="w-full bg-cine-accent hover:bg-red-600 text-white font-bold py-4 rounded-lg transition-all shadow-lg shadow-red-900/20"
                    >
                        Save to Database
                    </button>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;