import { NavLink, useLocation } from 'react-router-dom';
import { Home, Search, PlusCircle, MessageSquare, User, Bookmark } from 'lucide-react';
import { useLang } from '@/contexts/LangContext';

export default function BottomNav() {
  const location = useLocation();
  const { T } = useLang();
  const isAdmin = location.pathname.startsWith('/admin');
  if (isAdmin) return null;

  const NAV_ITEMS = [
    { to: '/', icon: Home, label: T.nav.feed },
    { to: '/explore', icon: Search, label: T.nav.explore },
    { to: '/upload', icon: PlusCircle, label: T.nav.upload, isUpload: true },
    { to: '/saved', icon: Bookmark, label: 'Saved' },
    { to: '/requests', icon: MessageSquare, label: T.nav.requests },
    { to: '/profile', icon: User, label: T.nav.profile },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 bg-card/90 backdrop-blur-lg border-t border-border/50 md:hidden">
      <div className="flex items-center justify-around h-16">
        {NAV_ITEMS.map(item => {
          const active = location.pathname === item.to;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className="flex flex-col items-center gap-0.5"
              data-testid={`bottom-nav-${item.to.replace('/', '') || 'feed'}`}
            >
              {(item as any).isUpload ? (
                <div className="w-9 h-9 gradient-primary rounded-xl flex items-center justify-center -mt-2 shadow-glow">
                  <item.icon className="w-4 h-4 text-primary-foreground" />
                </div>
              ) : (
                <>
                  <item.icon className={`w-5 h-5 transition-colors ${active ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className={`text-[10px] transition-colors ${active ? 'text-primary' : 'text-muted-foreground'}`}>{item.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
