/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Plus, 
  ChevronUp, 
  MessageSquare, 
  Bell, 
  LogOut, 
  User as UserIcon,
  ChevronLeft,
  ChevronRight,
  Filter,
  Check,
  X,
  Edit,
  Lightbulb
} from 'lucide-react';
import { User, Idea, Campaign, Notification } from './types';
import { mockApi } from './services/mockApi';
import { cn, formatDate } from './lib/utils';
import { IdeaCard } from './components/IdeaCard';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [totalIdeas, setTotalIdeas] = useState(0);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isIdeaModalOpen, setIsIdeaModalOpen] = useState(false);
  const [editingIdea, setEditingIdea] = useState<Idea | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  // Initialize
  useEffect(() => {
    setCurrentUser(mockApi.getCurrentUser());
    loadCampaign();
    loadIdeas();
  }, []);

  useEffect(() => {
    if (currentUser) {
      loadNotifications();
    }
  }, [currentUser]);

  const loadCampaign = async () => {
    const data = await mockApi.getCampaign();
    setCampaign(data);
  };

  const loadIdeas = useCallback(async () => {
    const { ideas, total } = await mockApi.getIdeas(search, page);
    setIdeas(ideas);
    setTotalIdeas(total);
  }, [search, page]);

  useEffect(() => {
    const timer = setTimeout(() => loadIdeas(), 300);
    return () => clearTimeout(timer);
  }, [loadIdeas]);

  const loadNotifications = async () => {
    const data = await mockApi.getNotifications();
    setNotifications(data);
  };

  const handleLogin = async (email: string) => {
    const user = await mockApi.login(email);
    setCurrentUser(user);
    setIsAuthModalOpen(false);
  };

  const handleLogout = async () => {
    await mockApi.logout();
    setCurrentUser(null);
  };

  const handleVote = async (ideaId: string) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    await mockApi.toggleVote(ideaId);
    loadIdeas();
  };

  const handleCreateIdea = async (subject: string, description: string) => {
    if (editingIdea) {
      await mockApi.updateIdea(editingIdea.id, subject, description);
    } else {
      await mockApi.addIdea(subject, description);
    }
    setEditingIdea(null);
    setIsIdeaModalOpen(false);
    loadIdeas();
    loadCampaign();
  };

  const handleOpenIdeaModal = (idea?: Idea) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    setEditingIdea(idea || null);
    setIsIdeaModalOpen(true);
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen bg-[#F5F5F0] text-[#141414] font-sans selection:bg-[#5A5A40] selection:text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-[#141414]/5">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-[#141414] rounded-xl flex items-center justify-center text-white">
              <Lightbulb size={22} />
            </div>
            <span className="text-xl font-semibold tracking-tight">Ideate Pro</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <button 
                onClick={() => {
                  setIsNotifOpen(!isNotifOpen);
                  if (!isNotifOpen) mockApi.markNotificationsRead().then(loadNotifications);
                }}
                className="p-2 hover:bg-[#141414]/5 rounded-full transition-colors relative"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#FF4444] text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
                    {unreadCount}
                  </span>
                )}
              </button>
              
              <AnimatePresence>
                {isNotifOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-[#141414]/10 overflow-hidden"
                  >
                    <div className="p-4 border-b border-[#141414]/5 font-medium flex justify-between items-center">
                      <span>Notifications</span>
                      <button onClick={() => setIsNotifOpen(false)} className="text-[#141414]/40 hover:text-[#141414] transition-colors">
                        <X size={16} />
                      </button>
                    </div>
                    <div className="max-h-[400px] overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-[#141414]/40 text-sm">No new updates</div>
                      ) : (
                        notifications.map(n => (
                          <div key={n.id} className={cn("p-4 border-b border-[#141414]/5 hover:bg-[#F5F5F0]/50 transition-colors", !n.isRead && "bg-blue-50/30")}>
                            <p className="text-sm leading-snug">{n.message}</p>
                            <span className="text-[10px] uppercase tracking-wider text-[#141414]/40 mt-1 block">{formatDate(n.createdAt)}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {currentUser ? (
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium leading-none">{currentUser.name}</p>
                  <p className="text-[10px] text-[#141414]/50 uppercase tracking-widest mt-1">Active Now</p>
                </div>
                <div className="group relative">
                  <img src={currentUser.avatar} alt="" className="w-10 h-10 rounded-full border border-[#141414]/10" />
                  <button 
                    onClick={handleLogout}
                    className="absolute -bottom-1 -right-1 p-1 bg-white border border-[#141414]/10 rounded-full shadow-sm hover:text-[#FF4444] transition-colors"
                  >
                    <LogOut size={12} />
                  </button>
                </div>
              </div>
            ) : (
              <button 
                onClick={() => setIsAuthModalOpen(true)}
                className="px-5 py-2 bg-[#141414] text-white rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Campaign Hero */}
        <section className="mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-end">
            <div className="lg:col-span-2">
              <span className="inline-block px-3 py-1 bg-[#5A5A40]/10 text-[#5A5A40] text-[10px] uppercase font-bold tracking-widest rounded-full mb-6">
                Active Campaign
              </span>
              <h1 className="text-6xl font-bold tracking-tighter leading-[0.9] mb-8">
                {campaign?.name}
              </h1>
              <p className="text-xl text-[#141414]/70 leading-relaxed max-w-2xl">
                {campaign?.description}
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 bg-white rounded-3xl border border-[#141414]/5 shadow-sm">
                <p className="text-[11px] uppercase tracking-wider text-[#141414]/40 mb-2 font-medium">Total Ideas</p>
                <p className="text-3xl font-bold">{campaign?.totalIdeas}</p>
              </div>
              <div className="p-6 bg-white rounded-3xl border border-[#141414]/5 shadow-sm">
                <p className="text-[11px] uppercase tracking-wider text-[#141414]/40 mb-2 font-medium">Participants</p>
                <p className="text-3xl font-bold font-mono">{campaign?.activeUsers}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Search & Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#141414]/30" size={18} />
            <input 
              type="text" 
              placeholder="Search ideas..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-[#141414]/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-[#5A5A40]/20 transition-all font-medium placeholder-[#141414]/30"
            />
          </div>
          
          <button 
            onClick={() => handleOpenIdeaModal()}
            className="px-8 py-4 bg-[#5A5A40] text-white rounded-2xl flex items-center justify-center gap-2 font-semibold hover:opacity-95 transition-opacity shadow-lg shadow-[#5A5A40]/20"
          >
            <Plus size={20} />
            <span>Submit Idea</span>
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <AnimatePresence mode="popLayout">
            {ideas.map((idea, index) => (
              <IdeaCard
                key={idea.id}
                idea={idea}
                currentUser={currentUser}
                onVote={handleVote}
                onEdit={handleOpenIdeaModal}
                isTop={index === 0 && page === 1 && search === ''}
              />
            ))}
          </AnimatePresence>
          {ideas.length === 0 && (
            <div className="bg-white rounded-[40px] border border-dashed border-[#141414]/10 p-20 text-center">
              <div className="w-20 h-20 bg-[#F5F5F0] rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Search size={32} className="text-[#141414]/20" />
              </div>
              <h3 className="text-2xl font-bold mb-2">No ideas found</h3>
              <p className="text-[#141414]/40">Try adjusting your search or be the first to submit a new concept!</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="mt-12 flex items-center justify-between border-t border-[#141414]/5 pt-8">
          <p className="text-sm text-[#141414]/40 font-medium">
            Showing <span className="text-[#141414]">{Math.min(ideas.length, 5)}</span> of <span className="text-[#141414]">{totalIdeas}</span> ideas
          </p>
          <div className="flex gap-2">
            <button 
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="p-3 border border-[#141414]/10 rounded-xl hover:bg-white transition-all disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              disabled={page * 5 >= totalIdeas}
              onClick={() => setPage(p => p + 1)}
              className="p-3 border border-[#141414]/10 rounded-xl hover:bg-white transition-all disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </main>

      {/* Modals */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        onLogin={handleLogin} 
      />
      <IdeaModal 
        isOpen={isIdeaModalOpen} 
        onClose={() => setIsIdeaModalOpen(false)} 
        onSubmit={handleCreateIdea}
        editingIdea={editingIdea}
      />

      <footer className="max-w-7xl mx-auto px-4 py-8 text-center text-[#141414]/30 text-[10px] uppercase tracking-[0.2em] font-medium mb-12">
        Prototype for Leadership Review • Built with Ideate Pro System
      </footer>
    </div>
  );
}

// Sub-components (Simplified for now, could be separate files)

function AuthModal({ isOpen, onClose, onLogin }: { isOpen: boolean, onClose: () => void, onLogin: (email: string) => void }) {
  const [email, setEmail] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [code, setCode] = useState(['', '', '', '', '', '']);

  if (!isOpen) return null;

  const handleNext = () => {
    if (email.includes('@')) setIsVerifying(true);
  };

  const handleLoginSubmit = () => {
    onLogin(email);
    setIsVerifying(false);
    setEmail('');
    setCode(['', '', '', '', '', '']);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-[#141414]/60 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="relative w-full max-w-md bg-white rounded-[40px] shadow-2xl p-10 overflow-hidden"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#F5F5F0] rounded-2.5xl flex items-center justify-center mx-auto mb-6">
            <UserIcon size={32} className="text-[#141414]/20" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight mb-2">Welcome Back</h2>
          <p className="text-[#141414]/50 leading-relaxed">
            {isVerifying ? `We've sent a code to ${email}` : 'Sign in to share ideas and vote on the future.'}
          </p>
        </div>

        {!isVerifying ? (
          <div className="space-y-4">
            <button 
              onClick={() => onLogin('leadership@example.com')}
              className="w-full py-4 border border-[#141414]/10 rounded-2xl flex items-center justify-center gap-3 hover:bg-[#F5F5F0] transition-colors font-semibold"
            >
              <img src="https://www.google.com/favicon.ico" alt="" className="w-5 h-5" />
              Continue with Google
            </button>
            <div className="relative py-4 flex items-center gap-4">
              <div className="flex-1 h-[1px] bg-[#141414]/5"></div>
              <span className="text-[10px] uppercase tracking-widest text-[#141414]/30 font-bold">OR</span>
              <div className="flex-1 h-[1px] bg-[#141414]/5"></div>
            </div>
            <div>
              <input 
                type="email" 
                placeholder="Work email address" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-[#F5F5F0] border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-[#5A5A40]/20 transition-all placeholder-[#141414]/20"
              />
            </div>
            <button 
              onClick={handleNext}
              disabled={!email.includes('@')}
              className="w-full py-4 bg-[#141414] text-white rounded-2xl font-bold hover:opacity-90 transition-opacity disabled:opacity-20"
            >
              Continue
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between gap-2">
              {code.map((digit, i) => (
                <input 
                  key={i}
                  type="text"
                  maxLength={1}
                  value={digit}
                  className="w-12 h-16 bg-[#F5F5F0] border-none rounded-xl text-center text-xl font-bold focus:ring-2 focus:ring-[#5A5A40]/20 transition-all"
                  onChange={e => {
                    const newCode = [...code];
                    newCode[i] = e.target.value;
                    setCode(newCode);
                    if (e.target.value && i < 5) {
                      (e.target.nextSibling as HTMLInputElement)?.focus();
                    }
                  }}
                />
              ))}
            </div>
            <button 
              onClick={handleLoginSubmit}
              className="w-full py-4 bg-[#5A5A40] text-white rounded-2xl font-bold hover:opacity-90 transition-opacity uppercase tracking-widest text-xs"
            >
              Verify & Sign In
            </button>
            <button 
              onClick={() => setIsVerifying(false)}
              className="w-full py-2 text-sm text-[#141414]/40 hover:text-[#141414] transition-colors"
            >
              Back to email
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}

function IdeaModal({ isOpen, onClose, onSubmit, editingIdea }: { isOpen: boolean, onClose: () => void, onSubmit: (s: string, d: string) => void, editingIdea: Idea | null }) {
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (editingIdea) {
      setSubject(editingIdea.subject);
      setDescription(editingIdea.description);
    } else {
      setSubject('');
      setDescription('');
    }
  }, [editingIdea, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-[#141414]/60 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="relative w-full max-w-2xl bg-white rounded-[40px] shadow-2xl p-10"
      >
        <h2 className="text-3xl font-bold tracking-tight mb-8">
          {editingIdea ? 'Edit your idea' : 'Submit a new idea'}
        </h2>
        
        <div className="space-y-6">
          <div className="relative">
            <label className="block text-[11px] uppercase tracking-wider text-[#141414]/40 font-bold mb-3">Idea Subject</label>
            <input 
              type="text" 
              maxLength={100}
              placeholder="What's the core concept?" 
              value={subject}
              onChange={e => setSubject(e.target.value)}
              className="w-full bg-[#F5F5F0] border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-[#5A5A40]/20 transition-all font-semibold"
            />
            <span className={cn(
              "absolute right-4 bottom-[-1.5rem] text-[10px] font-bold transition-colors",
              subject.length > 90 ? "text-amber-500" : "text-[#141414]/20"
            )}>
              {subject.length}/100
            </span>
          </div>

          <div className="relative pt-4">
            <label className="block text-[11px] uppercase tracking-wider text-[#141414]/40 font-bold mb-3">Detailed Description</label>
            <textarea 
              rows={6}
              maxLength={1000}
              placeholder="Explain how it works, why it matters, and who it helps..." 
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full bg-[#F5F5F0] border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-[#5A5A40]/20 transition-all leading-relaxed"
            />
            <span className={cn(
              "absolute right-4 bottom-[-1.5rem] text-[10px] font-bold transition-colors",
              description.length > 900 ? "text-amber-500" : "text-[#141414]/20"
            )}>
              {description.length}/1000
            </span>
          </div>

          <div className="flex gap-4 pt-8">
            <button 
              onClick={onClose}
              className="px-8 py-4 text-sm font-bold uppercase tracking-widest text-[#141414]/40 hover:text-[#141414] transition-colors"
            >
              Discard
            </button>
            <button 
              disabled={!subject || !description}
              onClick={() => onSubmit(subject, description)}
              className="flex-1 py-4 bg-[#5A5A40] text-white rounded-2xl font-bold hover:opacity-95 transition-opacity disabled:opacity-20 flex items-center justify-center gap-2"
            >
              <Check size={20} />
              <span>{editingIdea ? 'Update Idea' : 'Publish Idea'}</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
