import { useState } from 'react';
import { useData, ServiceRequest } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLang } from '@/contexts/LangContext';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Check, X, Clock, Star, Send, ChevronRight, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function RequestsPage() {
  const { user } = useAuth();
  const { requests, updateRequestStatus, addRequestMessage, rateRequest } = useData();
  const { T } = useLang();
  const [selectedReq, setSelectedReq] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [ratingValue, setRatingValue] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');

  const myRequests = requests.filter(r => r.from_user_id === user?.id || r.to_user_id === user?.id);
  const selected = requests.find(r => r.id === selectedReq);

  const isCreator = selected?.to_user_id === user?.id;

  const sendMessage = () => {
    if (!selected || !messageText.trim() || !user) return;
    addRequestMessage(selected.id, user.id, user.name, messageText.trim());
    setMessageText('');
  };

  const submitRating = () => {
    if (!selected || ratingValue === 0) return;
    rateRequest(selected.id, ratingValue, feedbackText);
    setRatingValue(0);
    setFeedbackText('');
  };

  const statusColor = (s: string) => {
    switch (s) {
      case 'pending': return 'bg-warning/15 text-warning';
      case 'accepted': return 'bg-success/15 text-success';
      case 'rejected': return 'bg-destructive/15 text-destructive';
      case 'completed': return 'bg-primary/15 text-primary';
      case 'info_requested': return 'bg-accent/15 text-accent';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const statusLabel = (s: string) => {
    switch (s) {
      case 'pending': return T.common.pending;
      case 'accepted': return T.requests.accept;
      case 'rejected': return T.common.rejected;
      case 'completed': return T.requests.completed;
      default: return s;
    }
  };

  if (selected) {
    return (
      <div className="min-h-screen bg-background pb-24 md:pb-8">
        <div className="max-w-lg mx-auto p-6">
          <button onClick={() => setSelectedReq(null)} className="text-muted-foreground text-sm mb-4 hover:text-foreground transition-colors">
            {T.requests.backToRequests}
          </button>

          <div className="bg-card rounded-2xl border border-border/50 p-5 mb-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display font-semibold text-foreground">{selected.video_title}</h2>
              <span className={`text-xs px-2.5 py-1 rounded-full ${statusColor(selected.status)}`}>{statusLabel(selected.status)}</span>
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              {selected.from_user_name} → {selected.to_user_name}
            </p>
            <p className="text-sm text-foreground/80 mb-3">{selected.description}</p>
            <div className="flex gap-2 text-xs">
              <span className="bg-secondary px-2 py-1 rounded text-secondary-foreground capitalize">
                {selected.type === 'consultation' ? T.common.consultation : selected.type === 'help' ? T.common.help : T.common.task}
              </span>
              <span className={`px-2 py-1 rounded capitalize ${
                selected.priority === 'high' ? 'bg-destructive/20 text-destructive' :
                selected.priority === 'medium' ? 'bg-warning/20 text-warning' : 'bg-success/20 text-success'
              }`}>
                {selected.priority === 'low' ? T.common.low : selected.priority === 'medium' ? T.common.medium : T.common.high}
              </span>
            </div>
          </div>

          {/* Action buttons for creator */}
          {isCreator && selected.status === 'pending' && (
            <div className="flex gap-2 mb-4">
              <Button onClick={() => updateRequestStatus(selected.id, 'accepted')} className="flex-1 bg-success text-success-foreground hover:bg-success/90">
                <Check className="w-4 h-4 mr-1" /> {T.requests.accept}
              </Button>
              <Button onClick={() => updateRequestStatus(selected.id, 'rejected')} variant="destructive" className="flex-1">
                <X className="w-4 h-4 mr-1" /> {T.requests.reject}
              </Button>
              <Button onClick={() => updateRequestStatus(selected.id, 'info_requested')} variant="secondary">
                <Info className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Messages */}
          <div className="bg-card rounded-2xl border border-border/50 flex flex-col" style={{ height: '350px' }}>
            <div className="p-4 border-b border-border/30">
              <h3 className="font-display font-semibold text-foreground text-sm flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-primary" /> {T.requests.messages}
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {selected.messages.length === 0 && (
                <p className="text-muted-foreground text-sm text-center pt-8">{T.requests.noMessages}</p>
              )}
              {selected.messages.map(m => (
                <div key={m.id} className={`flex ${m.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${
                    m.sender_id === user?.id
                      ? 'gradient-primary text-primary-foreground rounded-br-md'
                      : 'bg-secondary text-secondary-foreground rounded-bl-md'
                  }`}>
                    <p className="font-medium text-xs mb-0.5 opacity-70">{m.sender_name}</p>
                    {m.text}
                  </div>
                </div>
              ))}
            </div>
            {(selected.status === 'accepted' || selected.status === 'info_requested') && (
              <div className="p-3 border-t border-border/30 flex gap-2">
                <Input
                  value={messageText}
                  onChange={e => setMessageText(e.target.value)}
                  placeholder={T.requests.typeMessage}
                  className="bg-secondary/50 border-border/50"
                  onKeyDown={e => e.key === 'Enter' && sendMessage()}
                />
                <Button size="icon" onClick={sendMessage} className="gradient-primary text-primary-foreground shrink-0">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Rating (for requester, when accepted) */}
          {!isCreator && selected.status === 'accepted' && !selected.rating && (
            <div className="bg-card rounded-2xl border border-border/50 p-5 mt-4">
              <h3 className="font-display font-semibold text-foreground text-sm mb-3 flex items-center gap-2">
                <Star className="w-4 h-4 text-warning" /> {T.requests.rateService}
              </h3>
              <div className="flex gap-1 mb-3">
                {[1,2,3,4,5].map(n => (
                  <button key={n} onClick={() => setRatingValue(n)}>
                    <Star className={`w-8 h-8 transition-colors ${n <= ratingValue ? 'text-warning fill-warning' : 'text-muted-foreground'}`} />
                  </button>
                ))}
              </div>
              <Input
                value={feedbackText}
                onChange={e => setFeedbackText(e.target.value)}
                placeholder={T.requests.leaveFeedback}
                className="bg-secondary/50 border-border/50 mb-3"
              />
              <Button onClick={submitRating} disabled={ratingValue === 0} className="w-full gradient-primary text-primary-foreground">
                {T.requests.submitRating}
              </Button>
            </div>
          )}

          {selected.rating && (
            <div className="bg-card rounded-2xl border border-border/50 p-5 mt-4 text-center">
              <div className="flex justify-center gap-0.5 mb-2">
                {[1,2,3,4,5].map(n => (
                  <Star key={n} className={`w-5 h-5 ${n <= selected.rating! ? 'text-warning fill-warning' : 'text-muted-foreground'}`} />
                ))}
              </div>
              {selected.feedback && <p className="text-sm text-foreground/80">"{selected.feedback}"</p>}
              <p className="text-xs text-muted-foreground mt-1">{T.requests.completed}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8">
      <div className="max-w-lg mx-auto p-6">
        <h1 className="text-2xl font-display font-bold text-foreground mb-6">{T.requests.title}</h1>

        {myRequests.length === 0 ? (
          <div className="text-center py-16">
            <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">{T.requests.noRequests}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {myRequests.map(r => (
              <motion.button
                key={r.id}
                onClick={() => setSelectedReq(r.id)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full bg-card rounded-xl border border-border/50 p-4 text-left hover:border-primary/30 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-display font-semibold text-foreground text-sm">{r.video_title}</h3>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground mb-2">{r.from_user_name} → {r.to_user_name}</p>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor(r.status)}`}>{statusLabel(r.status)}</span>
                  <span className="text-xs text-muted-foreground capitalize">
                    {r.type === 'consultation' ? T.common.consultation : r.type === 'help' ? T.common.help : T.common.task}
                  </span>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
