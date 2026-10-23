import React, { useState, useEffect, useRef } from 'react';
import { Images, UploadCloud, Trash2, ArrowUp, ArrowDown, Loader2, Save, ChevronDown, RotateCcw, ImagePlus, X, PanelRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { db } from '@/lib/db';
import { cn } from '@/lib/utils';
import { photoUpload } from '@/services/photoUpload';
import { SlideContent } from '@/components/HeroSlideshow';
import HeroSubBanner, { BANNER_THEMES, DEFAULT_SUB_BANNERS } from '@/components/HeroSubBanner';

const fieldClass = 'bg-neutral-900 border-neutral-800';

const Field = ({ label, hint, children }) => (
  <div className="space-y-1.5">
    <Label className="text-xs text-neutral-400">{label}</Label>
    {children}
    {hint && <p className="text-[11px] text-neutral-600">{hint}</p>}
  </div>
);

const TextField = ({ label, hint, value, onChange, placeholder, disabled }) => (
  <Field label={label} hint={hint}>
    <Input value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} disabled={disabled} className={fieldClass} />
  </Field>
);

const ColorField = ({ label, value, onChange, disabled }) => (
  <Field label={label}>
    <div className="flex items-center gap-2">
      <input
        type="color"
        value={value || '#000000'}
        onChange={e => onChange(e.target.value)}
        disabled={disabled}
        className="h-9 w-11 shrink-0 cursor-pointer rounded-md border border-neutral-800 bg-neutral-900 p-1"
      />
      <Input value={value || ''} onChange={e => onChange(e.target.value)} disabled={disabled} className={cn(fieldClass, 'font-mono text-xs')} />
    </div>
  </Field>
);

// Renders a slide at desktop size and scales it to fit, so the thumbnail
// matches what visitors see
const PREVIEW_WIDTH = 800;
const SlidePreview = ({ slide, index }) => {
  const ref = useRef(null);
  const [scale, setScale] = useState(0.28);

  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => setScale(entry.contentRect.width / PREVIEW_WIDTH));
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="relative w-full sm:w-56 aspect-[16/9] shrink-0 overflow-hidden rounded-lg bg-neutral-900">
      <div
        className="pointer-events-none absolute left-0 top-0 origin-top-left"
        style={{ width: PREVIEW_WIDTH, height: PREVIEW_WIDTH * 9 / 16, transform: `scale(${scale})` }}
      >
        <SlideContent slide={slide} index={index} />
      </div>
    </div>
  );
};

const SaveButton = ({ dirty, saving, onClick }) => (
  <Button onClick={onClick} disabled={!dirty || saving} className="bg-red-600 hover:bg-red-700">
    {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
    {dirty ? 'Save Changes' : 'Saved'}
  </Button>
);

const HeroSliderManagement = () => {
  const { toast } = useToast();
  const fileInputRef = useRef(null);
  const [slides, setSlides] = useState([]);
  const [subBanners, setSubBanners] = useState(DEFAULT_SUB_BANNERS);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [slidesDirty, setSlidesDirty] = useState(false);
  const [bannersDirty, setBannersDirty] = useState(false);
  const [openSlide, setOpenSlide] = useState(null);

  useEffect(() => {
    Promise.all([db.heroSlides.getAll(), db.heroSubBanners.getAll()])
      .then(([savedSlides, savedBanners]) => {
        setSlides(savedSlides);
        if (savedBanners.length) setSubBanners(savedBanners);
      })
      .catch(err => toast({ variant: 'destructive', title: 'Failed to load hero content', description: err.message }))
      .finally(() => setLoading(false));
  }, []);

  // Uploads, deletes and reordering save immediately; text and colour edits
  // are collected locally until "Save Changes"
  const persistSlides = async (next, successMessage) => {
    setSaving(true);
    try {
      await db.heroSlides.save(next);
      setSlides(next);
      setSlidesDirty(false);
      if (successMessage) toast({ title: successMessage });
      return true;
    } catch (err) {
      toast({ variant: 'destructive', title: 'Save failed', description: err.message });
      return false;
    } finally {
      setSaving(false);
    }
  };

  const persistBanners = async (next, successMessage) => {
    setSaving(true);
    try {
      await db.heroSubBanners.save(next);
      setSubBanners(next);
      setBannersDirty(false);
      toast({ title: successMessage });
    } catch (err) {
      toast({ variant: 'destructive', title: 'Save failed', description: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (files.length === 0) return;

    setUploading(true);
    const added = [];
    for (const file of files) {
      const { url, error } = await photoUpload.uploadHeroSlide(file);
      if (error) {
        toast({ variant: 'destructive', title: `Could not upload ${file.name}`, description: error });
      } else {
        added.push({ id: crypto.randomUUID(), image_url: url, alt: '' });
      }
    }
    if (added.length > 0) {
      const saved = await persistSlides([...slides, ...added], `${added.length} slide(s) added`);
      // Don't leave orphaned files in storage if the list couldn't be saved
      if (!saved) added.forEach(s => photoUpload.deletePhoto(s.image_url));
    }
    setUploading(false);
  };

  const handleDelete = async (slide) => {
    if (!window.confirm('Delete this slide?')) return;
    const saved = await persistSlides(slides.filter(s => s.id !== slide.id), 'Slide deleted');
    if (saved) photoUpload.deletePhoto(slide.image_url);
  };

  const handleMove = (index, delta) => {
    const next = [...slides];
    [next[index], next[index + delta]] = [next[index + delta], next[index]];
    persistSlides(next);
  };

  const updateSlide = (id, patch) => {
    setSlides(prev => prev.map(s => (s.id === id ? { ...s, ...patch } : s)));
    setSlidesDirty(true);
  };

  const updateBanner = (index, patch) => {
    setSubBanners(prev => prev.map((b, i) => (i === index ? { ...b, ...patch } : b)));
    setBannersDirty(true);
  };

  const handleLogoUpload = async (index, file) => {
    if (!file) return;
    setUploading(true);
    const { url, error } = await photoUpload.uploadHeroSlide(file);
    setUploading(false);
    if (error) {
      toast({ variant: 'destructive', title: 'Could not upload logo', description: error });
      return;
    }
    updateBanner(index, { image_url: url });
  };

  const busy = uploading || saving;

  if (loading) {
    return <div className="flex justify-center py-24"><Loader2 className="w-6 h-6 animate-spin text-neutral-500" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Images className="text-red-500" /> Hero Section
        </h2>
        <p className="text-neutral-400 text-sm">
          The home page hero: a main slider on the left and two banners beside it.
        </p>
      </div>

      {/* Main slider */}
      <Card className="bg-neutral-900 border-neutral-800">
        <CardHeader className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 space-y-0">
          <div className="space-y-1.5">
            <CardTitle className="text-white">Main Slider ({slides.length})</CardTitle>
            <CardDescription className="text-neutral-500">
              16:9 images work best (e.g. 1920×1080), JPG/PNG/WebP up to 5MB. Add text to show a title and button over the photo;
              leave it empty for banners that already have text in the image.
            </CardDescription>
          </div>
          <div className="flex gap-2 shrink-0">
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={handleUpload} />
            <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={busy} className="border-neutral-700">
              {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <UploadCloud className="w-4 h-4 mr-2" />}
              Upload
            </Button>
            <SaveButton dirty={slidesDirty} saving={saving} onClick={() => persistSlides(slides, 'Slides saved')} />
          </div>
        </CardHeader>
        <CardContent>
          {slides.length === 0 ? (
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={busy}
              className="w-full border-2 border-dashed border-neutral-700 hover:border-red-500/50 rounded-xl py-16 text-neutral-500 flex flex-col items-center gap-2 transition-colors"
            >
              <UploadCloud className="w-8 h-8" />
              No slides yet. Click to upload images
            </button>
          ) : (
            <div className="space-y-3">
              {slides.map((slide, i) => {
                const open = openSlide === slide.id;
                return (
                  <div key={slide.id} className="rounded-xl bg-neutral-950 border border-neutral-800 overflow-hidden">
                    <div className="flex flex-col sm:flex-row gap-4 p-3">
                      <SlidePreview slide={slide} index={i} />
                      <div className="flex-1 min-w-0 flex flex-col justify-between gap-2">
                        <div>
                          <div className="text-xs text-neutral-500">Slide {i + 1}</div>
                          <div className="text-sm text-white truncate">{slide.title || slide.alt || 'Image only'}</div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setOpenSlide(open ? null : slide.id)}
                          className="w-fit -ml-2 text-neutral-300 hover:text-white"
                        >
                          <ChevronDown className={cn('w-4 h-4 mr-1 transition-transform', open && 'rotate-180')} />
                          {open ? 'Hide' : 'Edit'} text & colours
                        </Button>
                      </div>
                      <div className="flex sm:flex-col gap-2 justify-end">
                        <Button size="icon" variant="outline" className="border-neutral-800" disabled={busy || i === 0} onClick={() => handleMove(i, -1)} title="Move up">
                          <ArrowUp className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="outline" className="border-neutral-800" disabled={busy || i === slides.length - 1} onClick={() => handleMove(i, 1)} title="Move down">
                          <ArrowDown className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="outline" className="border-red-900/50 text-red-400 hover:bg-red-500/10" disabled={busy} onClick={() => handleDelete(slide)} title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {open && (
                      <div className="border-t border-neutral-800 p-4 grid gap-4 md:grid-cols-2">
                        <TextField label="Small label" placeholder="e.g. BLOOD DRIVE 2026" value={slide.eyebrow} onChange={v => updateSlide(slide.id, { eyebrow: v })} disabled={busy} />
                        <TextField label="Title" placeholder="e.g. Every Drop Counts" value={slide.title} onChange={v => updateSlide(slide.id, { title: v })} disabled={busy} />
                        <div className="md:col-span-2">
                          <TextField label="Subtitle" value={slide.subtitle} onChange={v => updateSlide(slide.id, { subtitle: v })} disabled={busy} />
                        </div>
                        <TextField label="Button text" placeholder="e.g. Donate Now" value={slide.button_label} onChange={v => updateSlide(slide.id, { button_label: v })} disabled={busy} />
                        <TextField label="Button link" hint="A page like /search, or a full https:// URL" value={slide.button_link} onChange={v => updateSlide(slide.id, { button_link: v })} disabled={busy} />
                        <ColorField label="Text colour" value={slide.text_color || '#ffffff'} onChange={v => updateSlide(slide.id, { text_color: v })} disabled={busy} />
                        <ColorField label="Button colour" value={slide.button_color || '#dc2626'} onChange={v => updateSlide(slide.id, { button_color: v })} disabled={busy} />
                        <div className="md:col-span-2">
                          <TextField label="Image description (accessibility & SEO)" value={slide.alt} onChange={v => updateSlide(slide.id, { alt: v })} disabled={busy} />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sub banners */}
      <Card className="bg-neutral-900 border-neutral-800">
        <CardHeader className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 space-y-0">
          <div className="space-y-1.5">
            <CardTitle className="text-white flex items-center gap-2"><PanelRight className="w-5 h-5 text-red-500" /> Side Banners</CardTitle>
            <CardDescription className="text-neutral-500">
              The two banners beside the slider. Pick a theme or set your own colours; the preview updates as you type.
            </CardDescription>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button
              variant="outline"
              className="border-neutral-700"
              disabled={busy}
              onClick={() => { setSubBanners(DEFAULT_SUB_BANNERS); setBannersDirty(true); }}
            >
              <RotateCcw className="w-4 h-4 mr-2" /> Defaults
            </Button>
            <SaveButton dirty={bannersDirty} saving={saving} onClick={() => persistBanners(subBanners, 'Side banners saved')} />
          </div>
        </CardHeader>
        <CardContent className="grid gap-6 xl:grid-cols-2">
          {subBanners.slice(0, 2).map((banner, i) => (
            <div key={banner.id} className="rounded-xl bg-neutral-950 border border-neutral-800 p-4 space-y-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Banner {i + 1}{i === 0 ? ' (top)' : ' (bottom)'}</div>

              <HeroSubBanner banner={banner} preview className="min-h-[180px]" />

              <Field label="Theme">
                <div className="flex flex-wrap gap-2">
                  {BANNER_THEMES.map(({ name, ...colors }) => {
                    const selected = colors.bg_color === banner.bg_color && colors.text_color === banner.text_color && colors.accent_color === banner.accent_color;
                    return (
                      <button
                        key={name}
                        type="button"
                        onClick={() => updateBanner(i, colors)}
                        disabled={busy}
                        className={cn(
                          'flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition-colors',
                          selected ? 'border-red-500 text-white' : 'border-neutral-800 text-neutral-400 hover:border-neutral-600'
                        )}
                      >
                        <span className="h-3.5 w-3.5 rounded-full ring-1 ring-white/20" style={{ background: `linear-gradient(135deg, ${colors.bg_color} 60%, ${colors.accent_color} 60%)` }} />
                        {name}
                      </button>
                    );
                  })}
                </div>
              </Field>

              <div className="grid gap-4 sm:grid-cols-3">
                <ColorField label="Background" value={banner.bg_color} onChange={v => updateBanner(i, { bg_color: v })} disabled={busy} />
                <ColorField label="Text" value={banner.text_color} onChange={v => updateBanner(i, { text_color: v })} disabled={busy} />
                <ColorField label="Link" value={banner.accent_color} onChange={v => updateBanner(i, { accent_color: v })} disabled={busy} />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <TextField label="Small label" value={banner.eyebrow} onChange={v => updateBanner(i, { eyebrow: v })} disabled={busy} />
                <TextField label="Title" value={banner.title} onChange={v => updateBanner(i, { title: v })} disabled={busy} />
                <div className="sm:col-span-2">
                  <TextField label="Description" value={banner.description} onChange={v => updateBanner(i, { description: v })} disabled={busy} />
                </div>
                <TextField label="Link text" value={banner.link_label} onChange={v => updateBanner(i, { link_label: v })} disabled={busy} />
                <TextField label="Link" hint="A page like /search, or a full https:// URL" value={banner.link_url} onChange={v => updateBanner(i, { link_url: v })} disabled={busy} />
              </div>

              <Field label="Logo / image (optional, shown on the right)">
                <div className="flex items-center gap-3">
                  {banner.image_url && (
                    <div className="relative h-12 w-12 rounded-lg bg-neutral-900 border border-neutral-800 p-1">
                      <img src={banner.image_url} alt="" className="h-full w-full object-contain" />
                      <button
                        type="button"
                        onClick={() => updateBanner(i, { image_url: '' })}
                        className="absolute -right-2 -top-2 rounded-full bg-neutral-800 p-0.5 text-neutral-300 hover:text-white"
                        aria-label="Remove logo"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                  <label className={cn(
                    'inline-flex cursor-pointer items-center gap-2 rounded-md border border-neutral-800 px-3 py-2 text-sm text-neutral-300 hover:border-neutral-600',
                    busy && 'pointer-events-none opacity-50'
                  )}>
                    <ImagePlus className="h-4 w-4" /> {banner.image_url ? 'Replace' : 'Upload'}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={e => { handleLogoUpload(i, e.target.files?.[0]); e.target.value = ''; }}
                    />
                  </label>
                </div>
              </Field>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default HeroSliderManagement;
