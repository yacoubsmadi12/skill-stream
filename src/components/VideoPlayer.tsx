import { useState, useRef, useEffect } from 'react';
import { Play, ExternalLink } from 'lucide-react';

function getVideoType(url: string): 'youtube' | 'vimeo' | 'video' | 'external' | 'none' {
  if (!url) return 'none';
  if (url.match(/(?:youtube\.com|youtu\.be)/)) return 'youtube';
  if (url.match(/(?:vimeo\.com|player\.vimeo\.com)/)) return 'vimeo';
  if (url.startsWith('data:video/') || url.match(/\.(mp4|webm|ogg|mov|avi)(\?|$)/i)) return 'video';
  if (url.startsWith('http') || url.startsWith('https')) return 'external';
  return 'none';
}

function getYouTubeEmbedUrl(url: string): string {
  const watchMatch = url.match(/[?&]v=([a-zA-Z0-9_-]+)/);
  const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
  const embedMatch = url.match(/\/embed\/([a-zA-Z0-9_-]+)/);
  const shortsMatch = url.match(/\/shorts\/([a-zA-Z0-9_-]+)/);
  const liveMatch = url.match(/\/live\/([a-zA-Z0-9_-]+)/);
  const id = watchMatch?.[1] || shortMatch?.[1] || embedMatch?.[1] || shortsMatch?.[1] || liveMatch?.[1] || '';
  return `https://www.youtube.com/embed/${id}?autoplay=1&mute=0&rel=0&playsinline=1&enablejsapi=1`;
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
  const [iframeBlocked, setIframeBlocked] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [ytBlocked, setYtBlocked] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const blockTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const type = getVideoType(url);

  // Reset state when url changes
  useEffect(() => {
    setPlaying(false);
    setIframeBlocked(false);
    setIframeLoaded(false);
    setVideoError(false);
    setYtBlocked(false);
  }, [url]);

  const Bg = <div className={`absolute inset-0 bg-gradient-to-br ${thumbnailColor}`} />;

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
    if (playing && type === 'external' && videoError) {
      blockTimerRef.current = setTimeout(() => {
        if (!iframeLoaded) setIframeBlocked(true);
      }, 5000);
    }
    return () => { if (blockTimerRef.current) clearTimeout(blockTimerRef.current); };
  }, [playing, type, iframeLoaded, videoError]);

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
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            onClick={e => { e.stopPropagation(); setPlaying(true); }}
            className="w-20 h-20 rounded-full bg-black/40 backdrop-blur-sm border-2 border-white/60 flex items-center justify-center hover:scale-110 transition-transform"
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
        <iframe
          src={getYouTubeEmbedUrl(url)}
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
      <div className="absolute inset-0" onClick={handleClick}>
        {Bg}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6">
          <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center mb-1">
            <ExternalLink className="w-7 h-7 text-white/80" />
          </div>
          <p className="text-white font-semibold text-base text-center">Cannot embed this video</p>
          <p className="text-white/50 text-xs text-center max-w-[220px]">This site blocks embedding. Watch the video directly:</p>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 text-white font-semibold text-sm hover:bg-white/30 transition-all hover:scale-105 shadow-lg"
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
        className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/40 backdrop-blur-sm border border-white/20 text-white/70 text-xs hover:text-white hover:bg-black/60 transition-all z-10"
      >
        <ExternalLink className="w-3 h-3" />
        Open
      </a>
    </div>
  );
}
