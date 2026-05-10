import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Copy, Shield, Info, LogOut, BookOpen } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

export default function ProfileSidebar({ open, onClose, user, isAdmin }) {
  const [statsOpen, setStatsOpen] = useState(false);
  const [readCount, setReadCount] = useState({ mangas: 0, chapters: 0 });
  const queryClient = useQueryClient();

  const copyId = () => {
    if (user?.id) {
      navigator.clipboard.writeText(user.id);
      toast.success("ID nusxalandi!");
    }
  };

  const loadStats = async () => {
    const progress = await base44.entities.ReadingProgress.filter({ created_by: user.email });
    const uniqueMangas = new Set(progress.map(p => p.manga_id));
    setReadCount({ mangas: uniqueMangas.size, chapters: progress.length });
    setStatsOpen(true);
  };

  const handleLogout = () => {
    base44.auth.logout('/');
  };

  if (!user) return null;

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="bg-card border-border w-80 overflow-y-auto">
        <SheetHeader className="pb-4">
          <SheetTitle className="text-foreground">Profil</SheetTitle>
        </SheetHeader>

        <div className="space-y-6">
          {/* Avatar & Name */}
          <div className="flex flex-col items-center gap-3 pt-2">
            <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center text-2xl font-bold text-primary border-2 border-primary/30">
              {user.full_name?.[0]?.toUpperCase() || '?'}
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-lg">{user.full_name || 'Foydalanuvchi'}</h3>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
            {isAdmin && (
              <Badge className="bg-primary/20 text-primary border-primary/30">
                <Shield className="w-3 h-3 mr-1" /> Admin
              </Badge>
            )}
          </div>

          {/* User ID */}
          <div className="bg-secondary/50 rounded-lg p-3 space-y-2">
            <Label className="text-xs text-muted-foreground">Foydalanuvchi ID</Label>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs bg-background rounded px-2 py-1.5 truncate">
                {user.id}
              </code>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={copyId}>
                <Copy className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          {/* Stats Button */}
          <Button variant="outline" className="w-full justify-start gap-2" onClick={loadStats}>
            <Info className="w-4 h-4" />
            ID ma'lumotlari
          </Button>

          {/* Admin Panel Link */}
          {isAdmin && (
            <Link to="/admin" onClick={onClose}>
              <Button variant="outline" className="w-full justify-start gap-2 border-primary/30 text-primary hover:bg-primary/10">
                <Shield className="w-4 h-4" />
                Admin Panel
              </Button>
            </Link>
          )}

          {/* Logout */}
          <Button variant="ghost" className="w-full justify-start gap-2 text-destructive hover:text-destructive" onClick={handleLogout}>
            <LogOut className="w-4 h-4" />
            Chiqish
          </Button>
        </div>

        {/* Stats Dialog */}
        <Dialog open={statsOpen} onOpenChange={setStatsOpen}>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle>Sizning statistikangiz</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground mb-4">
              ID raqamingiz bo'yicha nechta manga va bob o'qiganligingiz haqida batafsil ma'lumot.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-secondary rounded-xl p-4 text-center">
                <BookOpen className="w-6 h-6 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold">{readCount.mangas}</p>
                <p className="text-xs text-muted-foreground">Mangalar</p>
              </div>
              <div className="bg-secondary rounded-xl p-4 text-center">
                <BookOpen className="w-6 h-6 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold">{readCount.chapters}</p>
                <p className="text-xs text-muted-foreground">Boblar</p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </SheetContent>
    </Sheet>
  );
}
