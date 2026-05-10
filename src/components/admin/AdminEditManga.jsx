import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Upload, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const GENRES = ['Harakat', 'Ramantika', 'Fantaziya', 'Komediya', 'Horror', 'Drama', 'Sci-Fi', 'Sarguzasht', 'Sirli', 'Hayotdan parcha', 'Sport', 'Psixolagik', 'Ttreyler', 'SuperKuchlar'];

export default function AdminEditManga({ manga, onClose, onSaved }) {
  const [form, setForm] = useState({ ...manga });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const updateField = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const toggleGenre = (genre) => {
    setForm(prev => ({
      ...prev,
      genres: (prev.genres || []).includes(genre)
        ? prev.genres.filter(g => g !== genre)
        : [...(prev.genres || []), genre]
    }));
  };

  const handleImageUpload = async (e, field) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    updateField(field, file_url);
    setUploading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    await base44.entities.Manga.update(manga.id, {
      title: form.title,
      description: form.description,
      author: form.author,
      studio: form.studio,
      year: form.year ? parseInt(form.year) : undefined,
      type: form.type,
      status: form.status,
      access: form.access,
      genres: form.genres,
      cover_9_16: form.cover_9_16,
      banner_16_9: form.banner_16_9,
      total_volumes: parseInt(form.total_volumes) || 0,
      total_seasons: parseInt(form.total_seasons) || 0,
    });
    toast.success("Saqlandi!");
    onSaved();
    setSaving(false);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tahrirlash: {manga.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Sarlavha</Label>
            <Input value={form.title || ''} onChange={e => updateField('title', e.target.value)} className="bg-secondary" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Tavsif</Label>
            <Textarea value={form.description || ''} onChange={e => updateField('description', e.target.value)} className="bg-secondary min-h-[60px]" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Muallif</Label>
              <Input value={form.author || ''} onChange={e => updateField('author', e.target.value)} className="bg-secondary" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Yil</Label>
              <Input type="number" value={form.year || ''} onChange={e => updateField('year', e.target.value)} className="bg-secondary" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Holati</Label>
              <Select value={form.status} onValueChange={v => updateField('status', v)}>
                <SelectTrigger className="bg-secondary"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ongoing">Davom etmoqda</SelectItem>
                  <SelectItem value="completed">Tugallangan</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Kirish</Label>
              <Select value={form.access} onValueChange={v => updateField('access', v)}>
                <SelectTrigger className="bg-secondary"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Bepul</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Janrlar</Label>
            <div className="flex flex-wrap gap-1">
              {GENRES.map(g => (
                <Badge key={g} variant={(form.genres || []).includes(g) ? "default" : "secondary"} className="cursor-pointer text-[10px]" onClick={() => toggleGenre(g)}>
                  {g}
                </Badge>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <Label className="text-xs">9:16 muqova</Label>
              <label className="block cursor-pointer">
                {form.cover_9_16 ? (
                  <img src={form.cover_9_16} className="w-full aspect-[9/16] object-cover rounded-lg" />
                ) : (
                  <div className="aspect-[9/16] rounded-lg border-2 border-dashed border-border flex items-center justify-center bg-secondary/50">
                    <Upload className="w-4 h-4 text-muted-foreground" />
                  </div>
                )}
                <input type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload(e, 'cover_9_16')} />
              </label>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">16:9 banner</Label>
              <label className="block cursor-pointer">
                {form.banner_16_9 ? (
                  <img src={form.banner_16_9} className="w-full aspect-video object-cover rounded-lg" />
                ) : (
                  <div className="aspect-video rounded-lg border-2 border-dashed border-border flex items-center justify-center bg-secondary/50">
                    <Upload className="w-4 h-4 text-muted-foreground" />
                  </div>
                )}
                <input type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload(e, 'banner_16_9')} />
              </label>
            </div>
          </div>
          {uploading && <div className="flex items-center gap-2 text-xs text-muted-foreground"><Loader2 className="w-3 h-3 animate-spin" /> Yuklanmoqda...</div>}
          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1">Bekor qilish</Button>
            <Button onClick={handleSave} disabled={saving} className="flex-1">
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Saqlash
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
