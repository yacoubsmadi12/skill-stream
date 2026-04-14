import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Bookmark, Share2, Play, Zap, Send, X, ExternalLink } from 'lucide-react';
import { useData, Video } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLang } from '@/contexts/LangContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import RequestDialog from '@/components/RequestDialog';

function shareVideoOnLinkedIn(video: { title: string; description: string; category: string; user_name: string }) {
  const text = encodeURIComponent(
    `📹 Check out "${video.title}" on Ztube — Zain Jordan's knowledge sharing platform!\n\n` +
    (video.description ? video.description + '\n\n' : '') +
    `Category: ${video.category} | By ${video.user_name}\n\n` +
    `#ZainKnowledge #LearningAndDevelopment #Zain`
  );
  const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://zain.com')}&summary=${text}`;
  window.open(url, '_blank', 'noopener,noreferrer,width=600,height=600');
}

// ── Video URL + thumbnail helpers ─────────────────────────────
function getVideoType(url: string): 'youtube' | 'vimeo' | 'video' | 'external' | 'none' {
  if (!url) return 'none';
  if (url.match(/(?:youtube\.com|youtu\.be)/)) return 'youtube';
  if (url.match(/(?:vimeo\.com|player\.vimeo\.com)/)) return 'vimeo';
  if (url.startsWith('data:video/') || url.match(/\.(mp4|webm|ogg|mov|avi)(\?|$)/i)) return 'video';
  if (url.startsWith('http') || url.startsWith('https')) return 'external';
  return 'none';
}

function getYouTubeId(url: string): string | null {
  const watchMatch = url.match(/[?&]v=([a-zA-Z0-9_-]+)/);
  const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
  const embedMatch = url.match(/\/embed\/([a-zA-Z0-9_-]+)/);
  const shortsMatch = url.match(/\/shorts\/([a-zA-Z0-9_-]+)/);
  const liveMatch = url.match(/\/live\/([a-zA-Z0-9_-]+)/);
  return watchMatch?.[1] || shortMatch?.[1] || embedMatch?.[1] || shortsMatch?.[1] || liveMatch?.[1] || null;
}

function getYouTubeEmbedUrl(url: string): string {
  const id = getYouTubeId(url) || '';
  return `https://www.youtube.com/embed/${id}?autoplay=1&mute=0&rel=0&playsinline=1&enablejsapi=1`;
}

function getVimeoEmbedUrl(url: string): string {
  const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  const id = match?.[1] || '';
  return `https://player.vimeo.com/video/${id}?autoplay=1&playsinline=1`;
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
  const [videoError, setVideoError] = useState(false);
  const [ytBlocked, setYtBlocked] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const blockTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const type = getVideoType(url);
  const ytId = type === 'youtube' ? getYouTubeId(url) : null;
  const thumbnailUrl = ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : null;

  // Reset state when url changes
  useEffect(() => {
    setPlaying(false);
    setIframeBlocked(false);
    setIframeLoaded(false);
    setVideoError(false);
    setYtBlocked(false);
  }, [url]);

  const Bg = thumbnailUrl ? (
    <div className="absolute inset-0">
      <img src={thumbnailUrl} alt="" className="w-full h-full object-cover" />
      <div className={`absolute inset-0 bg-gradient-to-br ${thumbnailColor} opacity-20`} />
    </div>
  ) : (
    <div className={`absolute inset-0 bg-gradient-to-br ${thumbnailColor}`} />
  );

  const handleIframeLoad = () => {
    if (blockTimerRef.current) clearTimeout(blockTimerRef.current);
    setIframeLoaded(true);
  };

  // Detect YouTube embedding errors via postMessage (codes 100/101/150 = not embeddable)
  useEffect(() => {
    if (!playing || type !== 'youtube') return;
    const handleMessage = (e: MessageEvent) => {
      if (!e.data) return;
      try {
        const data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
        if (data.event === 'onError' && [100, 101, 150].includes(Number(data.info))) {
          setYtBlocked(true);
        }
      } catch { /* ignore parse errors */ }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [playing, type]);

  useEffect(() => {
    if (playing && (type === 'external') && videoError) {
      blockTimerRef.current = setTimeout(() => {
        if (!iframeLoaded) setIframeBlocked(true);
      }, 5000);
    }
    return () => { if (blockTimerRef.current) clearTimeout(blockTimerRef.current); };
  }, [playing, type, iframeLoaded, videoError]);

  if (type === 'none' || !url) {
    return (
      <div className="absolute inset-0" onClick={onDoubleTap}>
        {Bg}
        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-3">
          <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
            <Play className="w-7 h-7 text-white/50 ml-1" />
          </div>
          <p className="text-white/60 text-sm font-medium">No video uploaded yet</p>
        </div>
      </div>
    );
  }

  if (!playing) {
    return (
      <div className="absolute inset-0" onClick={onDoubleTap}>
        {Bg}
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
          <button
            onClick={e => { e.stopPropagation(); setPlaying(true); }}
            className="w-20 h-20 rounded-full bg-black/50 backdrop-blur-sm border-2 border-white/70 flex items-center justify-center hover:scale-110 transition-transform shadow-2xl"
          >
            <Play className="w-9 h-9 text-white fill-white ml-1" />
          </button>
        </div>
        {type === 'youtube' && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="absolute bottom-3 right-3 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-sm border border-white/20 text-white/80 text-xs hover:text-white hover:bg-black/80 transition-all"
          >
            <ExternalLink className="w-3 h-3" />
            Watch on YouTube
          </a>
        )}
      </div>
    );
  }

  if (type === 'youtube') {
    if (ytBlocked) {
      return (
        <div className="absolute inset-0" onClick={onDoubleTap}>
          {Bg}
          <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-4 px-6">
            <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
              <ExternalLink className="w-7 h-7 text-white/80" />
            </div>
            <p className="text-white font-semibold text-base text-center">لا يمكن تشغيل هذا الفيديو هنا</p>
            <p className="text-white/60 text-xs text-center max-w-[220px]">صاحب الفيديو أوقف التشغيل المضمّن. شاهده مباشرة على يوتيوب.</p>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-red-600 text-white font-semibold text-sm hover:bg-red-700 transition-all hover:scale-105 shadow-lg"
            >
              <Play className="w-4 h-4 fill-white" />
              شاهد على يوتيوب
            </a>
          </div>
        </div>
      );
    }
    const embedUrl = getYouTubeEmbedUrl(url);
    return (
      <div className="absolute inset-0 bg-black">
        <iframe
          src={embedUrl}
          className="absolute inset-0 w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={e => e.stopPropagation()}
          className="absolute bottom-3 right-3 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-sm border border-white/20 text-white/80 text-xs hover:text-white hover:bg-black/80 transition-all"
        >
          <ExternalLink className="w-3 h-3" />
          Watch on YouTube
        </a>
      </div>
    );
  }

  if (type === 'vimeo') {
    return (
      <div className="absolute inset-0 bg-black">
        <iframe
          src={getVimeoEmbedUrl(url)}
          className="absolute inset-0 w-full h-full"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
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

  // For external URLs: try native <video> first; fall back to iframe if it errors
  if (type === 'external' && !videoError) {
    return (
      <div className="absolute inset-0 bg-black">
        {Bg}
        <video
          src={url}
          autoPlay
          controls
          className="absolute inset-0 w-full h-full object-contain"
          onError={() => setVideoError(true)}
        />
      </div>
    );
  }

  if (iframeBlocked) {
    return (
      <div className="absolute inset-0" onClick={onDoubleTap}>
        {Bg}
        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-4 px-6">
          <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
            <ExternalLink className="w-7 h-7 text-white/80" />
          </div>
          <p className="text-white font-semibold text-base text-center">This video cannot be embedded</p>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 text-white font-semibold text-sm hover:bg-white/30 transition-all hover:scale-105"
          >
            <Play className="w-4 h-4 fill-white" />
            Open Video
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 bg-black">
      {Bg}
      {!iframeLoaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10 pointer-events-none">
          <div className="w-10 h-10 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          <p className="text-white/60 text-xs">Loading video...</p>
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
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={e => e.stopPropagation()}
        className="absolute bottom-4 left-4 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 text-white/70 text-xs hover:text-white hover:bg-black/70 transition-all"
      >
        <ExternalLink className="w-3 h-3" />
        Open in new tab
      </a>
    </div>
  );
}

// ── Feed page ──────────────────────────────────────────────────
export default function FeedPage() {
  const { videos, categories, likedVideos, savedVideos, followedUsers, toggleLike, toggleSave, toggleFollow, addComment, incrementView } = useData();
  const { user } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const viewedRef = useRef<Set<string>>(new Set());

  const approvedVideos = videos.filter(v => v.status === 'approved');
  const filteredVideos = selectedCategory
    ? approvedVideos.filter(v => v.category === selectedCategory)
    : approvedVideos;

  const firstVideoId = filteredVideos[0]?.id;
  useEffect(() => {
    setCurrentIndex(0);
    viewedRef.current = new Set();
    if (containerRef.current) containerRef.current.scrollTop = 0;
  }, [selectedCategory]);

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
        const vid = filteredVideos[idx];
        if (vid && !viewedRef.current.has(vid.id)) {
          viewedRef.current.add(vid.id);
          incrementView(vid.id);
        }
      }
      return idx;
    });
  }, [filteredVideos, incrementView]);

  return (
    <div className="h-screen relative overflow-hidden">
      {/* Categories bar — fixed overlay */}
      <div className="absolute top-0 inset-x-0 z-40 pt-3 pb-2 px-3 bg-gradient-to-b from-background/90 to-transparent pointer-events-none">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pointer-events-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
          <button
            onClick={() => setSelectedCategory(null)}
            className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              selectedCategory === null
                ? 'gradient-primary text-primary-foreground shadow-md'
                : 'bg-background/80 backdrop-blur-sm text-foreground border border-border/60 hover:border-primary/40'
            }`}
          >
            All
          </button>
          {categories.map(c => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(prev => prev === c.name ? null : c.name)}
              className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                selectedCategory === c.name
                  ? 'gradient-primary text-primary-foreground shadow-md'
                  : 'bg-background/80 backdrop-blur-sm text-foreground border border-border/60 hover:border-primary/40'
              }`}
            >
              <span>{c.icon}</span>
              <span className="max-w-[80px] truncate">{c.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Video feed */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="h-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
        style={{ scrollSnapType: 'y mandatory' }}
      >
        {filteredVideos.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-3">
            <span className="text-4xl">{categories.find(c => c.name === selectedCategory)?.icon || '🎬'}</span>
            <p className="font-semibold">No videos in this category yet</p>
          </div>
        ) : (
          filteredVideos.map((video, idx) => (
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
          ))
        )}
      </div>
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
    <div className="h-screen w-full snap-start relative flex items-center justify-center overflow-hidden" style={{ scrollSnapAlign: 'start' }}>
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
            <Heart className="w-24 h-24 text-primary fill-primary drop-shadow-2xl" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom gradient overlay */}
      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-background/95 via-background/40 to-transparent pointer-events-none z-10" />

      {/* Video info */}
      <div className="absolute bottom-0 inset-x-0 p-5 pb-24 md:pb-8 z-20">
        <div className="flex items-end gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-sm font-bold shrink-0 overflow-hidden">
                {video.user_avatar
                  ? <img src={video.user_avatar} alt={video.user_name} className="w-full h-full object-cover" />
                  : video.user_name.charAt(0)}
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
            <ActionButton icon={Share2} count={0} onClick={() => shareVideoOnLinkedIn(video)} />
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
      <div className={`w-12 h-12 rounded-full bg-secondary/70 backdrop-blur-sm flex items-center justify-center transition-all ${active ? activeClass : 'text-foreground'} ${active ? 'scale-110' : ''}`}>
        <Icon className="w-5 h-5" />
      </div>
      {count > 0 && <span className="text-xs text-foreground/80 font-medium">{count}</span>}
    </button>
  );
}
