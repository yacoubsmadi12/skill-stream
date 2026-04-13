import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Input } from '@/components/ui/input';
import { Search, Users, Video, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ExplorePage() {
  const { categories, videos, profiles } = useData();
  const [query, setQuery] = useState('');

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

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8">
      <div className="max-w-lg mx-auto p-6">
        <h1 className="text-2xl font-display font-bold text-foreground mb-6">Explore</h1>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search skills, people, topics..."
            className="pl-10 bg-secondary/50 border-border/50 h-12"
          />
        </div>

        {/* Categories */}
        {!query && (
          <>
            <h2 className="text-lg font-display font-semibold text-foreground mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" /> Categories
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
              <Users className="w-5 h-5 text-primary" /> Top Experts
            </h2>
            <div className="space-y-3">
              {profiles.map(p => (
                <div key={p.user_id} className="bg-card rounded-xl border border-border/50 p-4 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold shrink-0">
                    {p.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground text-sm">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.department} • {p.years_experience}y exp</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {p.skills.slice(0, 3).map(s => (
                        <span key={s} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{s}</span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-foreground font-bold text-sm">⭐ {p.rating}</p>
                    <p className="text-xs text-muted-foreground">{p.followers} followers</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Search results */}
        {query && (
          <>
            {filteredProfiles.length > 0 && (
              <>
                <h2 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4" /> People
                </h2>
                <div className="space-y-2 mb-6">
                  {filteredProfiles.map(p => (
                    <div key={p.user_id} className="bg-card rounded-xl border border-border/50 p-3 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-sm font-bold">{p.name.charAt(0)}</div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.department}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {filteredVideos.length > 0 && (
              <>
                <h2 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                  <Video className="w-4 h-4" /> Videos
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  {filteredVideos.map(v => (
                    <div key={v.id} className={`aspect-[9/16] rounded-xl bg-gradient-to-br ${v.thumbnail_color} p-3 flex flex-col justify-end`}>
                      <p className="text-xs font-semibold text-foreground line-clamp-2">{v.title}</p>
                      <p className="text-xs text-foreground/70 mt-0.5">{v.user_name}</p>
                    </div>
                  ))}
                </div>
              </>
            )}

            {filteredVideos.length === 0 && filteredProfiles.length === 0 && (
              <p className="text-muted-foreground text-center py-12">No results for "{query}"</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
