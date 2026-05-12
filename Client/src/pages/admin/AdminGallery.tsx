import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Image as ImageIcon, Plus, Trash2, X, Camera, Upload, AlertCircle } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import Button from '../../components/ui/Button';
import { api, ApiGalleryImage } from '../../lib/api';

const AdminGallery = () => {
  const [images, setImages] = useState<ApiGalleryImage[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [newImage, setNewImage] = useState<{ url: string; public_id: string; title: string }>({ url: '', public_id: '', title: '' });
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const loadImages = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.gallery.list('academy');
      setImages(response.images);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Images load nahi ho paye.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadImages();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Kya aap is image ko delete karna chahte hain?')) return;
    setSaving(true);
    try {
      await api.gallery.delete(id);
      setImages((prev) => prev.filter((img) => img.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete fail ho gaya.');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');
    try {
      const response = await api.upload(file, 'banners');
      // Update local state for modal preview
      setNewImage(prev => ({ ...prev, url: response.imageUrl, public_id: (response as any).public_id || 'manual' }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload fail ho gaya.');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!newImage.url) return;
    setSaving(true);
    try {
      const response = await api.gallery.add({
        image_url: newImage.url,
        public_id: newImage.public_id,
        title: newImage.title,
        section: 'academy'
      });
      setImages((prev) => [response.image, ...prev]);
      setIsModalOpen(false);
      setNewImage({ url: '', public_id: '', title: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save fail ho gaya.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-10">
        <div>
          <h1 className="text-3xl font-serif font-bold text-white">Academy Gallery</h1>
          <p className="text-brand-cream/40 mt-1">Home page slider ki images manage karein</p>
        </div>
        <Button
          variant="primary"
          className="flex items-center gap-2"
          onClick={() => {
            setError('');
            setIsModalOpen(true);
          }}
        >
          <Plus size={20} /> Add New Image
        </Button>
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-red-400/30 bg-red-500/10 px-5 py-4 text-red-200">
          <AlertCircle size={20} /> {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
           {[1,2,3,4].map(i => (
             <div key={i} className="aspect-square bg-white/5 animate-pulse rounded-2xl" />
           ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <AnimatePresence mode="popLayout">
            {images.map((img) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                key={img.id}
                className="group relative aspect-square bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-brand-gold/30 transition-all"
              >
                <img src={img.image_url} alt={img.title || ''} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                   <button
                    onClick={() => handleDelete(img.id)}
                    className="p-3 bg-red-500 text-white rounded-xl hover:scale-110 transition-all"
                   >
                     <Trash2 size={20} />
                   </button>
                </div>
                {img.title && (
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                    <p className="text-xs text-white truncate">{img.title}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Upload Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-brand-dark border border-brand-gold/20 rounded-3xl overflow-hidden p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-serif font-bold text-brand-gold">Upload Image</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/5 rounded-full text-brand-cream/60">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6">
                <div 
                  className="aspect-video w-full rounded-2xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center relative overflow-hidden group cursor-pointer hover:border-brand-gold/30 transition-all"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {newImage.url ? (
                    <img src={newImage.url} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center p-6">
                      <Camera size={40} className="mx-auto mb-2 text-brand-cream/20" />
                      <p className="text-sm text-brand-cream/40 font-medium">Click to select an image</p>
                    </div>
                  )}
                  {uploading && (
                    <div className="absolute inset-0 bg-brand-dark/60 flex items-center justify-center">
                       <div className="w-8 h-8 border-4 border-brand-gold border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                  <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-brand-gold uppercase tracking-widest ml-1">Title (Optional)</label>
                  <input
                    type="text"
                    placeholder="Enter image title..."
                    value={newImage.title}
                    onChange={(e) => setNewImage({ ...newImage, title: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-brand-gold/50 text-white"
                  />
                </div>

                <Button 
                  onClick={handleSave} 
                  disabled={saving || !newImage.url || uploading} 
                  className="w-full py-4 flex items-center justify-center gap-2"
                >
                  <Upload size={20} /> {saving ? 'Saving...' : 'Add to Gallery'}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
};

export default AdminGallery;
