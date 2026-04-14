import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLang } from '@/contexts/LangContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { Loader2, Play, Zap, BookOpen, Cpu, BarChart2, Globe, Shield, Lightbulb, Wifi, Database } from 'lucide-react';

const REELS = [
  { icon: BookOpen, title: 'How to Manage Projects', dept: 'Project Management', color: 'from-purple-600 to-indigo-700', views: '2.4K' },
  { icon: Cpu, title: 'AI Fundamentals', dept: 'AI & Data', color: 'from-cyan-500 to-blue-600', views: '5.1K' },
  { icon: BarChart2, title: 'Customer Data Analytics', dept: 'Sales', color: 'from-emerald-500 to-teal-600', views: '3.8K' },
  { icon: Globe, title: '5G Networks Deep Dive', dept: 'Network', color: 'from-pink-500 to-rose-600', views: '6.2K' },
  { icon: Shield, title: 'Cybersecurity Essentials', dept: 'IT Security', color: 'from-orange-500 to-amber-600', views: '4.5K' },
  { icon: Lightbulb, title: 'Innovation in Telecom', dept: 'Innovation', color: 'from-violet-500 to-purple-700', views: '3.2K' },
  { icon: Wifi, title: 'Wireless Network Technologies', dept: 'Network', color: 'from-sky-500 to-cyan-600', views: '2.9K' },
  { icon: Database, title: 'Database Administration', dept: 'IT', color: 'from-lime-500 to-green-600', views: '1.8K' },
  { icon: BookOpen, title: 'Effective Communication Skills', dept: 'HR', color: 'from-fuchsia-500 to-pink-600', views: '7.3K' },
  { icon: Cpu, title: 'Mobile App Development', dept: 'Engineering', color: 'from-blue-500 to-indigo-600', views: '4.1K' },
  { icon: BarChart2, title: 'Marketing Strategies', dept: 'Marketing', color: 'from-red-500 to-orange-600', views: '3.6K' },
  { icon: Globe, title: 'Excellence in Customer Service', dept: 'Customer Care', color: 'from-teal-500 to-emerald-600', views: '5.9K' },
];

function ReelCard({ reel, index }: { reel: typeof REELS[0]; index: number }) {
  const Icon = reel.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.5 }}
      className={`relative rounded-2xl overflow-hidden bg-gradient-to-b ${reel.color} flex-shrink-0 w-[130px] h-[200px] md:w-[150px] md:h-[230px] shadow-lg`}
    >
      <div className="absolute inset-0 bg-black/30" />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-3">
        <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
          <Icon className="w-6 h-6 text-white" />
        </div>
        <p className="text-white text-[11px] font-bold text-center leading-tight">{reel.title}</p>
        <span className="text-white/70 text-[10px]">{reel.dept}</span>
      </div>
      <div className="absolute bottom-3 left-0 right-0 flex items-center justify-between px-3">
        <div className="flex items-center gap-1">
          <div className="w-5 h-5 rounded-full bg-white/30 flex items-center justify-center">
            <Play className="w-2.5 h-2.5 text-white fill-white" />
          </div>
          <span className="text-white/80 text-[10px]">{reel.views}</span>
        </div>
        <div className="w-1.5 h-1.5 rounded-full bg-white/60 animate-pulse" />
      </div>
      <div className="absolute top-3 right-3">
        <div className="px-1.5 py-0.5 rounded-full bg-black/40 backdrop-blur-sm border border-white/20">
          <span className="text-white text-[9px] font-semibold">LIVE</span>
        </div>
      </div>
    </motion.div>
  );
}

export default function LoginPage() {
  const { login } = useAuth();
  const { T } = useLang();
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

  const topRow = REELS.slice(0, 6);
  const bottomRow = REELS.slice(6, 12);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-black">

      {/* Animated reels — top row */}
      <div className="absolute top-0 left-0 right-0 overflow-hidden">
        <motion.div
          className="flex gap-3 px-3 pt-4"
          animate={{ x: [0, -400] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear', repeatType: 'loop' }}
          style={{ width: 'max-content' }}
        >
          {[...topRow, ...topRow].map((reel, i) => (
            <ReelCard key={i} reel={reel} index={i % 6} />
          ))}
        </motion.div>
      </div>

      {/* Animated reels — bottom row */}
      <div className="absolute bottom-0 left-0 right-0 overflow-hidden">
        <motion.div
          className="flex gap-3 px-3 pb-4"
          animate={{ x: [-400, 0] }}
          transition={{ duration: 28, repeat: Infinity, ease: 'linear', repeatType: 'loop' }}
          style={{ width: 'max-content' }}
        >
          {[...bottomRow, ...bottomRow].map((reel, i) => (
            <ReelCard key={i} reel={reel} index={i % 6} />
          ))}
        </motion.div>
      </div>

      {/* Dark overlay gradient — keeps center readable */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70 pointer-events-none" />

      {/* Main content */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md px-6"
      >
        {/* Zain Jordan logo + Ztube branding */}
        <div className="text-center mb-8">
          {/* Zain Jordan wordmark */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center justify-center gap-2 mb-5"
          >
            {/* Zain logo SVG */}
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-5 py-2.5">
              <svg viewBox="0 0 120 40" className="h-8 w-auto" fill="none">
                {/* Zain arc / swoosh */}
                <ellipse cx="20" cy="20" rx="16" ry="16" fill="#00A0E3" />
                <path d="M10 28 Q20 8 30 28" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round"/>
                <circle cx="20" cy="20" r="4" fill="white"/>
                {/* Zain text */}
                <text x="42" y="27" fontFamily="Arial, sans-serif" fontWeight="800" fontSize="18" fill="white" letterSpacing="1">zain</text>
                {/* Jordan text */}
                <text x="42" y="38" fontFamily="Arial, sans-serif" fontWeight="400" fontSize="9" fill="#00A0E3" letterSpacing="2">JORDAN</text>
              </svg>
            </div>
          </motion.div>

          {/* Ztube logo */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            className="inline-flex items-center gap-3 mb-3"
          >
            <div className="w-12 h-12 gradient-primary rounded-2xl flex items-center justify-center shadow-glow">
              <Play className="w-6 h-6 text-white fill-white" />
            </div>
            <h1 className="text-4xl font-display font-bold text-white">
              Z<span className="text-gradient">tube</span>
            </h1>
          </motion.div>
          <p className="text-white/50 text-sm">{T.login.platform}</p>
        </div>

        {/* Login Card */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-2xl">
          <div className="flex items-center gap-2 mb-6">
            <Zap className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-display font-semibold text-white">{T.login.title}</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-sm text-white/60 mb-2 block">{T.login.employeeId}</label>
              <Input
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                placeholder={T.login.employeeId}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/30 focus:border-primary h-12"
                required
                data-testid="input-employee-id"
              />
            </div>
            <div>
              <label className="text-sm text-white/60 mb-2 block">{T.login.password}</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={T.login.password}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/30 focus:border-primary h-12"
                required
                data-testid="input-password"
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
              className="w-full h-12 gradient-primary text-white font-semibold text-base hover:opacity-90 transition-opacity"
              data-testid="button-login"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : T.login.signIn}
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-white/10">
            <p className="text-xs text-white/40 text-center">
              {T.login.demo} <span className="text-white/70">admin / admin123</span> {T.login.or} <span className="text-white/70">user1 / user123</span>
            </p>
          </div>
        </div>

      </motion.div>
    </div>
  );
}
