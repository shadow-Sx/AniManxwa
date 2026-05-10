import React, { useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';

export default function ProfilePage() {
  const { setProfileOpen } = useOutletContext();

  useEffect(() => {
    setProfileOpen(true);
  }, [setProfileOpen]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-muted-foreground text-sm">Profil paneli ochilmoqda...</p>
    </div>
  );
}
