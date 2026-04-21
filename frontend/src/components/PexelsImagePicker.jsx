import React, { useState } from 'react';
import { Search, Image as ImageIcon, X, Check, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useToast } from '../hooks/use-toast';
import api from '../lib/api';

/**
 * PexelsImagePicker — searches the Pexels free image library and, on pick,
 * downloads the chosen image into our uploads and invokes onImported(image_url).
 *
 * Props:
 *  - target: "articles" | "spotlight" | "school" | "art" | "sponsors"
 *  - onImported(imageUrl): called with the local /api/uploads/... URL after import
 *  - triggerLabel?: label for the open button (default: "Browse free images")
 */
const PexelsImagePicker = ({ target = 'articles', onImported, triggerLabel = 'Browse free images' }) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(null); // photo id being imported
  const [photos, setPhotos] = useState([]);
  const [total, setTotal] = useState(0);

  const search = async (e) => {
    if (e) e.preventDefault();
    if (!q.trim()) return;
    setLoading(true);
    try {
      const res = await api.get('/pexels/search', { params: { q, per_page: 18 } });
      setPhotos(res.data.photos || []);
      setTotal(res.data.total_results || 0);
    } catch (err) {
      toast({
        title: 'Search failed',
        description: err?.response?.data?.detail || 'Please try different keywords.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const pick = async (photo) => {
    setImporting(photo.id);
    try {
      const res = await api.post('/pexels/import', { url: photo.full, target });
      toast({ title: 'Image added', description: `Photo by ${photo.photographer}` });
      onImported?.(res.data.image_url);
      setOpen(false);
      // Reset state so next open is fresh
      setQ('');
      setPhotos([]);
      setTotal(0);
    } catch (err) {
      toast({
        title: 'Import failed',
        description: err?.response?.data?.detail || '',
        variant: 'destructive',
      });
    } finally {
      setImporting(null);
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="gap-1.5"
        data-testid="open-pexels-picker-btn"
      >
        <ImageIcon size={14} />
        {triggerLabel}
      </Button>

      {open && (
        <div
          className="fixed inset-0 z-[60] bg-black/60 flex items-end md:items-center justify-center p-0 md:p-6"
          onClick={() => setOpen(false)}
          data-testid="pexels-picker-modal"
        >
          <div
            className="bg-white rounded-t-2xl md:rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Free image search</h3>
                <p className="text-xs text-gray-500">
                  Powered by Pexels — pick an image and it will be saved to your article.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-gray-700 p-2"
                aria-label="Close"
                data-testid="pexels-picker-close"
              >
                <X size={22} />
              </button>
            </div>

            <form onSubmit={search} className="px-5 py-3 border-b flex gap-2">
              <div className="relative flex-1">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <Input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Try: school kids, science class, soccer, art, flowers…"
                  className="pl-9"
                  autoFocus
                  data-testid="pexels-search-input"
                />
              </div>
              <Button
                type="submit"
                disabled={loading || !q.trim()}
                className="bg-blue-700 hover:bg-blue-800 text-white"
                data-testid="pexels-search-submit"
              >
                {loading ? 'Searching…' : 'Search'}
              </Button>
            </form>

            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
              {loading ? (
                <div className="flex items-center justify-center h-40 text-gray-500 gap-2">
                  <Loader2 size={18} className="animate-spin" /> Searching Pexels…
                </div>
              ) : photos.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <ImageIcon size={32} className="mx-auto mb-2 opacity-40" />
                  <p className="text-sm">
                    {q.trim() ? 'No results — try different keywords.' : 'Type something and hit Search.'}
                  </p>
                </div>
              ) : (
                <>
                  <p className="text-xs text-gray-500 mb-3">
                    About {total.toLocaleString()} photos match "{q}". Click one to add it.
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {photos.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => pick(p)}
                        disabled={importing !== null}
                        className="group relative rounded-lg overflow-hidden border border-gray-200 hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:opacity-50"
                        data-testid={`pexels-photo-${p.id}`}
                      >
                        <img
                          src={p.thumb}
                          alt={p.alt || ''}
                          className="w-full h-32 object-cover"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 flex items-center justify-center transition-colors">
                          {importing === p.id ? (
                            <Loader2 size={20} className="text-white animate-spin" />
                          ) : (
                            <Check
                              size={20}
                              className="text-white opacity-0 group-hover:opacity-100 transition-opacity"
                            />
                          )}
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 px-2 py-1 bg-black/60 text-white text-[10px] truncate">
                          Photo by {p.photographer}
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PexelsImagePicker;
