import React, { useState } from 'react';
import { Link, useNavigate, useOutletContext } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, Upload, Loader2 } from 'lucide-react';
import { generateSlug } from '@/lib/utils';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

const GENRES = ['Harakat', 'Ramantika', 'Fantaziya', 'Komediya', 'Horror', 'Drama', 'Sci-Fi', 'Sarguzasht', 'Sirli', 'Hayotdan parcha', 'Sports', 'Psixalogik', 'Isekay', 'Treyler', 'SuperKuch'];

export default function AddManga() {
  const { isAdmin } = useOutletContext();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [uploading9x16, setUploading9x16] = useState(false);
  const [uploading16x9, setUploading16x9] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', author: '', studio: '', year: '',
    type: 'manhwa', status: 'ongoing', access: 'free',
    genres: [], categories: [],
    cover_9_16: '', banner_16_9: '',
    total_volumes: 0, total_seasons: 0,
  });

  if (!isAdmin) return <div className="min-h-screen flex items-center justify-center"><p className="text-muted-foreground">Ruxsat yo'q</p></div>;

  const updateField = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const toggleGenre = (genre) => {
    setForm(prev => ({
      ...prev,
      genres: prev.genres.includes(genre) 
        ? prev.genres.filter(g => g !== genre)
        : [...prev.genres, genre]
    }));
  };

  const handleImageUpload = async (e, field) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const setUploading = field === 'cover_9_16' ? setUploading9x16 : setUploading16x9;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    updateField(field, file_url);
    setUploading(false);
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) { toast.error("Sarlavha kiriting"); return; }
    setSaving(true);
    const slug = generateSlug(form.title);
    await base44.entities.Manga.create({
      ...form,
      slug,
      year: form.year ? parseInt(form.year) : undefined,
      total_volumes: parseInt(form.total_volumes) || 0,
      total_seasons: parseInt(form.total_seasons) || 0,
      view_count: 0,
      chapter_count: 0,
    });
    toast.success("Manga qo'shildi!");
    navigate('/');
    setSaving(false);
  };

  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-40 bg-background/90 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <Link to="/admin/add">
            <Button variant="ghost" size="icon" className="h-8 w-8"><ChevronLeft className="w-5 h-5" /></Button>
          </Link>
          <h1 className="text-lg font-bold">Manga qo'shish</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-4 space-y-4">
        <div className="space-y-2">
          <Label>Sarlavha *</Label>
          <Input value={form.title} onChange={e => updateField('title', e.target.value)} placeholder="Solo Leveling" className="bg-secondary" />
          {form.title && <p className="text-xs text-muted-foreground">URL: {generateSlug(form.title)}</p>}
        </div>

        <div className="space-y-2">
          <Label>Tavsif</Label>
          <Textarea value={form.description} onChange={e => updateField('description', e.target.value)} placeholder="Manga haqida..." className="bg-secondary min-h-[80px]" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>Muallif</Label>
            <Input value={form.author} onChange={e => updateField('author', e.target.value)} className="bg-secondary" />
          </div>
          <div className="space-y-2">
            <Label>Studiya</Label>
            <Input value={form.studio} onChange={e => updateField('studio', e.target.value)} className="bg-secondary" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>Yil</Label>
            <Input type="number" value={form.year} onChange={e => updateField('year', e.target.value)} className="bg-secondary" />
          </div>
          <div className="space-y-2">
            <Label>Turi</Label>
            <Select value={form.type} onValueChange={v => updateField('type', v)}>
              <SelectTrigger className="bg-secondary"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="manga">Manga</SelectItem>
                <SelectItem value="manhwa">Manhwa</SelectItem>
                <SelectItem value="manhua">Manhua</SelectItem>
                <SelectItem value="novella">Novella</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>Holati</Label>
            <Select value={form.status} onValueChange={v => updateField('status', v)}>
              <SelectTrigger className="bg-secondary"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ongoing">Ongoing</SelectItem>
                <SelectItem value="completed">Tugallangan</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Kirish</Label>
            <Select value={form.access} onValueChange={v => updateField('access', v)}>
              <SelectTrigger className="bg-secondary"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="free">Bepul</SelectItem>
                <SelectItem value="premium">Pullik</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>Jildlar soni</Label>
            <Input type="number" value={form.total_volumes} onChange={e => updateField('total_volumes', e.target.value)} className="bg-secondary" />
          </div>
          <div className="space-y-2">
            <Label>Fasllar soni</Label>
            <Input type="number" value={form.total_seasons} onChange={e => updateField('total_seasons', e.target.value)} className="bg-secondary" />
          </div>
        </div>

        {/* Genres */}
        <div className="space-y-2">
          <Label>Janrlar</Label>
          <div className="flex flex-wrap gap-1.5">
            {GENRES.map(g => (
              <Badge
                key={g}
                variant={form.genres.includes(g) ? "default" : "secondary"}
                className="cursor-pointer"
                onClick={() => toggleGenre(g)}
              >
                {g}
              </Badge>
            ))}
          </div>
        </div>

        {/* Images */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>9:16 muqova</Label>
            {form.cover_9_16 ? (
              <img src={form.cover_9_16} alt="cover" className="w-full aspect-[9/16] object-cover rounded-lg" />
            ) : (
              <label className="flex flex-col items-center justify-center aspect-[9/16] rounded-lg border-2 border-dashed border-border hover:border-primary/50 cursor-pointer transition-colors bg-secondary/50">
                {uploading9x16 ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5 text-muted-foreground" />}
                <span className="text-xs text-muted-foreground mt-1">Yuklash</span>
                <input type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload(e, 'cover_9_16')} />
              </label>
            )}
          </div>
          <div className="space-y-2">
            <Label>16:9 banner</Label>
            {form.banner_16_9 ? (
              <img src={form.banner_16_9} alt="banner" className="w-full aspect-video object-cover rounded-lg" />
            ) : (
              <label className="flex flex-col items-center justify-center aspect-video rounded-lg border-2 border-dashed border-border hover:border-primary/50 cursor-pointer transition-colors bg-secondary/50">
                {uploading16x9 ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5 text-muted-foreground" />}
                <span className="text-xs text-muted-foreground mt-1">Yuklash</span>
                <input type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload(e, 'banner_16_9')} />
              </label>
            )}
          </div>
        </div>

        <Button onClick={handleSubmit} disabled={saving} className="w-full h-12 text-sm font-semibold">
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          Manga qo'shish
        </Button>
      </div>
    </div>
  );
}
