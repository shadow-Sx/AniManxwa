import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, Search, Heart, User, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/', icon: BookOpen, label: 'Mangalar' },
  { path: '/search', icon: Search, label: 'Qidirish' },
  { path: '/saved', icon: Heart, label: 'Saqlangan' },
  { path: '/profile', icon: User, label: 'Profil' },
];

export default function BottomNav({ isAdmin }) {
  const location = useLocation();

  // Hide bottom nav on reader page
  if (location.pathname.startsWith('/read/')) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-xl border-t border-border">
      <div className="max-w-lg mx-auto flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const isActive = item.path === '/' 
            ? location.pathname === '/' 
            : location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive && "drop-shadow-[0_0_6px_hsl(347,77%,50%)]")} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
        {isAdmin && (
          <Link
            to="/admin/add"
            className={cn(
              "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200",
              location.pathname.startsWith('/admin')
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center -mt-3 shadow-lg shadow-primary/30">
              <Plus className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-[10px] font-medium -mt-0.5">Qo'shish</span>
          </Link>
        )}
      </div>
    </nav>
  );
}
