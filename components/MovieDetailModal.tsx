import React, { useState } from 'react';
import { X, Plus, Check, Play, Share2, Star, MessageSquare, Download, Lock } from 'lucide-react';
import { Movie, UserProfile } from '../types';

interface Props {
  movie: Movie;
  user: UserProfile;
  onClose: () => void;
  onAddToWatchlist: () => void;
  inWatchlist: boolean;
  isPremium: boolean;
  onAddReview: (id: string, rating: number, comment: string) => void;
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

const MovieDetailModal: React.FC<Props> = ({ movie, user, onClose, onAddToWatchlist, inWatchlist, isPremium, onAddReview, showToast }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'reviews'>('info');
  const [newComment, setNewComment] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);

  const handlePlay = () => {
    if (movie.trailerUrl) {
      setIsPlaying(true);
    } else {
      showToast("Sorry, a trailer is not currently available.", "error");
    }
  };

  const handleSubmitReview = (e: React.FormEvent) => {
      e.preventDefault();
      if(!newComment.trim()) return;
      onAddReview(movie.id, newRating, newComment);
      setNewComment('');
  };

  const handleDownload = () => {
      if (!isPremium) {
          showToast("Downloads are a Premium feature!", "error");
          return;
      }
      setIsDownloading(true);
      setTimeout(() => {
          setIsDownloading(false);
          setIsDownloaded(true);
          showToast("Movie downloaded for offline viewing", "success");
      }, 2000);
  };

  return (
    <>
      <div className="fixed inset-0 z-[60] flex justify-center bg-black/90 backdrop-blur-sm animate-fade-in overflow-y-auto">
        <div className="relative w-full max-w-2xl bg-cine-bg min-h-screen md:min-h-0 md:mt-10 md:rounded-t-2xl shadow-2xl md:pb-20">
          
          {/* Close Button */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 z-10 bg-black/50 p-2 rounded-full text-white hover:bg-white/20 transition-colors"
          >
            <X size={24} />
          </button>

          {/* Hero Image */}
          <div className="relative h-96 w-full">
            <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-cine-bg via-cine-bg/20 to-transparent"></div>
            
            <div className="absolute bottom-0 left-0 p-6 w-full">
               <h2 className="text-3xl font-black text-white leading-none mb-2">{movie.title}</h2>
               <div className="flex items-center space-x-4 text-sm font-medium text-gray-300">
                 <span className="bg-white/10 px-2 py-1 rounded">{movie.year}</span>
                 <span className="bg-white/10 px-2 py-1 rounded">{movie.genre}</span>
                 <span className="text-yellow-400">★ {movie.rating}</span>
               </div>
            </div>
          </div>

          {/* Actions */}
          <div className="px-6 py-4 flex space-x-4 border-b border-white/5">
            <button 
              onClick={handlePlay}
              className="flex-1 bg-white text-black py-3 rounded-lg font-bold flex items-center justify-center space-x-2 hover:bg-gray-200 transition-colors"
            >
              <Play fill="black" size={20} />
              <span>Watch</span>
            </button>
            <button 
              onClick={onAddToWatchlist}
              className={`flex-1 py-3 rounded-lg font-bold flex items-center justify-center space-x-2 border transition-colors ${
                inWatchlist 
                ? 'bg-cine-card border-green-500 text-green-500' 
                : 'bg-cine-card border-gray-600 hover:border-white text-white'
              }`}
            >
               {inWatchlist ? <Check size={20} /> : <Plus size={20} />}
               <span>{inWatchlist ? 'Added' : 'List'}</span>
            </button>
             <button 
              onClick={handleDownload}
              disabled={isDownloaded || isDownloading}
              className={`flex-1 py-3 rounded-lg font-bold flex items-center justify-center space-x-2 border transition-colors ${
                isDownloaded
                ? 'bg-green-500/20 border-green-500 text-green-500' 
                : 'bg-cine-card border-gray-600 hover:border-white text-white'
              }`}
            >
               {!isPremium ? <Lock size={16} /> : isDownloading ? <span className="animate-spin">⟳</span> : isDownloaded ? <Check size={20} /> : <Download size={20} />}
               <span className="hidden sm:inline">{isDownloaded ? 'Saved' : 'Save'}</span>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-white/5">
              <button 
                onClick={() => setActiveTab('info')}
                className={`flex-1 py-4 text-sm font-bold text-center border-b-2 transition-colors ${activeTab === 'info' ? 'border-cine-accent text-white' : 'border-transparent text-gray-500'}`}
              >
                  Overview
              </button>
              <button 
                onClick={() => setActiveTab('reviews')}
                className={`flex-1 py-4 text-sm font-bold text-center border-b-2 transition-colors ${activeTab === 'reviews' ? 'border-cine-accent text-white' : 'border-transparent text-gray-500'}`}
              >
                  Reviews ({movie.reviews?.length || 0})
              </button>
          </div>

          {/* Content */}
          <div className="p-6 min-h-[300px]">
             {activeTab === 'info' ? (
                 <div className="space-y-6 animate-fade-in">
                    <div>
                        <h3 className="text-white font-bold text-lg mb-2">Synopsis</h3>
                        <p className="text-gray-400 leading-relaxed">{movie.synopsis}</p>
                    </div>

                    {movie.cast && (
                        <div>
                            <h3 className="text-white font-bold text-lg mb-2">Cast</h3>
                            <div className="flex flex-wrap gap-2">
                            {movie.cast.map((actor, i) => (
                                <span key={i} className="bg-white/5 px-3 py-1 rounded-full text-xs text-gray-300">{actor}</span>
                            ))}
                            </div>
                        </div>
                    )}

                    {movie.trivia && (
                        <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-lg">
                            <h4 className="text-blue-400 font-bold text-sm mb-1">Did you know?</h4>
                            <p className="text-sm text-gray-300">{movie.trivia}</p>
                        </div>
                    )}
                 </div>
             ) : (
                 <div className="space-y-6 animate-fade-in">
                     {/* Add Review */}
                     <form onSubmit={handleSubmitReview} className="bg-white/5 p-4 rounded-xl border border-white/5">
                         <h4 className="font-bold mb-3 text-sm">Leave a Review</h4>
                         <div className="flex gap-2 mb-3">
                             {[1,2,3,4,5].map(star => (
                                 <button key={star} type="button" onClick={() => setNewRating(star)}>
                                     <Star size={20} fill={star <= newRating ? "gold" : "none"} className={star <= newRating ? "text-yellow-400" : "text-gray-600"} />
                                 </button>
                             ))}
                         </div>
                         <textarea 
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            className="w-full bg-black/40 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-cine-accent border border-transparent resize-none h-20"
                            placeholder="Share your thoughts..."
                         />
                         <div className="flex justify-end mt-2">
                             <button type="submit" className="bg-cine-accent px-4 py-2 rounded-lg text-xs font-bold text-white hover:bg-red-700">Post Review</button>
                         </div>
                     </form>

                     {/* List Reviews */}
                     <div className="space-y-4">
                         {movie.reviews && movie.reviews.length > 0 ? (
                             movie.reviews.map(rev => (
                                 <div key={rev.id} className="border-b border-white/5 pb-4">
                                     <div className="flex justify-between items-start mb-1">
                                         <span className="font-bold text-sm text-white">{rev.userName}</span>
                                         <span className="text-xs text-gray-500">{rev.date}</span>
                                     </div>
                                     <div className="flex text-yellow-400 mb-2">
                                         {[...Array(rev.rating)].map((_, i) => <Star key={i} size={12} fill="currentColor" />)}
                                     </div>
                                     <p className="text-gray-400 text-sm">{rev.comment}</p>
                                 </div>
                             ))
                         ) : (
                             <div className="text-center text-gray-500 py-8">
                                 <MessageSquare size={32} className="mx-auto mb-2 opacity-50" />
                                 <p>No reviews yet. Be the first!</p>
                             </div>
                         )}
                     </div>
                 </div>
             )}
             
             <div className="h-20"></div> {/* Spacer */}
          </div>
        </div>
      </div>

      {/* Video Player Overlay */}
      {isPlaying && movie.trailerUrl && (
        <div className="fixed inset-0 z-[70] bg-black flex flex-col items-center justify-center animate-fade-in">
           <button 
              onClick={() => setIsPlaying(false)}
              className="absolute top-6 right-6 z-[80] bg-white/10 hover:bg-white/20 p-2 rounded-full text-white transition-all"
           >
              <X size={32} />
           </button>
           <div className="w-full max-w-5xl aspect-video bg-black shadow-2xl overflow-hidden relative">
              <iframe
                src={`${movie.trailerUrl}${movie.trailerUrl.includes('?') ? '&' : '?'}autoplay=1`}
                title={`${movie.title} Trailer`}
                className="w-full h-full border-none"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
           </div>
           <p className="text-white/50 text-xs mt-4">Playing: {movie.title} (Official Trailer)</p>
        </div>
      )}
    </>
  );
};

export default MovieDetailModal;