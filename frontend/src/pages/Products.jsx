import { useState, useEffect } from 'react';
import api from '../api';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const emptyForm = { name: '', sku: '', price: '', stock: '', description: '' };

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/products');
      setProducts(res.data);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Product name is required';
    if (!form.sku.trim()) newErrors.sku = 'SKU is required';
    if (!form.price || Number(form.price) <= 0) newErrors.price = 'Price must be greater than 0';
    if (form.stock === '' || Number(form.stock) < 0) newErrors.stock = 'Stock must be 0 or more';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      await api.post('/products', {
        name: form.name.trim(),
        sku: form.sku.trim(),
        price: Number(form.price),
        stock: Number(form.stock),
        description: form.description.trim() || null,
      });
      toast.success('Product created successfully');
      setShowModal(false);
      setForm(emptyForm);
      setErrors({});
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This action cannot be undone.`)) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success(`"${name}" deleted`);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to delete product');
    }
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const openModal = () => {
    setForm(emptyForm);
    setErrors({});
    setShowModal(true);
  };

  if (loading) return <LoadingSpinner text="Loading products" />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your product inventory</p>
        </div>
        <button onClick={openModal} className="btn-primary self-start text-sm">
          Add Product
        </button>
      </div>

      {/* Table or Empty State */}
      {products.length === 0 ? (
        <div className="card p-14 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">No products yet</h3>
          <p className="text-gray-500 text-sm mb-5">Add your first one!</p>
          <button onClick={openModal} className="btn-primary text-sm">Add Product</button>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Name</th>
                  <th className="px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">SKU</th>
                  <th className="px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Price</th>
                  <th className="px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Stock</th>
                  <th className="px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="table-row">
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-gray-900">{product.name}</p>
                      {product.description && (
                        <p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">{product.description}</p>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-gray-500 font-mono text-xs">{product.sku}</td>
                    <td className="px-5 py-3.5 text-gray-700 font-medium">
                      ${Number(product.price).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
                          product.stock >= 10
                            ? 'bg-green-100 text-green-700'
                            : product.stock === 0
                            ? 'bg-red-100 text-red-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {product.stock === 0 ? 'Out of Stock' : product.stock}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => handleDelete(product.id, product.name)}
                        className="text-sm text-red-600 hover:text-red-800 font-medium transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Product">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className={`input-field ${errors.name ? 'border-red-400 focus:ring-red-400' : ''}`}
              placeholder="e.g. Wireless Mouse"
            />
            {errors.name && <p className="text-red-600 text-xs mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">SKU *</label>
            <input
              type="text"
              value={form.sku}
              onChange={(e) => handleChange('sku', e.target.value)}
              className={`input-field ${errors.sku ? 'border-red-400 focus:ring-red-400' : ''}`}
              placeholder="e.g. MOU-002"
            />
            {errors.sku && <p className="text-red-600 text-xs mt-1">{errors.sku}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price ($) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.price}
                onChange={(e) => handleChange('price', e.target.value)}
                className={`input-field ${errors.price ? 'border-red-400 focus:ring-red-400' : ''}`}
                placeholder="0.00"
              />
              {errors.price && <p className="text-red-600 text-xs mt-1">{errors.price}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock *</label>
              <input
                type="number"
                min="0"
                value={form.stock}
                onChange={(e) => handleChange('stock', e.target.value)}
                className={`input-field ${errors.stock ? 'border-red-400 focus:ring-red-400' : ''}`}
                placeholder="0"
              />
              {errors.stock && <p className="text-red-600 text-xs mt-1">{errors.stock}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className="input-field resize-none"
              rows={3}
              placeholder="Optional product description"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary text-sm">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn-primary text-sm">
              {submitting ? 'Creating...' : 'Create Product'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default Products;
