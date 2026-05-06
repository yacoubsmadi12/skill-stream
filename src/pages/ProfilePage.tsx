import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData, Video as VideoType } from '@/contexts/DataContext';
import { useLang } from '@/contexts/LangContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Video, Users, Award, Briefcase, Calendar, Pencil, X, Camera, Plus, Check, Trash2, Trophy, TrendingUp, Share2, Zap, Bell, Heart, Bookmark, MessageCircle, UserPlus, Shield, Play, Clock, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { getBadge, getNextBadge, shareOnLinkedIn, BADGES, POINTS_RULES } from '@/lib/badges';
import { playNotificationSound } from '@/lib/notificationSound';

function Avatar({ avatar, name, size = 'md' }: { avatar?: string; name?: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClass = size === 'lg' ? 'w-20 h-20 text-2xl' : size === 'sm' ? 'w-10 h-10 text-base' : 'w-16 h-16 text-xl';
  if (avatar) {
    return <img src={avatar} alt={name} className={`${sizeClass} rounded-2xl object-cover`} />;
  }
  return (
    <div className={`${sizeClass} rounded-2xl gradient-primary flex items-center justify-center text-primary-foreground font-bold shrink-0`}>
      {name?.charAt(0) || 'U'}
    </div>
  );
}

function notifIcon(type: string) {
  if (type === 'like') return <Heart className="w-4 h-4 text-primary fill-primary" />;
  if (type === 'save') return <Bookmark className="w-4 h-4 text-warning fill-warning" />;
  if (type === 'comment') return <MessageCircle className="w-4 h-4 text-blue-400" />;
  if (type === 'follow') return <UserPlus className="w-4 h-4 text-success" />;
  if (type === 'admin_video') return <Shield className="w-4 h-4 text-primary" />;
  return <Bell className="w-4 h-4 text-muted-foreground" />;
}

function notifText(type: string, actorName: string, videoTitle: string) {
  if (type === 'like') return `${actorName} liked your video "${videoTitle}"`;
  if (type === 'save') return `${actorName} saved your video "${videoTitle}"`;
  if (type === 'comment') return `${actorName} commented on "${videoTitle}"`;
  if (type === 'follow') return `${actorName} started following you`;
  if (type === 'admin_video') return `📢 فيديو جديد من فريق الإدارة يستحق المشاهدة: "${videoTitle}"`;
  return `${actorName} interacted with your content`;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const { profiles, videos, updateProfile, deleteVideo, pointsHistory, loadPointsHistory, notifications, loadNotifications, markNotificationRead, markAllNotificationsRead, followersList, loadFollowers, toggleLike, likedVideos, fetchVideoLikers, fetchVideoSavers, fetchVideoViewers } = useData();
  const { T } = useLang();
  const { toast } = useToast();

  const profile = profiles.find(p => p.user_id === user?.id);
  const userVideos = videos.filter(v => v.user_id === user?.id);
  const points = profile?.points || 0;
  const currentBadge = getBadge(points);
  const nextBadge = getNextBadge(points);
  const progressPct = nextBadge
    ? Math.min(100, Math.round(((points - currentBadge.minPoints) / (nextBadge.minPoints - currentBadge.minPoints)) * 100))
    : 100;

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPoints, setShowPoints] = useState(false);
  const [showBadges, setShowBadges] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showFollowers, setShowFollowers] = useState(false);
  const [playingVideo, setPlayingVideo] = useState<VideoType | null>(null);

  type EngagementUser = { user_id: string; user_name: string; user_avatar?: string; created_at: string };
  const [engagementModal, setEngagementModal] = useState<{ type: 'likes' | 'saves' | 'views'; list: EngagementUser[] } | null>(null);
  const [engagementLoading, setEngagementLoading] = useState(false);

  const openEngagement = async (type: 'likes' | 'saves' | 'views', videoId: string) => {
    setEngagementLoading(true);
    try {
      const list = type === 'likes'
        ? await fetchVideoLikers(videoId)
        : type === 'saves'
        ? await fetchVideoSavers(videoId)
        : await fetchVideoViewers(videoId);
      setEngagementModal({ type, list });
    } catch { /* ignore */ }
    finally { setEngagementLoading(false); }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const prevUnreadRef = useRef(0);
  useEffect(() => {
    if (unreadCount > prevUnreadRef.current) {
      playNotificationSound();
    }
    prevUnreadRef.current = unreadCount;
  }, [unreadCount]);

  const [editName, setEditName] = useState('');
  const [editDept, setEditDept] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editYears, setEditYears] = useState(0);
  const [editSkills, setEditSkills] = useState<string[]>([]);
  const [editAvatar, setEditAvatar] = useState('');
  const [skillInput, setSkillInput] = useState('');

  const avatarInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user?.id) {
      loadPointsHistory(user.id);
      loadNotifications(user.id);
    }
  }, [user?.id]);

  const openEdit = () => {
    setEditName(profile?.name || user?.name || '');
    setEditDept(profile?.department || user?.department || '');
    setEditBio(profile?.bio || '');
    setEditYears(profile?.years_experience || 0);
    setEditSkills(profile?.skills ? [...profile.skills] : []);
    setEditAvatar(profile?.avatar || '');
    setEditing(true);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onloadend = () => setEditAvatar(reader.result as string);
    reader.readAsDataURL(file);
  };

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !editSkills.includes(s)) {
      setEditSkills(prev => [...prev, s]);
      setSkillInput('');
    }
  };

  const removeSkill = (s: string) => setEditSkills(prev => prev.filter(x => x !== s));

  const handleSave = async () => {
    if (!user || !editName.trim()) return;
    setSaving(true);
    try {
      await updateProfile(user.id, {
        name: editName.trim(),
        department: editDept.trim(),
        bio: editBio.trim(),
        years_experience: editYears,
        skills: editSkills,
        avatar: editAvatar,
      });
      setEditing(false);
      toast({ title: '✅ ' + T.profile.saveChanges, description: 'Profile updated successfully' });
    } catch {
      toast({ title: 'Error', description: 'Failed to save changes', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const statusColor = (s: string) =>
    s === 'approved' ? 'bg-success/20 text-success' :
    s === 'pending' ? 'bg-warning/20 text-warning' :
    'bg-destructive/20 text-destructive';

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="gradient-primary p-8 pb-20 relative">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-display font-bold text-primary-foreground">{T.profile.title}</h1>
            <div className="flex items-center gap-2">
              {/* Notifications bell */}
              <button
                onClick={() => { setShowNotifications(true); }}
                className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive text-white text-[10px] font-bold flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              <button
                onClick={openEdit}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white text-sm font-medium transition-colors"
              >
                <Pencil className="w-3.5 h-3.5" />
                {T.profile.editProfile}
              </button>
            </div>
          </div>
        </div>

        {/* Profile card */}
        <div className="px-6 -mt-14 relative z-10">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-card rounded-2xl p-6 border border-border/50 shadow-card"
          >
            <div className="flex items-start gap-4 mb-4">
              <Avatar avatar={profile?.avatar} name={user?.name} size="lg" />
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-display font-bold text-foreground">{profile?.name || user?.name}</h2>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Briefcase className="w-3.5 h-3.5" />
                  {profile?.department || user?.department}
                </div>
                {profile && (
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="w-4 h-4 text-warning fill-warning" />
                    <span className="text-foreground font-semibold text-sm">{profile.rating}</span>
                    <span className="text-muted-foreground text-xs">({profile.total_ratings} ratings)</span>
                  </div>
                )}
              </div>
            </div>

            {profile?.bio && (
              <p className="text-sm text-foreground/80 mb-4">{profile.bio}</p>
            )}

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center p-3 bg-secondary/30 rounded-xl">
                <Video className="w-4 h-4 text-primary mx-auto mb-1" />
                <p className="text-foreground font-bold text-lg">{userVideos.length}</p>
                <p className="text-muted-foreground text-xs">{T.profile.videos}</p>
              </div>
              <button
                onClick={() => { loadFollowers(user!.id); setShowFollowers(true); }}
                className="text-center p-3 bg-secondary/30 rounded-xl hover:bg-primary/10 hover:border hover:border-primary/20 transition-all cursor-pointer"
              >
                <Users className="w-4 h-4 text-primary mx-auto mb-1" />
                <p className="text-foreground font-bold text-lg">{profile?.followers || 0}</p>
                <p className="text-muted-foreground text-xs">{T.profile.followers}</p>
              </button>
              <div className="text-center p-3 bg-secondary/30 rounded-xl">
                <Calendar className="w-4 h-4 text-primary mx-auto mb-1" />
                <p className="text-foreground font-bold text-lg">{profile?.years_experience || 0}{T.profile.yr}</p>
                <p className="text-muted-foreground text-xs">{T.profile.experience}</p>
              </div>
            </div>

            {/* Skills */}
            {profile?.skills && profile.skills.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-primary" /> {T.profile.skills}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map(s => (
                    <span key={s} className="text-xs bg-primary/15 text-primary px-3 py-1.5 rounded-full font-medium">{s}</span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* ── Badge & Points Card ── */}
        <div className="px-6 mt-4">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className={`rounded-2xl p-5 bg-gradient-to-br ${currentBadge.gradient} relative overflow-hidden`}
          >
            {/* Background decoration */}
            <div className="absolute top-0 right-0 text-[120px] opacity-10 leading-none select-none pointer-events-none">
              {currentBadge.icon}
            </div>

            <div className="relative z-10">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-white/70 text-xs font-medium mb-0.5">Zain Knowledge Badge</p>
                  <div className="flex items-center gap-2">
                    <span className="text-3xl">{currentBadge.icon}</span>
                    <div>
                      <h3 className="text-white font-bold text-xl leading-none">{currentBadge.name}</h3>
                      <p className="text-white/70 text-xs mt-0.5">{currentBadge.description}</p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white/70 text-xs">Your Points</p>
                  <p className="text-white font-bold text-2xl leading-none">{points.toLocaleString()}</p>
                  <p className="text-white/60 text-xs">pts</p>
                </div>
              </div>

              {/* Progress to next badge */}
              {nextBadge && (
                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs text-white/70 mb-1.5">
                    <span>Progress toward {nextBadge.icon} {nextBadge.name}</span>
                    <span>{nextBadge.minPoints - points} pts remaining</span>
                  </div>
                  <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPct}%` }}
                      transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
                      className="h-full bg-white rounded-full"
                    />
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => shareOnLinkedIn(currentBadge, profile?.name || user?.name || '')}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-gray-800 font-semibold text-sm hover:bg-white/90 transition-all hover:scale-105 shadow-md"
                >
                  <Share2 className="w-4 h-4" />
                  Share on LinkedIn
                </button>
                <button
                  onClick={() => setShowPoints(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/20 text-white font-semibold text-sm hover:bg-white/30 transition-all border border-white/30"
                >
                  <TrendingUp className="w-4 h-4" />
                  Points History
                </button>
                <button
                  onClick={() => setShowBadges(true)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/20 text-white font-semibold text-sm hover:bg-white/30 transition-all border border-white/30"
                >
                  <Trophy className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Points earning rules */}
        <div className="px-6 mt-4">
          <div className="bg-card rounded-2xl p-4 border border-border/50">
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              How do you earn points?
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {POINTS_RULES.map(rule => (
                <div key={rule.action} className="flex items-center justify-between bg-secondary/30 rounded-lg px-3 py-2">
                  <span className="text-xs text-muted-foreground">{rule.label}</span>
                  <span className="text-xs font-bold text-primary">+{rule.points}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Videos grid */}
        <div className="px-6 mt-6">
          <h3 className="text-lg font-display font-semibold text-foreground mb-4">{T.profile.myVideos}</h3>
          {userVideos.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">{T.profile.noVideos}</p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {userVideos.map(v => (
                <div
                  key={v.id}
                  className={`aspect-[9/16] rounded-xl bg-gradient-to-br ${v.thumbnail_color} p-3 flex flex-col justify-end relative group cursor-pointer`}
                  onClick={() => setPlayingVideo(v)}
                >
                  {/* Video preview thumbnail */}
                  {v.video_url && (v.video_url.startsWith('/uploads/') || v.video_url.startsWith('blob:') || v.video_url.startsWith('data:video/')) && (
                    <video
                      src={v.video_url}
                      className="absolute inset-0 w-full h-full object-cover rounded-xl opacity-60"
                      preload="metadata"
                      muted
                      playsInline
                      onLoadedMetadata={e => { (e.target as HTMLVideoElement).currentTime = 0.5; }}
                    />
                  )}
                  <div className="absolute inset-0 bg-black/30 rounded-xl" />
                  {/* Play button */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <div className="w-12 h-12 rounded-full bg-white/30 backdrop-blur-sm border-2 border-white/70 flex items-center justify-center">
                      <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                    </div>
                  </div>
                  {/* Delete button */}
                  <button
                    onClick={e => { e.stopPropagation(); deleteVideo(v.id); }}
                    className="absolute top-2 right-2 w-7 h-7 bg-black/50 hover:bg-destructive rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-white" />
                  </button>
                  {/* Info */}
                  <div className="relative z-10">
                    <p className="text-xs font-semibold text-white line-clamp-2">{v.title}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-white/80">
                      <span>❤️ {v.likes}</span>
                      <span>👁️ {v.views}</span>
                    </div>
                    <span className={`text-xs mt-1 px-2 py-0.5 rounded-full inline-block w-fit ${statusColor(v.status)}`}>
                      {v.status === 'approved' ? T.common.approved : v.status === 'pending' ? T.common.pending : T.common.rejected}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Points History Modal */}
      {/* ── Video Player Modal ── */}
      <AnimatePresence>
        {playingVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black/90 flex flex-col"
            onClick={e => { if (e.target === e.currentTarget) setPlayingVideo(null); }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 pt-4 pb-2 z-10">
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-semibold text-base line-clamp-1">{playingVideo.title}</h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor(playingVideo.status)}`}>
                    {playingVideo.status === 'approved' ? T.common.approved : playingVideo.status === 'pending' ? T.common.pending : T.common.rejected}
                  </span>
                  {playingVideo.status === 'pending' && (
                    <span className="text-white/50 text-xs flex items-center gap-1">
                      <Clock className="w-3 h-3" /> في انتظار موافقة الأدمن
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setPlayingVideo(null)}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center ml-3 shrink-0"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Player */}
            <div className="flex-1 flex items-center justify-center px-4 pb-4">
              {playingVideo.video_url && (
                playingVideo.video_url.startsWith('/uploads/') ||
                playingVideo.video_url.startsWith('data:video/') ||
                playingVideo.video_url.match(/\.(mp4|webm|ogg|mov|avi)(\?|$)/i)
              ) ? (
                <video
                  src={playingVideo.video_url}
                  controls
                  autoPlay
                  playsInline
                  className="max-h-full max-w-full rounded-xl object-contain"
                  style={{ maxHeight: 'calc(100vh - 120px)' }}
                />
              ) : playingVideo.video_url && playingVideo.video_url.match(/(?:youtube\.com|youtu\.be)/) ? (
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${
                    playingVideo.video_url.match(/[?&]v=([a-zA-Z0-9_-]+)/)?.[1] ||
                    playingVideo.video_url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/)?.[1] || ''
                  }?autoplay=1&rel=0`}
                  className="w-full rounded-xl"
                  style={{ aspectRatio: '16/9', maxHeight: 'calc(100vh - 120px)' }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
                  allowFullScreen
                />
              ) : (
                <div className={`w-full rounded-xl bg-gradient-to-br ${playingVideo.thumbnail_color} flex flex-col items-center justify-center gap-4`} style={{ aspectRatio: '9/16', maxHeight: 'calc(100vh - 120px)' }}>
                  <Play className="w-16 h-16 text-white/40" />
                  <p className="text-white/60 text-sm">لا يوجد ملف فيديو مرفق</p>
                </div>
              )}
            </div>

            {/* Meta + Like button */}
            <div className="px-4 pb-6 flex items-center gap-3">
              {/* Like button */}
              <button
                onClick={() => {
                  toggleLike(playingVideo.id);
                  setPlayingVideo(prev => prev ? {
                    ...prev,
                    likes: likedVideos.has(playingVideo.id) ? prev.likes - 1 : prev.likes + 1,
                  } : prev);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold transition-all ${likedVideos.has(playingVideo.id) ? 'bg-red-500 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}
              >
                <Heart className={`w-4 h-4 ${likedVideos.has(playingVideo.id) ? 'fill-white' : ''}`} />
                <span>{playingVideo.likes}</span>
              </button>

              {/* Clickable stats */}
              <button
                onClick={() => openEngagement('likes', playingVideo.id)}
                disabled={engagementLoading}
                className="flex items-center gap-1 text-white/60 hover:text-white/90 text-sm transition-colors"
                title="من أعجب"
              >
                <Users className="w-4 h-4" />
                <span>{playingVideo.likes}</span>
              </button>

              <button
                onClick={() => openEngagement('views', playingVideo.id)}
                disabled={engagementLoading}
                className="flex items-center gap-1 text-white/60 hover:text-white/90 text-sm transition-colors"
                title="من شاهد"
              >
                <Eye className="w-4 h-4" />
                <span>{playingVideo.views}</span>
              </button>

              <button
                onClick={() => openEngagement('saves', playingVideo.id)}
                disabled={engagementLoading}
                className="flex items-center gap-1 text-white/60 hover:text-white/90 text-sm transition-colors"
                title="من حفظ"
              >
                <Bookmark className="w-4 h-4" />
                <span>{playingVideo.saves}</span>
              </button>

              {engagementLoading && <span className="text-white/40 text-xs animate-pulse">جاري التحميل...</span>}

              {playingVideo.description && (
                <span className="flex-1 line-clamp-1 text-white/50 text-xs mr-auto">{playingVideo.description}</span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Engagement Modal (likers / savers / viewers) */}
      <AnimatePresence>
        {engagementModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-black/70 backdrop-blur-sm flex items-end md:items-center justify-center"
            onClick={e => { if (e.target === e.currentTarget) setEngagementModal(null); }}
          >
            <motion.div
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-[#1a1a2e] rounded-t-2xl md:rounded-2xl w-full max-w-sm max-h-[70vh] flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  {engagementModal.type === 'likes' && <><Heart className="w-5 h-5 text-red-400 fill-red-400" /><span className="text-white font-semibold">من أعجب بالفيديو</span></>}
                  {engagementModal.type === 'saves' && <><Bookmark className="w-5 h-5 text-yellow-400 fill-yellow-400" /><span className="text-white font-semibold">من حفظ الفيديو</span></>}
                  {engagementModal.type === 'views' && <><Eye className="w-5 h-5 text-blue-400" /><span className="text-white font-semibold">من شاهد الفيديو</span></>}
                  <span className="text-white/50 text-sm">({engagementModal.list.length})</span>
                </div>
                <button onClick={() => setEngagementModal(null)} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center">
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>

              {/* List */}
              <div className="flex-1 overflow-y-auto">
                {engagementModal.list.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-white/40">
                    {engagementModal.type === 'likes' && <Heart className="w-10 h-10 mb-2" />}
                    {engagementModal.type === 'saves' && <Bookmark className="w-10 h-10 mb-2" />}
                    {engagementModal.type === 'views' && <Eye className="w-10 h-10 mb-2" />}
                    <p className="text-sm">لا يوجد سجلات بعد</p>
                  </div>
                ) : (
                  <ul className="divide-y divide-white/5">
                    {engagementModal.list.map((u, i) => (
                      <li key={i} className="flex items-center gap-3 px-5 py-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shrink-0 overflow-hidden">
                          {u.user_avatar ? <img src={u.user_avatar} alt={u.user_name} className="w-full h-full object-cover" /> : u.user_name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium truncate">{u.user_name}</p>
                          <p className="text-white/40 text-xs">{new Date(u.created_at).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPoints && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center"
            onClick={e => { if (e.target === e.currentTarget) setShowPoints(false); }}
          >
            <motion.div
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-card w-full md:max-w-md rounded-t-3xl md:rounded-2xl border border-border/50 shadow-2xl max-h-[80vh] flex flex-col"
            >
              <div className="flex items-center justify-between p-5 border-b border-border/30">
                <div>
                  <h2 className="text-lg font-display font-bold text-foreground">Points History</h2>
                  <p className="text-sm text-primary font-semibold">{points.toLocaleString()} pts total</p>
                </div>
                <button onClick={() => setShowPoints(false)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-secondary transition-colors">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
              <div className="overflow-y-auto flex-1 p-4 space-y-2">
                {pointsHistory.length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-8">No points history yet</p>
                ) : (
                  pointsHistory.map(entry => (
                    <div key={entry.id} className="flex items-center justify-between bg-secondary/30 rounded-xl px-4 py-3">
                      <div>
                        <p className="text-sm text-foreground font-medium">{entry.description}</p>
                        <p className="text-xs text-muted-foreground">{new Date(entry.created_at).toLocaleDateString('en-US')}</p>
                      </div>
                      <span className="text-primary font-bold text-sm shrink-0">+{entry.points}</span>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* All Badges Modal */}
      <AnimatePresence>
        {showBadges && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center"
            onClick={e => { if (e.target === e.currentTarget) setShowBadges(false); }}
          >
            <motion.div
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-card w-full md:max-w-md rounded-t-3xl md:rounded-2xl border border-border/50 shadow-2xl max-h-[85vh] flex flex-col"
            >
              <div className="flex items-center justify-between p-5 border-b border-border/30">
                <h2 className="text-lg font-display font-bold text-foreground">Zain Knowledge Badges</h2>
                <button onClick={() => setShowBadges(false)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-secondary transition-colors">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
              <div className="overflow-y-auto flex-1 p-4 space-y-3">
                {BADGES.map(badge => {
                  const unlocked = points >= badge.minPoints;
                  return (
                    <div
                      key={badge.id}
                      className={`rounded-2xl p-4 border transition-all ${
                        unlocked
                          ? `bg-gradient-to-br ${badge.gradient} border-transparent`
                          : 'bg-secondary/20 border-border/30 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-4xl">{badge.icon}</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className={`font-bold text-base ${unlocked ? 'text-white' : 'text-foreground'}`}>
                              {badge.name}
                            </h3>
                            {unlocked && currentBadge.id === badge.id && (
                              <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full">Current</span>
                            )}
                          </div>
                          <p className={`text-xs mt-0.5 ${unlocked ? 'text-white/70' : 'text-muted-foreground'}`}>
                            {badge.description}
                          </p>
                          <p className={`text-xs mt-1 font-medium ${unlocked ? 'text-white/80' : 'text-muted-foreground'}`}>
                            {badge.minPoints === 0 ? 'Free for everyone' : `${badge.minPoints.toLocaleString()} pts`}
                          </p>
                        </div>
                        {unlocked && (
                          <button
                            onClick={() => shareOnLinkedIn(badge, profile?.name || user?.name || '')}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-gray-800 font-semibold text-xs hover:bg-white/90 transition-all shrink-0"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                            Share
                          </button>
                        )}
                        {!unlocked && (
                          <div className="text-xs text-muted-foreground text-right shrink-0">
                            <p>Need</p>
                            <p className="font-bold">{(badge.minPoints - points).toLocaleString()}</p>
                            <p>pts</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notifications Modal */}
      <AnimatePresence>
        {showNotifications && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center"
            onClick={e => { if (e.target === e.currentTarget) setShowNotifications(false); }}
          >
            <motion.div
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-card w-full md:max-w-md rounded-t-3xl md:rounded-2xl border border-border/50 shadow-2xl max-h-[80vh] flex flex-col"
            >
              <div className="flex items-center justify-between p-5 border-b border-border/30 shrink-0">
                <div>
                  <h2 className="text-lg font-display font-bold text-foreground flex items-center gap-2">
                    <Bell className="w-5 h-5 text-primary" />
                    Notifications
                  </h2>
                  {unreadCount > 0 && (
                    <p className="text-xs text-muted-foreground mt-0.5">{unreadCount} unread</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={() => user?.id && markAllNotificationsRead(user.id)}
                      className="text-xs text-primary hover:underline font-medium"
                    >
                      Mark all read
                    </button>
                  )}
                  <button onClick={() => setShowNotifications(false)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-secondary transition-colors">
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
              </div>
              <div className="overflow-y-auto flex-1 p-3 space-y-2">
                {notifications.length === 0 ? (
                  <div className="text-center py-12">
                    <Bell className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
                    <p className="text-muted-foreground text-sm">No notifications yet</p>
                    <p className="text-muted-foreground/60 text-xs mt-1">When someone likes, saves, comments, or follows you — it'll appear here</p>
                  </div>
                ) : (
                  notifications.map(n => {
                    const linkedVideo = n.video_id ? videos.find(v => v.id === n.video_id) : null;
                    return (
                    <button
                      key={n.id}
                      onClick={() => {
                        if (!n.read) markNotificationRead(n.id);
                        if (linkedVideo) {
                          setShowNotifications(false);
                          setPlayingVideo(linkedVideo);
                        }
                      }}
                      className={`w-full flex items-start gap-3 rounded-xl px-4 py-3 text-left transition-colors ${n.read ? 'bg-secondary/20 hover:bg-secondary/30' : 'bg-primary/5 border border-primary/10 hover:bg-primary/10'} ${linkedVideo ? 'cursor-pointer' : 'cursor-default'}`}
                    >
                      <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center shrink-0 overflow-hidden">
                        {n.actor_avatar
                          ? <img src={n.actor_avatar} alt={n.actor_name} className="w-full h-full object-cover" />
                          : <span className="text-sm font-bold text-secondary-foreground">{n.actor_name.charAt(0)}</span>
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          {notifIcon(n.type)}
                          <p className="text-sm text-foreground line-clamp-2">{notifText(n.type, n.actor_name, n.video_title)}</p>
                        </div>
                        <p className="text-xs text-muted-foreground">{new Date(n.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                        {linkedVideo && (
                          <p className="text-xs text-primary/70 mt-0.5 flex items-center gap-1">
                            <Play className="w-3 h-3" />
                            انقر لمشاهدة الفيديو
                          </p>
                        )}
                      </div>
                      {!n.read && (
                        <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
                      )}
                    </button>
                    );
                  })
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Followers Modal */}
      <AnimatePresence>
        {showFollowers && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center"
            onClick={e => { if (e.target === e.currentTarget) setShowFollowers(false); }}
          >
            <motion.div
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-card w-full md:max-w-md rounded-t-3xl md:rounded-2xl border border-border/50 shadow-2xl max-h-[80vh] flex flex-col"
            >
              <div className="flex items-center justify-between p-5 border-b border-border/30 shrink-0">
                <div>
                  <h2 className="text-lg font-display font-bold text-foreground flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    {T.profile.followers}
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">{profile?.followers || 0} followers</p>
                </div>
                <button onClick={() => setShowFollowers(false)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-secondary transition-colors">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
              <div className="overflow-y-auto flex-1 p-3 space-y-2">
                {followersList.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
                    <p className="text-muted-foreground text-sm">No followers yet</p>
                    <p className="text-muted-foreground/60 text-xs mt-1">When someone follows you, they'll appear here</p>
                  </div>
                ) : (
                  followersList.map(f => (
                    <div key={f.user_id} className="flex items-center gap-3 rounded-xl px-4 py-3 bg-secondary/20">
                      <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-sm shrink-0 overflow-hidden">
                        {f.avatar
                          ? <img src={f.avatar} alt={f.name} className="w-full h-full object-cover" />
                          : f.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground">{f.name}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Briefcase className="w-3 h-3" /> {f.department}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                        <Star className="w-3 h-3 text-warning fill-warning" />
                        {f.rating}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {editing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4"
            onClick={e => { if (e.target === e.currentTarget) setEditing(false); }}
          >
            <motion.div
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-card w-full md:max-w-md rounded-t-3xl md:rounded-2xl border border-border/50 shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between p-5 border-b border-border/30 sticky top-0 bg-card z-10">
                <h2 className="text-lg font-display font-bold text-foreground">{T.profile.editProfile}</h2>
                <button onClick={() => setEditing(false)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-secondary transition-colors">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              <div className="p-5 space-y-5">
                <div className="flex flex-col items-center gap-3">
                  <div className="relative">
                    {editAvatar ? (
                      <img src={editAvatar} alt="avatar" className="w-20 h-20 rounded-2xl object-cover" />
                    ) : (
                      <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center text-primary-foreground text-2xl font-bold">
                        {editName.charAt(0) || 'U'}
                      </div>
                    )}
                    <button
                      onClick={() => avatarInputRef.current?.click()}
                      className="absolute -bottom-2 -right-2 w-7 h-7 rounded-lg bg-primary flex items-center justify-center shadow-md hover:bg-primary/90 transition-colors"
                    >
                      <Camera className="w-3.5 h-3.5 text-white" />
                    </button>
                    <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                  </div>
                  <button onClick={() => avatarInputRef.current?.click()} className="text-xs text-primary hover:underline">
                    {T.profile.changeAvatar}
                  </button>
                </div>

                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block font-medium">{T.profile.name}</label>
                  <Input value={editName} onChange={e => setEditName(e.target.value)} className="bg-secondary/50 border-border/50" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block font-medium">{T.profile.department}</label>
                  <Input value={editDept} onChange={e => setEditDept(e.target.value)} className="bg-secondary/50 border-border/50" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block font-medium">{T.profile.bio}</label>
                  <textarea
                    value={editBio}
                    onChange={e => setEditBio(e.target.value)}
                    rows={3}
                    className="w-full bg-secondary/50 border border-border/50 rounded-lg p-3 text-foreground text-sm resize-none focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block font-medium">{T.profile.yearsExp}</label>
                  <Input type="number" min={0} max={50} value={editYears} onChange={e => setEditYears(parseInt(e.target.value) || 0)} className="bg-secondary/50 border-border/50" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block font-medium">{T.profile.skills}</label>
                  <div className="flex gap-2 mb-2">
                    <Input value={skillInput} onChange={e => setSkillInput(e.target.value)} placeholder={T.profile.addSkill} className="bg-secondary/50 border-border/50" onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())} />
                    <Button onClick={addSkill} variant="secondary" size="icon"><Plus className="w-4 h-4" /></Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {editSkills.map(s => (
                      <span key={s} className="text-xs bg-primary/15 text-primary px-3 py-1.5 rounded-full font-medium flex items-center gap-1.5">
                        {s}
                        <button onClick={() => removeSkill(s)}><X className="w-3 h-3" /></button>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button variant="outline" onClick={() => setEditing(false)} className="flex-1">{T.profile.cancel}</Button>
                  <Button onClick={handleSave} disabled={saving || !editName.trim()} className="flex-1 gradient-primary text-white">
                    {saving ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        {T.profile.saving}
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Check className="w-4 h-4" />
                        {T.profile.saveChanges}
                      </span>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
