import { useState } from 'react';
import { useData, Video } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLang } from '@/contexts/LangContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Users, Video as VideoIcon, Sparkles, X, Star, Briefcase, Calendar, Award, Play, Heart, Eye, Bookmark, MessageCircle, Send, UserPlus, UserCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import VideoPlayer from '@/components/VideoPlayer';

interface UserProfile {
  user_id: string;
  name: string;
  department: string;
  avatar?: string;
  bio?: string;
  rating: number;
  total_ratings: number;
  followers: number;
  videos_count: number;
  years_experience: number;
  skills: string[];
  points?: number;
}

export default function ExplorePage() {
  const { categories, videos, profiles, likedVideos, savedVideos, followedUsers, toggleLike, toggleSave, toggleFollow, addComment } = useData();
  const { user } = useAuth();
  const { T } = useLang();
  const [query, setQuery] = useState('');
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<UserProfile | null>(null);
  const [commentText, setCommentText] = useState('');
  const [showComments, setShowComments] = useState(false);

  const approvedVideos = videos.filter(v => v.status === 'approved');

  const filteredVideos = query
    ? approvedVideos.filter(v =>
        v.title.toLowerCase().includes(query.toLowerCase()) ||
        v.tags.some(t => t.toLowerCase().includes(query.toLowerCase())) ||
        v.user_name.toLowerCase().includes(query.toLowerCase()) ||
        v.category.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const filteredProfiles = query
    ? profiles.filter(p =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.department.toLowerCase().includes(query.toLowerCase()) ||
        p.skills.some(s => s.toLowerCase().includes(query.toLowerCase()))
      )
    : [];

  const getCategoryIcon = (catName: string) =>
    categories.find(c => c.name === catName)?.icon || '📁';

  const getYouTubeThumbnail = (url: string): string | null => {
    if (!url) return null;
    const watchMatch = url.match(/[?&]v=([a-zA-Z0-9_-]+)/);
    const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
    const id = watchMatch?.[1] || shortMatch?.[1];
    return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
  };

  const handleVideoSelect = (v: Video) => {
    setSelectedVideo(v);
    setShowComments(false);
    setCommentText('');
  };

  const submitComment = () => {
    if (!selectedVideo || !commentText.trim()) return;
    addComment(selectedVideo.id, user?.name || 'Anonymous', commentText.trim());
    setCommentText('');
  };

  const currentVideoLiked = selectedVideo ? likedVideos.has(selectedVideo.id) : false;
  const currentVideoSaved = selectedVideo ? savedVideos.has(selectedVideo.id) : false;
  const currentVideoFollowing = selectedVideo ? followedUsers.has(selectedVideo.user_id) : false;
  const currentProfileFollowing = selectedProfile ? followedUsers.has(selectedProfile.user_id) : false;

  const currentVideo = selectedVideo ? videos.find(v => v.id === selectedVideo.id) || selectedVideo : null;

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8">
      <div className="max-w-lg mx-auto p-6">
        <h1 className="text-2xl font-display font-bold text-foreground mb-6">{T.explore.title}</h1>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={T.explore.searchPlaceholder}
            className="pl-10 bg-secondary/50 border-border/50 h-12"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* ── No search: show categories & experts ── */}
        {!query && (
          <>
            <h2 className="text-lg font-display font-semibold text-foreground mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" /> {T.explore.categories}
            </h2>
            <div className="grid grid-cols-2 gap-3 mb-8">
              {categories.map((c, i) => (
                <motion.button
                  key={c.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => setQuery(c.name)}
                  className="bg-card rounded-xl border border-border/50 p-4 text-left hover:border-primary/30 transition-colors"
                >
                  <span className="text-2xl mb-2 block">{c.icon}</span>
                  <p className="text-sm font-semibold text-foreground">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.count} videos</p>
                </motion.button>
              ))}
            </div>

            <h2 className="text-lg font-display font-semibold text-foreground mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" /> {T.explore.topExperts}
            </h2>
            <div className="space-y-3">
              {profiles.map(p => (
                <motion.button
                  key={p.user_id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => setSelectedProfile(p as UserProfile)}
                  className="w-full bg-card rounded-xl border border-border/50 p-4 flex items-center gap-3 hover:border-primary/30 transition-colors text-left"
                >
                  <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold shrink-0 overflow-hidden">
                    {p.avatar
                      ? <img src={p.avatar} alt={p.name} className="w-12 h-12 rounded-full object-cover" />
                      : p.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground text-sm">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.department} • {p.years_experience} {T.explore.exp}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {p.skills.slice(0, 3).map(s => (
                        <span key={s} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{s}</span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-foreground font-bold text-sm">⭐ {p.rating}</p>
                    <p className="text-xs text-muted-foreground">{p.followers} {T.explore.followers}</p>
                  </div>
                </motion.button>
              ))}
            </div>
          </>
        )}

        {/* ── Search results ── */}
        {query && (
          <>
            {filteredProfiles.length > 0 && (
              <>
                <h2 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4" /> {T.explore.people}
                  <span className="text-xs bg-secondary px-2 py-0.5 rounded-full">{filteredProfiles.length}</span>
                </h2>
                <div className="space-y-4 mb-6">
                  {(() => {
                    const grouped: Record<string, typeof filteredProfiles> = {};
                    filteredProfiles.forEach(p => {
                      const dept = p.department || 'Other';
                      if (!grouped[dept]) grouped[dept] = [];
                      grouped[dept].push(p);
                    });
                    return Object.entries(grouped).map(([dept, people], gi) => (
                      <div key={dept}>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-base">{getCategoryIcon(dept)}</span>
                          <span className="text-xs font-bold text-primary uppercase tracking-wide">{dept}</span>
                          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{people.length}</span>
                          <div className="flex-1 h-px bg-border/40" />
                        </div>
                        <div className="space-y-2">
                          {people.map((p, i) => (
                            <motion.button
                              key={p.user_id}
                              initial={{ opacity: 0, y: 6 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: (gi * 3 + i) * 0.04 }}
                              onClick={() => setSelectedProfile(p as UserProfile)}
                              className="w-full bg-card rounded-xl border border-border/50 p-3 flex items-center gap-3 hover:border-primary/30 transition-colors text-left group"
                            >
                              <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-sm font-bold shrink-0 overflow-hidden">
                                {p.avatar
                                  ? <img src={p.avatar} alt={p.name} className="w-10 h-10 rounded-full object-cover" />
                                  : p.name.charAt(0)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{p.name}</p>
                                <div className="flex items-center gap-2 flex-wrap mt-0.5">
                                  <span className="text-xs text-muted-foreground">{p.department}</span>
                                  {p.skills.slice(0, 2).map(s => (
                                    <span key={s} className="text-xs bg-secondary text-muted-foreground px-1.5 py-0.5 rounded-full">{s}</span>
                                  ))}
                                </div>
                              </div>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                                <Star className="w-3 h-3 text-warning fill-warning" />
                                {p.rating}
                              </div>
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </>
            )}

            {filteredVideos.length > 0 && (
              <>
                <h2 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                  <VideoIcon className="w-4 h-4" /> {T.explore.videos}
                  <span className="text-xs bg-secondary px-2 py-0.5 rounded-full">{filteredVideos.length}</span>
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  {filteredVideos.map((v, i) => {
                    const yt = getYouTubeThumbnail(v.video_url);
                    return (
                      <motion.button
                        key={v.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.04 }}
                        onClick={() => handleVideoSelect(v)}
                        className="relative aspect-[9/16] rounded-xl overflow-hidden text-left group"
                      >
                        {yt ? (
                          <img src={yt} alt={v.title} className="absolute inset-0 w-full h-full object-cover" />
                        ) : (
                          <div className={`absolute inset-0 bg-gradient-to-br ${v.thumbnail_color}`} />
                        )}
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-sm border border-white/40 flex items-center justify-center">
                            <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                          </div>
                        </div>
                        <div className="absolute top-2 left-2">
                          <span className="text-xs bg-black/50 backdrop-blur-sm text-white px-2 py-1 rounded-full font-medium flex items-center gap-1">
                            <span>{getCategoryIcon(v.category)}</span>
                            <span className="max-w-[60px] truncate">{v.category}</span>
                          </span>
                        </div>
                        <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                          <p className="text-xs font-semibold text-white line-clamp-2 leading-snug">{v.title}</p>
                          <p className="text-xs text-white/70 mt-0.5 truncate">{v.user_name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="flex items-center gap-0.5 text-xs text-white/60">
                              <Heart className="w-3 h-3" /> {v.likes}
                            </span>
                            <span className="flex items-center gap-0.5 text-xs text-white/60">
                              <Eye className="w-3 h-3" /> {v.views}
                            </span>
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </>
            )}

            {filteredVideos.length === 0 && filteredProfiles.length === 0 && (
              <div className="text-center py-16">
                <Search className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">{T.explore.noResults} "{query}"</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Video Preview Modal ── */}
      <AnimatePresence>
        {selectedVideo && currentVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={e => { if (e.target === e.currentTarget) { setSelectedVideo(null); setShowComments(false); } }}
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
                <div className="flex items-center gap-3 flex-1 min-w-0 mr-2">
                  <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-sm font-bold shrink-0 overflow-hidden">
                    {currentVideo.user_avatar
                      ? <img src={currentVideo.user_avatar} alt={currentVideo.user_name} className="w-full h-full object-cover" />
                      : currentVideo.user_name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display font-bold text-foreground truncate text-sm">{currentVideo.title}</h3>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-xs text-muted-foreground">{currentVideo.user_name}</p>
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                        {getCategoryIcon(currentVideo.category)} {currentVideo.category}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => { setSelectedVideo(null); setShowComments(false); }}
                  className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-secondary transition-colors shrink-0"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              {/* Video */}
              <div className="relative aspect-video bg-black shrink-0">
                <VideoPlayer
                  videoUrl={currentVideo.video_url}
                  thumbnailColor={currentVideo.thumbnail_color}
                />
              </div>

              {/* Actions row */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border/20 shrink-0">
                <div className="flex items-center gap-4">
                  {/* Like */}
                  <button
                    onClick={() => toggleLike(currentVideo.id)}
                    className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${currentVideoLiked ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    <Heart className={`w-5 h-5 ${currentVideoLiked ? 'fill-primary' : ''}`} />
                    <span>{currentVideo.likes}</span>
                  </button>
                  {/* Save */}
                  <button
                    onClick={() => toggleSave(currentVideo.id)}
                    className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${currentVideoSaved ? 'text-warning' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    <Bookmark className={`w-5 h-5 ${currentVideoSaved ? 'fill-warning' : ''}`} />
                    <span>{currentVideo.saves}</span>
                  </button>
                  {/* Comment toggle */}
                  <button
                    onClick={() => setShowComments(v => !v)}
                    className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${showComments ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span>{currentVideo.comments.length}</span>
                  </button>
                </div>
                {/* Follow */}
                {currentVideo.user_id !== user?.id && (
                  <Button
                    size="sm"
                    variant={currentVideoFollowing ? 'secondary' : 'default'}
                    onClick={() => toggleFollow(currentVideo.user_id)}
                    className={`h-8 text-xs px-3 gap-1.5 ${!currentVideoFollowing ? 'gradient-primary text-primary-foreground' : ''}`}
                  >
                    {currentVideoFollowing ? <UserCheck className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
                    {currentVideoFollowing ? T.feed.following : T.feed.follow}
                  </Button>
                )}
              </div>

              {/* Description & tags */}
              <div className="px-4 py-3 shrink-0">
                {currentVideo.description && (
                  <p className="text-sm text-foreground/80 mb-2 line-clamp-2">{currentVideo.description}</p>
                )}
                {currentVideo.tags.length > 0 && (
                  <div className="flex gap-1 flex-wrap">
                    {currentVideo.tags.slice(0, 4).map(t => (
                      <span key={t} className="text-xs bg-secondary px-2 py-0.5 rounded-full">#{t}</span>
                    ))}
                  </div>
                )}
              </div>

              {/* Comments section */}
              <AnimatePresence>
                {showComments && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-border/20 flex flex-col overflow-hidden"
                    style={{ maxHeight: '220px' }}
                  >
                    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
                      {currentVideo.comments.length === 0 && (
                        <p className="text-muted-foreground text-xs text-center py-2">No comments yet</p>
                      )}
                      {currentVideo.comments.map(c => (
                        <div key={c.id} className="flex gap-2">
                          <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-secondary-foreground shrink-0">
                            {c.user_name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-foreground">{c.user_name}</p>
                            <p className="text-xs text-foreground/80">{c.text}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="px-4 pb-3 flex gap-2 shrink-0">
                      <Input
                        value={commentText}
                        onChange={e => setCommentText(e.target.value)}
                        placeholder="Add a comment..."
                        className="bg-secondary/50 border-border/50 h-9 text-sm"
                        onKeyDown={e => e.key === 'Enter' && submitComment()}
                      />
                      <Button size="icon" onClick={submitComment} className="gradient-primary text-primary-foreground h-9 w-9 shrink-0">
                        <Send className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── User Profile Modal ── */}
      <AnimatePresence>
        {selectedProfile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center"
            onClick={e => { if (e.target === e.currentTarget) setSelectedProfile(null); }}
          >
            <motion.div
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-card w-full md:max-w-md rounded-t-3xl md:rounded-2xl border border-border/50 shadow-2xl max-h-[85vh] overflow-y-auto"
            >
              {/* Gradient header */}
              <div className="gradient-primary p-6 pb-10 relative">
                <button
                  onClick={() => setSelectedProfile(null)}
                  className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>

              {/* Avatar overlap */}
              <div className="px-6 -mt-8 relative z-10">
                <div className="flex items-end justify-between gap-4 mb-4">
                  <div className="flex items-end gap-4">
                    <div className="w-16 h-16 rounded-2xl border-2 border-card overflow-hidden gradient-primary flex items-center justify-center text-primary-foreground text-xl font-bold shrink-0">
                      {selectedProfile.avatar
                        ? <img src={selectedProfile.avatar} alt={selectedProfile.name} className="w-full h-full object-cover" />
                        : selectedProfile.name.charAt(0)}
                    </div>
                    <div className="mb-2">
                      <h2 className="text-lg font-display font-bold text-foreground">{selectedProfile.name}</h2>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Briefcase className="w-3.5 h-3.5" />
                        {selectedProfile.department}
                      </div>
                    </div>
                  </div>

                  {/* Follow button */}
                  {selectedProfile.user_id !== user?.id && (
                    <Button
                      size="sm"
                      variant={currentProfileFollowing ? 'secondary' : 'default'}
                      onClick={() => toggleFollow(selectedProfile.user_id)}
                      className={`mb-2 shrink-0 gap-1.5 ${!currentProfileFollowing ? 'gradient-primary text-primary-foreground' : ''}`}
                    >
                      {currentProfileFollowing ? <UserCheck className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                      {currentProfileFollowing ? T.feed.following : T.feed.follow}
                    </Button>
                  )}
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-4">
                  <Star className="w-4 h-4 text-warning fill-warning" />
                  <span className="font-semibold text-foreground text-sm">{selectedProfile.rating}</span>
                  <span className="text-muted-foreground text-xs">({selectedProfile.total_ratings} {T.explore.ratings || 'ratings'})</span>
                </div>

                {/* Bio */}
                {selectedProfile.bio && (
                  <p className="text-sm text-foreground/80 mb-4">{selectedProfile.bio}</p>
                )}

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {[
                    { icon: VideoIcon, label: T.profile.videos, value: selectedProfile.videos_count },
                    { icon: Users, label: T.profile.followers, value: profiles.find(p => p.user_id === selectedProfile.user_id)?.followers ?? selectedProfile.followers },
                    { icon: Calendar, label: T.profile.experience, value: `${selectedProfile.years_experience}${T.profile.yr}` },
                  ].map(s => (
                    <div key={s.label} className="text-center p-3 bg-secondary/30 rounded-xl">
                      <s.icon className="w-4 h-4 text-primary mx-auto mb-1" />
                      <p className="text-foreground font-bold text-base">{s.value}</p>
                      <p className="text-muted-foreground text-xs">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Skills */}
                {selectedProfile.skills?.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-primary" /> {T.profile.skills}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedProfile.skills.map(s => (
                        <span key={s} className="text-xs bg-primary/15 text-primary px-3 py-1.5 rounded-full font-medium">{s}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Their videos */}
                {(() => {
                  const userVideos = videos.filter(v => v.user_id === selectedProfile.user_id && v.status === 'approved');
                  if (!userVideos.length) return null;
                  return (
                    <div className="mb-6">
                      <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-1.5">
                        <VideoIcon className="w-4 h-4 text-primary" /> {selectedProfile.name}'s Videos
                      </h3>
                      <div className="grid grid-cols-2 gap-2">
                        {userVideos.slice(0, 4).map(v => {
                          const yt = getYouTubeThumbnail(v.video_url);
                          return (
                            <button
                              key={v.id}
                              onClick={() => { setSelectedProfile(null); setTimeout(() => handleVideoSelect(v), 200); }}
                              className="aspect-[9/16] rounded-xl overflow-hidden relative group"
                            >
                              {yt ? (
                                <img src={yt} alt={v.title} className="w-full h-full object-cover" />
                              ) : (
                                <div className={`w-full h-full bg-gradient-to-br ${v.thumbnail_color}`} />
                              )}
                              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Play className="w-8 h-8 text-white fill-white" />
                              </div>
                              <div className="absolute top-1.5 left-1.5">
                                <span className="text-xs bg-black/50 text-white px-1.5 py-0.5 rounded-full">
                                  {getCategoryIcon(v.category)}
                                </span>
                              </div>
                              <div className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-black/70 to-transparent">
                                <p className="text-xs font-semibold text-white line-clamp-2">{v.title}</p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
