import { useState } from 'react';
import { useData, Video } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLang } from '@/contexts/LangContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Bookmark, Play, Heart, Eye, X, Trash2, MessageCircle, Send, UserPlus, UserCheck } from 'lucide-react';
import VideoPlayer from '@/components/VideoPlayer';
import { Input } from '@/components/ui/input';

export default function SavedPage() {
  const { videos, savedVideos, likedVideos, followedUsers, toggleSave, toggleLike, toggleFollow, addComment, categories } = useData();
  const { user } = useAuth();
  const { T } = useLang();
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [commentText, setCommentText] = useState('');
  const [showComments, setShowComments] = useState(false);

  const saved = videos.filter(v => savedVideos.has(v.id));

  const getCategoryIcon = (catName: string) =>
    categories.find(c => c.name === catName)?.icon || '📁';

  const currentVideo = selectedVideo ? videos.find(v => v.id === selectedVideo.id) ?? selectedVideo : null;
  const isLiked = currentVideo ? likedVideos.has(currentVideo.id) : false;
  const isSaved = currentVideo ? savedVideos.has(currentVideo.id) : false;
  const isFollowing = currentVideo ? followedUsers.has(currentVideo.user_id) : false;

  const submitComment = () => {
    if (!currentVideo || !commentText.trim()) return;
    addComment(currentVideo.id, user?.name || 'Anonymous', commentText.trim());
    setCommentText('');
  };

  const handleClose = () => {
    setSelectedVideo(null);
    setShowComments(false);
    setCommentText('');
  };

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
                onClick={() => { setSelectedVideo(video); setShowComments(false); }}
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

      {/* Video modal */}
      <AnimatePresence>
        {currentVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={e => { if (e.target === e.currentTarget) handleClose(); }}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-card rounded-2xl border border-border/50 shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-border/30 shrink-0">
                <div className="flex-1 min-w-0 mr-2">
                  <h3 className="font-display font-bold text-foreground truncate">{currentVideo.title}</h3>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <p className="text-xs text-muted-foreground">{currentVideo.user_name}</p>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full flex items-center gap-1">
                      {getCategoryIcon(currentVideo.category)} {currentVideo.category}
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-secondary transition-colors shrink-0"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              {/* Video player */}
              <div className="relative aspect-video bg-black shrink-0">
                <VideoPlayer
                  videoUrl={currentVideo.video_url}
                  thumbnailColor={currentVideo.thumbnail_color}
                />
              </div>

              {/* Actions bar */}
              <div className="flex items-center gap-1 px-4 py-3 border-b border-border/30 shrink-0">
                {/* Like */}
                <button
                  onClick={() => toggleLike(currentVideo.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${isLiked ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'}`}
                >
                  <Heart className={`w-4 h-4 ${isLiked ? 'fill-primary' : ''}`} />
                  <span>{currentVideo.likes}</span>
                </button>

                {/* Comments toggle */}
                <button
                  onClick={() => setShowComments(v => !v)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${showComments ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'}`}
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>{currentVideo.comments?.length ?? 0}</span>
                </button>

                {/* Views */}
                <span className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-muted-foreground">
                  <Eye className="w-4 h-4" />
                  <span>{currentVideo.views}</span>
                </span>

                <div className="flex-1" />

                {/* Follow */}
                {currentVideo.user_id !== user?.id && (
                  <button
                    onClick={() => toggleFollow(currentVideo.user_id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${isFollowing ? 'bg-secondary text-foreground' : 'gradient-primary text-primary-foreground'}`}
                  >
                    {isFollowing ? <UserCheck className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
                    {isFollowing ? T.feed.following : T.feed.follow}
                  </button>
                )}

                {/* Save / unsave */}
                <button
                  onClick={() => { toggleSave(currentVideo.id); if (isSaved) handleClose(); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-warning/15 text-warning hover:bg-warning/25 transition-colors"
                >
                  <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-warning' : ''}`} />
                  {isSaved ? 'Unsave' : 'Save'}
                </button>
              </div>

              {/* Description */}
              {currentVideo.description && (
                <div className="px-4 pt-3 shrink-0">
                  <p className="text-sm text-foreground/80 line-clamp-2">{currentVideo.description}</p>
                </div>
              )}

              {/* Comments section */}
              <AnimatePresence>
                {showComments && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pt-3 pb-1">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">{T.feed.comments}</p>
                      <div className="space-y-2 max-h-36 overflow-y-auto scrollbar-hide">
                        {(!currentVideo.comments || currentVideo.comments.length === 0) ? (
                          <p className="text-xs text-muted-foreground py-2">{T.feed.noComments}</p>
                        ) : (
                          currentVideo.comments.map(c => (
                            <div key={c.id} className="flex gap-2">
                              <div className="w-6 h-6 rounded-full gradient-primary shrink-0 flex items-center justify-center text-[10px] font-bold text-primary-foreground">
                                {c.user_name[0]?.toUpperCase()}
                              </div>
                              <div>
                                <span className="text-xs font-semibold text-foreground">{c.user_name} </span>
                                <span className="text-xs text-foreground/80">{c.text}</span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                    <div className="px-4 pb-4 pt-2 flex gap-2">
                      <Input
                        value={commentText}
                        onChange={e => setCommentText(e.target.value)}
                        placeholder={T.feed.addComment}
                        className="bg-secondary/50 border-border/50 text-sm h-9"
                        onKeyDown={e => e.key === 'Enter' && submitComment()}
                      />
                      <button
                        onClick={submitComment}
                        disabled={!commentText.trim()}
                        className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center disabled:opacity-40 shrink-0"
                      >
                        <Send className="w-4 h-4 text-primary-foreground" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
