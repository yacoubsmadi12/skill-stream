import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { Loader2, Play, Zap } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const success = await login(employeeId, password);
    setLoading(false);
    if (!success) setError('Invalid employee ID or password');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-primary/5 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-accent/5 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1s' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md px-6"
      >
        {/* Logo */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            className="inline-flex items-center gap-3 mb-4"
          >
            <div className="w-14 h-14 gradient-primary rounded-2xl flex items-center justify-center shadow-glow">
              <Play className="w-7 h-7 text-primary-foreground fill-current" />
            </div>
            <h1 className="text-4xl font-display font-bold text-foreground">
              Z<span className="text-gradient">tube</span>
            </h1>
          </motion.div>
          <p className="text-muted-foreground text-sm">Knowledge Sharing Platform</p>
        </div>

        {/* Login Card */}
        <div className="gradient-card rounded-2xl p-8 border border-border/50 shadow-card">
          <div className="flex items-center gap-2 mb-6">
            <Zap className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-display font-semibold text-foreground">Enterprise Login</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Employee ID</label>
              <Input
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                placeholder="Enter your employee ID"
                className="bg-secondary/50 border-border/50 focus:border-primary h-12"
                required
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="bg-secondary/50 border-border/50 focus:border-primary h-12"
                required
              />
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-destructive text-sm"
              >
                {error}
              </motion.p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 gradient-primary text-primary-foreground font-semibold text-base hover:opacity-90 transition-opacity"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In via LDAP'}
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-border/30">
            <p className="text-xs text-muted-foreground text-center">
              Demo: <span className="text-foreground">admin / admin123</span> or <span className="text-foreground">user1 / user123</span>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
