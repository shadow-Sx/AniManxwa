import React, { useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ChevronLeft, Plus, Upload, Loader2, X, GripVertical } from 'lucide-react';
import { toast } from 'sonner';

export default function AddChapter() {
  const { isAdmin } = useOutletContext();
  const [selectedManga, setSelectedManga] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ season: '', volume: '', chapter_number: '' });
  const [pages, setPages] = useState([]);

  const { data: ongoingMangas = [] } = useQuery({
    queryKey: ['ongoing-mangas'],
    queryFn: () => base44.entities.Manga.filter({ status: 'ongoing' }, '-created_date', 100),
  });

  if (!isAdmin) return <div className="min-h-screen flex items-center justify-center"><p className="text-muted-foreground">Ruxsat yo'q</p></div>;

  const handleSelectManga = (manga) => {
    setSelectedManga(manga);
    setConfirmOpen(true);
  };

  const handleConfirm = () => {
    setConfirmOpen(false);
    setFormOpen(true);
    setForm({ season: '', volume: '', chapter_number: '' });
    setPages([]);
  };

  const handlePageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setUploading(true);

    // Sort files by name numerically
    const sorted = files.sort((a, b) => {
      const numA = parseInt(a.name.replace(/\D/g, '')) || 0;
      const numB = parseInt(b.name.replace(/\D/g, '')) || 0;
      return numA - numB;
    });

    const urls = [];
    for (const file of sorted) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      urls.push(file_url);
    }
    setPages(prev => [...prev, ...urls]);
    setUploading(false);
  };

  const removePage = (index) => {
    setPages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!form.chapter_number) { toast.error("Bob raqamini kiriting"); return; }
    if (pages.length === 0) { toast.error("Sahifalarni yuklang"); return; }
    setSaving(true);

    await base44.entities.Chapter.create({
      manga_id: selectedManga.id,
      manga_title: selectedManga.title,
      manga_slug: selectedManga.slug,
      season: parseInt(form.season) || 0,
      volume: parseInt(form.volume) || 0,
      chapter_number: parseInt(form.chapter_number),
      pages,
    });

    // Update chapter count
    await base44.entities.Manga.update(selectedManga.id, {
      chapter_count: (selectedManga.chapter_count || 0) + 1,
    });

    toast.success(`${form.chapter_number}-bob qo'shildi!`);
    setFormOpen(false);
    setSelectedManga(null);
    setSaving(false);
  };

  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-40 bg-background/90 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <Link to="/admin/add">
            <Button variant="ghost" size="icon" className="h-8 w-8"><ChevronLeft className="w-5 h-5" /></Button>
          </Link>
          <h1 className="text-lg font-bold">Bob qo'shish</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-4">
        {!formOpen ? (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground mb-4">Davom etayotgan mangani tanlang:</p>
            {ongoingMangas.map(manga => (
              <div
                key={manga.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors cursor-pointer"
                onClick={() => handleSelectManga(manga)}
              >
                {manga.cover_9_16 ? (
                  <img src={manga.cover_9_16} alt={manga.title} className="w-10 h-14 rounded-lg object-cover" />
                ) : (
                  <div className="w-10 h-14 rounded-lg bg-secondary flex items-center justify-center text-[10px]">{manga.title[0]}</div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{manga.title}</p>
                  <p className="text-xs text-muted-foreground capitalize">{manga.type} · {manga.chapter_count || 0} bob</p>
                </div>
                <Plus className="w-5 h-5 text-primary shrink-0" />
              </div>
            ))}
            {ongoingMangas.length === 0 && (
              <p className="text-center py-12 text-muted-foreground text-sm">Davom etayotgan mangalar yo'q</p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-card rounded-xl border border-primary/20">
              {selectedManga?.cover_9_16 && (
                <img src={selectedManga.cover_9_16} alt="" className="w-10 h-14 rounded-lg object-cover" />
              )}
              <p className="font-medium text-sm">{selectedManga?.title}</p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Fasl</Label>
                <Input type="number" value={form.season} onChange={e => setForm(p => ({ ...p, season: e.target.value }))} placeholder="0" className="bg-secondary" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Jild</Label>
                <Input type="number" value={form.volume} onChange={e => setForm(p => ({ ...p, volume: e.target.value }))} placeholder="0" className="bg-secondary" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Bob *</Label>
                <Input type="number" value={form.chapter_number} onChange={e => setForm(p => ({ ...p, chapter_number: e.target.value }))} placeholder="1" className="bg-secondary" />
              </div>
            </div>

            {/* Page upload */}
            <div className="space-y-2">
              <Label>Sahifalar ({pages.length})</Label>
              <label className="flex items-center justify-center gap-2 h-12 rounded-xl border-2 border-dashed border-border hover:border-primary/50 cursor-pointer transition-colors bg-secondary/50">
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4 text-muted-foreground" />}
                <span className="text-sm text-muted-foreground">Sahifalarni yuklash (PNG, JPG, WEBP)</span>
                <input type="file" accept="image/png,image/jpeg,image/webp" multiple className="hidden" onChange={handlePageUpload} />
              </label>

              {/* Page thumbnails */}
              {pages.length > 0 && (
                <div className="grid grid-cols-4 gap-2">
                  {pages.map((url, i) => (
                    <div key={i} className="relative group">
                      <img src={url} alt={`Sahifa ${i + 1}`} className="w-full aspect-[9/16] object-cover rounded-lg" />
                      <div className="absolute top-1 left-1 bg-black/70 text-[10px] px-1 rounded">{i + 1}</div>
                      <button
                        onClick={() => removePage(i)}
                        className="absolute top-1 right-1 bg-destructive rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setFormOpen(false)} className="flex-1">Bekor qilish</Button>
              <Button onClick={handleSave} disabled={saving} className="flex-1">
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Saqlash
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Confirm dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>Yangi bob qo'shish</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            <strong>{selectedManga?.title}</strong> uchun yangi bob qo'shmoqchimisiz?
          </p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setConfirmOpen(false)} className="flex-1">Yo'q</Button>
            <Button onClick={handleConfirm} className="flex-1">Ha, davom etish</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
