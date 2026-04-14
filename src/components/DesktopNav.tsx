import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLang } from '@/contexts/LangContext';
import { Home, Search, PlusCircle, MessageSquare, User, Shield, Play, LogOut, Bookmark } from 'lucide-react';

export default function DesktopNav() {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const { T } = useLang();

  const items = [
    { to: '/', icon: Home, label: T.nav.feed },
    { to: '/explore', icon: Search, label: T.nav.explore },
    { to: '/upload', icon: PlusCircle, label: T.nav.upload },
    { to: '/saved', icon: Bookmark, label: 'Saved' },
    { to: '/requests', icon: MessageSquare, label: T.nav.requests },
    { to: '/profile', icon: User, label: T.nav.profile },
  ];

  return (
    <div className="hidden md:flex fixed left-0 top-0 bottom-0 w-20 bg-card border-r border-border/50 flex-col items-center py-6 z-50">
      <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shadow-glow mb-8">
        <Play className="w-5 h-5 text-primary-foreground fill-current" />
      </div>

      <nav className="flex-1 flex flex-col items-center gap-2">
        {items.map(item => {
          const active = location.pathname === item.to;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                active ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
              }`}
              title={item.label}
              data-testid={`nav-${item.to.replace('/', '') || 'feed'}`}
            >
              <item.icon className="w-5 h-5" />
            </NavLink>
          );
        })}

        {isAdmin && (
          <NavLink
            to="/admin"
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
              location.pathname === '/admin' ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
            }`}
            title={T.nav.admin}
            data-testid="nav-admin"
          >
            <Shield className="w-5 h-5" />
          </NavLink>
        )}
      </nav>

      <button
        onClick={logout}
        className="w-12 h-12 rounded-xl flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
        title={T.nav.logout}
        data-testid="button-logout"
      >
        <LogOut className="w-5 h-5" />
      </button>
    </div>
  );
}
