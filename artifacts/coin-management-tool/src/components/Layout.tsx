import React from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '../contexts/AuthContext';
import { LayoutDashboard, Calendar, LineChart, Image, ShieldAlert, LogOut, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { logout, userProfile } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/timeline', label: 'Timeline', icon: Calendar },
    { href: '/analytics', label: 'Analytics', icon: LineChart },
    { href: '/screenshots', label: 'Screenshots', icon: Image },
  ];

  if (userProfile?.isAdmin) {
    navItems.push({ href: '/radhaji', label: 'Admin', icon: ShieldAlert });
  }

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row overflow-hidden">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 glass-card m-2 z-50 rounded-xl relative">
        <div className="flex items-center gap-2 text-primary font-bold text-lg tracking-wider">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
            <div className="w-4 h-4 rounded-full bg-primary animate-pulse"></div>
          </div>
          COINMGMT
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-foreground p-2">
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        ${isMobileMenuOpen ? 'flex' : 'hidden'} 
        md:flex flex-col w-full md:w-64 fixed md:static inset-0 z-40 bg-background/95 backdrop-blur-xl md:bg-transparent
        p-6 border-r border-white/5 transition-all duration-300
      `}>
        <div className="hidden md:flex items-center gap-2 text-primary font-bold text-xl tracking-wider mb-12">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
            <div className="w-4 h-4 rounded-full bg-primary animate-pulse"></div>
          </div>
          COINMGMT
        </div>

        <nav className="flex-1 flex flex-col gap-2 mt-16 md:mt-0">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div onClick={() => setIsMobileMenuOpen(false)} className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 cursor-pointer
                  ${isActive ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'}
                `}>
                  <Icon size={20} className={isActive ? 'text-primary' : ''} />
                  {item.label}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto pt-8 border-t border-white/5 flex flex-col gap-4">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-primary font-semibold">
              {userProfile?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-foreground">{userProfile?.name}</span>
              <span className="text-xs text-muted-foreground truncate w-32">{userProfile?.email}</span>
            </div>
          </div>
          <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={handleLogout}>
            <LogOut size={18} className="mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 relative">
        <div className="max-w-6xl mx-auto pb-24">
          {children}
        </div>
      </main>
    </div>
  );
}
