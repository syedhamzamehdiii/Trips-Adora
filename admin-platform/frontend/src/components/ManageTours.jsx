import React, { useMemo, useState } from 'react';
import RequestToApprove from './RequestToApprove';
import TourDetailPage from './TourDetailPage';

const STATUS_OPTIONS = ['All status', 'Active', 'Draft', 'Archived'];
const TYPE_OPTIONS = ['All types', 'Day tour', 'Museum', 'Landmark'];
const COUNTRY_OPTIONS = ['All countries', 'Japan', 'UAE'];

const cards = new Array(12).fill(0).map((_, i) => ({
  id: i + 1,
  title: i % 3 === 0 ? 'Mount Fuji Highlights & Hidden Gems Tour' : i % 3 === 1 ? 'Hakoney Highlights & Hidden Gems Tour' : 'Burj Khalifa Highlights & Hidden Gems Tour',
  price: i % 3 === 2 ? 167 : i % 3 === 1 ? 245 : 119,
  img: i % 3 === 0
    ? 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=1200&auto=format&fit=crop'
    : i % 3 === 1
    ? 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=1200&auto=format&fit=crop'
    : 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?q=80&w=1200&auto=format&fit=crop',
  status: i % 4 === 0 ? 'Active' : i % 4 === 1 ? 'Draft' : 'Archived',
  type: i % 3 === 0 ? 'Day tour' : i % 3 === 1 ? 'Museum' : 'Landmark',
  country: i % 3 === 2 ? 'UAE' : 'Japan'
}));

const Star = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="#FFC107"><path d="M12 .587l3.668 7.431 8.2 1.193-5.934 5.787 1.402 8.168L12 18.896 4.664 23.166l1.402-8.168L.132 9.211l8.2-1.193z"/></svg>
);

const Dot = () => <span className="mx-2 inline-block w-1 h-1 rounded-full bg-gray-400" />;

const Chip = ({ children }) => (
  <span className="text-[10px] px-2 py-1 rounded bg-gray-100 text-gray-700 border border-gray-200">{children}</span>
);

const Card = ({ item }) => (
  <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
    <div className="relative">
      <img src={item.img} alt={item.title} className="w-full h-56 object-cover" />
      <span className="absolute top-3 left-3 text-[10px] text-white bg-[var(--brand-red)] px-2 py-1 rounded-full">Only 2 Slots left</span>
      <button className="absolute top-2 right-2 w-9 h-9 rounded-full bg-white flex items-center justify-center text-gray-700 border">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 22l7.8-8.6 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>
      </button>
    </div>
    <div className="p-4">
      <div className="flex items-center text-sm">
        <div className="flex items-center gap-1 text-yellow-400"><Star /><Star /><Star /><Star /></div>
        <span className="ml-2 text-gray-800 font-medium">4.8</span>
        <span className="ml-1 text-gray-400 text-xs">(384)</span>
      </div>
      <div className="mt-2 text-xs text-gray-500 flex items-center">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
        <span className="ml-1">Tokyo Japan</span>
      </div>
      <h3 className="mt-1 text-base font-semibold text-gray-900 leading-snug">{item.title}</h3>
      {/* Right aligned badges like screenshot */}
      <div className="mt-1 flex items-center justify-end gap-2">
        <span className="text-[10px] px-2 py-1 rounded-full bg-[var(--brand-green)] text-[var(--brand-dark)] border border-[var(--brand-green)]">Tripadvisor's Choice</span>
        <span className="text-[10px] px-2 py-1 rounded-full bg-gray-100 text-gray-700 border border-gray-200">Private</span>
      </div>
      <div className="mt-2 text-xs text-gray-600 flex items-center">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
        <span className="ml-1">8 hours</span>
        <Dot />
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        <span className="ml-1">Up to 12</span>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-[var(--brand-dark)] text-white flex items-center justify-center text-sm">K</div>
        <div className="leading-tight">
          <div className="text-[11px] text-gray-500">Hosted by</div>
          <div className="text-xs text-gray-800">Karvaan Tours</div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <Chip>Sightseeing</Chip>
        <Chip>Local Food</Chip>
        <Chip>Private Transport</Chip>
        <Chip>HiddenGems</Chip>
        <Chip>Photo Spots</Chip>
      </div>

      {/* Divider like screenshot above price row */}
      <div className="mt-4 border-t border-gray-200" />
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-baseline gap-3">
          <div className="text-[12px] text-gray-400 line-through">$125</div>
          <div className="text-xl font-semibold text-gray-900">${item.price}/person</div>
        </div>
        <button className="w-9 h-9 rounded-full border border-gray-300 text-gray-700 flex items-center justify-center">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="1"/><circle cx="6" cy="12" r="1"/><circle cx="18" cy="19" r="1"/><path d="M7 12h10M7 12L17 5M7 12l10 7"/></svg>
        </button>
      </div>
    </div>
  </div>
);

const ManageTours = () => {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('All status');
  const [type, setType] = useState('All types');
  const [country, setCountry] = useState('All countries');
  const [openMenu, setOpenMenu] = useState(null); // 'status' | 'type' | 'country'
  const [showRequestToApprove, setShowRequestToApprove] = useState(false);
  const [showTourDetail, setShowTourDetail] = useState(false);

  const filtered = useMemo(() => {
    return cards.filter((c) =>
      (status === 'All status' || c.status === status) &&
      (type === 'All types' || c.type === type) &&
      (country === 'All countries' || c.country === country) &&
      c.title.toLowerCase().includes(query.toLowerCase())
    );
  }, [query, status, type, country]);

  return (
    <div className="p-2">
      {!showTourDetail && (
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-semibold text-green-800">Manage All Tours</h1>
          {!showRequestToApprove && (
            <button 
              onClick={() => setShowRequestToApprove(true)}
              className="relative inline-flex items-center gap-2 rounded-full text-sm shadow"
              style={{ backgroundColor: '#284078', color: '#fff', height: '44px', paddingInline: '20px' }}>
              Request to approve
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-[10px] leading-none flex items-center justify-center">15</span>
            </button>
          )}
        </div>
      )}

      {showTourDetail ? (
        <TourDetailPage fromRequestToApprove={true} onBack={() => { setShowTourDetail(false); setShowRequestToApprove(true); }} />
      ) : showRequestToApprove ? (
        <div className="mt-6">
          <RequestToApprove 
            onCardClick={() => setShowTourDetail(true)} 
            onBack={() => setShowRequestToApprove(false)} 
          />
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex items-center w-[360px] max-w-full rounded-full border border-gray-300 px-4 py-2 bg-white">
          <input value={query} onChange={(e)=>setQuery(e.target.value)} className="flex-1 outline-none text-sm" placeholder="Search by name or ref. number" />
          <svg className="text-gray-500" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.3-4.3"/></svg>
        </div>
        <div className="relative">
          <button onClick={()=>setOpenMenu(openMenu==='status'?null:'status')} className="px-4 py-2 rounded-full border border-gray-300 bg-white text-sm text-gray-700 flex items-center gap-2">
            {status}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
          </button>
          {openMenu==='status' && (
            <div className="absolute z-10 mt-2 w-44 bg-white rounded-lg shadow border">
              {STATUS_OPTIONS.map((opt)=> (
                <button key={opt} onClick={()=>{setStatus(opt);setOpenMenu(null);}} className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-50">{opt}</button>
              ))}
            </div>
          )}
        </div>
        <div className="relative">
          <button onClick={()=>setOpenMenu(openMenu==='type'?null:'type')} className="px-4 py-2 rounded-full border border-gray-300 bg-white text-sm text-gray-700 flex items-center gap-2">
            {type}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
          </button>
          {openMenu==='type' && (
            <div className="absolute z-10 mt-2 w-44 bg-white rounded-lg shadow border">
              {TYPE_OPTIONS.map((opt)=> (
                <button key={opt} onClick={()=>{setType(opt);setOpenMenu(null);}} className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-50">{opt}</button>
              ))}
            </div>
          )}
        </div>
        <div className="relative">
          <button onClick={()=>setOpenMenu(openMenu==='country'?null:'country')} className="px-4 py-2 rounded-full border border-gray-300 bg-white text-sm text-gray-700 flex items-center gap-2">
            {country}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
          </button>
          {openMenu==='country' && (
            <div className="absolute z-10 mt-2 w-44 bg-white rounded-lg shadow border">
              {COUNTRY_OPTIONS.map((opt)=> (
                <button key={opt} onClick={()=>{setCountry(opt);setOpenMenu(null);}} className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-50">{opt}</button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((c) => (
          <Card key={c.id} item={c} />
        ))}
      </div>

      {/* Dummy pagination */}
      <div className="mt-8 flex items-center justify-center gap-4">
        <button className="w-9 h-9 flex items-center justify-center rounded-full border text-gray-600">‹</button>
        <button className="w-9 h-9 flex items-center justify-center rounded-full bg-[#273C75] text-white">1</button>
        <button className="w-9 h-9 flex items-center justify-center rounded-full border text-gray-700">2</button>
        <button className="w-9 h-9 flex items-center justify-center rounded-full border text-gray-700">3</button>
        <span className="mx-2 text-gray-500">…</span>
        <button className="w-9 h-9 flex items-center justify-center rounded-full border text-gray-700">12</button>
        <button className="w-9 h-9 flex items-center justify-center rounded-full border text-gray-700">13</button>
        <button className="w-9 h-9 flex items-center justify-center rounded-full border text-gray-700">14</button>
        <div className="ml-6 flex items-center gap-2">
          <button className="px-3 py-1.5 rounded-full border text-sm text-gray-700">1\10</button>
          <button className="w-9 h-9 flex items-center justify-center rounded-full border">▾</button>
        </div>
        <button className="w-9 h-9 flex items-center justify-center rounded-full border text-gray-600">›</button>
      </div>
        </>
      )}
    </div>
  );
};

export default ManageTours;


