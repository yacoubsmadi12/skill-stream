import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { Upload, X, Video, Tag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function UploadPage() {
  const { user } = useAuth();
  const { addVideo, categories } = useData();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [uploaded, setUploaded] = useState(false);

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleUpload = () => {
    if (!user || !title.trim()) return;
    addVideo({
      userId: user.id,
      userName: user.name,
      userAvatar: '',
      userDepartment: user.department,
      title,
      description,
      tags,
      category: category || 'Uncategorized',
      videoUrl: '',
      thumbnailColor: 'from-primary/80 to-accent/80',
      status: 'pending',
    });
    setUploaded(true);
    setTimeout(() => navigate('/'), 2000);
  };

  if (uploaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-center">
          <div className="w-20 h-20 gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <Video className="w-10 h-10 text-primary-foreground" />
          </div>
          <h2 className="text-xl font-display font-bold text-foreground mb-2">Video Uploaded!</h2>
          <p className="text-muted-foreground text-sm">Your video is pending review</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8">
      <div className="max-w-lg mx-auto p-6">
        <h1 className="text-2xl font-display font-bold text-foreground mb-6">Upload Video</h1>

        {/* Upload area */}
        <div className="border-2 border-dashed border-border/50 rounded-2xl p-12 text-center mb-6 bg-secondary/20 hover:border-primary/50 transition-colors cursor-pointer">
          <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-foreground font-medium mb-1">Tap to upload video</p>
          <p className="text-muted-foreground text-sm">Max 60 seconds • MP4, MOV</p>
        </div>

        <div className="space-y-5">
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Title *</label>
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Video title" className="bg-secondary/50 border-border/50 h-12" />
          </div>

          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="What's your video about?"
              className="w-full bg-secondary/50 border border-border/50 rounded-lg p-3 text-foreground text-sm resize-none h-24 focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Category</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full bg-secondary/50 border border-border/50 rounded-lg p-3 text-foreground text-sm h-12"
            >
              <option value="">Select category</option>
              {categories.map(c => (
                <option key={c.id} value={c.name}>{c.icon} {c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Tags</label>
            <div className="flex gap-2 mb-2">
              <Input
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                placeholder="Add tag"
                className="bg-secondary/50 border-border/50"
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <Button onClick={addTag} variant="secondary" size="icon"><Tag className="w-4 h-4" /></Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map(t => (
                <span key={t} className="text-xs bg-primary/20 text-primary px-3 py-1 rounded-full flex items-center gap-1">
                  #{t}
                  <button onClick={() => setTags(tags.filter(x => x !== t))}><X className="w-3 h-3" /></button>
                </span>
              ))}
            </div>
          </div>

          <Button onClick={handleUpload} disabled={!title.trim()} className="w-full h-12 gradient-primary text-primary-foreground font-semibold">
            Upload & Submit for Review
          </Button>
        </div>
      </div>
    </div>
  );
}
