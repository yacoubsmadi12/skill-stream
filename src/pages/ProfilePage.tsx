import { useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { useLang } from '@/contexts/LangContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Video, Users, Award, Briefcase, Calendar, Pencil, X, Camera, Plus, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

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

export default function ProfilePage() {
  const { user } = useAuth();
  const { profiles, videos, updateProfile } = useData();
  const { T } = useLang();
  const { toast } = useToast();

  const profile = profiles.find(p => p.user_id === user?.id);
  const userVideos = videos.filter(v => v.user_id === user?.id);

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [editName, setEditName] = useState('');
  const [editDept, setEditDept] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editYears, setEditYears] = useState(0);
  const [editSkills, setEditSkills] = useState<string[]>([]);
  const [editAvatar, setEditAvatar] = useState('');
  const [skillInput, setSkillInput] = useState('');

  const avatarInputRef = useRef<HTMLInputElement>(null);

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
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Invalid file', description: 'Please select an image file', variant: 'destructive' });
      return;
    }
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
            <button
              onClick={openEdit}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white text-sm font-medium transition-colors"
              data-testid="button-edit-profile"
            >
              <Pencil className="w-3.5 h-3.5" />
              {T.profile.editProfile}
            </button>
          </div>
        </div>

        {/* Profile card */}
        <div className="px-6 -mt-14">
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
              {[
                { label: T.profile.videos, value: userVideos.length, icon: Video },
                { label: T.profile.followers, value: profile?.followers || 0, icon: Users },
                { label: T.profile.experience, value: `${profile?.years_experience || 0}${T.profile.yr}`, icon: Calendar },
              ].map(s => (
                <div key={s.label} className="text-center p-3 bg-secondary/30 rounded-xl">
                  <s.icon className="w-4 h-4 text-primary mx-auto mb-1" />
                  <p className="text-foreground font-bold text-lg">{s.value}</p>
                  <p className="text-muted-foreground text-xs">{s.label}</p>
                </div>
              ))}
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

        {/* Videos grid */}
        <div className="px-6 mt-6">
          <h3 className="text-lg font-display font-semibold text-foreground mb-4">{T.profile.myVideos}</h3>
          {userVideos.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">{T.profile.noVideos}</p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {userVideos.map(v => (
                <div key={v.id} className={`aspect-[9/16] rounded-xl bg-gradient-to-br ${v.thumbnail_color} p-3 flex flex-col justify-end`} data-testid={`card-video-${v.id}`}>
                  <p className="text-xs font-semibold text-foreground line-clamp-2">{v.title}</p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-foreground/70">
                    <span>❤️ {v.likes}</span>
                    <span>👁️ {v.views}</span>
                  </div>
                  <span className={`text-xs mt-1 px-2 py-0.5 rounded-full inline-block w-fit ${statusColor(v.status)}`}>
                    {v.status === 'approved' ? T.common.approved : v.status === 'pending' ? T.common.pending : T.common.rejected}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

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
              {/* Modal header */}
              <div className="flex items-center justify-between p-5 border-b border-border/30 sticky top-0 bg-card z-10">
                <h2 className="text-lg font-display font-bold text-foreground">{T.profile.editProfile}</h2>
                <button onClick={() => setEditing(false)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-secondary transition-colors" data-testid="button-close-edit">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              <div className="p-5 space-y-5">
                {/* Avatar */}
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
                      data-testid="button-change-avatar"
                    >
                      <Camera className="w-3.5 h-3.5 text-white" />
                    </button>
                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarChange}
                      data-testid="input-avatar"
                    />
                  </div>
                  <button
                    onClick={() => avatarInputRef.current?.click()}
                    className="text-xs text-primary hover:underline"
                  >
                    {T.profile.changeAvatar}
                  </button>
                </div>

                {/* Name */}
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block font-medium">{T.profile.name}</label>
                  <Input
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    className="bg-secondary/50 border-border/50"
                    data-testid="input-edit-name"
                  />
                </div>

                {/* Department */}
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block font-medium">{T.profile.department}</label>
                  <Input
                    value={editDept}
                    onChange={e => setEditDept(e.target.value)}
                    className="bg-secondary/50 border-border/50"
                    data-testid="input-edit-dept"
                  />
                </div>

                {/* Bio */}
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block font-medium">{T.profile.bio}</label>
                  <textarea
                    value={editBio}
                    onChange={e => setEditBio(e.target.value)}
                    rows={3}
                    className="w-full bg-secondary/50 border border-border/50 rounded-lg p-3 text-foreground text-sm resize-none focus:border-primary focus:outline-none"
                    data-testid="input-edit-bio"
                  />
                </div>

                {/* Years of Experience */}
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block font-medium">{T.profile.yearsExp}</label>
                  <Input
                    type="number"
                    min={0}
                    max={50}
                    value={editYears}
                    onChange={e => setEditYears(parseInt(e.target.value) || 0)}
                    className="bg-secondary/50 border-border/50"
                    data-testid="input-edit-years"
                  />
                </div>

                {/* Skills */}
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block font-medium">{T.profile.skills}</label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={skillInput}
                      onChange={e => setSkillInput(e.target.value)}
                      placeholder={T.profile.addSkill}
                      className="bg-secondary/50 border-border/50"
                      onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                      data-testid="input-skill"
                    />
                    <Button onClick={addSkill} variant="secondary" size="icon" data-testid="button-add-skill">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {editSkills.map(s => (
                      <span key={s} className="text-xs bg-primary/15 text-primary px-3 py-1.5 rounded-full font-medium flex items-center gap-1.5">
                        {s}
                        <button onClick={() => removeSkill(s)} data-testid={`button-remove-skill-${s}`}>
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => setEditing(false)}
                    className="flex-1"
                    data-testid="button-cancel-edit"
                  >
                    {T.profile.cancel}
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={saving || !editName.trim()}
                    className="flex-1 gradient-primary text-white"
                    data-testid="button-save-profile"
                  >
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
