import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Bookmark, Share2, Play, Zap, Send, X, ExternalLink } from 'lucide-react';
import { useData, Video } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLang } from '@/contexts/LangContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import RequestDialog from '@/components/RequestDialog';

// ── Video URL helpers ──────────────────────────────────────────
function getVideoType(url: string): 'youtube' | 'vimeo' | 'video' | 'external' | 'none' {
  if (!url) return 'none';
  if (url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)/)) return 'youtube';
  if (url.match(/(?:vimeo\.com\/|player\.vimeo\.com\/video\/)/)) return 'vimeo';
  if (url.startsWith('data:video/') || url.match(/\.(mp4|webm|ogg|mov|avi)(\?|$)/i)) return 'video';
  if (url.startsWith('http') || url.startsWith('https')) return 'external';
  return 'none';
}

function getYouTubeEmbedUrl(url: string): string {
  const watchMatch = url.match(/youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/);
  const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
  const embedMatch = url.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]+)/);
  const id = watchMatch?.[1] || shortMatch?.[1] || embedMatch?.[1] || '';
  return `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`;
}

function getVimeoEmbedUrl(url: string): string {
  const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  const id = match?.[1] || '';
  return `https://player.vimeo.com/video/${id}?autoplay=1`;
}

// ── Smart video player ─────────────────────────────────────────
function VideoPlayer({ url, thumbnailColor, onDoubleTap }: {
  url: string;
  thumbnailColor: string;
  onDoubleTap: () => void;
}) {
  const [playing, setPlaying] = useState(false);
  const [iframeBlocked, setIframeBlocked] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const blockTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const type = getVideoType(url);

  const Bg = (
    <div className={`absolute inset-0 bg-gradient-to-br ${thumbnailColor}`} />
  );

  // When iframe loads, check if it has real content (cross-origin: can't read doc, so
  // we optimistically trust load = success, but cancel the "blocked" timer)
  const handleIframeLoad = () => {
    if (blockTimerRef.current) clearTimeout(blockTimerRef.current);
    setIframeLoaded(true);
  };

  // Start a short timer when playing begins; if iframe hasn't loaded by then, flag it blocked
  useEffect(() => {
    if (playing && type === 'external') {
      blockTimerRef.current = setTimeout(() => {
        if (!iframeLoaded) setIframeBlocked(true);
      }, 5000);
    }
    return () => { if (blockTimerRef.current) clearTimeout(blockTimerRef.current); };
  }, [playing, type, iframeLoaded]);

  if (type === 'none' || !url) {
    return (
      <div className="absolute inset-0" onClick={onDoubleTap}>
        {Bg}
        <div className="absolute inset-0 flex items-center justify-center">
          <Play className="w-16 h-16 text-white/20" />
        </div>
      </div>
    );
  }

  if (!playing) {
    return (
      <div className="absolute inset-0" onClick={onDoubleTap}>
        {Bg}
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            onClick={e => { e.stopPropagation(); setPlaying(true); }}
            className="w-20 h-20 rounded-full bg-black/40 backdrop-blur-sm border-2 border-white/60 flex items-center justify-center hover:scale-110 transition-transform"
          >
            <Play className="w-9 h-9 text-white fill-white ml-1" />
          </button>
        </div>
      </div>
    );
  }

  if (type === 'youtube') {
    return (
      <div className="absolute inset-0 bg-black">
        {Bg}
        <iframe
          src={getYouTubeEmbedUrl(url)}
          className="absolute inset-0 w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  if (type === 'vimeo') {
    return (
      <div className="absolute inset-0 bg-black">
        {Bg}
        <iframe
          src={getVimeoEmbedUrl(url)}
          className="absolute inset-0 w-full h-full"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  if (type === 'video') {
    return (
      <div className="absolute inset-0 bg-black">
        {Bg}
        <video
          src={url}
          autoPlay
          controls
          className="absolute inset-0 w-full h-full object-contain"
        />
      </div>
    );
  }

  // External link — try to embed, with graceful fallback if blocked
  if (iframeBlocked) {
    return (
      <div className="absolute inset-0" onClick={onDoubleTap}>
        {Bg}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6">
          <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center mb-1">
            <ExternalLink className="w-7 h-7 text-white/80" />
          </div>
          <p className="text-white font-semibold text-base text-center">لا يمكن تضمين هذا الفيديو</p>
          <p className="text-white/50 text-xs text-center max-w-[220px]">الموقع يمنع التضمين. شاهد الفيديو مباشرةً:</p>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 text-white font-semibold text-sm hover:bg-white/30 transition-all hover:scale-105 shadow-lg"
          >
            <Play className="w-4 h-4 fill-white" />
            فتح الفيديو
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 bg-black">
      {Bg}
      {/* Loading shimmer shown while iframe loads */}
      {!iframeLoaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10 pointer-events-none">
          <div className="w-10 h-10 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          <p className="text-white/60 text-xs">جارٍ تحميل الفيديو...</p>
        </div>
      )}
      <iframe
        ref={iframeRef}
        src={url}
        className={`absolute inset-0 w-full h-full transition-opacity duration-300 ${iframeLoaded ? 'opacity-100' : 'opacity-0'}`}
        allowFullScreen
        allow="autoplay; fullscreen; encrypted-media"
        onLoad={handleIframeLoad}
      />
      {/* Subtle open-in-new-tab button always available */}
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={e => e.stopPropagation()}
        className="absolute bottom-4 left-4 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 text-white/70 text-xs hover:text-white hover:bg-black/70 transition-all"
      >
        <ExternalLink className="w-3 h-3" />
        فتح في تبويب
      </a>
    </div>
  );
}

// ── Feed page ──────────────────────────────────────────────────
export default function FeedPage() {
  const { videos, likedVideos, savedVideos, followedUsers, toggleLike, toggleSave, toggleFollow, addComment, incrementView } = useData();
  const { user } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const viewedRef = useRef<Set<string>>(new Set());
  const approvedVideos = videos.filter(v => v.status === 'approved');

  const firstVideoId = approvedVideos[0]?.id;
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

// ── Video card ─────────────────────────────────────────────────
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
  const { T } = useLang();
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
      {/* Smart video player */}
      <VideoPlayer
        url={video.video_url}
        thumbnailColor={video.thumbnail_color}
        onDoubleTap={handleDoubleTap}
      />

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

      {/* Bottom gradient overlay */}
      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-background/95 via-background/50 to-transparent pointer-events-none z-10" />

      {/* Video info */}
      <div className="absolute bottom-0 inset-x-0 p-5 pb-24 md:pb-8 z-20">
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
                  {isFollowing ? T.feed.following : T.feed.follow}
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
              <h3 className="font-display font-semibold text-foreground">{T.feed.comments} ({video.comments.length})</h3>
              <button onClick={() => setShowComments(false)} className="text-muted-foreground"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {video.comments.length === 0 && <p className="text-muted-foreground text-sm text-center pt-8">{T.feed.noComments}</p>}
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
                placeholder={T.feed.addComment}
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
