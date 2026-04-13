import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Bookmark, Share2, Play, UserPlus, Zap, Send, X } from 'lucide-react';
import { useData, Video } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import RequestDialog from '@/components/RequestDialog';

export default function FeedPage() {
  const { videos, likedVideos, savedVideos, followedUsers, toggleLike, toggleSave, toggleFollow, addComment, incrementView } = useData();
  const { user } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const viewedRef = useRef<Set<string>>(new Set());
  const approvedVideos = videos.filter(v => v.status === 'approved');

  const firstVideoId = approvedVideos[0]?.id;
  // Mark first video as viewed on load
  useEffect(() => {
    if (firstVideoId && !viewedRef.current.has(firstVideoId)) {
      viewedRef.current.add(firstVideoId);
      incrementView(firstVideoId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firstVideoId]);

  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    const scrollTop = containerRef.current.scrollTop;
    const height = containerRef.current.clientHeight;
    const idx = Math.round(scrollTop / height);
    setCurrentIndex(prev => {
      if (idx !== prev) {
        const vid = approvedVideos[idx];
        if (vid && !viewedRef.current.has(vid.id)) {
          viewedRef.current.add(vid.id);
          incrementView(vid.id);
        }
      }
      return idx;
    });
  }, [approvedVideos, incrementView]);

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="h-screen overflow-y-scroll snap-y-mandatory scrollbar-hide"
    >
      {approvedVideos.map((video, idx) => (
        <VideoCard
          key={video.id}
          video={video}
          isActive={idx === currentIndex}
          isLiked={likedVideos.has(video.id)}
          isSaved={savedVideos.has(video.id)}
          isFollowing={followedUsers.has(video.user_id)}
          onLike={() => toggleLike(video.id)}
          onSave={() => toggleSave(video.id)}
          onFollow={() => toggleFollow(video.user_id)}
          onComment={(text) => addComment(video.id, user?.name || 'Anonymous', text)}
          currentUserId={user?.id || ''}
        />
      ))}
    </div>
  );
}

function VideoCard({
  video,
  isActive,
  isLiked,
  isSaved,
  isFollowing,
  onLike,
  onSave,
  onFollow,
  onComment,
  currentUserId,
}: {
  video: Video;
  isActive: boolean;
  isLiked: boolean;
  isSaved: boolean;
  isFollowing: boolean;
  onLike: () => void;
  onSave: () => void;
  onFollow: () => void;
  onComment: (text: string) => void;
  currentUserId: string;
}) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [showRequest, setShowRequest] = useState(false);
  const [doubleTapLike, setDoubleTapLike] = useState(false);
  const lastTap = useRef(0);

  const handleDoubleTap = () => {
    const now = Date.now();
    if (now - lastTap.current < 300) {
      if (!isLiked) onLike();
      setDoubleTapLike(true);
      setTimeout(() => setDoubleTapLike(false), 800);
    }
    lastTap.current = now;
  };

  const submitComment = () => {
    if (!commentText.trim()) return;
    onComment(commentText.trim());
    setCommentText('');
  };

  return (
    <div className="h-screen w-full snap-start relative flex items-center justify-center overflow-hidden">
      {/* Video Background */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${video.thumbnail_color} flex items-center justify-center`}
        onClick={handleDoubleTap}
      >
        <div className="text-center p-8">
          <Play className="w-16 h-16 text-foreground/20 mx-auto mb-4" />
          <p className="text-foreground/30 text-sm">Video Player Placeholder</p>
        </div>
      </div>

      {/* Double tap heart */}
      <AnimatePresence>
        {doubleTapLike && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1.5, opacity: 1 }}
            exit={{ scale: 2, opacity: 0 }}
            className="absolute z-30 pointer-events-none"
          >
            <Heart className="w-24 h-24 text-primary fill-primary" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom gradient */}
      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-background/95 via-background/50 to-transparent pointer-events-none" />

      {/* Video info */}
      <div className="absolute bottom-0 inset-x-0 p-5 pb-24 md:pb-8 z-10">
        <div className="flex items-end gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-sm font-bold shrink-0">
                {video.user_name.charAt(0)}
              </div>
              <div>
                <p className="text-foreground font-semibold text-sm">{video.user_name}</p>
                <p className="text-muted-foreground text-xs">{video.user_department}</p>
              </div>
              {video.user_id !== currentUserId && (
                <Button
                  size="sm"
                  variant={isFollowing ? 'secondary' : 'default'}
                  onClick={onFollow}
                  className={`h-7 text-xs px-3 ${!isFollowing ? 'gradient-primary text-primary-foreground' : ''}`}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </Button>
              )}
            </div>
            <h3 className="text-foreground font-display font-semibold text-lg mb-1">{video.title}</h3>
            <p className="text-foreground/70 text-sm line-clamp-2 mb-2">{video.description}</p>
            <div className="flex flex-wrap gap-1.5">
              {video.tags.map((tag) => (
                <span key={tag} className="text-xs bg-secondary/60 text-secondary-foreground px-2 py-0.5 rounded-full">#{tag}</span>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col items-center gap-5">
            <ActionButton icon={Heart} count={video.likes} active={isLiked} onClick={onLike} activeClass="text-primary fill-primary" />
            <ActionButton icon={MessageCircle} count={video.comments.length} onClick={() => setShowComments(true)} />
            <ActionButton icon={Bookmark} count={video.saves} active={isSaved} onClick={onSave} activeClass="text-warning fill-warning" />
            <ActionButton icon={Share2} count={0} onClick={() => {}} />
            {video.user_id !== currentUserId && (
              <button
                onClick={() => setShowRequest(true)}
                className="w-12 h-12 gradient-primary rounded-full flex items-center justify-center shadow-glow animate-pulse-glow"
              >
                <Zap className="w-5 h-5 text-primary-foreground" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Comments sheet */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25 }}
            className="absolute inset-x-0 bottom-0 h-[60%] bg-card rounded-t-3xl z-30 border-t border-border/50 flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b border-border/30">
              <h3 className="font-display font-semibold text-foreground">Comments ({video.comments.length})</h3>
              <button onClick={() => setShowComments(false)} className="text-muted-foreground"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {video.comments.length === 0 && <p className="text-muted-foreground text-sm text-center pt-8">No comments yet</p>}
              {video.comments.map(c => (
                <div key={c.id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-secondary-foreground shrink-0">
                    {c.user_name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{c.user_name}</p>
                    <p className="text-sm text-foreground/80">{c.text}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-border/30 flex gap-2">
              <Input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                className="bg-secondary/50 border-border/50"
                onKeyDown={(e) => e.key === 'Enter' && submitComment()}
              />
              <Button size="icon" onClick={submitComment} className="gradient-primary text-primary-foreground shrink-0">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Request dialog */}
      <RequestDialog
        open={showRequest}
        onClose={() => setShowRequest(false)}
        video={video}
      />
    </div>
  );
}

function ActionButton({ icon: Icon, count, active, onClick, activeClass }: {
  icon: React.ElementType;
  count: number;
  active?: boolean;
  onClick: () => void;
  activeClass?: string;
}) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1">
      <div className={`w-10 h-10 rounded-full bg-secondary/60 backdrop-blur-sm flex items-center justify-center transition-colors ${active ? activeClass : 'text-foreground'}`}>
        <Icon className="w-5 h-5" />
      </div>
      {count > 0 && <span className="text-xs text-foreground/70">{count}</span>}
    </button>
  );
}
