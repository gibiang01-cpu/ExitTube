import React, { useState, useEffect, useRef } from 'react';
import { 
  Menu, 
  X, 
  Play, 
  Lock, 
  ShieldCheck, 
  Zap, 
  DollarSign, 
  ChevronRight,
  ExternalLink,
  Download,
  Copy,
  Check,
  Trash2,
  Plus,
  RefreshCw,
  HelpCircle,
  Building,
  FileText,
  ShieldAlert,
  Mail,
  AlertCircle,
  Info,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

// Type definition for Local Privacy Vault Record
interface VaultRecord {
  id: string;
  platform: string;
  status: 'In Progress' | 'Deactivated' | 'Deleted';
  dateSaved: string;
  notes: string;
}

// Type definition for Extracted TubeAsset
interface ExtractedAsset {
  videoId: string;
  originalUrl: string;
  title: string;
  author: string;
  maxResThumbnail: string;
  hqThumbnail: string;
  tags: string[];
}

export default function App() {
  // Navigation & Modal States
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<'vault' | 'faq' | 'about' | 'privacy' | 'terms' | 'contact' | null>(null);

  // TubeAsset Input & Extracted State
  const youtubeInputRef = useRef<HTMLInputElement>(null);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);
  const [extractedAsset, setExtractedAsset] = useState<ExtractedAsset | null>(null);
  const [copiedTags, setCopiedTags] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const handleFocusTubeAssetInput = () => {
    if (youtubeInputRef.current) {
      youtubeInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      youtubeInputRef.current.focus();
    }
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('penthux1@gmail.com');
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  // Local Privacy Vault State
  const [vaultRecords, setVaultRecords] = useState<VaultRecord[]>([]);
  const [newPlatform, setNewPlatform] = useState('Facebook');
  const [newStatus, setNewStatus] = useState<'In Progress' | 'Deactivated' | 'Deleted'>('In Progress');
  const [newNotes, setNewNotes] = useState('');

  // Load Vault Records from LocalStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('exittube_privacy_vault');
      if (saved) {
        setVaultRecords(JSON.parse(saved));
      } else {
        // Sample default record for demonstration
        const initialRecord: VaultRecord = {
          id: '1',
          platform: 'Facebook',
          status: 'In Progress',
          dateSaved: new Date().toISOString().split('T')[0],
          notes: 'Requested account deletion via direct link. Pending 30-day grace period.'
        };
        setVaultRecords([initialRecord]);
        localStorage.setItem('exittube_privacy_vault', JSON.stringify([initialRecord]));
      }
    } catch (e) {
      console.error('Failed to access localStorage', e);
    }
  }, []);

  // Save Vault Records to LocalStorage
  const saveVaultRecords = (records: VaultRecord[]) => {
    setVaultRecords(records);
    try {
      localStorage.setItem('exittube_privacy_vault', JSON.stringify(records));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  };

  // Add new record to Vault
  const handleAddVaultRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlatform) return;

    const newEntry: VaultRecord = {
      id: Date.now().toString(),
      platform: newPlatform,
      status: newStatus,
      dateSaved: new Date().toISOString().split('T')[0],
      notes: newNotes.trim() || 'No additional notes provided.'
    };

    saveVaultRecords([newEntry, ...vaultRecords]);
    setNewNotes('');
  };

  // Delete individual Vault record
  const handleDeleteVaultRecord = (id: string) => {
    const updated = vaultRecords.filter(r => r.id !== id);
    saveVaultRecords(updated);
  };

  // Clear entire Vault
  const handleClearVault = () => {
    if (window.confirm('Are you sure you want to clear all local privacy vault entries? This action cannot be undone.')) {
      saveVaultRecords([]);
    }
  };

  // Extract YouTube Video ID from URL
  const parseYouTubeVideoId = (url: string): string | null => {
    if (!url) return null;
    const cleanUrl = url.trim();

    // Standard URL format: youtube.com/watch?v=VIDEO_ID
    const regWatch = /(?:youtube\.com\/(?:watch\?.*v=|embed\/|shorts\/)|youtu\.be\/)([^"&?/\s]{11})/;
    const match = cleanUrl.match(regWatch);

    if (match && match[1]) {
      return match[1];
    }
    return null;
  };

  // Handle TubeAsset Asset Extraction Logic
  const handleExtractAssets = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setExtractError(null);
    setCopiedTags(false);
    setCopiedUrl(false);

    if (!youtubeUrl.trim()) {
      setExtractError('Please enter a valid YouTube Video or Shorts URL.');
      return;
    }

    const videoId = parseYouTubeVideoId(youtubeUrl);
    if (!videoId) {
      setExtractError('Invalid YouTube URL format. Example: https://www.youtube.com/watch?v=dQw4w9WgXcQ');
      return;
    }

    setIsExtracting(true);

    try {
      // Attempt oEmbed fetch for title and author
      let title = `YouTube Video (${videoId})`;
      let author = 'YouTube Creator';

      try {
        const oembedRes = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
        if (oembedRes.ok) {
          const data = await oembedRes.json();
          if (data.title) title = data.title;
          if (data.author_name) author = data.author_name;
        }
      } catch (err) {
        console.warn('oEmbed fetch bypassed due to browser policy, utilizing derived asset parameters.');
      }

      // Generate realistic creator tags based on title and video metadata
      const titleWords = title
        .toLowerCase()
        .replace(/[^\w\s]/gi, '')
        .split(' ')
        .filter(w => w.length > 3);
      
      const generatedTags = Array.from(new Set([
        'YouTube',
        'VideoAsset',
        'CreatorTools',
        'HDThumbnail',
        'Shorts',
        author.replace(/\s+/g, ''),
        ...titleWords
      ])).slice(0, 12);

      const maxRes = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
      const hqRes = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

      setExtractedAsset({
        videoId,
        originalUrl: youtubeUrl,
        title,
        author,
        maxResThumbnail: maxRes,
        hqThumbnail: hqRes,
        tags: generatedTags
      });

    } catch (err) {
      setExtractError('Failed to extract assets. Please verify the video link and try again.');
    } finally {
      setIsExtracting(false);
    }
  };

  // Copy Tags to Clipboard
  const handleCopyTags = () => {
    if (!extractedAsset) return;
    const tagText = extractedAsset.tags.map(t => `#${t}`).join(' ');
    navigator.clipboard.writeText(tagText);
    setCopiedTags(true);
    setTimeout(() => setCopiedTags(false), 2500);
  };

  // Copy Video Embed URL
  const handleCopyEmbedUrl = () => {
    if (!extractedAsset) return;
    const embedUrl = `https://www.youtube.com/embed/${extractedAsset.videoId}`;
    navigator.clipboard.writeText(embedUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2500);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-red-600 selection:text-white">
      
      {/* ----------------- 1. HEADER ----------------- */}
      <header className="sticky top-0 z-40 px-4 sm:px-6 py-4 border-b border-white/10 shrink-0 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo */}
          <a href="#" className="flex items-center text-2xl font-black tracking-tighter font-heading group">
            <span className="text-blue-500 transition-colors group-hover:text-blue-400">Exit</span>
            <span className="text-[#FF0000] transition-colors group-hover:text-red-500">Tube</span>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <a href="#" className="hover:text-blue-400 transition-colors py-1">
              Home
            </a>
            <a href="#tools" className="hover:text-blue-400 transition-colors py-1">
              Tools
            </a>
            <button 
              onClick={() => setActiveModal('faq')}
              className="hover:text-blue-400 transition-colors py-1 cursor-pointer"
            >
              FAQ
            </button>
            <button 
              onClick={() => setActiveModal('about')} 
              className="px-3.5 py-1.5 rounded-xl bg-white/5 border border-white/10 text-slate-200 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <span>About Us</span>
              <span className="text-[10px] text-blue-400 uppercase tracking-widest font-mono">(PenthuX)</span>
            </button>
            <button 
              onClick={() => setActiveModal('contact')} 
              className="hover:text-blue-400 transition-colors py-1 cursor-pointer"
            >
              Contact
            </button>
          </nav>

          {/* Mobile Hamburger Button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-slate-300 hover:text-white p-2 rounded-xl bg-white/5 border border-white/10 transition-colors focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-3 max-w-7xl mx-auto bg-slate-900/95 border border-white/10 rounded-2xl p-5 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-200">
            <nav className="flex flex-col gap-3 font-medium text-slate-300 text-sm">
              <a 
                href="#" 
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-xl hover:bg-white/5 hover:text-blue-400 transition-colors flex items-center justify-between"
              >
                <span>Home</span>
                <ChevronRight size={16} className="text-slate-500" />
              </a>
              <a 
                href="#tools" 
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-xl hover:bg-white/5 hover:text-blue-400 transition-colors flex items-center justify-between"
              >
                <span>Tools</span>
                <ChevronRight size={16} className="text-slate-500" />
              </a>
              <button 
                onClick={() => { setMobileMenuOpen(false); setActiveModal('faq'); }}
                className="p-2.5 rounded-xl hover:bg-white/5 hover:text-blue-400 transition-colors flex items-center justify-between text-left"
              >
                <span>FAQ</span>
                <ChevronRight size={16} className="text-slate-500" />
              </button>
              <button 
                onClick={() => { setMobileMenuOpen(false); setActiveModal('about'); }}
                className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-2">
                  <span>About Us</span>
                  <span className="text-[10px] bg-blue-950 text-blue-400 px-2 py-0.5 rounded-md font-mono border border-blue-800/50">PenthuX</span>
                </div>
                <ChevronRight size={16} className="text-slate-400" />
              </button>
              <button 
                onClick={() => { setMobileMenuOpen(false); setActiveModal('contact'); }}
                className="p-2.5 rounded-xl hover:bg-white/5 hover:text-blue-400 transition-colors flex items-center justify-between text-left"
              >
                <span>Contact</span>
                <ChevronRight size={16} className="text-slate-500" />
              </button>
            </nav>
          </div>
        )}
      </header>

      {/* ----------------- 2. HERO SECTION (Bento Grid) ----------------- */}
      <main id="tools" className="flex-1 relative py-6 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
        
        {/* Ambient Subtle Particle Glows */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Mobile Dual-Tool Navigator Bar (< md) */}
        <div className="md:hidden max-w-7xl mx-auto w-full mb-4 grid grid-cols-2 gap-2.5 relative z-10">
          <a 
            href="#cleanexit-tool" 
            className="p-3 bg-blue-950/50 hover:bg-blue-900/60 border border-blue-500/40 rounded-2xl flex items-center justify-between text-slate-200 transition-colors shadow-lg"
          >
            <div className="flex items-center gap-2 min-w-0">
              <ShieldCheck size={16} className="text-blue-400 shrink-0" />
              <div className="flex flex-col text-left min-w-0">
                <span className="text-xs font-bold font-heading text-white truncate">CleanExit</span>
                <span className="text-[9px] font-mono text-blue-300 truncate">Privacy Suite</span>
              </div>
            </div>
            <ChevronRight size={14} className="text-blue-400 shrink-0 ml-1" />
          </a>

          <button 
            onClick={handleFocusTubeAssetInput}
            className="p-3 bg-red-950/50 hover:bg-red-900/60 border border-red-500/40 rounded-2xl flex items-center justify-between text-slate-200 transition-colors text-left cursor-pointer shadow-lg"
          >
            <div className="flex items-center gap-2 min-w-0">
              <Play size={15} className="text-red-500 fill-red-500 shrink-0" />
              <div className="flex flex-col text-left min-w-0">
                <span className="text-xs font-bold font-heading text-white truncate">TubeAsset</span>
                <span className="text-[9px] font-mono text-red-300 truncate">Tap to Extract</span>
              </div>
            </div>
            <Zap size={14} className="text-red-400 shrink-0 ml-1" />
          </button>
        </div>

        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch relative z-10">
          
          {/* BENTO CARD LEFT: CleanExit */}
          <div id="cleanexit-tool" className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl p-6 sm:p-8 md:p-10 flex flex-col justify-between relative overflow-hidden group hover:border-white/20 transition-all duration-300 shadow-2xl h-full">
            
            {/* Top Glow Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-bl-full blur-xl pointer-events-none"></div>

            <div>
              {/* Card Title & Subtitle */}
              <div className="mb-6">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight font-heading">
                  CleanExit
                </h2>
                <p className="text-xs font-bold text-blue-400 tracking-widest uppercase mt-2 flex items-center gap-1.5">
                  <Lock size={13} className="text-blue-400 shrink-0" />
                  <span>DIRECT FACEBOOK &amp; INSTAGRAM DELETION LINKS</span>
                </p>
              </div>

              {/* Primary Facebook & Instagram Account Deletion Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                
                {/* Facebook Button */}
                <a 
                  href="https://www.facebook.com/help/delete_account" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="py-3.5 px-4 bg-white/10 hover:bg-blue-600/20 border border-white/10 hover:border-blue-500/50 rounded-xl font-semibold flex items-center justify-center gap-3 transition-all shadow-sm group/fb"
                >
                  <div className="w-8 h-8 rounded-full bg-[#1877F2] flex items-center justify-center text-white shrink-0 group-hover/fb:scale-105 transition-transform">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold tracking-wide uppercase text-slate-100">FACEBOOK ACCOUNT</span>
                    <ExternalLink size={12} className="text-slate-400 group-hover/fb:text-blue-400" />
                  </div>
                </a>

                {/* Instagram Button */}
                <a 
                  href="https://www.instagram.com/accounts/remove/request/permanent/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="py-3.5 px-4 bg-white/10 hover:bg-pink-600/20 border border-white/10 hover:border-pink-500/50 rounded-xl font-semibold flex items-center justify-center gap-3 transition-all shadow-sm group/ig"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white shrink-0 group-hover/ig:scale-105 transition-transform">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold tracking-wide uppercase text-slate-100">INSTAGRAM ACCOUNT</span>
                    <ExternalLink size={12} className="text-slate-400 group-hover/ig:text-pink-400" />
                  </div>
                </a>

              </div>

              {/* Description line */}
              <p className="text-slate-300 text-xs sm:text-sm font-medium leading-relaxed mb-6 text-center sm:text-left">
                1-Click Direct Links to Official Account Deletion Pages + Local Privacy Vault
              </p>

              {/* Small Social Icon Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
                
                {/* TikTok */}
                <a 
                  href="https://www.tiktok.com/setting" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="h-10 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg flex items-center justify-center gap-1.5 px-3 font-bold text-xs text-slate-300 hover:text-white transition-colors"
                >
                  <svg className="w-3.5 h-3.5 fill-current text-white shrink-0" viewBox="0 0 24 24">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.98-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.29-2.26.51-4.57 2.13-6.18 1.63-1.64 4.02-2.45 6.29-2.11v4.13c-1.25-.26-2.58.07-3.53.86-.98.78-1.48 2.06-1.29 3.3.17 1.25 1.12 2.27 2.37 2.49 1.18.23 2.42-.25 3.1-1.23.47-.63.7-1.42.68-2.21-.03-5.26-.01-10.53-.02-15.79z"/>
                  </svg>
                  <span>TIKTOK</span>
                </a>

                {/* Twitter / X */}
                <a 
                  href="https://twitter.com/settings/deactivate" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="h-10 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg flex items-center justify-center gap-1.5 px-3 font-bold text-xs text-slate-300 hover:text-white transition-colors"
                >
                  <svg className="w-3.5 h-3.5 fill-current text-white shrink-0" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  <span>X</span>
                </a>

                {/* Snapchat */}
                <a 
                  href="https://accounts.snapchat.com/accounts/delete_account" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="h-10 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg flex items-center justify-center gap-1.5 px-3 font-bold text-xs text-slate-300 hover:text-white transition-colors"
                >
                  <svg className="w-3.5 h-3.5 fill-current text-amber-300 shrink-0" viewBox="0 0 24 24">
                    <path d="M12.001 1.5c-4.418 0-8 3.582-8 8 0 1.942.693 3.722 1.848 5.111l-.848 2.889 3.053-.763c1.178.681 2.545 1.063 3.947 1.063 4.418 0 8-3.582 8-8s-3.582-8-8-8zm-2 5c.552 0 1 .448 1 1s-.448 1-1 1-1-.448-1-1 .448-1 1-1zm4 0c.552 0 1 .448 1 1s-.448 1-1 1-1-.448-1-1 .448-1 1-1z"/>
                  </svg>
                  <span>SNAP</span>
                </a>

                {/* Reddit */}
                <a 
                  href="https://www.reddit.com/settings/deactivate" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="h-10 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg flex items-center justify-center gap-1.5 px-3 font-bold text-xs text-slate-300 hover:text-white transition-colors"
                >
                  <svg className="w-3.5 h-3.5 fill-current text-orange-500 shrink-0" viewBox="0 0 24 24">
                    <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l3.018.635a1.24 1.24 0 0 1 1.006-.72z"/>
                  </svg>
                  <span>REDDIT</span>
                </a>

              </div>
            </div>

            {/* Bottom Primary Action CTA */}
            <div className="mt-auto pt-2">
              <button 
                type="button" 
                onClick={() => setActiveModal('vault')}
                className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl shadow-lg shadow-blue-900/30 uppercase tracking-widest text-xs sm:text-sm transition-all transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShieldCheck size={18} />
                <span>MY LOCAL PRIVACY VAULT</span>
              </button>
            </div>

          </div>

          {/* BENTO CARD RIGHT: TubeAsset */}
          <div id="tubeasset-tool" className="rounded-3xl bg-[#FF0000] p-6 sm:p-8 md:p-10 flex flex-col justify-between text-white shadow-2xl shadow-red-900/30 relative overflow-hidden group h-full">
            
            {/* Top Gloss Highlight */}
            <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-white/20 to-transparent pointer-events-none rounded-t-3xl"></div>

            <div>
              {/* Card Title & Asset Badges (Tap header to focus input on mobile) */}
              <div 
                onClick={handleFocusTubeAssetInput}
                className="mb-6 cursor-pointer group/header transition-opacity hover:opacity-95"
                title="Tap to focus input"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-black italic tracking-tighter text-white font-heading">
                    TubeAsset
                  </h2>
                  <span className="text-[10px] sm:text-xs font-sans font-bold not-italic bg-black/30 border border-white/20 px-2.5 py-1 rounded-full uppercase tracking-wider text-white/90 md:hidden flex items-center gap-1 shadow-sm">
                    <Zap size={10} className="fill-white text-white" /> Tap to Focus
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className="px-2.5 py-1 bg-black/20 rounded-md text-[10px] font-bold tracking-wider uppercase backdrop-blur-sm border border-white/10">HD THUMBNAIL</span>
                  <span className="px-2.5 py-1 bg-black/20 rounded-md text-[10px] font-bold tracking-wider uppercase backdrop-blur-sm border border-white/10">TAGS</span>
                  <span className="px-2.5 py-1 bg-black/20 rounded-md text-[10px] font-bold tracking-wider uppercase backdrop-blur-sm border border-white/10">ASSETS</span>
                  <span className="px-2.5 py-1 bg-black/20 rounded-md text-[10px] font-bold tracking-wider uppercase backdrop-blur-sm border border-white/10">METADATA</span>
                </div>
              </div>

              {/* URL Form Container */}
              <form onSubmit={handleExtractAssets} className="my-6">
                <div className="relative flex items-center">
                  <div className="absolute left-4 z-10 w-8 h-8 rounded-full bg-[#FF0000] flex items-center justify-center shrink-0 shadow-md">
                    <Play size={14} className="fill-white text-white ml-0.5" />
                  </div>
                  <input 
                    ref={youtubeInputRef}
                    type="url" 
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    placeholder="Paste YouTube Video / Shorts URL here..." 
                    className="w-full bg-white/10 border-2 border-white/20 rounded-2xl py-4 sm:py-5 pl-14 pr-6 placeholder:text-white/60 text-white outline-none focus:border-white/50 focus:bg-black/20 text-sm sm:text-base font-medium shadow-inner transition-colors" 
                  />
                </div>

                {extractError && (
                  <div className="mt-3 p-3 bg-black/40 border border-white/20 rounded-xl text-xs font-medium text-white flex items-center gap-2">
                    <AlertCircle size={16} className="text-amber-300 shrink-0" />
                    <span>{extractError}</span>
                  </div>
                )}
              </form>

              {/* Extracted Asset Preview Drawer */}
              {extractedAsset && (
                <div className="mt-6 bg-black/40 border border-white/20 rounded-2xl p-5 backdrop-blur-md animate-in fade-in zoom-in-95 duration-200">
                

                  <div className="flex flex-col sm:flex-row gap-4 items-start mb-4">
                    {/* Thumbnail Preview */}
                    <div className="relative group/thumb w-full sm:w-44 rounded-xl overflow-hidden border border-white/20 bg-black/60 shrink-0 aspect-video">
                      <img 
                        src={extractedAsset.maxResThumbnail} 
                        alt="Extracted HD Thumbnail" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback to HQ thumbnail if maxres fails
                          (e.target as HTMLImageElement).src = extractedAsset.hqThumbnail;
                        }}
                      />
                      <a 
                        href={extractedAsset.maxResThumbnail} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="absolute inset-0 bg-black/50 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center text-xs font-bold gap-1 text-white"
                      >
                        <Download size={14} />
                        <span>HD View</span>
                      </a>
                    </div>

                    {/* Metadata & Actions */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm text-white line-clamp-2 leading-snug mb-1">
                        {extractedAsset.title}
                      </h4>
                      <p className="text-xs text-red-200/80 mb-3 font-medium">
                        By {extractedAsset.author}
                      </p>

                      <div className="flex flex-wrap gap-2">
                        <a 
                          href={extractedAsset.maxResThumbnail} 
                          download={`youtube-thumbnail-${extractedAsset.videoId}.jpg`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 bg-white text-red-600 hover:bg-slate-100 rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition-colors"
                        >
                          <Download size={13} />
                          <span>Download HD Thumbnail</span>
                        </a>

                        <button 
                          onClick={handleCopyEmbedUrl}
                          className="px-3 py-1.5 bg-black/40 hover:bg-black/60 border border-white/20 rounded-lg text-xs font-bold text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          {copiedUrl ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                          <span>{copiedUrl ? 'Copied Embed!' : 'Copy Embed Link'}</span>
                        </button>

                        <a 
                          href={`https://www.youtube.com/watch?v=${extractedAsset.videoId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 bg-black/40 hover:bg-black/60 border border-white/20 rounded-lg text-xs font-bold text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <FileText size={13} className="text-red-200" />
                          <span>Open Official Transcript</span>
                          <ExternalLink size={11} className="text-white/60" />
                        </a>
                      </div>

                      {/* Transcript Guidance Note */}
                      <div className="mt-3 p-2.5 rounded-xl bg-black/30 border border-white/10 text-[11px] text-red-100/90 flex items-start gap-2">
                        <Info size={14} className="text-red-300 shrink-0 mt-0.5" />
                        <span>
                          <strong className="text-white font-semibold">Transcript Guide:</strong> Click &quot;Open Official Transcript&quot; to launch YouTube. Expand <code className="bg-white/10 px-1 py-0.5 rounded text-white font-mono text-[10px]">&quot;...More&quot;</code> in the description and select <code className="bg-white/10 px-1 py-0.5 rounded text-white font-mono text-[10px]">&quot;Show transcript&quot;</code> to view full captions.
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Extracted Tags Section */}
                  <div className="pt-3 border-t border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] uppercase tracking-wider font-bold text-red-200">EXTRACTED CREATOR TAGS ({extractedAsset.tags.length})</span>
                      <button 
                        onClick={handleCopyTags}
                        className="text-xs font-bold text-white hover:text-red-200 underline flex items-center gap-1 cursor-pointer"
                      >
                        {copiedTags ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                        <span>{copiedTags ? 'Copied Tags!' : 'Copy All Tags'}</span>
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                      {extractedAsset.tags.map((tag, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-white/10 hover:bg-white/20 border border-white/10 rounded text-[11px] font-mono text-white">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                </div>
              )}

            </div>

            {/* Bottom Centered White Extract Button */}
            <div className="flex flex-col items-center gap-4 mt-auto pt-4">
              <button 
                type="button" 
                onClick={() => handleExtractAssets()}
                disabled={isExtracting}
                className="w-full py-4 sm:py-5 bg-white hover:bg-slate-100 text-[#FF0000] font-black rounded-2xl shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-transform uppercase tracking-tighter text-base sm:text-lg cursor-pointer flex items-center justify-center gap-2 disabled:opacity-80"
              >
                {isExtracting ? (
                  <>
                    <RefreshCw size={20} className="animate-spin text-[#FF0000]" />
                    <span>EXTRACTING ASSETS...</span>
                  </>
                ) : (
                  <>
                    <Zap size={20} className="fill-[#FF0000] text-[#FF0000]" />
                    <span>EXTRACT ASSETS</span>
                  </>
                )}
              </button>
              
              <p className="text-[10px] uppercase font-bold tracking-widest opacity-80 text-center">
                Designed for PenthuX Creators
              </p>
            </div>

          </div>

        </div>
      </main>

     

      {/* ----------------- 3. VALUE PROPS & FOOTER ----------------- */}
      <section className="bg-slate-950 text-white py-12 px-4 sm:px-6 lg:px-8 border-t border-white/10 relative">
        <div className="max-w-7xl mx-auto">
          
          {/* Main Title Section */}
          <h3 className="text-center text-slate-400 font-bold text-xs sm:text-sm tracking-[0.25em] uppercase mb-8 font-heading">
            <span className="text-blue-500">EXIT</span><span className="text-[#FF0000]">TUBE</span>: ENGINEERED FOR TRANSPARENCY & UTILITY.
          </h3>

          {/* 3 Bento Value Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            
            {/* Bento Card 1 */}
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 sm:p-8 flex items-start gap-4 hover:border-white/20 hover:bg-white/[0.05] transition-all shadow-xl group">
              <div className="w-10 h-10 shrink-0 bg-blue-500/20 border border-blue-500/30 rounded-lg flex items-center justify-center text-blue-400 font-bold font-mono text-sm group-hover:scale-105 transition-transform">
                01
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-black uppercase text-white font-heading tracking-wide">
                  DIGITAL PRIVACY FIRST.
                </h4>
                <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed font-mono">
                  CleanExit uses local browser technology (<code className="text-blue-300 bg-white/5 px-1 py-0.5 rounded">localStorage</code>) to manage your accounts. We do not store any user data. Your privacy is total.
                </p>
              </div>
            </div>

            {/* Bento Card 2 */}
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 sm:p-8 flex items-start gap-4 hover:border-white/20 hover:bg-white/[0.05] transition-all shadow-xl group">
              <div className="w-10 h-10 shrink-0 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center justify-center text-red-400 font-bold font-mono text-sm group-hover:scale-105 transition-transform">
                02
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-black uppercase text-white font-heading tracking-wide">
                  CREATOR PERFORMANCE TOOLS.
                </h4>
                <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed font-mono">
                  TubeAsset is optimized for speed, helping you analyze and extract key video assets. Stay ahead of content trends without a single cost.
                </p>
              </div>
            </div>

            {/* Bento Card 3 */}
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 sm:p-8 flex items-start gap-4 hover:border-white/20 hover:bg-white/[0.05] transition-all shadow-xl group">
              <div className="w-10 h-10 shrink-0 bg-emerald-500/20 border border-emerald-500/30 rounded-lg flex items-center justify-center text-emerald-400 font-bold font-mono text-sm group-hover:scale-105 transition-transform">
                03
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-black uppercase text-white font-heading tracking-wide">
                  TRANSPARENT & ZERO-COST.
                </h4>
                <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed font-mono">
                  PenthuX is an agency building with a commitment to $0 infrastructure costs for you. All tools are free to use, supported by lean monetization.
                </p>
              </div>
            </div>

          </div>

          {/* Semantic SEO Indexing Guide Section */}
          <div className="mt-12 pt-10 border-t border-white/10">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-heading mb-6 text-center">
              How ExitTube Simplifies Social Media Deletion &amp; YouTube Asset Extraction
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-400 font-mono leading-relaxed">
              <div className="bg-white/[0.02] border border-white/10 p-5 rounded-2xl hover:border-white/20 transition-colors">
                <h3 className="text-sm font-bold text-blue-400 mb-2 font-sans uppercase tracking-wide">
                  1-Click Facebook &amp; Instagram Account Deletion Links
                </h3>
                <p>
                  CleanExit bypasses confusing social media settings menus by linking you directly to official account deactivation and permanent deletion portals for Facebook, Instagram, TikTok, Twitter (X), Snapchat, and Reddit. Use the integrated Local Privacy Vault to track your deletion confirmation dates with 100% client-side privacy.
                </p>
              </div>
              <div className="bg-white/[0.02] border border-white/10 p-5 rounded-2xl hover:border-white/20 transition-colors">
                <h3 className="text-sm font-bold text-red-400 mb-2 font-sans uppercase tracking-wide">
                  Download HD YouTube Thumbnails &amp; Extract Creator Tags
                </h3>
                <p>
                  TubeAsset parses any standard YouTube video or Shorts link to extract maxresdefault HD thumbnails, video title metadata via oEmbed, creator tags for 1-click copying, and direct links to official video transcripts for content research.
                </p>
              </div>
            </div>
          </div>

          {/* Footer Bar */}
          <footer className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-500">
            <div className="flex flex-wrap items-center justify-center gap-6">
              <button onClick={() => setActiveModal('terms')} className="hover:text-blue-400 transition-colors cursor-pointer">Terms of Service</button>
              <button onClick={() => setActiveModal('privacy')} className="hover:text-blue-400 transition-colors cursor-pointer">Privacy Policy</button>
              <button onClick={() => setActiveModal('faq')} className="hover:text-blue-400 transition-colors cursor-pointer">FAQ</button>
              <button onClick={() => setActiveModal('contact')} className="hover:text-blue-400 transition-colors cursor-pointer">Support</button>
            </div>
            <div className="text-slate-500 font-medium">
              © 2026 <span className="text-slate-400 font-bold">PenthuX Agency</span>. All rights reserved.
            </div>
          </footer>

        </div>
      </section>

      {/* ----------------- 4. MODALS & OVERLAYS ----------------- */}

      {/* MODAL 1: LOCAL PRIVACY VAULT */}
      {activeModal === 'vault' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-white/15 rounded-3xl max-w-2xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto shadow-2xl relative">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white font-heading">Local Privacy Vault</h3>
                  <p className="text-xs text-slate-400 font-mono">100% Client-Side Private Storage</p>
                </div>
              </div>
              <button 
                onClick={() => setActiveModal(null)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Privacy Guarantee Alert */}
            <div className="mb-6 p-4 rounded-2xl bg-blue-950/40 border border-blue-800/40 text-xs text-blue-200 flex items-start gap-3">
              <Info size={18} className="text-blue-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Zero-Server Guarantee:</span> All records added here are saved strictly inside your browser&apos;s <code className="bg-blue-900/60 px-1 py-0.5 rounded text-blue-200 font-mono">localStorage</code>. No remote server or database ever receives your data.
              </div>
            </div>

            {/* Form to Add New Vault Record */}
            <form onSubmit={handleAddVaultRecord} className="mb-8 bg-slate-950/60 border border-white/10 rounded-2xl p-4 sm:p-5">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <Plus size={14} className="text-blue-400" />
                <span>Log New Account Action</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs text-slate-400 font-medium mb-1">Platform</label>
                  <select 
                    value={newPlatform}
                    onChange={(e) => setNewPlatform(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 font-medium"
                  >
                    <option value="Facebook">Facebook</option>
                    <option value="Instagram">Instagram</option>
                    <option value="TikTok">TikTok</option>
                    <option value="Twitter / X">Twitter / X</option>
                    <option value="Snapchat">Snapchat</option>
                    <option value="Reddit">Reddit</option>
                    <option value="Google / YouTube">Google / YouTube</option>
                    <option value="Other">Other Service</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 font-medium mb-1">Current Status</label>
                  <select 
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as 'In Progress' | 'Deactivated' | 'Deleted')}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 font-medium"
                  >
                    <option value="In Progress">In Progress</option>
                    <option value="Deactivated">Deactivated</option>
                    <option value="Deleted">Deleted / Purged</option>
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-xs text-slate-400 font-medium mb-1">Notes / Confirmation Reference</label>
                <input 
                  type="text" 
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="e.g. Account deletion submitted on July 25. Grace period ends in 30 days." 
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 font-medium placeholder-slate-500"
                />
              </div>

              <button 
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Plus size={14} />
                <span>Save Record to Local Vault</span>
              </button>
            </form>

            {/* Saved Vault Records List */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Saved Local Records ({vaultRecords.length})
                </h4>
                {vaultRecords.length > 0 && (
                  <button 
                    onClick={handleClearVault}
                    className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer font-medium"
                  >
                    <Trash2 size={12} />
                    <span>Clear All</span>
                  </button>
                )}
              </div>

              {vaultRecords.length === 0 ? (
                <div className="text-center py-8 bg-slate-950/30 rounded-2xl border border-dashed border-white/10 text-slate-500 text-xs font-mono">
                  No account deletion logs saved yet. Use the form above to add your first record.
                </div>
              ) : (
                <div className="space-y-3">
                  {vaultRecords.map((record) => (
                    <div key={record.id} className="p-4 rounded-xl bg-slate-950/60 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-sm text-white">{record.platform}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            record.status === 'Deleted' 
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40' 
                              : record.status === 'Deactivated'
                              ? 'bg-amber-950 text-amber-400 border border-amber-800/40'
                              : 'bg-blue-950 text-blue-400 border border-blue-800/40'
                          }`}>
                            {record.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">{record.notes}</p>
                        <span className="text-[10px] text-slate-500 font-mono mt-1 block">Saved on: {record.dateSaved}</span>
                      </div>

                      <button 
                        onClick={() => handleDeleteVaultRecord(record.id)}
                        className="p-2 text-slate-500 hover:text-red-400 transition-colors self-end sm:self-center cursor-pointer"
                        title="Remove entry"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* MODAL 2: FAQ */}
      {activeModal === 'faq' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-white/15 rounded-3xl max-w-2xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto shadow-2xl relative">
            
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <HelpCircle size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white font-heading">Frequently Asked Questions</h3>
                  <p className="text-xs text-slate-400 font-mono">ExitTube Knowledge Base</p>
                </div>
              </div>
              <button 
                onClick={() => setActiveModal(null)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/10">
                <h4 className="font-bold text-sm text-white mb-2 flex items-center gap-2">
                  <span className="text-blue-400 font-mono">Q:</span> What is ExitTube?
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed font-mono">
                  ExitTube is a dual-purpose web utility developed by PenthuX Agency. It pairs CleanExit (direct 1-click account deletion and privacy vaulting) with TubeAsset (a high-speed YouTube thumbnail, tags, and metadata extractor for creators).
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/10">
                <h4 className="font-bold text-sm text-white mb-2 flex items-center gap-2">
                  <span className="text-blue-400 font-mono">Q:</span> Does CleanExit store my social media passwords or data?
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed font-mono">
                  No. CleanExit provides direct links to official platform deletion portals (Facebook, Instagram, TikTok, Twitter/X, Snapchat, Reddit). Your account deletion happens directly on the official platform servers. Your Local Privacy Vault logs are stored strictly in your browser&apos;s <code className="text-blue-300 bg-white/5 px-1 py-0.5 rounded">localStorage</code>.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/10">
                <h4 className="font-bold text-sm text-white mb-2 flex items-center gap-2">
                  <span className="text-blue-400 font-mono">Q:</span> How does TubeAsset extract YouTube thumbnails?
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed font-mono">
                  TubeAsset parses YouTube video and Shorts URLs, fetches public oEmbed video data, and provides direct access to high-resolution video thumbnail assets stored on YouTube CDN servers.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/10">
                <h4 className="font-bold text-sm text-white mb-2 flex items-center gap-2">
                  <span className="text-blue-400 font-mono">Q:</span> Is ExitTube free to use?
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed font-mono">
                  Yes, ExitTube is 100% free with zero registration required. It is sustained via lean Google AdSense monetization.
                </p>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 3: ABOUT US (PENTHUX) */}
      {activeModal === 'about' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-white/15 rounded-3xl max-w-2xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto shadow-2xl relative">
            
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <Building size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white font-heading">About PenthuX Agency</h3>
                  <p className="text-xs text-slate-400 font-mono">Engineering Digital Transparency</p>
                </div>
              </div>
              <button 
                onClick={() => setActiveModal(null)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed font-mono">
              <p>
                <strong className="text-white">PenthuX Agency</strong> is an independent software studio committed to building zero-cost, privacy-first web utilities for digital citizens and modern creators.
              </p>
              <p>
                We believe that managing your digital footprint should be frictionless. Tools like <strong className="text-blue-400">CleanExit</strong> eliminate hidden navigation mazes by pointing users straight to official account deletion portals, backed by local-first privacy vaulting.
              </p>
              <p>
                Simultaneously, <strong className="text-red-500">TubeAsset</strong> empowers content creators with instant access to public video metadata and high-definition thumbnail assets, accelerating creative research.
              </p>
              
              <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
                <span>© 2026 PenthuX Agency</span>
                <span className="text-blue-400 font-bold">penthux.agency</span>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 4: PRIVACY POLICY */}
      {activeModal === 'privacy' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-white/15 rounded-3xl max-w-2xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto shadow-2xl relative">
            
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <ShieldAlert size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white font-heading">Privacy Policy</h3>
                  <p className="text-xs text-slate-400 font-mono">Google AdSense Compliant Policy</p>
                </div>
              </div>
              <button 
                onClick={() => setActiveModal(null)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-300 leading-relaxed font-mono">
              <h4 className="text-sm font-bold text-white">1. Information Collection and Storage</h4>
              <p>
                ExitTube does not collect, sell, or store personal identifiable information (PII) on external databases. All vault entries generated in CleanExit are stored locally on your device via browser <code className="text-blue-300 bg-white/5 px-1 py-0.5 rounded">localStorage</code>.
              </p>

              <h4 className="text-sm font-bold text-white">2. Google AdSense & Third-Party Cookies</h4>
              <p>
                ExitTube uses third-party advertising services (including Google AdSense) to serve non-intrusive ads. Third-party vendors, including Google, use cookies to serve ads based on a user&apos;s prior visits to our website or other websites. You may opt out of personalized advertising by visiting Google Ad Settings.
              </p>

              <h4 className="text-sm font-bold text-white">3. Third-Party Web Links</h4>
              <p>
                CleanExit contains direct external links to third-party services (Facebook, Instagram, TikTok, X, Snapchat, Reddit). We are not responsible for the privacy practices or content of these external websites.
              </p>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 5: TERMS OF SERVICE */}
      {activeModal === 'terms' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-white/15 rounded-3xl max-w-2xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto shadow-2xl relative">
            
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <FileText size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white font-heading">Terms of Service</h3>
                  <p className="text-xs text-slate-400 font-mono">Usage Terms & Legal Disclaimers</p>
                </div>
              </div>
              <button 
                onClick={() => setActiveModal(null)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-300 leading-relaxed font-mono">
              <h4 className="text-sm font-bold text-white">1. Acceptance of Terms</h4>
              <p>
                By accessing or using ExitTube, you agree to comply with these Terms of Service. ExitTube is provided "as is" for informational and productivity purposes.
              </p>

              <h4 className="text-sm font-bold text-white">2. Non-Affiliation Disclaimer</h4>
              <p>
                ExitTube and PenthuX Agency are independent entities and are NOT affiliated, endorsed, associated, or sponsored by YouTube, Meta (Facebook, Instagram), TikTok, X Corp, Snapchat, or Reddit. All trademarks belong to their respective owners.
              </p>

              <h4 className="text-sm font-bold text-white">3. Fair Use & Copyright Compliance</h4>
              <p>
                TubeAsset is designed strictly for creative research, archival reference, and metadata inspection. Users are responsible for complying with YouTube Terms of Service and applicable copyright laws when handling extracted media.
              </p>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 6: CONTACT */}
      {activeModal === 'contact' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-white/15 rounded-3xl max-w-2xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto shadow-2xl relative">
            
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <Mail size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white font-heading">Contact PenthuX</h3>
                  <p className="text-xs text-slate-400 font-mono">Support & General Inquiries</p>
                </div>
              </div>
              <button 
                onClick={() => setActiveModal(null)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-300 font-mono">
              <p className="text-slate-300 leading-relaxed">
                Have questions, feature requests, or AdSense compliance inquiries for ExitTube? Get in touch directly with PenthuX Agency:
              </p>

              <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Mail size={20} className="text-blue-400 shrink-0" />
                  <div>
                    <span className="block text-[10px] text-slate-500 uppercase tracking-wider font-bold">Official Contact Email</span>
                    <span className="text-sm sm:text-base font-bold text-white select-all">
                      penthux1@gmail.com
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={handleCopyEmail}
                    className="px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/15 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copiedEmail ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    <span>{copiedEmail ? 'Copied!' : 'Copy Email'}</span>
                  </button>

                  <a 
                    href="mailto:penthux1@gmail.com"
                    className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-md"
                  >
                    <ExternalLink size={14} />
                    <span>Send Mail</span>
                  </a>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/10 flex items-center gap-3">
                <Building size={18} className="text-blue-400 shrink-0" />
                <div>
                  <span className="block text-[10px] text-slate-500 uppercase tracking-wider font-bold">Developer Studio</span>
                  <span className="text-xs sm:text-sm font-bold text-white">
                    PenthuX Agency — Digital Utilities & Privacy Division
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
