import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Package, Search, Plus, Edit, Trash2, X, Save, AlertCircle, Camera, Upload } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import Button from '../../components/ui/Button';
import { api, ApiProduct } from '../../lib/api';

const productImages = [
  'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1535141192574-5d4897c12636?w=500&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=500&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=500&auto=format&fit=crop&q=60',
];

const emptyProduct: Partial<ApiProduct> = {
  id: 0,
  name: '',
  description: '',
  category: 'Cake',
  price: '',
  available: true,
  image_url: '',
};

const money = (value: string | number) => `₹${Number(value || 0).toLocaleString('en-IN')}`;

const AdminProducts = () => {
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<ApiProduct> | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const loadProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.products.list();
      setProducts(response.products);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Products load nahi ho paye.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return products.filter((product) =>
      [product.name, product.category, product.description]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    );
  }, [products, searchQuery]);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this product? Superadmin role required.')) return;
    setSaving(true);
    setError('');
    try {
      await api.products.delete(id);
      setProducts((prev) => prev.filter((product) => product.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Product delete nahi ho paya.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (product: ApiProduct) => {
    setEditingProduct(product);
    setError('');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    setSaving(true);
    setError('');

    const payload = {
      name: editingProduct.name || '',
      description: editingProduct.description || '',
      category: editingProduct.category || '',
      price: Number(editingProduct.price || 0),
      image_url: editingProduct.image_url || '',
      available: editingProduct.available ?? true,
    };

    try {
      if (editingProduct.id && editingProduct.id !== 0) {
        const response = await api.products.update(editingProduct.id, payload);
        setProducts((prev) => prev.map((product) => (product.id === response.product.id ? response.product : product)));
      } else {
        const response = await api.products.create(payload);
        setProducts((prev) => [...prev, response.product]);
      }

      setIsModalOpen(false);
      setEditingProduct(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Product save nahi ho paya.');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Local preview dikhao turant
    const localPreview = URL.createObjectURL(file);
    setEditingProduct((prev) => prev ? { ...prev, image_url: localPreview } : prev);

    setUploading(true);
    setError('');
    try {
      const response = await api.upload(file, 'products');
      // Functional update: stale closure bug fix
      setEditingProduct((prev) => prev ? { ...prev, image_url: response.imageUrl } : prev);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Image upload nahi ho paya.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-10">
        <div>
          <h1 className="text-3xl font-serif font-bold text-white">Product Catalog</h1>
          <p className="text-brand-cream/40 mt-1">Create, update and manage bakery items</p>
        </div>
        <Button
          variant="primary"
          className="flex items-center gap-2"
          onClick={() => {
            setEditingProduct(emptyProduct);
            setError('');
            setIsModalOpen(true);
          }}
        >
          <Plus size={20} /> Add New Product
        </Button>
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-red-400/30 bg-red-500/10 px-5 py-4 text-red-200">
          <AlertCircle size={20} /> {error}
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-cream/40" size={18} />
          <input
            type="text"
            placeholder="Search by product name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 focus:border-brand-gold/50 outline-none text-white transition-all"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-brand-cream/40">Loading products...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredProducts.map((product, index) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                key={product.id}
                className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden group hover:border-brand-gold/30 transition-all"
              >
                <div className="relative h-48 overflow-hidden">
                  <img src={product.image_url || productImages[index % productImages.length]} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute top-2 right-2 flex gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEdit(product)}
                      className="p-2 bg-white/10 backdrop-blur-md text-white rounded-lg hover:bg-brand-gold hover:text-brand-dark transition-colors"
                      aria-label="Edit product"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      disabled={saving}
                      className="p-2 bg-white/10 backdrop-blur-md text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition-colors disabled:opacity-50"
                      aria-label="Delete product"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="absolute bottom-2 left-2 px-3 py-1 bg-brand-gold text-brand-dark text-[10px] font-bold uppercase rounded-full">
                    {product.category || 'Bakery'}
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-white font-bold truncate pr-2">{product.name}</h3>
                    <span className="text-brand-gold font-bold">{money(product.price)}</span>
                  </div>
                  <p className="text-xs text-brand-cream/45 line-clamp-2">{product.description || 'No description yet.'}</p>
                  <div className="flex items-center justify-between mt-4 text-xs text-brand-cream/40">
                    <div className="flex items-center gap-1">
                      <Package size={14} /> {product.available ? 'Available' : 'Hidden'}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <AnimatePresence>
        {isModalOpen && editingProduct && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-[95%] sm:w-full max-w-md max-h-[90vh] bg-brand-dark border border-brand-gold/20 rounded-3xl overflow-hidden shadow-2xl flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 sm:p-6 overflow-y-auto scrollbar-hide flex-1">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl sm:text-2xl font-serif font-bold text-brand-gold">
                    {editingProduct.id === 0 ? 'Add New Product' : 'Edit Product'}
                  </h2>
                  <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/5 rounded-full text-brand-cream/60">
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleSave} className="space-y-3">
                  {/* Image Upload Area */}
                  <div className="relative group/img">
                    <div className="h-28 sm:h-32 w-full rounded-2xl overflow-hidden bg-white/5 border-2 border-dashed border-white/10 group-hover/img:border-brand-gold/30 transition-all relative">
                      {editingProduct.image_url ? (
                        <img src={editingProduct.image_url} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-brand-cream/20">
                          <Camera size={48} className="mb-2" />
                          <p className="text-xs font-bold uppercase tracking-widest">No Image Selected</p>
                        </div>
                      )}
                      
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="p-3 bg-brand-gold text-brand-dark rounded-xl hover:scale-110 transition-all font-bold flex items-center gap-2"
                        >
                          <Upload size={20} /> {uploading ? 'Uploading...' : 'Upload'}
                        </button>
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleImageUpload}
                          accept="image/*"
                          className="hidden"
                        />
                      </div>
                    </div>
                    {uploading && (
                      <div className="absolute inset-0 bg-brand-dark/50 backdrop-blur-sm flex items-center justify-center rounded-2xl">
                        <div className="w-8 h-8 border-4 border-brand-gold border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-brand-gold uppercase tracking-widest ml-1">Product Name</label>
                    <input
                      type="text"
                      value={editingProduct.name || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-brand-gold/50 text-white"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-brand-gold uppercase tracking-widest ml-1">Description</label>
                    <textarea
                      value={editingProduct.description || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-brand-gold/50 text-white resize-none"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-brand-gold uppercase tracking-widest ml-1">Category</label>
                      <input
                        type="text"
                        value={editingProduct.category || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-brand-gold/50 text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-brand-gold uppercase tracking-widest ml-1">Price</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-gold font-bold text-base select-none">₹</span>
                        <input
                          type="number"
                          min="0"
                          value={editingProduct.price || ''}
                          onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-xl p-3 pl-8 outline-none focus:border-brand-gold/50 text-white"
                          required
                        />
                      </div>
                    </div>
                  </div>

                </form>
              </div>

              {/* Fixed sticky footer — scroll ke bahar */}
              <div className="shrink-0 px-4 sm:px-6 py-4 border-t border-white/10 bg-brand-dark flex flex-col gap-3">
                <label className="flex items-center gap-3 text-sm text-brand-cream/70 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={editingProduct.available ?? true}
                    onChange={(e) => setEditingProduct({ ...editingProduct, available: e.target.checked })}
                    className="h-4 w-4 accent-brand-gold"
                  />
                  Show this product in shop
                </label>
                <Button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  variant="primary"
                  className="w-full py-3 flex items-center justify-center gap-2"
                >
                  <Save size={18} /> {saving ? 'Saving...' : 'Save Product Changes'}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
};

export default AdminProducts;
