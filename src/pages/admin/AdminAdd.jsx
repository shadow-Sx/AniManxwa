import React from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BookOpen, Layers, ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminAdd() {
  const { isAdmin } = useOutletContext();

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Ruxsat yo'q</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-40 bg-background/90 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <Link to="/">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-lg font-bold">Qo'shish</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Link to="/admin/add-manga">
            <div className="flex items-center gap-4 p-5 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors group">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Manga qo'shish</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Yangi manga, manhwa yoki manhua qo'shish</p>
              </div>
            </div>
          </Link>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Link to="/admin/add-chapter">
            <div className="flex items-center gap-4 p-5 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors group">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Layers className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Bob qo'shish</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Mavjud mangaga yangi bob qo'shish</p>
              </div>
            </div>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
