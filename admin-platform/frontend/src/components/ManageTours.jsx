import React, { useEffect, useState } from 'react';
import RequestToApprove from './RequestToApprove';
import TourDetailPage from './TourDetailPage';
import adminProductService from '../services/adminProductService';

// Admin should not see draft/archived filters here (per requirement)
const STATUS_OPTIONS = ['All status', 'published', 'pending_review', 'rejected'];

const Star = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="#FFC107"><path d="M12 .587l3.668 7.431 8.2 1.193-5.934 5.787 1.402 8.168L12 18.896 4.664 23.166l1.402-8.168L.132 9.211l8.2-1.193z"/></svg>
);

const Dot = () => <span className="mx-2 inline-block w-1 h-1 rounded-full bg-gray-400" />;

const Chip = ({ children }) => (
  <span className="text-[10px] px-2 py-1 rounded bg-gray-100 text-gray-700 border border-gray-200">{children}</span>
);

const formatPrice = (item) => {
  const price = Number(item.price || 0);
  const currency = item.currency || 'USD';
  const unit = item.price_unit || 'Per person';
  const sym = currency === 'USD' ? '$' : `${currency} `;
  return `${sym}${price.toFixed(0)}/${String(unit || '').toLowerCase().includes('group') ? 'group' : 'person'}`;
};

const initialsOf = (name) =>
  String(name || 'S')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || '')
    .join('') || 'S';

const Card = ({ item, onClick }) => (
  <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
    <div className="relative">
      <img src={item.hero_image || (item.images && item.images[0]) || ''} alt={item.title} className="w-full h-56 object-cover" onClick={onClick} />
      <button className="absolute top-2 right-2 w-9 h-9 rounded-full bg-white flex items-center justify-center text-gray-700 border">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 22l7.8-8.6 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>
      </button>
    </div>
    <div className="p-4">
      <div className="flex items-center text-sm">
        <div className="flex items-center gap-1 text-yellow-400"><Star /><Star /><Star /><Star /></div>
        <span className="ml-2 text-gray-800 font-medium">{(Number(item.rating || 0)).toFixed(1)}</span>
        <span className="ml-1 text-gray-400 text-xs">({item.reviews_count || 0})</span>
      </div>
      <div className="mt-2 text-xs text-gray-500 flex items-center">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
        <span className="ml-1">{item.location || item.destination || '—'}</span>
      </div>
      <h3 className="mt-1 text-base font-semibold text-gray-900 leading-snug cursor-pointer" onClick={onClick}>{item.title}</h3>
      {/* Right aligned badges like screenshot */}
      <div className="mt-1 flex items-center justify-end gap-2">
        <span className="text-[10px] px-2 py-1 rounded-full bg-[var(--brand-green)] text-[var(--brand-dark)] border border-[var(--brand-green)]">Tripadvisor's Choice</span>
        <span className="text-[10px] px-2 py-1 rounded-full bg-gray-100 text-gray-700 border border-gray-200">Private</span>
      </div>
      <div className="mt-2 text-xs text-gray-600 flex items-center">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
        <span className="ml-1">{item.duration || 'Duration TBD'}</span>
        <Dot />
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        <span className="ml-1">{item.groupSize || item.maxGroupSize || 'Up to 12'}</span>
      </div>

      <div className="mt-4 flex items-center gap-3">
        {item.supplier_avatar_url ? (
          <img
            src={item.supplier_avatar_url}
            alt={item.supplier_name || 'Supplier'}
            className="w-8 h-8 rounded-full object-cover border border-gray-200"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-[var(--brand-dark)] text-white flex items-center justify-center text-sm">
            {initialsOf(item.supplier_name)}
          </div>
        )}
        <div className="leading-tight">
          <div className="text-[11px] text-gray-500">Hosted by</div>
          <div className="text-xs text-gray-800">{item.supplier_name || 'Supplier'}</div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {item.selling_points && item.selling_points.length > 0 ? (
          item.selling_points.slice(0, 5).map((tag, i) => (
            <Chip key={i}>{tag}</Chip>
          ))
        ) : item.activity_type ? (
          <Chip>{item.activity_type}</Chip>
        ) : (
          // Fallback to default tags only if no data available
          <>
            <Chip>Sightseeing</Chip>
            <Chip>Local Food</Chip>
            <Chip>Private Transport</Chip>
          </>
        )}
      </div>

      {/* Divider like screenshot above price row */}
      <div className="mt-4 border-t border-gray-200" />
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-baseline gap-3">
          <div className="text-xl font-semibold text-gray-900">{formatPrice(item)}</div>
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
  const [openMenu, setOpenMenu] = useState(null); // 'status'
  const [showRequestToApprove, setShowRequestToApprove] = useState(false);
  const [showTourDetail, setShowTourDetail] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [pendingCount, setPendingCount] = useState(0);
  const [products, setProducts] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [pendingItems, setPendingItems] = useState([]);
  const [pendingLoading, setPendingLoading] = useState(false);

  // Load pending count for button badge
  useEffect(() => {
    let active = true;
    const loadCount = async () => {
      try {
        const res = await adminProductService.getPendingCount();
        if (active) setPendingCount(Number(res?.pending || 0));
      } catch (_) {
        if (active) setPendingCount(0);
      }
    };
    loadCount();
    const t = setInterval(loadCount, 20000);
    return () => { active = false; clearInterval(t); };
  }, []);

  // Load products list for main view (published by default)
  useEffect(() => {
    if (showRequestToApprove || showTourDetail) return;
    let active = true;
    const load = async () => {
      try {
        setLoading(true);
        const res = await adminProductService.listProducts({
          page,
          pageSize: 12,
          // When "All status" is selected, show all products (no status filter)
          status: status === 'All status' ? null : status,
          search: query,
        });
        if (!active) return;
        setProducts(res?.products || []);
        setTotalPages(res?.total_pages || 1);
      } catch (e) {
        if (!active) return;
        console.error('Failed to load products', e);
        setProducts([]);
        setTotalPages(1);
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [page, query, status, showRequestToApprove, showTourDetail]);

  // Load pending approval queue
  useEffect(() => {
    if (!showRequestToApprove || showTourDetail) return;
    let active = true;
    const loadPending = async () => {
      try {
        setPendingLoading(true);
        const res = await adminProductService.listProducts({
          page: 1,
          pageSize: 20,
          status: 'pending_review',
          // Always show all pending approvals (no accidental carry-over filtering)
          search: '',
        });
        if (!active) return;
        setPendingItems(res?.products || []);
      } catch (e) {
        if (!active) return;
        console.error('Failed to load pending approvals', e);
        setPendingItems([]);
      } finally {
        if (active) setPendingLoading(false);
      }
    };
    loadPending();
    return () => { active = false; };
  }, [showRequestToApprove, showTourDetail, query]);

  // Removed category + country filter dropdowns per requirement

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
              {pendingCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-[10px] leading-none flex items-center justify-center">
                  {pendingCount > 99 ? '99+' : pendingCount}
                </span>
              )}
            </button>
          )}
        </div>
      )}

      {showTourDetail ? (
        <TourDetailPage
          productId={selectedProduct?.id}
          fromRequestToApprove={!!selectedProduct?.fromRequest}
          onBack={() => { setShowTourDetail(false); setShowRequestToApprove(!!selectedProduct?.fromRequest); setSelectedProduct(null); }}
        />
      ) : showRequestToApprove ? (
        <div className="mt-6">
          <RequestToApprove 
            loading={pendingLoading}
            items={pendingItems}
            onCardClick={(p) => { setSelectedProduct({ ...p, fromRequest: true }); setShowTourDetail(true); }} 
            onBack={() => setShowRequestToApprove(false)} 
          />
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex items-center w-[360px] max-w-full rounded-full border border-gray-300 px-4 py-2 bg-white">
          <input value={query} onChange={(e)=>{setQuery(e.target.value); setPage(1);}} className="flex-1 outline-none text-sm" placeholder="Search by name or ref. number" />
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
                <button key={opt} onClick={()=>{setStatus(opt);setPage(1);setOpenMenu(null);}} className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-50">{opt}</button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading && (
          <div className="col-span-full text-sm text-gray-500 py-10">Loading products…</div>
        )}
        {!loading && products.map((p) => (
          <Card key={p.id} item={p} onClick={() => { setSelectedProduct({ ...p, fromRequest: false }); setShowTourDetail(true); }} />
        ))}
      </div>

      {/* Realtime pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          <button
            className="w-9 h-9 flex items-center justify-center rounded-full border text-gray-600 disabled:opacity-50"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            ‹
          </button>
          <button className="w-9 h-9 flex items-center justify-center rounded-full bg-[#273C75] text-white">{page}</button>
          <button
            className="w-9 h-9 flex items-center justify-center rounded-full border text-gray-600 disabled:opacity-50"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            ›
          </button>
        </div>
      )}
        </>
      )}
    </div>
  );
};

export default ManageTours;


