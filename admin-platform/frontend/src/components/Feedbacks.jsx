import React, { useEffect, useRef, useState, useMemo } from 'react';
import { feedbackService } from '../services/feedbackService';

const StatCard = ({ tone, value, label }) => (
  <div className="rounded-xl border px-6 py-4 w-full sm:w-auto" style={{ borderColor: tone, backgroundColor: tone + '22' }}> 
    <div className="text-2xl font-semibold" style={{ color: '#111827' }}>{value}</div>
    <div className="text-sm mt-1" style={{ color: '#374151' }}>{label}</div>
    <div className="mt-3 flex items-center gap-2 text-[11px] text-center justify-center" style={{ color: '#6B7280' }}>
      <span className="inline-flex items-center gap-1"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: tone }}><path d="M12 19V6"/><path d="M5 12l7-7 7 7"/></svg>12.5%</span>
      <span >This Month</span>
    </div>
  </div>
);

const FeedbackCard = ({ name, date, reference, text }) => (
  <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-4">
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm">S</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-gray-900 font-semibold">{name}</div>
            <div className="text-[11px] text-gray-500">{reference}</div>
          </div>
          <div className="text-[11px] text-gray-500">{date}</div>
        </div>
        <p className="mt-2 text-sm text-gray-700 leading-relaxed">{text}</p>
      </div>
    </div>
  </div>
);

const Feedbacks = () => {
  const [query, setQuery] = useState('');
  const [monthOpen, setMonthOpen] = useState(false);
  const [month, setMonth] = useState('All');
  const monthOptions = ['All','January','February','March','April','May','June','July','August','September','October','November','December'];
  const monthRef = useRef(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ total_reviews: 0, avg_rating: 0, pending_replies: 0 });

  useEffect(() => {
    const onClick = (e) => {
      if (monthOpen && monthRef.current && !monthRef.current.contains(e.target)) setMonthOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setMonthOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [monthOpen]);
  useEffect(() => {
    const fetchFeedbacks = async () => {
      setLoading(true);
      try {
        const data = await feedbackService.getFeedbacks(query, month);
        setFeedbacks(data.feedbacks || []);
      } catch (err) {
        console.error('Failed to load feedbacks', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeedbacks();
  }, [query, month]);

  useEffect(() => {
    let interval;
    const loadStats = async () => {
      try {
        const data = await feedbackService.getStats(month);
        setStats(data || { total_reviews: 0, avg_rating: 0, pending_replies: 0 });
      } catch (err) {
        console.error('Failed to load feedback stats', err);
      }
    };
    loadStats();
    interval = setInterval(loadStats, 5000);
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [month]);

  const filtered = useMemo(() => {
    return feedbacks;
  }, [feedbacks]);

  return (
    <div className="p-2">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-3xl font-semibold" style={{ color: 'var(--brand-dark)' }}>Feedbacks</h1>
        <div className="flex items-center gap-2">
          <button
            className="px-4 py-2 rounded-full text-white text-sm"
            style={{ backgroundColor: 'var(--brand-dark)' }}
            onClick={() => {
              const headers = ['Name','Reference','Date','Rating','Title','Text'];
              const rows = feedbacks.map(f => [
                `"${(f.name||'').replace(/"/g,'""')}"`,
                `"${(f.reference||'').replace(/"/g,'""')}"`,
                `"${(f.date||'').replace(/"/g,'""')}"`,
                `"${(f.rating ?? '').toString().replace(/"/g,'""')}"`,
                `"${(f.title||'').replace(/"/g,'""')}"`,
                `"${(f.text||'').replace(/"/g,'""')}"`,
              ]);
              const csv = [headers.join(','), ...rows.map(r=>r.join(','))].join('\n');
              const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              const monthSuffix = month && month !== 'All' ? `_${month}` : '';
              link.download = `feedbacks${monthSuffix}.csv`;
              link.click();
              URL.revokeObjectURL(url);
            }}
          >
            Export
          </button>
          <div className="relative" ref={monthRef}>
            <button
              onClick={() => setMonthOpen(!monthOpen)}
              className="px-4 py-2 rounded-full border bg-white text-sm flex items-center gap-2"
              style={{ borderColor: 'var(--accent-slate)', color: '#374151' }}
            >
              {month}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
            </button>
            {monthOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border" style={{ borderColor: 'var(--accent-slate)' }}>
                <div className="p-3 space-y-2">
                  {monthOptions.map((m) => {
                    const checked = m === month;
                    return (
                      <button
                        key={m}
                        onClick={() => { setMonth(m); setMonthOpen(false); }}
                        className="w-full flex items-center justify-between text-left text-[15px] text-gray-800"
                      >
                        <span>{m}</span>
                        <span className={`w-4 h-4 rounded border ${checked ? 'bg-[var(--brand-dark)] border-[var(--brand-dark)]' : 'bg-white border-gray-300'}`}></span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 text-center">
        <StatCard tone={getComputedStyle(document.documentElement).getPropertyValue('--accent-green').trim() || '#DBFCE7'} value={stats.total_reviews?.toLocaleString?.() || stats.total_reviews} label="Total Reviews" />
        <StatCard tone={getComputedStyle(document.documentElement).getPropertyValue('--accent-slate').trim() || '#3B69E233'} value={stats.avg_rating?.toFixed ? stats.avg_rating.toFixed(2) : stats.avg_rating} label="Avg. rating" />
        <StatCard tone={getComputedStyle(document.documentElement).getPropertyValue('--accent-yellow').trim() || '#FEF9C2'} value={stats.pending_replies} label="Pending replies" />
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="flex items-center w-[360px] max-w-full rounded-full border border-gray-300 px-4 py-2 bg-white">
          <input value={query} onChange={(e)=>setQuery(e.target.value)} className="flex-1 outline-none text-sm" placeholder="Search by name or ref. number" />
          <svg className="text-gray-500" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.3-4.3"/></svg>
        </div>
      </div>

      <h3 className="text-sm text-gray-700 mb-3">Feedbacks by customers.</h3>
      <div className="space-y-3">
        {loading && <div className="text-sm text-gray-500">Loading feedbacks...</div>}
        {!loading && filtered.map((f)=> (
          <FeedbackCard key={f.id} name={f.name} reference={f.reference} date={f.date} text={f.text} />
        ))}
        {!loading && filtered.length === 0 && <div className="text-sm text-gray-500">No feedbacks found.</div>}
      </div>
    </div>
  );
};

export default Feedbacks;


