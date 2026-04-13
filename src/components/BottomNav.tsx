import { NavLink, useLocation } from 'react-router-dom';
import { Home, Search, PlusCircle, MessageSquare, User } from 'lucide-react';
import { useLang } from '@/contexts/LangContext';

export default function BottomNav() {
  const location = useLocation();
  const { lang, setLang, T } = useLang();
  const isAdmin = location.pathname.startsWith('/admin');
  if (isAdmin) return null;

  const NAV_ITEMS = [
    { to: '/', icon: Home, label: T.nav.feed },
    { to: '/explore', icon: Search, label: T.nav.explore },
    { to: '/upload', icon: PlusCircle, label: T.nav.upload },
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
              {item.to === '/upload' ? (
                <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center -mt-3 shadow-glow">
                  <item.icon className="w-5 h-5 text-primary-foreground" />
                </div>
              ) : (
                <>
                  <item.icon className={`w-5 h-5 transition-colors ${active ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className={`text-xs transition-colors ${active ? 'text-primary' : 'text-muted-foreground'}`}>{item.label}</span>
                </>
              )}
            </NavLink>
          );
        })}

        {/* Language toggle pill - sits above nav */}
        <button
          onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
          className="absolute top-0 right-3 -translate-y-full mb-1 px-3 py-1 bg-card border border-border/50 rounded-t-lg text-xs font-bold text-foreground hover:bg-secondary transition-colors"
          data-testid="button-lang-toggle-mobile"
        >
          {lang === 'en' ? 'ع' : 'EN'}
        </button>
      </div>
    </nav>
  );
}
