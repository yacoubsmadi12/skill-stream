import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useData, Video } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { Zap, CheckCircle } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
  video: Video;
}

export default function RequestDialog({ open, onClose, video }: Props) {
  const { addRequest } = useData();
  const { user } = useAuth();
  const [type, setType] = useState<'consultation' | 'help' | 'task'>('consultation');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!user || !description.trim()) return;
    addRequest({
      fromUserId: user.id,
      fromUserName: user.name,
      toUserId: video.user_id,
      toUserName: video.user_name,
      videoId: video.id,
      videoTitle: video.title,
      type,
      description,
      priority,
      status: 'pending',
    });
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setDescription('');
      onClose();
    }, 1500);
  };

  if (submitted) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="bg-card border-border/50">
          <div className="flex flex-col items-center py-8 gap-4">
            <CheckCircle className="w-16 h-16 text-success" />
            <p className="text-foreground font-display font-semibold text-lg">Request Sent!</p>
            <p className="text-muted-foreground text-sm">Waiting for {video.user_name} to respond</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border/50 max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display">
            <Zap className="w-5 h-5 text-primary" />
            Connect with {video.user_name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Request Type</label>
            <div className="grid grid-cols-3 gap-2">
              {(['consultation', 'help', 'task'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                    type === t ? 'gradient-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Description</label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what you need..."
              className="bg-secondary/50 border-border/50"
            />
          </div>

          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Priority</label>
            <div className="grid grid-cols-3 gap-2">
              {(['low', 'medium', 'high'] as const).map(p => (
                <button
                  key={p}
                  onClick={() => setPriority(p)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                    priority === p
                      ? p === 'high' ? 'bg-destructive text-destructive-foreground'
                        : p === 'medium' ? 'bg-warning text-warning-foreground'
                        : 'bg-success text-success-foreground'
                      : 'bg-secondary text-secondary-foreground'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <Button onClick={handleSubmit} disabled={!description.trim()} className="w-full gradient-primary text-primary-foreground h-11 font-semibold">
            Send Request
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
