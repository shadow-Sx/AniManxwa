import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Home, Search, Heart, User, ShieldCheck, Plus, ArrowLeft, X, Loader2, Upload, Trash2, Pencil, Bell, BookOpen, Flag } from 'lucide-react';

/* ===========================================================
   !!! MUHIM !!!
   O'zingizning Render backend manzilingizni shu yerga yozing.
   Masalan: 'https://animanxwa-backend.onrender.com'
=========================================================== */
const API_BASE = 'https://animanxwa.onrender.com';

/* !!! Google Cloud Console'dan olingan Client ID shu yerga (README'ga qarang) !!! */
const GOOGLE_CLIENT_ID = '525880409391-3g1paj7k886jhctlr1n9m4komv2dnhgr.apps.googleusercontent.com';

/* ----------------------------- theme ----------------------------- */
const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&family=Inter:wght@400;500;600&display=swap');
    .font-display { font-family:'Oswald',sans-serif; letter-spacing:0.02em; }
    .font-body { font-family:'Inter',sans-serif; }
    .theme-light { --bg:#FFFFFF; --surface:#F1F3F6; --surface-2:#E7E9EE; --text:#14161A; --text-dim:#6B7280; --text-faint:#9CA3AF; --accent:#2454C4; --accent-text:#FFFFFF; --line:#E1E4EA; }
    .theme-dark { --bg:#0E0E10; --surface:#1B1B1E; --surface-2:#242428; --text:#F5F5F5; --text-dim:#9A9AA0; --text-faint:#68686E; --accent:#D93A2E; --accent-text:#FFFFFF; --line:#2A2A2E; }
    .bg-app{background-color:var(--bg);} .bg-surface{background-color:var(--surface);} .bg-surface-2{background-color:var(--surface-2);}
    .text-main{color:var(--text);} .text-dim{color:var(--text-dim);} .text-faint{color:var(--text-faint);}
    .bg-accent{background-color:var(--accent);} .text-accent{color:var(--accent);} .text-on-accent{color:var(--accent-text);}
    .input-field{background-color:var(--surface-2);color:var(--text);}
    .input-field::placeholder{color:var(--text-faint);}
    .input-field:focus{outline:none;box-shadow:0 0 0 2px var(--accent);}
    .tap-btn:active{opacity:.7;}
    .chip{background-color:var(--surface-2);color:var(--text-dim);}
    .chip.active{background-color:var(--accent);color:var(--accent-text);}
    @keyframes marquee-scroll{from{transform:translateX(0);}to{transform:translateX(-50%);}}
    .marquee-track{display:flex;animation:marquee-scroll 45s linear infinite;}
    img{-webkit-touch-callout:none;-webkit-user-select:none;user-select:none;}
    ::-webkit-scrollbar{width:6px;height:6px;} ::-webkit-scrollbar-thumb{background:var(--line);border-radius:3px;}
  `}</style>
);

/* ----------------------------- constants ----------------------------- */
const GENRES = ["Harakat","Romantika","Fantaziya","Komediya","Horror","Drama","Ilmiy fantastika","Sarguzasht","Sirli","Hayotdan lavha","Sport","Psixologik","G'ayritabiiy","O'zga dunyo"];
const TYPE_OPTIONS = [{ v: 'manga', l: 'Manga' }, { v: 'manhwa', l: 'Manhwa' }, { v: 'manhua', l: 'Manhua' }, { v: 'novel', l: 'Roman' }];
const STATUS_OPTIONS = [{ v: 'ongoing', l: 'Davom etmoqda' }, { v: 'completed', l: 'Tugallangan' }];
const TYPE_LABELS = { manga: 'Manga', manhwa: 'Manhwa', manhua: 'Manhua', novel: 'Roman' };
const ADMIN_TTL = 4 * 60 * 60 * 1000;

/* ----------------------------- helpers ----------------------------- */
const genLongId = () => Array.from({ length: 22 }, () => Math.floor(Math.random() * 10)).join('');

// Personal, per-viewer data only (nickname, theme, saved list, admin unlock, progress).
// The shared catalog now lives on the real backend, not here.
async function safeGet(key, shared) {
  try { const r = await window.storage.get(key, shared); return r ? r.value : null; } catch (e) { return null; }
}
async function safeSet(key, value, shared) {
  try { const r = await window.storage.set(key, value, shared); return !!r; } catch (e) { return false; }
}

// One helper for every backend call: JSON or FormData, with or without an admin token.
async function apiRequest(path, { method = 'GET', body, token, isForm } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body && !isForm) headers['Content-Type'] = 'application/json';
  const res = await fetch(API_BASE + path, {
    method,
    headers,
    credentials: 'include',
    body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error || 'Xatolik yuz berdi');
  return data;
}

/* ----------------------------- small pieces ----------------------------- */
function Modal({ children, onClose }) {
  return (
    <div className="fixed inset-0 flex items-end sm:items-center justify-center z-50" style={{ backgroundColor: 'rgba(0,0,0,0.65)' }} onClick={onClose}>
      <div className="bg-surface w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl overflow-y-auto" style={{ maxHeight: '88vh', borderTop: '1px solid var(--line)' }} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}
function ConfirmModal({ message, confirmLabel, onConfirm, onCancel }) {
  return (
    <Modal onClose={onCancel}>
      <div className="p-5 font-body">
        <p className="text-sm text-main mb-5">{message}</p>
        <div className="flex gap-2">
          <button onClick={onCancel} className="flex-1 py-2.5 rounded-lg bg-surface-2 text-main text-sm tap-btn">Bekor qilish</button>
          <button onClick={onConfirm} className="flex-1 py-2.5 rounded-lg text-sm tap-btn" style={{ backgroundColor: '#D93A2E', color: '#fff' }}>{confirmLabel || "O'chirish"}</button>
        </div>
      </div>
    </Modal>
  );
}
function Spinner({ label }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-3">
      <Loader2 className="w-6 h-6 animate-spin text-accent" />
      {label && <p className="text-xs text-faint font-body">{label}</p>}
    </div>
  );
}

/* ----------------------------- ads ----------------------------- */
function AdBanner() {
  const [ad, setAd] = useState(null);
  const [dismissed, setDismissed] = useState(false);
  const reportedRef = useRef(false);

  useEffect(() => {
    apiRequest('/api/ads/active?placement=banner').then(setAd).catch(() => {});
  }, []);
  useEffect(() => {
    if (ad && !reportedRef.current) {
      reportedRef.current = true;
      apiRequest(`/api/ads/${ad._id}/impression`, { method: 'POST' }).catch(() => {});
    }
  }, [ad]);

  if (!ad || dismissed) return null;
  const media = ad.type === 'video' ? (
    <video src={ad.mediaUrl} autoPlay muted loop playsInline className="w-full h-full object-cover" />
  ) : (
    <img src={ad.mediaUrl} className="w-full h-full object-cover" alt="reklama" />
  );
  const Wrapper = ad.linkUrl ? 'a' : 'div';
  const wrapperProps = ad.linkUrl ? { href: ad.linkUrl, target: '_blank', rel: 'noreferrer' } : {};
  return (
    <div className="relative shrink-0" style={{ height: 60, borderTop: '1px solid var(--line)' }}>
      <Wrapper {...wrapperProps} className="block w-full h-full">{media}</Wrapper>
      <button onClick={() => setDismissed(true)} className="absolute top-1 right-1 tap-btn" style={{ background: 'rgba(0,0,0,0.6)', borderRadius: 999, padding: 2 }}>
        <X className="w-3 h-3" style={{ color: '#fff' }} />
      </button>
      <span className="absolute bottom-0.5 left-1 font-body" style={{ fontSize: 8, color: 'rgba(255,255,255,0.85)', background: 'rgba(0,0,0,0.5)', padding: '0 4px', borderRadius: 3 }}>Reklama</span>
    </div>
  );
}

function AdInterstitial({ onDone }) {
  const [ad, setAd] = useState(undefined);
  const [countdown, setCountdown] = useState(0);
  const reportedRef = useRef(false);

  useEffect(() => {
    apiRequest('/api/ads/active?placement=chapter-interstitial')
      .then((a) => { if (a) { setAd(a); setCountdown(a.displaySeconds || 5); } else setAd(null); })
      .catch(() => setAd(null));
  }, []);
  useEffect(() => {
    if (ad === null) onDone();
    else if (ad && !reportedRef.current) {
      reportedRef.current = true;
      apiRequest(`/api/ads/${ad._id}/impression`, { method: 'POST' }).catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ad]);
  useEffect(() => {
    if (!ad) return;
    if (countdown <= 0) { onDone(); return; }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ad, countdown]);

  if (!ad) return <Spinner />;
  return (
    <div className="flex-1 flex items-center justify-center relative" style={{ backgroundColor: '#000' }}>
      {ad.type === 'video' ? (
        <video src={ad.mediaUrl} autoPlay muted playsInline className="max-w-full max-h-full" />
      ) : (
        <img src={ad.mediaUrl} className="max-w-full max-h-full object-contain" alt="reklama" />
      )}
      <div className="absolute top-4 right-4 text-sm font-body px-3 py-1 rounded-full" style={{ backgroundColor: 'rgba(0,0,0,0.6)', color: '#fff' }}>{countdown}s</div>
    </div>
  );
}

/* ----------------------------- navigation ----------------------------- */
function BottomNav({ tab, setTab, isAdmin, onPlus }) {
  const base = [
    { id: 'home', icon: Home, label: 'Bosh sahifa' },
    { id: 'search', icon: Search, label: 'Qidiruv' },
    { id: 'saved', icon: Heart, label: 'Saqlangan' },
    { id: 'profile', icon: User, label: 'Profil' },
  ];
  const items = isAdmin ? [base[0], base[1], { id: 'admin', icon: ShieldCheck, label: 'Admin' }, base[2], base[3]] : base;
  return (
    <div className="relative bg-surface shrink-0" style={{ borderTop: '1px solid var(--line)' }}>
      {isAdmin && (
        <button onClick={onPlus} className="absolute tap-btn bg-accent flex items-center justify-center" style={{ top: -22, left: '50%', transform: 'translateX(-50%)', width: 52, height: 52, borderRadius: 999, boxShadow: '0 4px 14px rgba(0,0,0,0.35)' }}>
          <Plus className="w-6 h-6 text-on-accent" />
        </button>
      )}
      <div className="flex items-stretch justify-around py-2">
        {items.map((it) => {
          const Icon = it.icon;
          const active = tab === it.id;
          return (
            <button key={it.id} onClick={() => setTab(it.id)} className="flex flex-col items-center gap-0.5 px-2 py-1 tap-btn" style={{ flex: 1 }}>
              <Icon className="w-5 h-5" style={{ color: active ? 'var(--accent)' : 'var(--text-faint)' }} />
              <span style={{ fontSize: 10, color: active ? 'var(--accent)' : 'var(--text-faint)' }} className="font-body">{it.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ----------------------------- catalog display ----------------------------- */
function Carousel({ items, onOpen }) {
  if (items.length === 0) return null;
  const animate = items.length >= 4;
  const loop = animate ? [...items, ...items] : items;
  return (
    <div className="overflow-hidden rounded-xl" style={{ aspectRatio: '16 / 9' }}>
      <div className={animate ? 'marquee-track' : 'flex'} style={{ height: '100%' }}>
        {loop.map((s, i) => (
          <div key={s._id + '-' + i} onClick={() => onOpen(s._id)} className="tap-btn shrink-0" style={{ width: '85%', height: '100%', marginRight: 8, position: 'relative', cursor: 'pointer' }}>
            {s.coverUrl ? <img src={s.coverUrl} className="w-full h-full object-cover" style={{ borderRadius: 12 }} alt={s.title} /> : <div className="w-full h-full bg-surface-2" style={{ borderRadius: 12 }} />}
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '10px 12px', background: 'linear-gradient(transparent, rgba(0,0,0,0.75))', borderRadius: '0 0 12px 12px' }}>
              <p className="text-sm font-medium font-body" style={{ color: '#fff' }}>{s.title}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SeriesCard({ s, onOpen }) {
  return (
    <div onClick={() => onOpen(s._id)} className="cursor-pointer tap-btn">
      <div className="rounded-lg overflow-hidden bg-surface-2 relative" style={{ aspectRatio: '768 / 1097' }}>
        {s.coverUrl ? <img src={s.coverUrl} className="w-full h-full object-cover" alt={s.title} /> : <div className="w-full h-full flex items-center justify-center"><BookOpen className="w-6 h-6 text-faint" /></div>}
        <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded font-body" style={{ fontSize: 9, fontWeight: 600, color: '#fff', backgroundColor: s.payment === 'subscription' ? '#D93A2E' : '#2E9E5B' }}>
          {s.payment === 'subscription' ? 'OBUNA' : 'BEPUL'}
        </span>
      </div>
      <p className="mt-1 text-xs font-medium text-main font-body truncate">{s.title}</p>
      <p style={{ fontSize: 10 }} className="text-faint font-body">{TYPE_LABELS[s.type]}</p>
    </div>
  );
}

/* ----------------------------- home / search ----------------------------- */
function HomeScreen({ catalogList, onOpen, onSearchFocus }) {
  const topPicks = [...catalogList].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 20);
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-4 pb-2">
        <button onClick={onSearchFocus} className="w-full flex items-center gap-2 rounded-full px-4 py-2.5 input-field text-left">
          <Search className="w-4 h-4 text-faint" /><span className="text-sm text-faint font-body">Manga, manhwa qidirish...</span>
        </button>
      </div>
      {topPicks.length > 0 && <div className="px-4 pb-3"><Carousel items={topPicks} onOpen={onOpen} /></div>}
      <div className="px-4 pb-2"><h2 className="font-display text-base text-main">KATALOG</h2></div>
      {catalogList.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
          <BookOpen className="w-10 h-10 text-faint mb-3" /><p className="text-dim font-body text-sm">Hozircha manga qo'shilmagan</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3 px-4 pb-6">{catalogList.map((s) => <SeriesCard key={s._id} s={s} onOpen={onOpen} />)}</div>
      )}
    </div>
  );
}

function SearchScreen({ catalogList, onOpen }) {
  const [q, setQ] = useState('');
  const [genre, setGenre] = useState(null);
  const filtered = catalogList.filter((s) => {
    const matchQ = !q.trim() || s.title.toLowerCase().includes(q.trim().toLowerCase());
    const matchGenre = !genre || (s.genres || []).includes(genre);
    return matchQ && matchGenre;
  });
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-4 pb-2">
        <div className="flex items-center gap-2 rounded-full px-4 py-2.5 input-field">
          <Search className="w-4 h-4 text-faint" />
          <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Nomi bo'yicha qidirish..." className="flex-1 bg-transparent outline-none text-sm text-main font-body" />
        </div>
      </div>
      <div className="flex gap-2 overflow-x-auto px-4 pb-3">
        <button onClick={() => setGenre(null)} className={`chip ${!genre ? 'active' : ''} px-3 py-1.5 rounded-full text-xs shrink-0 tap-btn font-body`}>Barchasi</button>
        {GENRES.map((g) => <button key={g} onClick={() => setGenre(g === genre ? null : g)} className={`chip ${genre === g ? 'active' : ''} px-3 py-1.5 rounded-full text-xs shrink-0 tap-btn font-body`}>{g}</button>)}
      </div>
      {filtered.length === 0 ? <p className="text-faint font-body text-sm text-center py-10">Hech narsa topilmadi</p> : (
        <div className="grid grid-cols-3 gap-3 px-4 pb-6">{filtered.map((s) => <SeriesCard key={s._id} s={s} onOpen={onOpen} />)}</div>
      )}
    </div>
  );
}

/* ----------------------------- report ----------------------------- */
function ReportModal({ seriesTitle, chapterLabel, onClose, onSubmit }) {
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('idle');
  const [errMsg, setErrMsg] = useState('');

  const send = async () => {
    if (!message.trim()) return;
    setStatus('sending');
    try { await onSubmit(message.trim()); setStatus('sent'); }
    catch (e) {
      if (String(e.message).includes('yubora olmaysiz')) setStatus('banned');
      else { setStatus('error'); setErrMsg(e.message); }
    }
  };

  return (
    <Modal onClose={onClose}>
      <div className="p-5 font-body">
        <h3 className="font-display text-lg text-main mb-1">XABAR BERISH</h3>
        <p className="text-xs text-faint mb-3">{seriesTitle}{chapterLabel ? ` · ${chapterLabel}` : ''}</p>
        {status === 'sent' ? <p className="text-sm text-dim">Xabaringiz yuborildi, rahmat!</p>
          : status === 'banned' ? <p className="text-sm" style={{ color: '#D93A2E' }}>Siz shikoyat yubora olmaysiz</p>
          : (
            <>
              <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} placeholder="Muammoni qisqacha tasvirlab bering (tarjima xatosi, bob tartibsizligi va h.k.)" className="input-field w-full rounded-lg px-3 py-2 text-sm mb-2" />
              {status === 'error' && <p className="text-xs mb-2" style={{ color: '#D93A2E' }}>{errMsg}</p>}
              <button onClick={send} disabled={!message.trim() || status === 'sending'} className="w-full py-2.5 rounded-lg bg-accent text-on-accent text-sm font-medium tap-btn disabled:opacity-50">{status === 'sending' ? 'Yuborilmoqda...' : 'Yuborish'}</button>
            </>
          )}
      </div>
    </Modal>
  );
}

/* ----------------------------- series detail (self-contained) ----------------------------- */
function SeriesDetailScreen({ seriesId, profile, isSaved, onBack, onToggleSave, onOpenChapter, isAdmin, onAddChapter, onDeleteChapter, onSubmitReport }) {
  const [series, setSeries] = useState(null);
  const [err, setErr] = useState('');
  const [showReport, setShowReport] = useState(false);
  const [showAddChapter, setShowAddChapter] = useState(false);

  const load = useCallback(async () => {
    try { setSeries(await apiRequest(`/api/series/${seriesId}`)); }
    catch (e) { setErr(e.message); }
  }, [seriesId]);
  useEffect(() => { load(); }, [load]);

  const handleDeleteChapter = async (chapterId) => { await onDeleteChapter(seriesId, chapterId); await load(); };

  if (err) return <div className="flex-1 flex items-center justify-center p-6 text-center"><p className="text-sm text-dim font-body">{err}</p></div>;
  if (!series) return <Spinner />;

  const prog = profile.progress?.[series._id];

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: '1px solid var(--line)' }}>
        <button onClick={onBack} className="tap-btn"><ArrowLeft className="w-5 h-5 text-main" /></button>
        <h2 className="font-display text-base text-main flex-1 truncate">{series.title.toUpperCase()}</h2>
        <button onClick={() => setShowReport(true)} className="tap-btn"><Flag className="w-4 h-4 text-faint" /></button>
        <button onClick={onToggleSave} className="tap-btn"><Heart className="w-5 h-5" style={{ color: isSaved ? '#D93A2E' : 'var(--text-faint)', fill: isSaved ? '#D93A2E' : 'none' }} /></button>
      </div>
      <div className="p-4 flex gap-4">
        <div className="rounded-lg overflow-hidden bg-surface-2 shrink-0" style={{ width: 100, aspectRatio: '768/1097' }}>{series.coverUrl && <img src={series.coverUrl} className="w-full h-full object-cover" alt={series.title} />}</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-dim font-body">{series.author}{series.studio ? ` · ${series.studio}` : ''}{series.year ? ` · ${series.year}` : ''}</p>
          <div className="flex gap-1.5 flex-wrap mt-2">
            <span className="px-2 py-0.5 rounded text-xs font-body font-medium" style={{ backgroundColor: series.payment === 'subscription' ? '#D93A2E' : '#2E9E5B', color: '#fff' }}>{series.payment === 'subscription' ? 'OBUNA' : 'BEPUL'}</span>
            <span className="chip px-2 py-0.5 rounded text-xs font-body">{TYPE_LABELS[series.type]}</span>
            <span className="chip px-2 py-0.5 rounded text-xs font-body">{series.status === 'ongoing' ? 'Davom etmoqda' : 'Tugallangan'}</span>
          </div>
          {prog && <button onClick={() => onOpenChapter(prog.chapterId, prog.page)} className="mt-2 text-xs px-3 py-1.5 rounded-full bg-accent text-on-accent font-body tap-btn">O'qishni davom ettirish</button>}
        </div>
      </div>
      {series.description && <p className="px-4 pb-3 text-sm text-dim font-body">{series.description}</p>}
      {series.genres?.length > 0 && <div className="flex flex-wrap gap-1.5 px-4 pb-4">{series.genres.map((g) => <span key={g} className="chip px-2 py-0.5 rounded-full text-xs font-body">{g}</span>)}</div>}
      <div className="px-4 pb-3 flex items-center justify-between">
        <h3 className="text-sm font-medium text-dim font-body">Boblar ({series.chapters.length})</h3>
        {isAdmin && <button onClick={() => setShowAddChapter(true)} className="text-sm text-accent font-body tap-btn flex items-center gap-1"><Plus className="w-4 h-4" />Bob qo'shish</button>}
      </div>
      <div style={{ borderTop: '1px solid var(--line)' }}>
        {series.chapters.length === 0 ? <p className="text-faint font-body text-sm px-4 py-6 text-center">Hozircha bob yo'q</p> : (
          series.chapters.map((c) => {
            const isCurrent = prog?.chapterId === c._id;
            const isRead = isCurrent && c.pageCount && prog.page >= c.pageCount - 1;
            return (
              <div key={c._id} className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--line)' }}>
                <div onClick={() => onOpenChapter(c._id, isRead ? 0 : isCurrent ? prog.page : 0)} className="min-w-0 flex-1 cursor-pointer tap-btn">
                  <p className="text-sm font-medium text-main font-body truncate">{[c.season && `Fasl ${c.season}`, c.volume && `Jild ${c.volume}`, `${c.chapter}-bob`].filter(Boolean).join(' · ')}{c.title ? ` — ${c.title}` : ''}</p>
                  <p className="text-xs text-faint font-body">{c.pageCount ?? '?'} bet{isRead ? " · o'qilgan" : isCurrent ? ` · ${prog.page + 1}-betda` : ''}</p>
                </div>
                {isAdmin && <button onClick={() => handleDeleteChapter(c._id)} className="tap-btn p-1 ml-2"><Trash2 className="w-4 h-4 text-faint" /></button>}
              </div>
            );
          })
        )}
      </div>
      {showReport && (
        <ReportModal seriesTitle={series.title} onClose={() => setShowReport(false)} onSubmit={(msg) => onSubmitReport({ seriesId: series._id, seriesTitle: series.title, message: msg })} />
      )}
      {showAddChapter && (
        <AddChapterForm seriesList={[series]} initialSeriesId={series._id} onClose={() => setShowAddChapter(false)} onSave={async (sid, meta, files) => { await onAddChapter(sid, meta, files); setShowAddChapter(false); await load(); }} />
      )}
    </div>
  );
}

/* ----------------------------- saved + recommendations ----------------------------- */
function SavedScreen({ catalogList, savedIds, onOpen }) {
  const saved = catalogList.filter((s) => savedIds.includes(s._id));
  const [recs, setRecs] = useState([]);
  const savedKey = savedIds.join(',');

  useEffect(() => {
    if (saved.length === 0) { setRecs([]); return; }
    const genreSet = new Set();
    saved.forEach((s) => (s.genres || []).forEach((g) => genreSet.add(g)));
    if (genreSet.size === 0) { setRecs([]); return; }
    apiRequest(`/api/series/recommendations/by-genre?genres=${encodeURIComponent(Array.from(genreSet).join(','))}&exclude=${encodeURIComponent(savedKey)}`)
      .then(setRecs).catch(() => setRecs([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedKey, catalogList.length]);

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <h2 className="font-display text-lg text-main mb-3">SAQLANGANLAR</h2>
      {saved.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center"><Heart className="w-10 h-10 text-faint mb-3" /><p className="text-dim font-body text-sm">Hali hech narsa saqlanmagan</p></div>
      ) : (
        <div className="grid grid-cols-3 gap-3 mb-6">{saved.map((s) => <SeriesCard key={s._id} s={s} onOpen={onOpen} />)}</div>
      )}
      {recs.length > 0 && (
        <>
          <h3 className="font-display text-base text-main mb-3">SIZGA YOQISHI MUMKIN</h3>
          <div className="grid grid-cols-3 gap-3">{recs.map((s) => <SeriesCard key={s._id} s={s} onOpen={onOpen} />)}</div>
        </>
      )}
    </div>
  );
}

/* ----------------------------- google sign-in ----------------------------- */
function GoogleSignInButton({ onCredential, theme }) {
  const btnRef = useRef(null);
  const [available, setAvailable] = useState(true);
  const onCredentialRef = useRef(onCredential);
  onCredentialRef.current = onCredential;

  useEffect(() => {
    let cancelled = false;
    const init = () => {
      try {
        if (!window.google?.accounts?.id) { if (!cancelled) setAvailable(false); return; }
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: (resp) => onCredentialRef.current(resp.credential),
        });
        if (btnRef.current) {
          window.google.accounts.id.renderButton(btnRef.current, { theme: theme === 'light' ? 'outline' : 'filled_black', size: 'large', shape: 'pill', width: 260 });
        }
      } catch (e) {
        if (!cancelled) setAvailable(false);
      }
    };
    if (window.google?.accounts?.id) {
      init();
    } else {
      let script = document.getElementById('google-gsi-script');
      if (!script) {
        script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.id = 'google-gsi-script';
        script.async = true;
        script.defer = true;
        script.onerror = () => { if (!cancelled) setAvailable(false); };
        document.body.appendChild(script);
      }
      script.addEventListener('load', init);
      // If Google's script hasn't produced a working object shortly, fall back quietly
      // (this is the common outcome inside an embedded preview like this chat window).
      const timeout = setTimeout(() => { if (!cancelled && !window.google?.accounts?.id) setAvailable(false); }, 4000);
      return () => { clearTimeout(timeout); script.removeEventListener('load', init); };
    }
    return () => { cancelled = true; };
  }, [theme]);

  if (!available) {
    return <p className="text-xs text-faint font-body leading-relaxed">Google orqali kirish bu oynada ishlamayapti — bu odatiy holat (pastdagi eslatmani ko'ring). Hozircha nomingizni qo'lda kiriting.</p>;
  }
  return <div ref={btnRef} />;
}


function ProfileScreen({ profile, onUpdateProfile, onClearCache, onSubmitTranslatorRequest, onVerifyAdmin, onLogoutAdmin, onGoogleLogin, onGoogleLogout }) {
  const [editing, setEditing] = useState(false);
  const [nickname, setNickname] = useState(profile.nickname);
  const [avatar, setAvatar] = useState(profile.avatar);
  const [adminCode, setAdminCode] = useState('');
  const [adminError, setAdminError] = useState('');
  const [adminBusy, setAdminBusy] = useState(false);
  const [showTranslatorForm, setShowTranslatorForm] = useState(false);
  const [translatorMsg, setTranslatorMsg] = useState('');
  const [translatorSent, setTranslatorSent] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  const handleAvatarChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setAvatar(URL.createObjectURL(f));
  };
  const saveEdit = () => { onUpdateProfile({ ...profile, nickname: nickname.trim() || profile.nickname, avatar }); setEditing(false); };
  const tryAdminCode = async () => {
    setAdminBusy(true); setAdminError('');
    try { await onVerifyAdmin(adminCode.trim()); setAdminCode(''); }
    catch (e) { setAdminError(e.message); }
    setAdminBusy(false);
  };
  const setTheme = (t) => onUpdateProfile({ ...profile, theme: t });
  const sendTranslatorRequest = async () => {
    if (!translatorMsg.trim()) return;
    await onSubmitTranslatorRequest(translatorMsg.trim());
    setTranslatorSent(true); setTranslatorMsg('');
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 pb-8">
      <div className="flex items-center gap-4 mb-6">
        <div className="relative">
          <div className="rounded-full overflow-hidden bg-surface-2 flex items-center justify-center" style={{ width: 72, height: 72 }}>
            {(editing ? avatar : profile.avatar) ? <img src={editing ? avatar : profile.avatar} className="w-full h-full object-cover" alt="avatar" /> : <span className="font-display text-2xl text-dim">{(profile.nickname || '?').charAt(0).toUpperCase()}</span>}
          </div>
          {editing && (
            <label className="absolute bottom-0 right-0 bg-accent rounded-full p-1.5 tap-btn cursor-pointer">
              <Pencil className="w-3 h-3 text-on-accent" /><input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </label>
          )}
        </div>
        <div className="flex-1 min-w-0">
          {editing ? <input value={nickname} onChange={(e) => setNickname(e.target.value)} className="input-field rounded-lg px-3 py-2 text-sm w-full font-body" /> : <p className="font-display text-lg text-main truncate">{profile.nickname || 'Foydalanuvchi'}</p>}
          <p className="text-faint font-body" style={{ fontSize: 11 }}>ID: {profile.id}</p>
        </div>
        {editing ? <button onClick={saveEdit} className="bg-accent text-on-accent rounded-lg px-3 py-2 text-xs tap-btn font-body">Saqlash</button>
          : <button onClick={() => { setNickname(profile.nickname); setAvatar(profile.avatar); setEditing(true); }} className="tap-btn"><Pencil className="w-4 h-4 text-dim" /></button>}
      </div>

      <div className="mb-5 bg-surface rounded-lg p-3">
        {profile.googleUser ? (
          <div className="flex items-center gap-3">
            {profile.googleUser.picture && <img src={profile.googleUser.picture} className="rounded-full" style={{ width: 32, height: 32 }} alt="google" />}
            <div className="flex-1 min-w-0"><p className="text-sm text-main font-body truncate">{profile.googleUser.email}</p><p className="text-xs text-faint font-body">Google orqali ulangan</p></div>
            <button onClick={onGoogleLogout} className="text-xs text-dim tap-btn font-body">Chiqish</button>
          </div>
        ) : (
          <>
            <p className="text-xs text-dim font-body mb-2">Google orqali kirish (ixtiyoriy — ban tizimini ishonchliroq qiladi)</p>
            <GoogleSignInButton theme={profile.theme} onCredential={onGoogleLogin} />
          </>
        )}
      </div>

      <div className="mb-5">
        <p className="text-xs text-dim font-body mb-2">Ko'rinish</p>
        <div className="flex gap-2">
          <button onClick={() => setTheme('light')} className={`flex-1 py-2 rounded-lg text-sm font-body tap-btn ${profile.theme === 'light' ? 'bg-accent text-on-accent' : 'bg-surface-2 text-dim'}`}>Tong (och)</button>
          <button onClick={() => setTheme('dark')} className={`flex-1 py-2 rounded-lg text-sm font-body tap-btn ${profile.theme === 'dark' ? 'bg-accent text-on-accent' : 'bg-surface-2 text-dim'}`}>Tun (qorong'i)</button>
        </div>
      </div>

      {!profile.isAdmin ? (
        <div className="mb-5 bg-surface rounded-lg p-3">
          <p className="text-xs text-dim font-body mb-2">Admin kodi</p>
          <div className="flex gap-2">
            <input value={adminCode} onChange={(e) => { setAdminCode(e.target.value); setAdminError(''); }} type="password" className="input-field rounded-lg px-3 py-2 text-sm flex-1 font-body" placeholder="Kodni kiriting" />
            <button onClick={tryAdminCode} disabled={adminBusy || !adminCode.trim()} className="bg-surface-2 text-main rounded-lg px-3 py-2 text-sm tap-btn font-body disabled:opacity-50">{adminBusy ? '...' : 'Kirish'}</button>
          </div>
          {adminError && <p className="text-xs mt-1.5 font-body" style={{ color: '#D93A2E' }}>{adminError}</p>}
        </div>
      ) : (
        <div className="mb-5 bg-surface rounded-lg p-3 flex items-center justify-between">
          <p className="text-sm text-main font-body">Admin huquqi faol</p>
          <button onClick={onLogoutAdmin} className="text-xs text-dim tap-btn font-body">Chiqish</button>
        </div>
      )}

      <div className="mb-5 flex flex-col gap-2">
        <div className="bg-surface rounded-lg p-3 flex items-center justify-between">
          <div className="flex items-center gap-2"><Bell className="w-4 h-4 text-dim" /><p className="text-sm text-main font-body">Bildirishnoma</p></div>
          <button onClick={() => onUpdateProfile({ ...profile, notifications: !profile.notifications })} className="tap-btn" style={{ width: 40, height: 22, borderRadius: 999, backgroundColor: profile.notifications ? 'var(--accent)' : 'var(--surface-2)', position: 'relative' }}>
            <span style={{ position: 'absolute', top: 2, left: profile.notifications ? 20 : 2, width: 18, height: 18, borderRadius: 999, backgroundColor: '#fff', transition: 'left .15s' }} />
          </button>
        </div>
        <div className="bg-surface rounded-lg p-3"><p className="text-sm text-main font-body mb-1">Obuna olish</p><p className="text-xs text-faint font-body">To'lov tizimi tez orada qo'shiladi</p></div>
        <button onClick={() => setShowTranslatorForm(true)} className="w-full text-left bg-surface rounded-lg p-3 tap-btn"><p className="text-sm text-main font-body">Tarjimonlikka so'rov yuborish</p></button>
        <button onClick={() => setConfirmClear(true)} className="w-full text-left bg-surface rounded-lg p-3 tap-btn"><p className="text-sm text-main font-body">Ma'lumot va xotira</p><p className="text-xs text-faint font-body">Kesh va shaxsiy ma'lumotlarni tozalash</p></button>
      </div>

      {showTranslatorForm && (
        <Modal onClose={() => { setShowTranslatorForm(false); setTranslatorSent(false); }}>
          <div className="p-5 font-body">
            <h3 className="font-display text-lg text-main mb-3">TARJIMONLIKKA SO'ROV</h3>
            {translatorSent ? <p className="text-sm text-dim">So'rovingiz yuborildi, rahmat!</p> : (
              <>
                <textarea value={translatorMsg} onChange={(e) => setTranslatorMsg(e.target.value)} rows={4} className="input-field w-full rounded-lg px-3 py-2 text-sm mb-3" placeholder="O'zingiz va tajribangiz haqida qisqacha yozing..." />
                <button onClick={sendTranslatorRequest} disabled={!translatorMsg.trim()} className="w-full py-2.5 rounded-lg bg-accent text-on-accent text-sm font-medium tap-btn disabled:opacity-50">Yuborish</button>
              </>
            )}
          </div>
        </Modal>
      )}
      {confirmClear && <ConfirmModal message="Shaxsiy ma'lumotlaringiz (profil, saqlanganlar, o'qish tarixi) tozalanadi. Davom etasizmi?" confirmLabel="Tozalash" onConfirm={() => { onClearCache(); setConfirmClear(false); }} onCancel={() => setConfirmClear(false)} />}
    </div>
  );
}

/* ----------------------------- admin forms ----------------------------- */
function AddSeriesForm({ initial, onClose, onSave }) {
  const [title, setTitle] = useState(initial?.title || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [author, setAuthor] = useState(initial?.author || '');
  const [studio, setStudio] = useState(initial?.studio || '');
  const [year, setYear] = useState(initial?.year || '');
  const [type, setType] = useState(initial?.type || 'manhwa');
  const [status, setStatus] = useState(initial?.status || 'ongoing');
  const [payment, setPayment] = useState(initial?.payment || 'free');
  const [volumes, setVolumes] = useState(initial?.volumes ?? 0);
  const [seasons, setSeasons] = useState(initial?.seasons ?? 0);
  const [genres, setGenres] = useState(initial?.genres || []);
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(initial?.coverUrl || null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const toggleGenre = (g) => setGenres((prev) => (prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]));
  const handleCover = (e) => { const f = e.target.files?.[0]; if (!f) return; setCoverFile(f); setCoverPreview(URL.createObjectURL(f)); };
  const handleSave = async () => {
    if (!title.trim() || saving) return;
    setSaving(true); setError('');
    try {
      await onSave({ title: title.trim(), description, author, studio, year: Number(year) || 0, type, status, payment, volumes: Number(volumes) || 0, seasons: Number(seasons) || 0, genres }, coverFile);
    } catch (e) { setError(e.message); setSaving(false); }
  };

  return (
    <Modal onClose={onClose}>
      <div className="p-5 font-body">
        <h3 className="font-display text-lg text-main mb-4">{initial ? 'TAHRIRLASH' : "MANGA QO'SHISH"}</h3>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Nomi" className="input-field w-full rounded-lg px-3 py-2.5 mb-3 text-sm" />
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Tavsif" rows={3} className="input-field w-full rounded-lg px-3 py-2.5 mb-3 text-sm" />
        <div className="grid grid-cols-2 gap-3 mb-3">
          <input value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Muallif" className="input-field rounded-lg px-3 py-2.5 text-sm" />
          <input value={studio} onChange={(e) => setStudio(e.target.value)} placeholder="Studiya" className="input-field rounded-lg px-3 py-2.5 text-sm" />
        </div>
        <div className="mb-3">
          <input value={year} onChange={(e) => setYear(e.target.value)} type="number" placeholder="Yil" className="input-field w-full rounded-lg px-3 py-2.5 text-sm mb-2" />
          <div className="flex gap-1.5">{TYPE_OPTIONS.map((o) => <button key={o.v} onClick={() => setType(o.v)} className={`flex-1 py-2 rounded-lg text-xs tap-btn ${type === o.v ? 'bg-accent text-on-accent' : 'bg-surface-2 text-dim'}`}>{o.l}</button>)}</div>
        </div>
        <p className="text-xs text-dim mb-1.5">Holat</p>
        <div className="flex gap-2 mb-3">{STATUS_OPTIONS.map((o) => <button key={o.v} onClick={() => setStatus(o.v)} className={`flex-1 py-2 rounded-lg text-sm tap-btn ${status === o.v ? 'bg-accent text-on-accent' : 'bg-surface-2 text-dim'}`}>{o.l}</button>)}</div>
        <p className="text-xs text-dim mb-1.5">To'lov</p>
        <div className="flex gap-2 mb-3">
          <button onClick={() => setPayment('free')} className="flex-1 py-2 rounded-lg text-sm tap-btn font-medium" style={{ backgroundColor: payment === 'free' ? '#2E9E5B' : 'var(--surface-2)', color: payment === 'free' ? '#fff' : 'var(--text-dim)' }}>Bepul</button>
          <button onClick={() => setPayment('subscription')} className="flex-1 py-2 rounded-lg text-sm tap-btn font-medium" style={{ backgroundColor: payment === 'subscription' ? '#D93A2E' : 'var(--surface-2)', color: payment === 'subscription' ? '#fff' : 'var(--text-dim)' }}>Obuna</button>
        </div>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div><p className="text-xs text-dim mb-1">Jildlar soni</p><input value={volumes} onChange={(e) => setVolumes(e.target.value)} type="number" className="input-field w-full rounded-lg px-3 py-2 text-sm" /></div>
          <div><p className="text-xs text-dim mb-1">Fasllar soni</p><input value={seasons} onChange={(e) => setSeasons(e.target.value)} type="number" className="input-field w-full rounded-lg px-3 py-2 text-sm" /></div>
        </div>
        <p className="text-xs text-dim mb-1.5">Janrlar</p>
        <div className="flex flex-wrap gap-1.5 mb-4">{GENRES.map((g) => <button key={g} onClick={() => toggleGenre(g)} className={`chip ${genres.includes(g) ? 'active' : ''} px-2.5 py-1 rounded-full text-xs tap-btn`}>{g}</button>)}</div>
        <p className="text-xs text-dim mb-1.5">Muqova (7:10)</p>
        <div className="flex items-center gap-3 mb-2">
          <div className="rounded-lg bg-surface-2 overflow-hidden flex items-center justify-center shrink-0" style={{ width: 60, aspectRatio: '768 / 1097' }}>{coverPreview ? <img src={coverPreview} className="w-full h-full object-cover" alt="cover" /> : <Upload className="w-4 h-4 text-faint" />}</div>
          <label className="text-sm px-3 py-2 rounded-lg bg-surface-2 text-dim tap-btn cursor-pointer">Rasm tanlash<input type="file" accept="image/*" className="hidden" onChange={handleCover} /></label>
        </div>
        {error && <p className="text-xs mb-2 mt-2" style={{ color: '#D93A2E' }}>{error}</p>}
        <div className="flex gap-2 mt-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-lg bg-surface-2 text-main text-sm tap-btn">Bekor qilish</button>
          <button onClick={handleSave} disabled={!title.trim() || saving} className="flex-1 py-2.5 rounded-lg bg-accent text-on-accent text-sm font-medium tap-btn disabled:opacity-50">{saving ? 'Saqlanmoqda...' : 'Saqlash'}</button>
        </div>
      </div>
    </Modal>
  );
}

function AddChapterForm({ seriesList, initialSeriesId, onClose, onSave }) {
  const [seriesId, setSeriesId] = useState(initialSeriesId || seriesList[0]?._id || '');
  const [season, setSeason] = useState('');
  const [volume, setVolume] = useState('');
  const [chapter, setChapter] = useState('');
  const [title, setTitle] = useState('');
  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const selectedSeries = seriesList.find((s) => s._id === seriesId);

  const handleSave = async () => {
    if (!seriesId || !chapter.trim() || files.length === 0) return;
    setStatus('uploading'); setError('');
    try { await onSave(seriesId, { season: season.trim(), volume: volume.trim(), chapter: chapter.trim(), title: title.trim() }, files); }
    catch (e) { setError(e.message); setStatus('idle'); }
  };

  return (
    <Modal onClose={status === 'uploading' ? () => {} : onClose}>
      <div className="p-5 font-body">
        <h3 className="font-display text-lg text-main mb-3">BOB QO'SHISH</h3>
        {status === 'idle' ? (
          <>
            <p className="text-xs text-dim mb-1.5">Manga</p>
            <select value={seriesId} onChange={(e) => setSeriesId(e.target.value)} className="input-field w-full rounded-lg px-3 py-2.5 mb-1 text-sm">
              {seriesList.map((s) => <option key={s._id} value={s._id}>{s.title}</option>)}
            </select>
            {selectedSeries && <p className="text-xs text-faint mb-3">{TYPE_LABELS[selectedSeries.type]}</p>}
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div><p className="text-xs text-dim mb-1">Fasl</p><input value={season} onChange={(e) => setSeason(e.target.value)} className="input-field w-full rounded-lg px-2 py-2 text-sm" placeholder="—" /></div>
              <div><p className="text-xs text-dim mb-1">Jild</p><input value={volume} onChange={(e) => setVolume(e.target.value)} className="input-field w-full rounded-lg px-2 py-2 text-sm" placeholder="—" /></div>
              <div><p className="text-xs text-dim mb-1">Bob *</p><input value={chapter} onChange={(e) => setChapter(e.target.value)} className="input-field w-full rounded-lg px-2 py-2 text-sm" placeholder="1" /></div>
            </div>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Sarlavha (ixtiyoriy)" className="input-field w-full rounded-lg px-3 py-2.5 mb-4 text-sm" />
            <label className="flex flex-col items-center justify-center gap-2 rounded-lg py-6 mb-2 cursor-pointer bg-surface-2" style={{ border: '1.5px dashed var(--line)' }}>
              <Upload className="w-5 h-5 text-faint" />
              <span className="text-sm text-dim">{files.length > 0 ? `${files.length} ta sahifa tanlandi` : 'Sahifalarni tanlash (JPG/PNG/WEBP)'}</span>
              <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => setFiles(Array.from(e.target.files || []))} />
            </label>
            <p className="text-xs text-faint mb-3">Fayllar nomi bo'yicha avtomatik tartiblanadi</p>
            {error && <p className="text-xs mb-3" style={{ color: '#D93A2E' }}>{error}</p>}
            <div className="flex gap-2">
              <button onClick={onClose} className="flex-1 py-2.5 rounded-lg bg-surface-2 text-main text-sm tap-btn">Bekor qilish</button>
              <button onClick={handleSave} disabled={!seriesId || !chapter.trim() || files.length === 0} className="flex-1 py-2.5 rounded-lg bg-accent text-on-accent text-sm font-medium tap-btn disabled:opacity-50">Saqlash</button>
            </div>
          </>
        ) : (
          <div className="py-8 flex flex-col items-center gap-3"><Loader2 className="w-6 h-6 animate-spin text-accent" /><p className="text-sm text-dim">Fayllar serverga yuklanmoqda...</p></div>
        )}
      </div>
    </Modal>
  );
}

function AddAdForm({ adminToken, onClose, onSaved }) {
  const [placement, setPlacement] = useState('banner');
  const [type, setType] = useState('image');
  const [file, setFile] = useState(null);
  const [linkUrl, setLinkUrl] = useState('');
  const [targetImpressions, setTargetImpressions] = useState(0);
  const [displaySeconds, setDisplaySeconds] = useState(5);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!file || saving) return;
    setSaving(true); setError('');
    try {
      const fd = new FormData();
      fd.append('data', JSON.stringify({ placement, type, linkUrl, targetImpressions: Number(targetImpressions) || 0, displaySeconds: Number(displaySeconds) || 5 }));
      fd.append('media', file);
      await apiRequest('/api/ads', { method: 'POST', body: fd, token: adminToken, isForm: true });
      onSaved();
    } catch (e) { setError(e.message); setSaving(false); }
  };

  return (
    <Modal onClose={onClose}>
      <div className="p-5 font-body">
        <h3 className="font-display text-lg text-main mb-4">REKLAMA QO'SHISH</h3>
        <p className="text-xs text-dim mb-1.5">Joylashuvi</p>
        <div className="flex gap-2 mb-3">
          <button onClick={() => setPlacement('banner')} className={`flex-1 py-2 rounded-lg text-sm tap-btn ${placement === 'banner' ? 'bg-accent text-on-accent' : 'bg-surface-2 text-dim'}`}>Pastki banner</button>
          <button onClick={() => setPlacement('chapter-interstitial')} className={`flex-1 py-2 rounded-lg text-sm tap-btn ${placement === 'chapter-interstitial' ? 'bg-accent text-on-accent' : 'bg-surface-2 text-dim'}`}>Bobga kirishda</button>
        </div>
        <p className="text-xs text-dim mb-1.5">Turi</p>
        <div className="flex gap-2 mb-3">
          <button onClick={() => setType('image')} className={`flex-1 py-2 rounded-lg text-sm tap-btn ${type === 'image' ? 'bg-accent text-on-accent' : 'bg-surface-2 text-dim'}`}>Rasm</button>
          <button onClick={() => setType('video')} className={`flex-1 py-2 rounded-lg text-sm tap-btn ${type === 'video' ? 'bg-accent text-on-accent' : 'bg-surface-2 text-dim'}`}>Video</button>
        </div>
        <label className="flex flex-col items-center justify-center gap-2 rounded-lg py-5 mb-3 cursor-pointer bg-surface-2" style={{ border: '1.5px dashed var(--line)' }}>
          <Upload className="w-5 h-5 text-faint" /><span className="text-sm text-dim">{file ? file.name : 'Fayl tanlash'}</span>
          <input type="file" accept={type === 'video' ? 'video/*' : 'image/*'} className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        </label>
        <input value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="Havola (ixtiyoriy)" className="input-field w-full rounded-lg px-3 py-2.5 mb-3 text-sm" />
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div><p className="text-xs text-dim mb-1">Jami ko'rsatilishi (0=cheksiz)</p><input value={targetImpressions} onChange={(e) => setTargetImpressions(e.target.value)} type="number" className="input-field w-full rounded-lg px-3 py-2 text-sm" /></div>
          <div><p className="text-xs text-dim mb-1">Necha soniya</p><input value={displaySeconds} onChange={(e) => setDisplaySeconds(e.target.value)} type="number" className="input-field w-full rounded-lg px-3 py-2 text-sm" /></div>
        </div>
        {error && <p className="text-xs mb-2" style={{ color: '#D93A2E' }}>{error}</p>}
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-lg bg-surface-2 text-main text-sm tap-btn">Bekor qilish</button>
          <button onClick={handleSave} disabled={!file || saving} className="flex-1 py-2.5 rounded-lg bg-accent text-on-accent text-sm font-medium tap-btn disabled:opacity-50">{saving ? 'Yuklanmoqda...' : 'Saqlash'}</button>
        </div>
      </div>
    </Modal>
  );
}

/* ----------------------------- admin tabs ----------------------------- */
function AdminSeriesTab({ series, onAddSeries, onEditSeries, onDeleteSeries, onAddChapter }) {
  const [formMode, setFormMode] = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);
  return (
    <div className="p-4 pt-0">
      <div className="flex gap-2 mb-4">
        <button onClick={() => setFormMode('add-series')} className="flex-1 py-2.5 rounded-lg bg-accent text-on-accent text-sm font-medium tap-btn font-body">+ Manga qo'shish</button>
        <button onClick={() => setFormMode({ addChapter: true })} className="flex-1 py-2.5 rounded-lg bg-surface-2 text-main text-sm font-medium tap-btn font-body">+ Bob qo'shish</button>
      </div>
      <p className="text-xs text-dim font-body mb-2">Mangalar ({series.length})</p>
      <div className="flex flex-col gap-2">
        {series.map((s) => (
          <div key={s._id} className="bg-surface rounded-lg p-3 flex items-center gap-3">
            <div className="rounded overflow-hidden bg-surface-2 shrink-0" style={{ width: 36, aspectRatio: '768/1097' }}>{s.coverUrl && <img src={s.coverUrl} className="w-full h-full object-cover" alt={s.title} />}</div>
            <div className="flex-1 min-w-0"><p className="text-sm text-main font-body truncate">{s.title}</p><p className="text-xs text-faint font-body">{s.chapterCount ?? 0} bob</p></div>
            <button onClick={() => setFormMode({ editSeries: s })} className="tap-btn p-1"><Pencil className="w-4 h-4 text-dim" /></button>
            <button onClick={() => setConfirmDel({ id: s._id, name: s.title })} className="tap-btn p-1"><Trash2 className="w-4 h-4 text-faint" /></button>
          </div>
        ))}
        {series.length === 0 && <p className="text-faint font-body text-sm">Hozircha manga yo'q</p>}
      </div>
      {formMode === 'add-series' && <AddSeriesForm onClose={() => setFormMode(null)} onSave={async (data, file) => { await onAddSeries(data, file); setFormMode(null); }} />}
      {formMode?.editSeries && <AddSeriesForm initial={formMode.editSeries} onClose={() => setFormMode(null)} onSave={async (data, file) => { await onEditSeries(formMode.editSeries._id, data, file); setFormMode(null); }} />}
      {formMode?.addChapter !== undefined && <AddChapterForm seriesList={series} initialSeriesId={typeof formMode.addChapter === 'string' ? formMode.addChapter : null} onClose={() => setFormMode(null)} onSave={async (sid, meta, files) => { await onAddChapter(sid, meta, files); setFormMode(null); }} />}
      {confirmDel && <ConfirmModal message={`"${confirmDel.name}"ni butunlay o'chirmoqchimisiz?`} onConfirm={() => { onDeleteSeries(confirmDel.id); setConfirmDel(null); }} onCancel={() => setConfirmDel(null)} />}
    </div>
  );
}

function AdminReportsTab({ adminToken }) {
  const [reports, setReports] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [err, setErr] = useState('');
  const load = useCallback(async () => { try { setReports(await apiRequest('/api/reports', { token: adminToken })); } catch (e) { setErr(e.message); } }, [adminToken]);
  useEffect(() => { load(); }, [load]);

  const doBan = async (r) => { setBusyId(r._id); try { await apiRequest('/api/reports/ban', { method: 'POST', body: { userId: r.userId, nickname: r.nickname }, token: adminToken }); await load(); } catch (e) { setErr(e.message); } setBusyId(null); };
  const doUnban = async (r) => { setBusyId(r._id); try { await apiRequest('/api/reports/unban', { method: 'POST', body: { userId: r.userId }, token: adminToken }); await load(); } catch (e) { setErr(e.message); } setBusyId(null); };

  if (!reports) return <Spinner />;
  return (
    <div className="p-4 pt-0">
      {err && <p className="text-xs mb-2" style={{ color: '#D93A2E' }}>{err}</p>}
      {reports.length === 0 && <p className="text-faint font-body text-sm">Hozircha shikoyat yo'q</p>}
      <div className="flex flex-col gap-2">
        {reports.map((r) => {
          const open = expandedId === r._id;
          return (
            <div key={r._id} className="bg-surface rounded-lg p-3">
              <div onClick={() => setExpandedId(open ? null : r._id)} className="cursor-pointer tap-btn">
                <p className="text-sm text-main font-body truncate">{r.nickname || "Noma'lum"}{r.status === 'new' && <span className="ml-2 px-1.5 py-0.5 rounded-full font-body" style={{ fontSize: 9, backgroundColor: '#D93A2E', color: '#fff' }}>YANGI</span>}</p>
                {!open && <p className="text-xs text-faint font-body truncate mt-0.5">{r.message}</p>}
              </div>
              {open && (
                <div className="mt-2 pt-2" style={{ borderTop: '1px solid var(--line)' }}>
                  <p className="text-sm text-main font-body mb-2">{r.message}</p>
                  <p className="text-xs text-faint font-body mb-3">{r.seriesTitle || '—'}{r.chapterLabel ? ` · ${r.chapterLabel}` : ''} · {new Date(r.createdAt).toLocaleString('uz-UZ')}</p>
                  {r.isBanned
                    ? <button onClick={() => doUnban(r)} disabled={busyId === r._id} className="w-full py-2 rounded-lg text-sm font-medium tap-btn font-body" style={{ backgroundColor: '#2E9E5B', color: '#fff' }}>Blokdan chiqarish</button>
                    : <button onClick={() => doBan(r)} disabled={busyId === r._id} className="w-full py-2 rounded-lg text-sm font-medium tap-btn font-body" style={{ backgroundColor: '#D93A2E', color: '#fff' }}>Bloklash (Ban)</button>}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AdminAdsTab({ adminToken }) {
  const [ads, setAds] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [confirmDel, setConfirmDel] = useState(null);
  const [err, setErr] = useState('');
  const load = useCallback(async () => { try { setAds(await apiRequest('/api/ads', { token: adminToken })); } catch (e) { setErr(e.message); } }, [adminToken]);
  useEffect(() => { load(); }, [load]);
  const remove = async (id) => { try { await apiRequest(`/api/ads/${id}`, { method: 'DELETE', token: adminToken }); await load(); } catch (e) { setErr(e.message); } setConfirmDel(null); };

  if (!ads) return <Spinner />;
  return (
    <div className="p-4 pt-0">
      {err && <p className="text-xs mb-2" style={{ color: '#D93A2E' }}>{err}</p>}
      <button onClick={() => setShowForm(true)} className="w-full py-2.5 rounded-lg bg-accent text-on-accent text-sm font-medium tap-btn font-body mb-4">+ Reklama qo'shish</button>
      {ads.length === 0 && <p className="text-faint font-body text-sm">Hozircha reklama yo'q</p>}
      <div className="flex flex-col gap-2">
        {ads.map((a) => (
          <div key={a._id} className="bg-surface rounded-lg p-3 flex items-center gap-3">
            <div className="rounded overflow-hidden bg-surface-2 shrink-0" style={{ width: 50, height: 34 }}>{a.type === 'video' ? <video src={a.mediaUrl} className="w-full h-full object-cover" muted /> : <img src={a.mediaUrl} className="w-full h-full object-cover" alt="ad" />}</div>
            <div className="flex-1 min-w-0"><p className="text-sm text-main font-body">{a.placement === 'banner' ? 'Banner' : 'Bob reklamasi'}</p><p className="text-xs text-faint font-body">{a.impressions}{a.targetImpressions > 0 ? `/${a.targetImpressions}` : ''} ko'rsatildi · {a.active ? 'faol' : "o'chiq"}</p></div>
            <button onClick={() => setConfirmDel(a._id)} className="tap-btn p-1"><Trash2 className="w-4 h-4 text-faint" /></button>
          </div>
        ))}
      </div>
      {showForm && <AddAdForm adminToken={adminToken} onClose={() => setShowForm(false)} onSaved={async () => { setShowForm(false); await load(); }} />}
      {confirmDel && <ConfirmModal message="Bu reklamani o'chirmoqchimisiz?" onConfirm={() => remove(confirmDel)} onCancel={() => setConfirmDel(null)} />}
    </div>
  );
}

function AdminTranslatorsTab({ adminToken }) {
  const [list, setList] = useState(null);
  const [err, setErr] = useState('');
  useEffect(() => { apiRequest('/api/translator-requests', { token: adminToken }).then(setList).catch((e) => setErr(e.message)); }, [adminToken]);
  if (!list) return <Spinner />;
  return (
    <div className="p-4 pt-0">
      {err && <p className="text-xs mb-2" style={{ color: '#D93A2E' }}>{err}</p>}
      {list.length === 0 ? <p className="text-faint font-body text-sm">Hozircha so'rov yo'q</p> : (
        <div className="flex flex-col gap-2">{list.map((r) => <div key={r._id} className="bg-surface rounded-lg p-3"><p className="text-sm text-main font-body">{r.nickname}</p><p className="text-xs text-dim font-body mt-0.5">{r.message}</p></div>)}</div>
      )}
    </div>
  );
}

function AdminScreen({ catalogList, adminToken, onAddSeries, onEditSeries, onDeleteSeries, onAddChapter }) {
  const [subTab, setSubTab] = useState('series');
  const tabs = [['series', 'Mangalar'], ['reports', 'Shikoyatlar'], ['ads', 'Reklamalar'], ['translators', "So'rovlar"]];
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="flex gap-1 p-4 pb-2">{tabs.map(([id, label]) => <button key={id} onClick={() => setSubTab(id)} className={`flex-1 py-1.5 rounded-lg text-xs tap-btn font-body ${subTab === id ? 'bg-accent text-on-accent' : 'bg-surface-2 text-dim'}`}>{label}</button>)}</div>
      {subTab === 'series' && <AdminSeriesTab series={catalogList} onAddSeries={onAddSeries} onEditSeries={onEditSeries} onDeleteSeries={onDeleteSeries} onAddChapter={onAddChapter} />}
      {subTab === 'reports' && <AdminReportsTab adminToken={adminToken} />}
      {subTab === 'ads' && <AdminAdsTab adminToken={adminToken} />}
      {subTab === 'translators' && <AdminTranslatorsTab adminToken={adminToken} />}
    </div>
  );
}

/* ----------------------------- reader ----------------------------- */
function MangaReader({ pages, page, onPrev, onNext }) {
  const handleTap = (e) => { const rect = e.currentTarget.getBoundingClientRect(); if (e.clientX - rect.left < rect.width / 2) onPrev(); else onNext(); };
  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex-1 flex items-center justify-center overflow-hidden" style={{ backgroundColor: '#000' }} onClick={handleTap}>
        {pages[page] && <img src={pages[page]} onContextMenu={(e) => e.preventDefault()} draggable={false} className="max-h-full max-w-full object-contain" alt={`${page + 1}-bet`} />}
      </div>
      <div className="flex items-center justify-between px-4 py-3 bg-surface shrink-0">
        <button onClick={onPrev} disabled={page === 0} className="px-4 py-2 rounded-lg bg-surface-2 text-main text-sm font-body tap-btn disabled:opacity-40">Oldingi</button>
        <span className="text-xs text-dim font-body">{page + 1} / {pages.length}</span>
        <button onClick={onNext} disabled={page === pages.length - 1} className="px-4 py-2 rounded-lg bg-accent text-on-accent text-sm font-medium font-body tap-btn disabled:opacity-40">Keyingi</button>
      </div>
    </div>
  );
}
function ManhwaReader({ pages, initialPage, onProgress }) {
  const pageRefs = useRef([]);
  const debounceRef = useRef(null);
  useEffect(() => {
    if (initialPage > 0 && pageRefs.current[initialPage]) pageRefs.current[initialPage].scrollIntoView();
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const handleScroll = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      let current = 0;
      for (let i = 0; i < pageRefs.current.length; i++) { const el = pageRefs.current[i]; if (el && el.getBoundingClientRect().top <= window.innerHeight / 2) current = i; }
      onProgress(current);
    }, 600);
  };
  return (
    <div onScroll={handleScroll} className="flex-1 overflow-y-auto" style={{ backgroundColor: '#000' }}>
      {pages.map((src, i) => <img key={i} ref={(el) => (pageRefs.current[i] = el)} src={src} onContextMenu={(e) => e.preventDefault()} draggable={false} className="w-full block" alt={`${i + 1}-bet`} />)}
    </div>
  );
}
function ReaderScreen({ series, pages, loading, page, onPrev, onNext, onProgress, onBack }) {
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-3 px-4 py-3 shrink-0" style={{ backgroundColor: '#000', borderBottom: '1px solid #222' }}>
        <button onClick={onBack} className="tap-btn"><ArrowLeft className="w-5 h-5" style={{ color: '#fff' }} /></button>
        <p className="text-sm font-medium truncate font-body flex-1" style={{ color: '#fff' }}>{series.title}</p>
      </div>
      {loading ? <Spinner /> : pages.length === 0 ? (
        <div className="flex-1 flex items-center justify-center"><p className="text-sm" style={{ color: '#999' }}>Sahifalar topilmadi</p></div>
      ) : series.type === 'manhwa' || series.type === 'manhua' ? (
        <ManhwaReader pages={pages} initialPage={page} onProgress={onProgress} />
      ) : (
        <MangaReader pages={pages} page={page} onPrev={onPrev} onNext={onNext} />
      )}
    </div>
  );
}

/* ----------------------------- main app ----------------------------- */
export default function AniManxwaApp() {
  const [profile, setProfile] = useState(null);
  const [catalogList, setCatalogList] = useState([]);
  const [catalogError, setCatalogError] = useState('');
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('home');
  const [detailId, setDetailId] = useState(null);
  const [readerState, setReaderState] = useState(null);
  const [readerPages, setReaderPages] = useState([]);
  const [readerLoading, setReaderLoading] = useState(false);
  const [readerPage, setReaderPage] = useState(0);
  const [showAdGate, setShowAdGate] = useState(false);

  useEffect(() => {
    (async () => {
      const raw = await safeGet('profile', false);
      let p = null;
      if (raw) { try { p = JSON.parse(raw); } catch { p = null; } }
      if (!p) {
        p = { id: genLongId(), nickname: 'Foydalanuvchi', avatar: null, isAdmin: false, adminToken: null, adminUnlockedAt: null, googleUser: null, sessionToken: null, theme: 'dark', notifications: true, saved: [], progress: {} };
        await safeSet('profile', JSON.stringify(p), false);
      }
      if (p.isAdmin && p.adminUnlockedAt && Date.now() - p.adminUnlockedAt > ADMIN_TTL) p = { ...p, isAdmin: false, adminToken: null, adminUnlockedAt: null };
      setProfile(p);
      try { setCatalogList(await apiRequest('/api/series')); } catch (e) { setCatalogError(e.message); }
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    const iv = setInterval(() => {
      setProfile((p) => {
        if (p && p.isAdmin && p.adminUnlockedAt && Date.now() - p.adminUnlockedAt > ADMIN_TTL) {
          const next = { ...p, isAdmin: false, adminToken: null, adminUnlockedAt: null };
          safeSet('profile', JSON.stringify(next), false);
          return next;
        }
        return p;
      });
    }, 5 * 60 * 1000);
    return () => clearInterval(iv);
  }, []);

  const updateProfile = useCallback((next) => { setProfile(next); safeSet('profile', JSON.stringify(next), false); }, []);
  const refreshCatalog = useCallback(async () => { try { setCatalogList(await apiRequest('/api/series')); } catch (e) { setCatalogError(e.message); } }, []);

  const verifyAdminCode = async (code) => {
    const res = await apiRequest('/api/admin/verify', { method: 'POST', body: { code } });
    updateProfile({ ...profile, isAdmin: true, adminToken: res.token, adminUnlockedAt: Date.now() });
  };
  const logoutAdmin = () => updateProfile({ ...profile, isAdmin: false, adminToken: null, adminUnlockedAt: null });

  const handleGoogleLogin = async (credential) => {
    const res = await apiRequest('/api/auth/google', { method: 'POST', body: { credential } });
    updateProfile({ ...profile, googleUser: res.user, sessionToken: res.token, nickname: res.user.name, avatar: res.user.picture });
  };
  const handleGoogleLogout = () => {
    try { window.google?.accounts?.id?.disableAutoSelect(); } catch (e) { /* ignore */ }
    updateProfile({ ...profile, googleUser: null, sessionToken: null });
  };

  const addSeries = async (data, coverFile) => {
    const fd = new FormData(); fd.append('data', JSON.stringify(data)); if (coverFile) fd.append('cover', coverFile);
    await apiRequest('/api/series', { method: 'POST', body: fd, token: profile.adminToken, isForm: true });
    await refreshCatalog();
  };
  const editSeries = async (id, data, coverFile) => {
    const fd = new FormData(); fd.append('data', JSON.stringify(data)); if (coverFile) fd.append('cover', coverFile);
    await apiRequest(`/api/series/${id}`, { method: 'PUT', body: fd, token: profile.adminToken, isForm: true });
    await refreshCatalog();
  };
  const deleteSeriesFn = async (id) => {
    await apiRequest(`/api/series/${id}`, { method: 'DELETE', token: profile.adminToken });
    await refreshCatalog();
    if (detailId === id) setDetailId(null);
  };
  const addChapter = async (seriesId, meta, files) => {
    const fd = new FormData();
    fd.append('seriesId', seriesId); fd.append('season', meta.season || ''); fd.append('volume', meta.volume || ''); fd.append('chapter', meta.chapter); fd.append('title', meta.title || '');
    files.forEach((f) => fd.append('pages', f));
    await apiRequest('/api/chapters', { method: 'POST', body: fd, token: profile.adminToken, isForm: true });
    await refreshCatalog();
  };
  const deleteChapterFn = async (seriesId, chapterId) => { await apiRequest(`/api/chapters/${chapterId}`, { method: 'DELETE', token: profile.adminToken }); await refreshCatalog(); };
  const submitReport = async ({ seriesId, seriesTitle, message }) => {
    const userId = profile.googleUser?.googleId || profile.id;
    await apiRequest('/api/reports', { method: 'POST', body: { userId, nickname: profile.nickname, seriesId, seriesTitle, message } });
  };
  const submitTranslatorRequest = async (message) => { await apiRequest('/api/translator-requests', { method: 'POST', body: { nickname: profile.nickname, message } }); };

  const toggleSave = (seriesId) => {
    const saved = profile.saved.includes(seriesId) ? profile.saved.filter((x) => x !== seriesId) : [...profile.saved, seriesId];
    updateProfile({ ...profile, saved });
  };
  const clearCache = () => updateProfile({ id: profile.id, nickname: 'Foydalanuvchi', avatar: null, isAdmin: false, adminToken: null, adminUnlockedAt: null, googleUser: null, sessionToken: null, theme: profile.theme, notifications: true, saved: [], progress: {} });

  const openChapter = (chapterId, startPage = 0) => { setReaderState({ seriesId: detailId, chapterId }); setReaderPage(startPage); setShowAdGate(true); };
  const proceedPastAd = async () => {
    setShowAdGate(false); setReaderLoading(true);
    try { const ch = await apiRequest(`/api/chapters/${readerState.chapterId}`); setReaderPages((ch.pages || []).map((p) => p.url)); }
    catch (e) { setReaderPages([]); }
    setReaderLoading(false);
  };
  const updateProgress = (seriesId, chapterId, page) => updateProfile({ ...profile, progress: { ...profile.progress, [seriesId]: { chapterId, page } } });
  const closeReaderFn = () => { setReaderState(null); setReaderPages([]); setShowAdGate(false); };
  const handlePrev = () => setReaderPage((p) => { const np = Math.max(0, p - 1); updateProgress(readerState.seriesId, readerState.chapterId, np); return np; });
  const handleNext = () => setReaderPage((p) => { const np = Math.min(readerPages.length - 1, p + 1); updateProgress(readerState.seriesId, readerState.chapterId, np); return np; });
  const handleManhwaProgress = (p) => { setReaderPage(p); updateProgress(readerState.seriesId, readerState.chapterId, p); };

  if (API_BASE.includes('YOUR-APP-NAME')) {
    return (
      <div className="h-screen w-full flex items-center justify-center theme-dark bg-app p-6 text-center">
        <p className="text-main font-body text-sm">Fayl boshidagi <code>API_BASE</code> qatoriga o'zingizning Render manzilingizni yozing, keyin qayta oching.</p>
      </div>
    );
  }
  if (loading || !profile) return <div className="h-screen w-full flex items-center justify-center theme-dark bg-app"><Spinner label="Serverga ulanmoqda..." /></div>;

  const readerSeries = readerState ? catalogList.find((s) => s._id === readerState.seriesId) : null;

  return (
    <div className={`h-screen w-full flex flex-col theme-${profile.theme} bg-app text-main`} style={{ fontFamily: "'Inter', sans-serif" }}>
      <GlobalStyle />
      {readerState && showAdGate ? (
        <div className="h-full flex flex-col" style={{ backgroundColor: '#000' }}>
          <div className="flex items-center px-4 py-3 shrink-0"><button onClick={closeReaderFn} className="tap-btn"><ArrowLeft className="w-5 h-5" style={{ color: '#fff' }} /></button></div>
          <AdInterstitial onDone={proceedPastAd} />
        </div>
      ) : readerState && readerSeries ? (
        <ReaderScreen series={readerSeries} pages={readerPages} loading={readerLoading} page={readerPage} onPrev={handlePrev} onNext={handleNext} onProgress={handleManhwaProgress} onBack={closeReaderFn} />
      ) : detailId ? (
        <SeriesDetailScreen seriesId={detailId} profile={profile} isSaved={profile.saved.includes(detailId)} onBack={() => setDetailId(null)} onToggleSave={() => toggleSave(detailId)} onOpenChapter={openChapter} isAdmin={profile.isAdmin} onAddChapter={addChapter} onDeleteChapter={deleteChapterFn} onSubmitReport={submitReport} />
      ) : (
        <>
          {catalogError && catalogList.length === 0 && (
            <div className="p-4"><p className="text-xs font-body mb-2" style={{ color: '#D93A2E' }}>{catalogError}</p><button onClick={refreshCatalog} className="text-xs px-3 py-1.5 rounded-lg bg-surface-2 text-main font-body tap-btn">Qayta urinish</button></div>
          )}
          {tab === 'home' && <HomeScreen catalogList={catalogList} onOpen={setDetailId} onSearchFocus={() => setTab('search')} />}
          {tab === 'search' && <SearchScreen catalogList={catalogList} onOpen={setDetailId} />}
          {tab === 'saved' && <SavedScreen catalogList={catalogList} savedIds={profile.saved} onOpen={setDetailId} />}
          {tab === 'admin' && profile.isAdmin && <AdminScreen catalogList={catalogList} adminToken={profile.adminToken} onAddSeries={addSeries} onEditSeries={editSeries} onDeleteSeries={deleteSeriesFn} onAddChapter={addChapter} />}
          {tab === 'profile' && <ProfileScreen profile={profile} onUpdateProfile={updateProfile} onClearCache={clearCache} onSubmitTranslatorRequest={submitTranslatorRequest} onVerifyAdmin={verifyAdminCode} onLogoutAdmin={logoutAdmin} onGoogleLogin={handleGoogleLogin} onGoogleLogout={handleGoogleLogout} />}
          <AdBanner />
          <BottomNav tab={tab} setTab={setTab} isAdmin={profile.isAdmin} onPlus={() => setTab('admin')} />
        </>
      )}
    </div>
  );
}
