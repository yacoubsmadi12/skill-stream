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
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0a3d3d 0%, #0c4a4a 25%, #0e5555 50%, #0a3d3d 75%, #082e2e 100%)' }}>
      {/* Decorative geometric star bursts */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Large stars */}
        <svg className="absolute top-[8%] left-[5%] w-28 h-28 opacity-20 animate-[spin_30s_linear_infinite]" viewBox="0 0 100 100">
          <polygon points="50,0 61,35 100,35 68,57 79,91 50,70 21,91 32,57 0,35 39,35" fill="none" stroke="hsl(180,40%,50%)" strokeWidth="1.5"/>
        </svg>
        <svg className="absolute top-[15%] right-[8%] w-36 h-36 opacity-15 animate-[spin_40s_linear_infinite_reverse]" viewBox="0 0 100 100">
          <polygon points="50,5 58,38 95,38 64,58 74,90 50,72 26,90 36,58 5,38 42,38" fill="none" stroke="hsl(180,40%,45%)" strokeWidth="1"/>
        </svg>
        <svg className="absolute bottom-[12%] left-[8%] w-32 h-32 opacity-15 animate-[spin_35s_linear_infinite]" viewBox="0 0 100 100">
          <polygon points="50,2 60,36 98,36 66,58 76,92 50,72 24,92 34,58 2,36 40,36" fill="none" stroke="hsl(180,35%,50%)" strokeWidth="1.2"/>
        </svg>
        <svg className="absolute bottom-[20%] right-[12%] w-24 h-24 opacity-20 animate-[spin_25s_linear_infinite_reverse]" viewBox="0 0 100 100">
          <polygon points="50,0 61,35 100,35 68,57 79,91 50,70 21,91 32,57 0,35 39,35" fill="none" stroke="hsl(180,40%,55%)" strokeWidth="1.5"/>
        </svg>
        {/* Small accent stars */}
        <svg className="absolute top-[40%] left-[15%] w-16 h-16 opacity-25" viewBox="0 0 100 100">
          <polygon points="50,10 58,40 90,40 63,58 72,88 50,70 28,88 37,58 10,40 42,40" fill="none" stroke="hsl(180,50%,55%)" strokeWidth="2"/>
        </svg>
        <svg className="absolute top-[60%] right-[5%] w-20 h-20 opacity-15" viewBox="0 0 100 100">
          <polygon points="50,5 60,38 95,38 65,58 75,90 50,72 25,90 35,58 5,38 40,38" fill="none" stroke="hsl(180,40%,50%)" strokeWidth="1.5"/>
        </svg>
        <svg className="absolute top-[5%] left-[45%] w-14 h-14 opacity-20" viewBox="0 0 100 100">
          <polygon points="50,0 61,35 100,35 68,57 79,91 50,70 21,91 32,57 0,35 39,35" fill="none" stroke="hsl(180,45%,50%)" strokeWidth="2"/>
        </svg>
        {/* Subtle radial glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-10" style={{ background: 'radial-gradient(circle, hsl(180,40%,40%) 0%, transparent 70%)' }} />
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
