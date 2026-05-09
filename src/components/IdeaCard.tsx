import { useState, useEffect, FC } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronUp, MessageSquare, Edit, Send, User as UserIcon } from 'lucide-react';
import { Idea, User, Comment } from '../types';
import { cn, formatDate } from '../lib/utils';
import { mockApi } from '../services/mockApi';

interface IdeaCardProps {
  idea: Idea;
  currentUser: User | null;
  onVote: (id: string) => void;
  onEdit: (idea?: Idea) => void;
  isTop?: boolean;
}

export const IdeaCard: FC<IdeaCardProps> = ({ idea, currentUser, onVote, onEdit, isTop }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isExpanded) {
      loadComments();
    }
  }, [isExpanded]);

  const loadComments = async () => {
    const data = await mockApi.getComments(idea.id);
    setComments(data);
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !currentUser) return;
    setLoading(true);
    try {
      await mockApi.addComment(idea.id, newComment);
      setNewComment('');
      await loadComments();
    } finally {
      setLoading(false);
    }
  };

  const hasVoted = currentUser ? idea.votes.includes(currentUser.id) : false;

  return (
    <motion.div
      layout
      className={cn(
        "group bg-white rounded-[32px] border border-[#141414]/5 p-8 flex flex-col gap-8 transition-all hover:shadow-2xl hover:shadow-[#141414]/5",
        isTop && "ring-2 ring-[#5A5A40]/20 ring-offset-4 ring-offset-[#F5F5F0]"
      )}
    >
      <div className="flex flex-col md:flex-row gap-8">
        {/* Voting Column */}
        <div className="flex flex-row md:flex-col items-center gap-4">
          <button 
            onClick={() => onVote(idea.id)}
            className={cn(
              "w-16 h-16 rounded-2xl flex flex-col items-center justify-center transition-all border-2",
              hasVoted 
                ? "bg-[#5A5A40] text-white border-[#5A5A40]" 
                : "bg-white text-[#141414] border-[#141414]/5 hover:border-[#141414]/20"
            )}
          >
            <ChevronUp size={24} className={cn("transition-transform", hasVoted && "animate-bounce")} />
            <span className="text-lg font-bold mt-[-4px]">{idea.votes.length}</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <img src={idea.userAvatar} alt="" className="w-8 h-8 rounded-full bg-slate-100" />
              <div>
                <p className="text-sm font-semibold">{idea.userName}</p>
                <p className="text-[10px] text-[#141414]/40 uppercase tracking-widest">{formatDate(idea.createdAt)}</p>
              </div>
            </div>
            {currentUser?.id === idea.userId && (
              <button 
                onClick={() => onEdit(idea)}
                className="p-2 hover:bg-[#141414]/5 rounded-xl text-[#141414]/40 hover:text-[#141414] transition-all"
              >
                <Edit size={18} />
              </button>
            )}
          </div>

          <h3 className="text-2xl font-bold tracking-tight mb-3 group-hover:text-[#5A5A40] transition-colors">
            {idea.subject}
          </h3>
          <p className="text-[#141414]/60 leading-relaxed mb-6">
            {idea.description}
          </p>

          <div className="flex items-center gap-6">
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-2 text-[#141414]/40 hover:text-[#141414] transition-colors group/chat"
            >
              <MessageSquare size={18} />
              <span className="text-sm font-medium">{idea.commentCount} comments</span>
            </button>
            
            {isTop && (
              <span className="px-3 py-1 bg-amber-100 text-amber-700 text-[10px] font-bold uppercase rounded-full">Top Priority</span>
            )}
          </div>
        </div>
      </div>

      {/* Expandable Comments Section */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-[#141414]/5 pt-8"
          >
            <div className="space-y-6 mb-8">
              {comments.map(comment => (
                <div key={comment.id} className="flex gap-4">
                  <img src={comment.userAvatar} alt="" className="w-8 h-8 rounded-full bg-slate-100 shrink-0" />
                  <div className="flex-1 bg-[#F5F5F0] rounded-2xl p-4">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold">{comment.userName}</span>
                      <span className="text-[10px] text-[#141414]/40">{formatDate(comment.createdAt)}</span>
                    </div>
                    <p className="text-sm text-[#141414]/70 leading-relaxed">{comment.content}</p>
                  </div>
                </div>
              ))}
              {comments.length === 0 && (
                <p className="text-center text-sm text-[#141414]/30 py-4 italic">No comments yet. Be the first to share your thoughts!</p>
              )}
            </div>

            {currentUser ? (
              <div className="flex gap-4">
                <img src={currentUser.avatar} alt="" className="w-8 h-8 rounded-full" />
                <div className="flex-1 relative">
                  <input 
                    type="text"
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAddComment()}
                    className="w-full bg-[#F5F5F0] border-none rounded-2xl py-3 px-6 pr-12 text-sm focus:ring-2 focus:ring-[#5A5A40]/20 transition-all"
                  />
                  <button 
                    onClick={handleAddComment}
                    disabled={!newComment.trim() || loading}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-[#5A5A40] hover:bg-[#5A5A40]/10 rounded-xl transition-all disabled:opacity-30"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center p-4 bg-[#F5F5F0] rounded-2xl border border-dashed border-[#141414]/10">
                <p className="text-xs text-[#141414]/50">Sign in to join the discussion</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
