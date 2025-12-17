import React from 'react';

const Tag = ({ children }) => (
  <span className="inline-flex items-center text-[11px] px-2 py-0.5 rounded-md bg-gray-100 text-gray-700">{children}</span>
);

const monthLabel = (d) => {
  try {
    const dt = d ? new Date(d) : null;
    if (!dt || Number.isNaN(dt.getTime())) return '';
    return dt.toLocaleString(undefined, { month: 'long', year: 'numeric' });
  } catch (_) {
    return '';
  }
};

const Row = ({ item, onClick }) => {
  const avatarUrl = item.supplier_avatar_url || null;
  const initials = String(item.supplier_name || 'S')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || '')
    .join('') || 'S';

  return (
    <div 
      onClick={onClick}
      className="w-full rounded-xl border border-gray-200 bg-white shadow-sm px-4 py-4 md:px-5 md:py-5 cursor-pointer hover:shadow-md transition-shadow"
    >
      <div className="flex items-start gap-4">
        {/* left meta */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={item.supplier_name || 'Supplier'}
                className="w-7 h-7 rounded-full object-cover border border-gray-200"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-gray-100 text-[#284078] flex items-center justify-center text-[11px] font-semibold">
                {initials}
              </div>
            )}
            <div className="flex items-center gap-6 text-[11px] text-gray-500">
              <div className="flex items-center gap-1.5">
                <span className="text-[13px] font-semibold text-gray-800">{item.supplier_name || 'Supplier'}</span>
              </div>
              <span className="hidden md:inline">{item.supplier_id || ''}</span>
            </div>
          </div>

          <div className="pl-10 mt-1 text-[11px] text-gray-400">{monthLabel(item.updated_at || item.created_at) || ''}</div>

          <div className="mt-4 grid grid-cols-2 gap-6">
            <div className="space-y-1">
              <div className="text-[12px] text-gray-700">Product Title:</div>
              <div className="text-[12px] text-gray-700 font-medium">{item.title}</div>
            </div>
            <div className="space-y-1">
              <div className="text-[12px] text-gray-700">Tags:</div>
              <div className="flex flex-wrap gap-1.5">
                {[item.category, item.activity_type, item.destination].filter(Boolean).slice(0, 3).map((t) => (
                  <Tag key={t}>{t}</Tag>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* right images */}
        <div className="flex-shrink-0 flex items-center gap-3">
          <div className="w-[270px] h-[120px] rounded-lg overflow-hidden">
            <img src={item.hero_image || ''} alt="preview" className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col gap-2">
            <div className="w-[90px] h-[56px] rounded-lg overflow-hidden">
              <img src={(item.images && item.images[0]) || item.hero_image || ''} alt="small1" className="w-full h-full object-cover" />
            </div>
            <div className="w-[90px] h-[56px] rounded-lg overflow-hidden">
              <img src={(item.images && item.images[1]) || item.hero_image || ''} alt="small2" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const RequestToApprove = ({ items = [], loading = false, onCardClick, onBack }) => {
  return (
    <div className="w-full" style={{ fontFamily: 'Poppins, sans-serif' }}>
      {onBack && (
        <button 
          onClick={onBack}
          className="mb-4 px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-100 flex items-center gap-2"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back
        </button>
      )}
      <h2 className="text-center text-[34px] md:text-[36px] font-semibold text-[#2c7a4b] mb-4">Request to approve</h2>
      <div className="space-y-5">
        {loading && (
          <div className="text-sm text-gray-500 text-center py-10">Loading requests…</div>
        )}
        {!loading && items.length === 0 && (
          <div className="text-sm text-gray-500 text-center py-10">No pending product requests.</div>
        )}
        {!loading && items.map((it) => (
          <Row key={it.id} item={it} onClick={() => onCardClick && onCardClick(it)} />
        ))}
      </div>
    </div>
  );
};

export default RequestToApprove;


