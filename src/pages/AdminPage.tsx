import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLang } from '@/contexts/LangContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Video, MessageSquare, FolderOpen, Settings, BarChart3,
  Check, X, Trash2, Plus, Server, TestTube, Shield, LogOut, Play, Eye,
  ToggleLeft, ToggleRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import VideoPlayer from '@/components/VideoPlayer';

type Tab = 'overview' | 'users' | 'videos' | 'requests' | 'categories' | 'ldap';

export default function AdminPage() {
  const { user, logout } = useAuth();
  const { videos, requests, categories, profiles, updateVideoStatus, deleteVideo, addCategory, deleteCategory, settings, updateSettings } = useData();
  const { T } = useLang();
  const [tab, setTab] = useState<Tab>('overview');
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('📁');
  const [ldapConfig, setLdapConfig] = useState({
    host: 'ldap.company.local',
    port: '389',
    baseDN: 'dc=company,dc=local',
    bindDN: 'cn=admin,dc=company,dc=local',
  });
  const [ldapTestResult, setLdapTestResult] = useState<string | null>(null);
  const [previewVideo, setPreviewVideo] = useState<typeof videos[0] | null>(null);
  const [toggling, setToggling] = useState(false);

  const approvalRequired = settings.approval_required === 'true';

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'overview', label: T.admin.title, icon: BarChart3 },
    { id: 'users', label: T.admin.users, icon: Users },
    { id: 'videos', label: T.admin.videos, icon: Video },
    { id: 'requests', label: T.admin.requestsMgmt, icon: MessageSquare },
    { id: 'categories', label: T.admin.categoriesMgmt, icon: FolderOpen },
    { id: 'ldap', label: T.admin.ldap, icon: Settings },
  ];

  const stats = [
    { label: T.admin.totalUsers, value: profiles.length, icon: Users, color: 'text-primary' },
    { label: T.admin.totalVideos, value: videos.length, icon: Video, color: 'text-accent' },
    { label: T.admin.requests, value: requests.length, icon: MessageSquare, color: 'text-success' },
    { label: T.admin.categories, value: categories.length, icon: FolderOpen, color: 'text-warning' },
  ];

  const testLdap = () => {
    setLdapTestResult('testing');
    setTimeout(() => setLdapTestResult('Demo mode: LDAP mock connection successful ✓'), 1500);
  };

  const handleToggleApproval = async () => {
    setToggling(true);
    await updateSettings({ approval_required: approvalRequired ? 'false' : 'true' });
    setToggling(false);
  };

  const statusColor = (s: string) =>
    s === 'approved' ? 'bg-success/15 text-success' :
    s === 'pending' ? 'bg-warning/15 text-warning' :
    'bg-destructive/15 text-destructive';

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 min-h-screen bg-card border-r border-border/50 p-4 hidden md:block">
          <div className="flex items-center gap-3 mb-8 px-2">
            <Shield className="w-8 h-8 text-primary" />
            <div>
              <h2 className="font-display font-bold text-foreground">Admin Panel</h2>
              <p className="text-xs text-muted-foreground">{user?.name}</p>
            </div>
          </div>

          <nav className="space-y-1">
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  tab === t.id ? 'gradient-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                }`}
              >
                <t.icon className="w-4 h-4" />
                {t.label}
              </button>
            ))}
          </nav>

          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-destructive hover:bg-destructive/10 mt-8 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            {T.nav.logout}
          </button>
        </div>

        {/* Mobile tabs */}
        <div className="md:hidden fixed top-0 inset-x-0 z-40 bg-card border-b border-border/50 p-2 flex gap-1 overflow-x-auto scrollbar-hide">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs whitespace-nowrap shrink-0 ${
                tab === t.id ? 'gradient-primary text-primary-foreground' : 'text-muted-foreground'
              }`}
            >
              <t.icon className="w-3.5 h-3.5" /> {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 p-6 pt-16 md:pt-6 max-w-5xl">

          {/* ── Overview ── */}
          {tab === 'overview' && (
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground mb-6">{T.admin.title}</h1>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {stats.map((s, i) => (
                  <motion.div
                    key={s.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-card rounded-xl border border-border/50 p-5"
                  >
                    <s.icon className={`w-6 h-6 ${s.color} mb-3`} />
                    <p className="text-2xl font-bold text-foreground">{s.value}</p>
                    <p className="text-sm text-muted-foreground">{s.label}</p>
                  </motion.div>
                ))}
              </div>

              {/* ── Approval Toggle ── */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-card rounded-xl border border-border/50 p-5 mb-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
                      <Shield className="w-5 h-5 text-primary" />
                      Video Approval Service
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {approvalRequired
                        ? '✅ Active — all videos require admin approval before publishing'
                        : '⚡ Disabled — videos are published directly without review'}
                    </p>
                  </div>
                  <button
                    onClick={handleToggleApproval}
                    disabled={toggling}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                      approvalRequired
                        ? 'bg-success/20 text-success hover:bg-success/30 border border-success/30'
                        : 'bg-warning/20 text-warning hover:bg-warning/30 border border-warning/30'
                    } ${toggling ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {approvalRequired
                      ? <><ToggleRight className="w-5 h-5" /> Active</>
                      : <><ToggleLeft className="w-5 h-5" /> Disabled</>
                    }
                  </button>
                </div>

                {/* Toggle explanation */}
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className={`rounded-lg p-3 border ${approvalRequired ? 'border-success/40 bg-success/10' : 'border-border/30 bg-secondary/20'}`}>
                    <p className="text-xs font-semibold text-foreground mb-1 flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-success" /> Enable Approval
                    </p>
                    <p className="text-xs text-muted-foreground">Video stays pending until admin approves</p>
                  </div>
                  <div className={`rounded-lg p-3 border ${!approvalRequired ? 'border-warning/40 bg-warning/10' : 'border-border/30 bg-secondary/20'}`}>
                    <p className="text-xs font-semibold text-foreground mb-1 flex items-center gap-1.5">
                      <Play className="w-3.5 h-3.5 text-warning" /> Disable Approval
                    </p>
                    <p className="text-xs text-muted-foreground">Video published directly without review</p>
                  </div>
                </div>
              </motion.div>

              {/* Recent activity */}
              <div className="bg-card rounded-xl border border-border/50 p-5">
                <h3 className="font-display font-semibold text-foreground mb-4">{T.admin.recentActivity}</h3>
                <div className="space-y-3">
                  {videos.slice(0, 5).map(v => (
                    <div key={v.id} className="flex items-center gap-3 text-sm">
                      <div className={`w-2 h-2 rounded-full ${v.status === 'approved' ? 'bg-success' : v.status === 'pending' ? 'bg-warning' : 'bg-destructive'}`} />
                      <span className="text-foreground">{v.user_name}</span>
                      <span className="text-muted-foreground">{T.admin.uploaded}</span>
                      <span className="text-foreground font-medium truncate">{v.title}</span>
                      <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${statusColor(v.status)}`}>
                        {v.status === 'approved' ? T.common.approved : v.status === 'pending' ? T.common.pending : T.common.rejected}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Users ── */}
          {tab === 'users' && (
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground mb-6">{T.admin.users}</h1>
              <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="text-left p-4 text-sm text-muted-foreground font-medium">{T.profile.name}</th>
                      <th className="text-left p-4 text-sm text-muted-foreground font-medium hidden md:table-cell">{T.profile.department}</th>
                      <th className="text-left p-4 text-sm text-muted-foreground font-medium">{T.explore.topExperts}</th>
                      <th className="text-left p-4 text-sm text-muted-foreground font-medium hidden md:table-cell">{T.profile.videos}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {profiles.map(p => (
                      <tr key={p.user_id} className="border-b border-border/30 last:border-0">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-xs font-bold">{p.name.charAt(0)}</div>
                            <div>
                              <p className="text-sm font-semibold text-foreground">{p.name}</p>
                              <p className="text-xs text-muted-foreground md:hidden">{p.department}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-sm text-foreground hidden md:table-cell">{p.department}</td>
                        <td className="p-4 text-sm text-foreground">⭐ {p.rating}</td>
                        <td className="p-4 text-sm text-foreground hidden md:table-cell">{p.videos_count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Videos ── */}
          {tab === 'videos' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-display font-bold text-foreground">{T.admin.videos}</h1>
                <div className="flex items-center gap-2 text-xs">
                  <span className="bg-warning/15 text-warning px-2 py-1 rounded-full font-medium">
                    {videos.filter(v => v.status === 'pending').length} awaiting review
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                {videos.map(v => (
                  <motion.div
                    key={v.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-card rounded-xl border border-border/50 p-4 flex items-center gap-4"
                  >
                    {/* Thumbnail — clickable for preview */}
                    <button
                      onClick={() => setPreviewVideo(v)}
                      className="relative w-20 h-14 rounded-lg shrink-0 group overflow-hidden"
                      title="Preview video"
                    >
                      {(() => {
                        const ytMatch = v.video_url?.match(/(?:v=|youtu\.be\/|\/embed\/|\/shorts\/|\/live\/)([a-zA-Z0-9_-]{11})/);
                        const ytId = ytMatch?.[1];
                        return ytId ? (
                          <img
                            src={`https://img.youtube.com/vi/${ytId}/mqdefault.jpg`}
                            alt={v.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className={`w-full h-full bg-gradient-to-br ${v.thumbnail_color}`} />
                        );
                      })()}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                        <Play className="w-5 h-5 text-white fill-white" />
                      </div>
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-foreground text-sm">{v.title}</p>
                        <span className="text-xs bg-secondary px-2 py-0.5 rounded-full text-muted-foreground">{v.category}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{v.user_name} • {v.user_department}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">❤️ {v.likes}</span>
                        <span className="text-xs text-muted-foreground">👁️ {v.views}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                      {/* Preview button */}
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setPreviewVideo(v)}
                        className="h-8 text-xs gap-1.5"
                      >
                        <Play className="w-3 h-3" /> Preview
                      </Button>

                      {v.status === 'pending' && (
                        <>
                          <Button size="sm" onClick={() => updateVideoStatus(v.id, 'approved')} className="bg-success text-success-foreground h-8 gap-1.5 text-xs">
                            <Check className="w-3.5 h-3.5" /> Approve
                          </Button>
                          <Button size="sm" onClick={() => updateVideoStatus(v.id, 'rejected')} variant="destructive" className="h-8 gap-1.5 text-xs">
                            <X className="w-3.5 h-3.5" /> Reject
                          </Button>
                        </>
                      )}

                      <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor(v.status)}`}>
                        {v.status === 'approved' ? T.common.approved : v.status === 'pending' ? T.common.pending : T.common.rejected}
                      </span>

                      <Button size="sm" variant="ghost" onClick={() => deleteVideo(v.id)} className="text-destructive h-8">
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* ── Requests ── */}
          {tab === 'requests' && (
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground mb-6">{T.admin.requestsMgmt}</h1>
              <div className="space-y-3">
                {requests.map(r => (
                  <div key={r.id} className="bg-card rounded-xl border border-border/50 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold text-foreground text-sm">{r.video_title}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        r.status === 'accepted' ? 'bg-success/15 text-success' :
                        r.status === 'pending' ? 'bg-warning/15 text-warning' :
                        r.status === 'completed' ? 'bg-primary/15 text-primary' :
                        'bg-destructive/15 text-destructive'
                      }`}>
                        {r.status === 'pending' ? T.common.pending : r.status === 'accepted' ? T.requests.accept : r.status === 'rejected' ? T.common.rejected : r.status === 'completed' ? T.requests.completed : r.status}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{r.from_user_name} → {r.to_user_name}</p>
                    <p className="text-sm text-foreground/80 mt-1">{r.description}</p>
                    <div className="flex gap-2 mt-2 text-xs">
                      <span className="bg-secondary px-2 py-0.5 rounded text-secondary-foreground capitalize">
                        {r.type === 'consultation' ? T.common.consultation : r.type === 'help' ? T.common.help : T.common.task}
                      </span>
                      <span className="bg-secondary px-2 py-0.5 rounded text-secondary-foreground capitalize">
                        {r.priority === 'low' ? T.common.low : r.priority === 'medium' ? T.common.medium : T.common.high}
                      </span>
                      {r.rating && <span className="text-warning">⭐ {r.rating}/5</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Categories ── */}
          {tab === 'categories' && (
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground mb-6">{T.admin.categoriesMgmt}</h1>
              <div className="bg-card rounded-xl border border-border/50 p-5 mb-6">
                <h3 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-primary" /> {T.admin.addCategory}
                </h3>
                <div className="flex gap-2">
                  <Input
                    value={newCatIcon}
                    onChange={e => setNewCatIcon(e.target.value)}
                    placeholder="Icon"
                    className="w-16 bg-secondary/50 border-border/50 text-center"
                  />
                  <Input
                    value={newCatName}
                    onChange={e => setNewCatName(e.target.value)}
                    placeholder={T.admin.categoryName}
                    className="flex-1 bg-secondary/50 border-border/50"
                  />
                  <Button
                    onClick={() => { if (newCatName.trim()) { addCategory(newCatName.trim(), newCatIcon); setNewCatName(''); } }}
                    className="gradient-primary text-primary-foreground"
                  >
                    {T.admin.add}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                {categories.map(c => (
                  <div key={c.id} className="bg-card rounded-xl border border-border/50 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{c.icon}</span>
                      <div>
                        <p className="font-semibold text-foreground text-sm">{c.name}</p>
                        <p className="text-xs text-muted-foreground">{c.count} {T.explore.videos}</p>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => deleteCategory(c.id)} className="text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── LDAP ── */}
          {tab === 'ldap' && (
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground mb-6">{T.admin.ldap}</h1>
              <div className="bg-card rounded-xl border border-border/50 p-6 max-w-xl">
                <div className="flex items-center gap-3 mb-6">
                  <Server className="w-6 h-6 text-primary" />
                  <div>
                    <h3 className="font-display font-semibold text-foreground">{T.admin.ldapSettings}</h3>
                    <p className="text-xs text-muted-foreground">{T.admin.ldapDesc}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    { key: 'host', label: 'LDAP Host', placeholder: 'ldap.company.local' },
                    { key: 'port', label: 'Port', placeholder: '389' },
                    { key: 'baseDN', label: 'Base DN', placeholder: 'dc=company,dc=local' },
                    { key: 'bindDN', label: 'Bind DN', placeholder: 'cn=admin,dc=company,dc=local' },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="text-sm text-muted-foreground mb-2 block">{f.label}</label>
                      <Input
                        value={ldapConfig[f.key as keyof typeof ldapConfig]}
                        onChange={e => setLdapConfig({ ...ldapConfig, [f.key]: e.target.value })}
                        placeholder={f.placeholder}
                        className="bg-secondary/50 border-border/50"
                      />
                    </div>
                  ))}

                  <div className="flex gap-3 pt-2">
                    <Button onClick={testLdap} variant="secondary" className="flex items-center gap-2">
                      <TestTube className="w-4 h-4" /> {T.admin.testConn}
                    </Button>
                    <Button className="gradient-primary text-primary-foreground">{T.admin.saveConfig}</Button>
                  </div>

                  {ldapTestResult && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`p-3 rounded-lg text-sm ${
                        ldapTestResult === 'testing' ? 'bg-secondary text-muted-foreground' : 'bg-success/15 text-success'
                      }`}
                    >
                      {ldapTestResult === 'testing' ? T.admin.testing : ldapTestResult}
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Video Preview Modal ── */}
      <AnimatePresence>
        {previewVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={e => { if (e.target === e.currentTarget) setPreviewVideo(null); }}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-card rounded-2xl border border-border/50 shadow-2xl w-full max-w-2xl overflow-hidden"
            >
              {/* Modal header */}
              <div className="flex items-center justify-between p-4 border-b border-border/30">
                <div>
                  <h3 className="font-display font-bold text-foreground">{previewVideo.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{previewVideo.user_name} • {previewVideo.category}</p>
                </div>
                <button
                  onClick={() => setPreviewVideo(null)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-secondary transition-colors"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              {/* Video player */}
              <div className="relative aspect-video bg-black">
                <VideoPlayer videoUrl={previewVideo.video_url} thumbnailColor={previewVideo.thumbnail_color} />
              </div>

              {/* Action bar */}
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span>❤️ {previewVideo.likes}</span>
                  <span>👁️ {previewVideo.views}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    previewVideo.status === 'approved' ? 'bg-success/15 text-success' :
                    previewVideo.status === 'pending' ? 'bg-warning/15 text-warning' :
                    'bg-destructive/15 text-destructive'
                  }`}>
                    {previewVideo.status === 'approved' ? T.common.approved : previewVideo.status === 'pending' ? T.common.pending : T.common.rejected}
                  </span>
                </div>
                {previewVideo.status === 'pending' && (
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => { updateVideoStatus(previewVideo.id, 'approved'); setPreviewVideo(null); }}
                      className="bg-success text-success-foreground gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" /> Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => { updateVideoStatus(previewVideo.id, 'rejected'); setPreviewVideo(null); }}
                      className="gap-1.5"
                    >
                      <X className="w-3.5 h-3.5" /> Reject
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
