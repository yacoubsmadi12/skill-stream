import { useState, useRef, useEffect } from 'react';
import { Play, ExternalLink, Loader2 } from 'lucide-react';

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
  return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=0&rel=0&playsinline=1&enablejsapi=1`;
}

function getVimeoEmbedUrl(url: string): string {
  const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  const id = match?.[1] || '';
  return `https://player.vimeo.com/video/${id}?autoplay=1`;
}

interface VideoPlayerProps {
  videoUrl: string;
  thumbnailColor: string;
  onDoubleTap?: () => void;
}

export default function VideoPlayer({ videoUrl: url, thumbnailColor, onDoubleTap }: VideoPlayerProps) {
  const [playing, setPlaying] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [ytHardBlocked, setYtHardBlocked] = useState(false);
  const [thumbQuality, setThumbQuality] = useState<'maxresdefault' | 'hqdefault' | 'mqdefault' | 'failed'>('maxresdefault');
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const type = getVideoType(url);
  const ytId = type === 'youtube' ? getYouTubeId(url) : null;
  const thumbSrc = ytId && thumbQuality !== 'failed'
    ? `https://img.youtube.com/vi/${ytId}/${thumbQuality}.jpg`
    : null;

  const handleThumbError = () => {
    setThumbQuality(prev =>
      prev === 'maxresdefault' ? 'hqdefault' :
      prev === 'hqdefault' ? 'mqdefault' : 'failed'
    );
  };

  useEffect(() => {
    setPlaying(false);
    setIframeLoaded(false);
    setVideoError(false);
    setYtHardBlocked(false);
    setThumbQuality('maxresdefault');
  }, [url]);

  // Only block on actual YouTube error codes (not timeout)
  useEffect(() => {
    if (!playing || type !== 'youtube') return;
    const handleMessage = (e: MessageEvent) => {
      try {
        const data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
        if (!data?.event) return;
        if (data.event === 'onError' && [100, 101, 150].includes(Number(data.info))) {
          setYtHardBlocked(true);
        }
      } catch { /* ignore */ }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [playing, type]);

  const Bg = thumbSrc ? (
    <div className="absolute inset-0">
      <img src={thumbSrc} alt="" className="w-full h-full object-cover" onError={handleThumbError} />
      <div className={`absolute inset-0 bg-gradient-to-br ${thumbnailColor} opacity-10`} />
    </div>
  ) : (
    <div className={`absolute inset-0 bg-gradient-to-br ${thumbnailColor}`} />
  );

  const handleClick = () => onDoubleTap?.();

  if (type === 'none' || !url) {
    return (
      <div className="absolute inset-0" onClick={handleClick}>
        {Bg}
        <div className="absolute inset-0 flex items-center justify-center">
          <Play className="w-16 h-16 text-white/20" />
        </div>
      </div>
    );
  }

  if (!playing) {
    return (
      <div className="absolute inset-0" onClick={handleClick}>
        {Bg}
        <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center gap-3">
          <button
            onClick={e => { e.stopPropagation(); setPlaying(true); }}
            className="w-20 h-20 rounded-full bg-black/60 backdrop-blur-sm border-2 border-white/70 flex items-center justify-center hover:scale-110 transition-transform shadow-2xl"
          >
            <Play className="w-9 h-9 text-white fill-white ml-1" />
          </button>
          {type === 'youtube' && (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-red-600/90 backdrop-blur-sm text-white text-sm font-semibold hover:bg-red-600 transition-all hover:scale-105 shadow-lg"
            >
              <ExternalLink className="w-4 h-4" />
              شاهد على يوتيوب
            </a>
          )}
        </div>
      </div>
    );
  }

  if (type === 'youtube') {
    if (ytHardBlocked) {
      return (
        <div className="absolute inset-0" onClick={handleClick}>
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
    return (
      <div className="absolute inset-0 bg-black">
        {Bg}
        {!iframeLoaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10 pointer-events-none">
            <Loader2 className="w-10 h-10 text-white/60 animate-spin" />
            <p className="text-white/50 text-xs">جاري تحميل الفيديو...</p>
          </div>
        )}
        <iframe
          ref={iframeRef}
          src={getYouTubeEmbedUrl(url)}
          className={`absolute inset-0 w-full h-full transition-opacity duration-500 ${iframeLoaded ? 'opacity-100' : 'opacity-0'}`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          onLoad={() => setIframeLoaded(true)}
        />
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={e => e.stopPropagation()}
          className="absolute bottom-3 right-3 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-sm border border-white/20 text-white/80 text-xs hover:text-white hover:bg-black/80 transition-all"
        >
          <ExternalLink className="w-3 h-3" />
          يوتيوب
        </a>
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
          playsInline
          className="absolute inset-0 w-full h-full object-contain"
          onError={() => setVideoError(true)}
        />
        {videoError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/60">
            <Play className="w-10 h-10 text-white/30" />
            <p className="text-white/60 text-sm">تعذّر تشغيل الفيديو</p>
          </div>
        )}
      </div>
    );
  }

  // External URL: try native <video> first, then iframe
  if (type === 'external' && !videoError) {
    return (
      <div className="absolute inset-0 bg-black">
        {Bg}
        <video
          src={url}
          autoPlay
          controls
          playsInline
          className="absolute inset-0 w-full h-full object-contain"
          onError={() => setVideoError(true)}
        />
      </div>
    );
  }

  // External iframe fallback
  return (
    <div className="absolute inset-0 bg-black">
      {Bg}
      {!iframeLoaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10 pointer-events-none">
          <Loader2 className="w-10 h-10 text-white/60 animate-spin" />
          <p className="text-white/60 text-xs">جاري التحميل...</p>
        </div>
      )}
      <iframe
        ref={iframeRef}
        src={url}
        className={`absolute inset-0 w-full h-full transition-opacity duration-300 ${iframeLoaded ? 'opacity-100' : 'opacity-0'}`}
        allowFullScreen
        allow="autoplay; fullscreen; encrypted-media"
        onLoad={() => setIframeLoaded(true)}
      />
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={e => e.stopPropagation()}
        className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/40 backdrop-blur-sm border border-white/20 text-white/70 text-xs hover:text-white hover:bg-black/60 transition-all z-10"
      >
        <ExternalLink className="w-3 h-3" />
        فتح
      </a>
    </div>
  );
}
