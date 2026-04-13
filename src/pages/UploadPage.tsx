import { useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { useLang } from '@/contexts/LangContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { Upload, X, Video, Tag, CheckCircle, Play, Link } from 'lucide-react';
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
  const { user } = useAuth();
  const { addVideo, categories } = useData();
  const { T } = useLang();
  const navigate = useNavigate();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [videoLinkUrl, setVideoLinkUrl] = useState('');
  const [uploadMode, setUploadMode] = useState<'file' | 'link'>('file');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
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
      setError('يرجى اختيار ملف فيديو صالح (MP4, MOV, AVI)');
      return;
    }
    if (file.size > 200 * 1024 * 1024) {
      setError('حجم الملف يجب أن لا يتجاوز 200MB');
      return;
    }
    setError('');
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    if (!title) setTitle(file.name.replace(/\.[^/.]+$/, ''));
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
    if (!user || !title.trim()) return;
    setUploading(true);
    setError('');
    try {
      const videoUrl = uploadMode === 'link' ? videoLinkUrl : (previewUrl || '');
      await addVideo({
        userId: user.id,
        userName: user.name,
        userAvatar: '',
        userDepartment: user.department,
        title: title.trim(),
        description: description.trim(),
        tags,
        category: category || 'Uncategorized',
        videoUrl,
        thumbnailColor: selectedColor,
        status: 'pending',
      });
      setUploaded(true);
      setTimeout(() => navigate('/'), 2500);
    } catch (err) {
      setError('حدث خطأ أثناء الرفع، يرجى المحاولة مجدداً');
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
          <h2 className="text-xl font-display font-bold text-foreground mb-2">تم رفع الفيديو بنجاح!</h2>
          <p className="text-muted-foreground text-sm">الفيديو بانتظار مراجعة الإدارة قبل النشر</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8">
      <div className="max-w-lg mx-auto p-6">
        <h1 className="text-2xl font-display font-bold text-foreground mb-6">رفع فيديو</h1>

        {/* Upload mode toggle */}
        <div className="flex gap-2 mb-5 p-1 bg-secondary/40 rounded-xl">
          <button
            onClick={() => setUploadMode('file')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
              uploadMode === 'file' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
            }`}
            data-testid="tab-upload-file"
          >
            <Upload className="w-4 h-4" /> رفع ملف
          </button>
          <button
            onClick={() => setUploadMode('link')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
              uploadMode === 'link' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
            }`}
            data-testid="tab-upload-link"
          >
            <Link className="w-4 h-4" /> رابط فيديو
          </button>
        </div>

        {uploadMode === 'file' ? (
          <>
            {/* File drop zone */}
            {!previewUrl ? (
              <div
                onDrop={handleDrop}
                onDragOver={e => e.preventDefault()}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border/50 rounded-2xl p-12 text-center mb-5 bg-secondary/20 hover:border-primary/60 hover:bg-primary/5 transition-all cursor-pointer group"
                data-testid="upload-dropzone"
              >
                <Upload className="w-12 h-12 text-muted-foreground group-hover:text-primary mx-auto mb-3 transition-colors" />
                <p className="text-foreground font-medium mb-1">اضغط أو اسحب ملف الفيديو هنا</p>
                <p className="text-muted-foreground text-sm">MP4، MOV، AVI — حتى 200MB</p>
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
                <video
                  src={previewUrl}
                  controls
                  className="w-full max-h-64 object-contain"
                />
                <button
                  onClick={() => { setSelectedFile(null); setPreviewUrl(''); }}
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
          </>
        ) : (
          <div className="mb-5">
            <label className="text-sm text-muted-foreground mb-2 block">رابط الفيديو (YouTube، SharePoint، إلخ)</label>
            <Input
              value={videoLinkUrl}
              onChange={e => setVideoLinkUrl(e.target.value)}
              placeholder="https://..."
              className="bg-secondary/50 border-border/50 h-12"
              data-testid="input-video-url"
            />
          </div>
        )}

        {error && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-destructive text-sm mb-4">
            {error}
          </motion.p>
        )}

        <div className="space-y-5">
          {/* Title */}
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">العنوان *</label>
            <Input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="عنوان الفيديو"
              className="bg-secondary/50 border-border/50 h-12"
              data-testid="input-video-title"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">الوصف</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="عمَّ يتحدث الفيديو؟"
              className="w-full bg-secondary/50 border border-border/50 rounded-lg p-3 text-foreground text-sm resize-none h-24 focus:border-primary focus:outline-none"
              data-testid="input-video-description"
            />
          </div>

          {/* Category */}
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">التصنيف</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full bg-secondary/50 border border-border/50 rounded-lg p-3 text-foreground text-sm h-12"
              data-testid="select-category"
            >
              <option value="">اختر تصنيفاً</option>
              {categories.map(c => (
                <option key={c.id} value={c.name}>{c.icon} {c.name}</option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">الوسوم</label>
            <div className="flex gap-2 mb-2">
              <Input
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                placeholder="أضف وسماً..."
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

          {/* Thumbnail color picker */}
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">لون الغلاف</label>
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

          {/* Preview tile */}
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">معاينة البطاقة</label>
            <div className={`h-28 rounded-xl bg-gradient-to-br ${selectedColor} p-4 flex flex-col justify-end`}>
              <p className="text-sm font-bold text-white line-clamp-2">{title || 'عنوان الفيديو'}</p>
              <p className="text-xs text-white/70 mt-0.5">{user?.name}</p>
            </div>
          </div>

          <Button
            onClick={handleUpload}
            disabled={!title.trim() || uploading}
            className="w-full h-12 gradient-primary text-white font-semibold text-base"
            data-testid="button-submit-upload"
          >
            {uploading ? (
              <span className="flex items-center gap-2">
                <Video className="w-5 h-5 animate-pulse" /> جاري الرفع...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Upload className="w-5 h-5" /> رفع وإرسال للمراجعة
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
