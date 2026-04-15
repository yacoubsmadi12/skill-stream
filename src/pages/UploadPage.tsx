import { useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { useLang } from '@/contexts/LangContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { Upload, X, Video, Tag, CheckCircle, Play, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const COLORS = [
  'from-purple-600 to-indigo-700',
  'from-cyan-500 to-blue-600',
  'from-emerald-500 to-teal-600',
  'from-pink-500 to-rose-600',
  'from-orange-500 to-amber-600',
  'from-violet-500 to-purple-700',
  'from-sky-500 to-cyan-600',
  'from-lime-500 to-green-600',
];

export default function UploadPage() {
  const { user, isAdmin } = useAuth();
  const { addVideo, addCategory, categories, settings } = useData();
  const { T } = useLang();
  const navigate = useNavigate();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [fileDataUrl, setFileDataUrl] = useState<string>('');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('video/')) {
      setError(T.upload.errorType);
      return;
    }
    const maxBytes = 40 * 1024 * 1024;
    if (file.size > maxBytes) {
      setError('حجم الفيديو يتجاوز 40MB. يرجى رفع فيديو أصغر.');
      return;
    }
    setError('');
    setSelectedFile(file);
    const blobUrl = URL.createObjectURL(file);
    setPreviewUrl(blobUrl);
    if (!title) setTitle(file.name.replace(/\.[^/.]+$/, ''));
    const reader = new FileReader();
    reader.onloadend = () => setFileDataUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const syntheticEvent = { target: { files: [file] } } as unknown as React.ChangeEvent<HTMLInputElement>;
      handleFileChange(syntheticEvent);
    }
  };

  const addTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags(prev => [...prev, trimmed]);
      setTagInput('');
    }
  };

  const handleUpload = async () => {
    if (!user || !title.trim() || !selectedFile) return;
    if (!fileDataUrl) {
      setError('الفيديو لا يزال يُعالج، انتظر لحظة وحاول مجدداً.');
      return;
    }
    if (category === 'other' && !customCategory.trim()) {
      setError('يرجى إدخال اسم التصنيف الجديد.');
      return;
    }
    setUploading(true);
    setError('');
    try {
      let finalCategory = category || 'Uncategorized';
      if (category === 'other' && customCategory.trim()) {
        const trimmed = customCategory.trim();
        const exists = categories.find(c => c.name.toLowerCase() === trimmed.toLowerCase());
        if (!exists) {
          await addCategory(trimmed, '📁');
        }
        finalCategory = trimmed;
      }
      await addVideo({
        userId: user.id,
        userName: user.name,
        userAvatar: '',
        userDepartment: user.department,
        title: title.trim(),
        description: description.trim(),
        tags,
        category: finalCategory,
        videoUrl: fileDataUrl,
        thumbnailColor: selectedColor,
        status: (isAdmin || settings.approval_required !== 'true') ? 'approved' : 'pending',
        isAdmin,
      });
      setUploaded(true);
      setTimeout(() => navigate('/'), 2500);
    } catch (err) {
      setError(T.upload.errorGeneral);
      setUploading(false);
    }
  };

  if (uploaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-center px-6">
          <div className="w-20 h-20 gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 shadow-glow">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-xl font-display font-bold text-foreground mb-2">{T.upload.success}</h2>
          <p className="text-muted-foreground text-sm">{T.upload.successSub}</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8">
      <div className="max-w-lg mx-auto p-6">
        <h1 className="text-2xl font-display font-bold text-foreground mb-6">{T.upload.title}</h1>

        {!previewUrl ? (
          <div
            onDrop={handleDrop}
            onDragOver={e => e.preventDefault()}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-border/50 rounded-2xl p-12 text-center mb-5 bg-secondary/20 hover:border-primary/60 hover:bg-primary/5 transition-all cursor-pointer group"
            data-testid="upload-dropzone"
          >
            <Upload className="w-12 h-12 text-muted-foreground group-hover:text-primary mx-auto mb-3 transition-colors" />
            <p className="text-foreground font-medium mb-1">{T.upload.dropzone}</p>
            <p className="text-muted-foreground text-sm">{T.upload.dropzoneHint}</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              className="hidden"
              onChange={handleFileChange}
              data-testid="input-video-file"
            />
          </div>
        ) : (
          <div className="relative mb-5 rounded-2xl overflow-hidden bg-black">
            <video src={previewUrl} controls className="w-full max-h-64 object-contain" />
            <button
              onClick={() => { setSelectedFile(null); setPreviewUrl(''); setFileDataUrl(''); }}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80 transition-colors"
              data-testid="button-remove-video"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="absolute bottom-3 left-3 bg-black/60 text-white text-xs px-3 py-1 rounded-full flex items-center gap-1.5">
              <Play className="w-3 h-3" />
              {selectedFile?.name}
            </div>
          </div>
        )}

        {error && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-destructive text-sm mb-4">
            {error}
          </motion.p>
        )}

        <div className="space-y-5">
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">{T.upload.videoTitle}</label>
            <Input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder={T.upload.videoTitle}
              className="bg-secondary/50 border-border/50 h-12"
              data-testid="input-video-title"
            />
          </div>

          <div>
            <label className="text-sm text-muted-foreground mb-2 block">{T.upload.description}</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder={T.upload.descPlaceholder}
              className="w-full bg-secondary/50 border border-border/50 rounded-lg p-3 text-foreground text-sm resize-none h-24 focus:border-primary focus:outline-none"
              data-testid="input-video-description"
            />
          </div>

          <div>
            <label className="text-sm text-muted-foreground mb-2 block">{T.upload.category}</label>
            <select
              value={category}
              onChange={e => { setCategory(e.target.value); setCustomCategory(''); }}
              className="w-full bg-secondary/50 border border-border/50 rounded-lg p-3 text-foreground text-sm h-12"
              data-testid="select-category"
            >
              <option value="">{T.upload.selectCategory}</option>
              {categories.map(c => (
                <option key={c.id} value={c.name}>{c.icon} {c.name}</option>
              ))}
              <option value="other">➕ أخرى (تصنيف جديد)</option>
            </select>
            {category === 'other' && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 flex gap-2 items-center"
              >
                <Plus className="w-4 h-4 text-primary shrink-0" />
                <Input
                  value={customCategory}
                  onChange={e => setCustomCategory(e.target.value)}
                  placeholder="اكتب اسم التصنيف الجديد..."
                  className="bg-secondary/50 border-primary/50 h-11 flex-1"
                  autoFocus
                />
              </motion.div>
            )}
          </div>

          <div>
            <label className="text-sm text-muted-foreground mb-2 block">{T.upload.tags}</label>
            <div className="flex gap-2 mb-2">
              <Input
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                placeholder={T.upload.addTag}
                className="bg-secondary/50 border-border/50"
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                data-testid="input-tag"
              />
              <Button onClick={addTag} variant="secondary" size="icon" data-testid="button-add-tag">
                <Tag className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map(t => (
                <span key={t} className="text-xs bg-primary/20 text-primary px-3 py-1 rounded-full flex items-center gap-1">
                  #{t}
                  <button onClick={() => setTags(prev => prev.filter(x => x !== t))} data-testid={`button-remove-tag-${t}`}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm text-muted-foreground mb-2 block">{T.upload.thumbnailColor}</label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setSelectedColor(c)}
                  className={`w-10 h-10 rounded-lg bg-gradient-to-br ${c} transition-all ${
                    selectedColor === c ? 'ring-2 ring-white ring-offset-2 ring-offset-background scale-110' : 'opacity-70 hover:opacity-100'
                  }`}
                  data-testid={`button-color-${c.split(' ')[0]}`}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm text-muted-foreground mb-2 block">{T.upload.cardPreview}</label>
            <div className={`h-28 rounded-xl bg-gradient-to-br ${selectedColor} p-4 flex flex-col justify-end`}>
              <p className="text-sm font-bold text-white line-clamp-2">{title || T.upload.videoTitle}</p>
              <p className="text-xs text-white/70 mt-0.5">{user?.name}</p>
            </div>
          </div>

          <Button
            onClick={handleUpload}
            disabled={
              !title.trim() ||
              !selectedFile ||
              uploading ||
              (category === 'other' && !customCategory.trim())
            }
            className="w-full h-12 gradient-primary text-white font-semibold text-base"
            data-testid="button-submit-upload"
          >
            {uploading ? (
              <span className="flex items-center gap-2">
                <Video className="w-5 h-5 animate-pulse" /> {T.upload.uploading}
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Upload className="w-5 h-5" /> {T.upload.submit}
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
