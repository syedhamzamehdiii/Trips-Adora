import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const InvitePartnerComponent = ({ isOpen, onClose }) => {
  const [isCopied, setIsCopied] = useState(false);
  const [referralLink, setReferralLink] = useState('https://www.tripadora.supply/referral/accept-invitation?...');
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50" onClick={() => { if (onClose) onClose(); navigate('/dashboard'); }}></div>

      {/* Header back button */}
      <div className="absolute top-6 left-6 z-[10001] pointer-events-auto">
        <button type="button" onClick={() => { if (onClose) onClose(); navigate('/dashboard'); }} className="bg-black/50 hover:bg-black/70 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          <span>Back to Dashboard</span>
        </button>
      </div>

      {/* Centered modal card */}
      <div className="relative z-50 flex min-h-screen items-center justify-center p-6 pointer-events-none">
        <div className="w-full max-w-7xl bg-black/60 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 flex pointer-events-auto">
          {/* Left content */}
          <div className="flex-1 p-8 pl-16 flex flex-col justify-center">
          <div className="mb-8">
            <h1 className="text-3xl font-medium text-gray-300 mb-2 leading-relaxed">
              Refer a supply partner and <span className="text-blue-400 font-bold text-4xl">earn up to €250</span>
            </h1>
            <p className="text-3xl font-medium text-gray-300 leading-relaxed">in commission free bookings for each successful referral.</p>
          </div>

          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <input type="text" value={referralLink} onChange={(e)=>setReferralLink(e.target.value)} className="flex-1 bg-gray-800 rounded-lg px-4 py-3 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              <button onClick={handleCopyLink} className={`px-6 py-3 rounded-lg font-semibold transition-colors ${isCopied? 'bg-green-500 text-white':'bg-blue-500 text-white hover:bg-blue-600'}`}>{isCopied? 'Copied!':'Grab Referral Link!'}</button>
            </div>
            <div className="flex items-center space-x-4">
              <p className="text-white text-sm">Or share via,</p>
              <div className="flex space-x-3">
                <button className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center hover:bg-green-600 transition-colors"><svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/></svg></button>
                <button className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors"><svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg></button>
                <button className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors"><svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg></button>
              </div>
            </div>
          </div>

          <div className="mt-12">
            <h2 className="text-4xl font-bold text-white mb-8">Getting started is simple</h2>
            <div className="flex flex-col md:flex-row gap-8 md:gap-12">
              <div className="flex flex-col items-start"><div className="w-16 h-16 bg-gray-800 border border-blue-400 rounded-lg flex items-center justify-center mb-4"><span className="text-xl font-bold text-white">01</span></div><p className="text-white text-base leading-relaxed max-w-xs">Refer a supply partner</p></div>
              <div className="flex flex-col items-start"><div className="w-16 h-16 bg-gray-800 border border-blue-400 rounded-lg flex items-center justify-center mb-4"><span className="text-xl font-bold text-white">02</span></div><p className="text-white text-base leading-relaxed max-w-xs">Invite a supply partner with your referral link Your referral successfully conducts their first booking</p></div>
              <div className="flex flex-col items-start"><div className="w-16 h-16 bg-gray-800 border border-blue-400 rounded-lg flex items-center justify-center mb-4"><span className="text-xl font-bold text-white">03</span></div><p className="text-white text-base leading-relaxed max-w-xs">You both receive up to €250 in commission-free bookings Some supply partners even referred 10 people, earning rewrite</p></div>
            </div>
          </div>
          </div>
          {/* Right image */}
          <div className="w-1/3 relative flex items-center justify-center mr-8">
            <img src="/assets/image2.jpg" alt="Waterfall" className="w-full h-[42rem] object-cover rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvitePartnerComponent;


