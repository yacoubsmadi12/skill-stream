import { useState } from 'react';
import { useData, Video } from '@/contexts/DataContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Bookmark, Play, Heart, Eye, X, Trash2 } from 'lucide-react';
import VideoPlayer from '@/components/VideoPlayer';

export default function SavedPage() {
  const { videos, savedVideos, toggleSave, categories } = useData();
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  const saved = videos.filter(v => savedVideos.has(v.id));

  const getCategoryIcon = (catName: string) =>
    categories.find(c => c.name === catName)?.icon || '📁';

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8">
      <div className="max-w-lg mx-auto p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
            <Bookmark className="w-5 h-5 text-primary-foreground fill-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Favorites</h1>
            <p className="text-sm text-muted-foreground">{saved.length} saved video{saved.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        {/* Empty state */}
        {saved.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-24 gap-4"
          >
            <div className="w-20 h-20 rounded-2xl bg-secondary/50 flex items-center justify-center">
              <Bookmark className="w-10 h-10 text-muted-foreground/40" />
            </div>
            <div className="text-center">
              <p className="text-foreground font-semibold text-lg">No saved videos yet</p>
              <p className="text-muted-foreground text-sm mt-1">
                Tap the bookmark icon on any video to save it here.
              </p>
            </div>
          </motion.div>
        )}

        {/* Video grid */}
        {saved.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            {saved.map((video, i) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="relative aspect-[9/16] rounded-2xl overflow-hidden group cursor-pointer"
                onClick={() => setSelectedVideo(video)}
              >
                {/* Thumbnail */}
                <div className={`absolute inset-0 bg-gradient-to-br ${video.thumbnail_color}`} />

                {/* Play overlay */}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-sm border border-white/40 flex items-center justify-center">
                    <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                  </div>
                </div>

                {/* Category badge */}
                <div className="absolute top-2 left-2">
                  <span className="text-xs bg-black/40 backdrop-blur-sm text-white px-2 py-1 rounded-full font-medium flex items-center gap-1">
                    <span>{getCategoryIcon(video.category)}</span>
                    <span className="max-w-[50px] truncate">{video.category}</span>
                  </span>
                </div>

                {/* Remove button */}
                <button
                  onClick={e => { e.stopPropagation(); toggleSave(video.id); }}
                  className="absolute top-2 right-2 w-7 h-7 bg-black/50 hover:bg-destructive rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
                >
                  <Trash2 className="w-3.5 h-3.5 text-white" />
                </button>

                {/* Bottom info */}
                <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                  <p className="text-xs font-semibold text-white line-clamp-2 leading-snug">{video.title}</p>
                  <p className="text-xs text-white/70 mt-0.5 truncate">{video.user_name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="flex items-center gap-0.5 text-xs text-white/60">
                      <Heart className="w-3 h-3" /> {video.likes}
                    </span>
                    <span className="flex items-center gap-0.5 text-xs text-white/60">
                      <Eye className="w-3 h-3" /> {video.views}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Video preview modal */}
      <AnimatePresence>
        {selectedVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={e => { if (e.target === e.currentTarget) setSelectedVideo(null); }}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-card rounded-2xl border border-border/50 shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="flex items-center justify-between p-4 border-b border-border/30">
                <div className="flex-1 min-w-0 mr-2">
                  <h3 className="font-display font-bold text-foreground truncate">{selectedVideo.title}</h3>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <p className="text-xs text-muted-foreground">{selectedVideo.user_name}</p>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full flex items-center gap-1">
                      {getCategoryIcon(selectedVideo.category)} {selectedVideo.category}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedVideo(null)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-secondary transition-colors shrink-0"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              <div className="relative aspect-video bg-black">
                <VideoPlayer
                  videoUrl={selectedVideo.video_url}
                  thumbnailColor={selectedVideo.thumbnail_color}
                />
              </div>

              <div className="p-4">
                {selectedVideo.description && (
                  <p className="text-sm text-foreground/80 mb-3 line-clamp-2">{selectedVideo.description}</p>
                )}
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1"><Heart className="w-4 h-4" /> {selectedVideo.likes}</span>
                    <span className="flex items-center gap-1"><Eye className="w-4 h-4" /> {selectedVideo.views}</span>
                  </div>
                  <button
                    onClick={() => { toggleSave(selectedVideo.id); setSelectedVideo(null); }}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-warning/15 text-warning hover:bg-warning/25 transition-colors"
                  >
                    <Bookmark className="w-3.5 h-3.5 fill-warning" /> Remove from favorites
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
