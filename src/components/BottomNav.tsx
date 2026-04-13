import { NavLink, useLocation } from 'react-router-dom';
import { Home, Search, PlusCircle, MessageSquare, User } from 'lucide-react';

const NAV_ITEMS = [
  { to: '/', icon: Home, label: 'Feed' },
  { to: '/explore', icon: Search, label: 'Explore' },
  { to: '/upload', icon: PlusCircle, label: 'Upload' },
  { to: '/requests', icon: MessageSquare, label: 'Requests' },
  { to: '/profile', icon: User, label: 'Profile' },
];

export default function BottomNav() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  if (isAdmin) return null;

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
      </div>
    </nav>
  );
}
