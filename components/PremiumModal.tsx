import React, { useState, useRef } from 'react';
import { X, Check, Smartphone, Upload, Image as ImageIcon } from 'lucide-react';
import { UserProfile } from '../types';

interface Props {
  user: UserProfile;
  onClose: () => void;
  onSubmitRequest: (tid: string, screenshotUrl: string) => void;
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

const PremiumModal: React.FC<Props> = ({ user, onClose, onSubmitRequest, showToast }) => {
  const [tid, setTid] = useState('');
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // If already pending
  if (user.paymentStatus === 'pending') {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-cine-card w-full max-w-md rounded-2xl p-8 text-center border border-yellow-500/30">
                <Check size={48} className="mx-auto text-yellow-500 mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">Request Submitted</h2>
                <p className="text-gray-400 mb-6">Your payment is currently under review by our Admin team. You will be notified once approved.</p>
                <button onClick={onClose} className="bg-white/10 text-white px-6 py-2 rounded-lg hover:bg-white/20">Close</button>
            </div>
        </div>
      );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              setScreenshot(reader.result as string);
          };
          reader.readAsDataURL(file);
      }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tid.length < 5) {
      showToast("Please enter a valid Transaction ID", 'error');
      return;
    }
    if (!screenshot) {
        showToast("Please upload a payment screenshot", 'error');
        return;
    }
    
    onSubmitRequest(tid, screenshot);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-cine-card w-full max-w-md rounded-2xl overflow-hidden shadow-2xl border border-cine-gold/30">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-600 to-cine-gold p-6 text-center relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-black/50 hover:text-black">
            <X size={24} />
          </button>
          <h2 className="text-2xl font-black text-black tracking-tight uppercase">CineVault Premium</h2>
          <p className="text-black/80 font-medium text-sm mt-1">Unlock the Full Cinematic Experience</p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="bg-white/5 p-4 rounded-xl border border-white/10 text-center">
            <p className="text-xs text-gray-400 mb-2 uppercase tracking-widest">EasyPaisa Payment</p>
            <p className="text-xl font-mono font-bold text-white tracking-wider">+92 349 6013 464</p>
            <p className="text-[10px] text-gray-500 mt-1">Send PKR 500 & Upload Proof</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1 ml-1">Transaction ID</label>
              <div className="relative">
                <Smartphone className="absolute left-3 top-3 text-gray-500" size={18} />
                <input
                  type="text"
                  value={tid}
                  onChange={(e) => setTid(e.target.value)}
                  placeholder="e.g., 8273649182"
                  className="w-full bg-black/40 border border-gray-700 text-white py-3 pl-10 pr-4 rounded-lg focus:ring-2 focus:ring-cine-gold focus:outline-none transition-all"
                />
              </div>
            </div>

            <div>
                 <label className="block text-xs font-medium text-gray-400 mb-1 ml-1">Payment Screenshot</label>
                 <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-700 hover:border-cine-gold rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer transition-colors"
                 >
                     {screenshot ? (
                         <div className="relative w-full h-24">
                             <img src={screenshot} className="w-full h-full object-cover rounded" alt="proof" />
                             <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                 <p className="text-xs text-white font-bold">Change Image</p>
                             </div>
                         </div>
                     ) : (
                         <>
                            <Upload className="text-gray-500 mb-2" size={20} />
                            <span className="text-xs text-gray-400">Tap to upload Screenshot</span>
                         </>
                     )}
                     <input 
                        type="file" 
                        ref={fileInputRef} 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleFileChange} 
                     />
                 </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-lg font-bold text-black bg-cine-gold hover:bg-yellow-400 shadow-lg shadow-yellow-500/20 transition-all transform active:scale-95"
            >
              Submit for Verification
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PremiumModal;