import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import BottomNav from './BottomNav';
import ProfileSidebar from '../profile/ProfileSidebar';

export default function AppLayout() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    async function loadUser() {
      const me = await base44.auth.me();
      setUser(me);
      setIsAdmin(me?.role === 'admin');
    }
    loadUser();
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="pb-safe">
        <Outlet context={{ user, isAdmin, setProfileOpen }} />
      </main>
      <BottomNav isAdmin={isAdmin} />
      <ProfileSidebar 
        open={profileOpen} 
        onClose={() => setProfileOpen(false)} 
        user={user}
        isAdmin={isAdmin}
      />
    </div>
  );
}
