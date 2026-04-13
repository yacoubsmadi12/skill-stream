import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { motion } from 'framer-motion';
import { Star, Video, Users, Award, MapPin, Briefcase, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ProfilePage() {
  const { user } = useAuth();
  const { profiles, videos, followedUsers, toggleFollow } = useData();
  
  const profile = profiles.find(p => p.userId === user?.id);
  const userVideos = videos.filter(v => v.userId === user?.id);

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="gradient-primary p-8 pb-20 relative">
          <h1 className="text-xl font-display font-bold text-primary-foreground">My Profile</h1>
        </div>

        {/* Profile card */}
        <div className="px-6 -mt-14">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-card rounded-2xl p-6 border border-border/50 shadow-card"
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center text-primary-foreground text-xl font-bold shrink-0">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-display font-bold text-foreground">{user?.name}</h2>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Briefcase className="w-3.5 h-3.5" />
                  {user?.department}
                </div>
                {profile && (
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="w-4 h-4 text-warning fill-warning" />
                    <span className="text-foreground font-semibold text-sm">{profile.rating}</span>
                    <span className="text-muted-foreground text-xs">({profile.totalRatings} ratings)</span>
                  </div>
                )}
              </div>
            </div>

            {profile?.bio && (
              <p className="text-sm text-foreground/80 mb-4">{profile.bio}</p>
            )}

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              {[
                { label: 'Videos', value: userVideos.length, icon: Video },
                { label: 'Followers', value: profile?.followers || 0, icon: Users },
                { label: 'Experience', value: `${profile?.yearsExperience || 0}y`, icon: Calendar },
              ].map(s => (
                <div key={s.label} className="text-center p-3 bg-secondary/30 rounded-xl">
                  <s.icon className="w-4 h-4 text-primary mx-auto mb-1" />
                  <p className="text-foreground font-bold text-lg">{s.value}</p>
                  <p className="text-muted-foreground text-xs">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Skills */}
            {profile?.skills && (
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-primary" /> Skills
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

        {/* Videos grid */}
        <div className="px-6 mt-6">
          <h3 className="text-lg font-display font-semibold text-foreground mb-4">My Videos</h3>
          {userVideos.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">No videos yet</p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {userVideos.map(v => (
                <div key={v.id} className={`aspect-[9/16] rounded-xl bg-gradient-to-br ${v.thumbnailColor} p-3 flex flex-col justify-end`}>
                  <p className="text-xs font-semibold text-foreground line-clamp-2">{v.title}</p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-foreground/70">
                    <span>❤️ {v.likes}</span>
                    <span>👁️ {v.views}</span>
                  </div>
                  <span className={`text-xs mt-1 px-2 py-0.5 rounded-full inline-block w-fit ${
                    v.status === 'approved' ? 'bg-success/20 text-success' :
                    v.status === 'pending' ? 'bg-warning/20 text-warning' :
                    'bg-destructive/20 text-destructive'
                  }`}>
                    {v.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
