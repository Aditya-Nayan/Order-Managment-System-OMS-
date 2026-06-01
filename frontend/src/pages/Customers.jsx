import { useState, useEffect } from 'react';
import api from '../api';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const emptyForm = { name: '', email: '', phone: '', address: '' };

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/customers');
      setCustomers(res.data);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Name is required';
    if (!form.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = 'Invalid email format';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      await api.post('/customers', {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || null,
        address: form.address.trim() || null,
      });
      toast.success('Customer created successfully');
      setShowModal(false);
      setForm(emptyForm);
      setErrors({});
      fetchCustomers();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create customer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This action cannot be undone.`)) return;
    try {
      await api.delete(`/customers/${id}`);
      toast.success(`"${name}" deleted`);
      fetchCustomers();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to delete customer');
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

  if (loading) return <LoadingSpinner text="Loading customers" />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your customer base</p>
        </div>
        <button onClick={openModal} className="btn-primary self-start text-sm">
          Add Customer
        </button>
      </div>

      {/* Table or Empty State */}
      {customers.length === 0 ? (
        <div className="card p-14 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">No customers yet</h3>
          <p className="text-gray-500 text-sm mb-5">Add your first customer!</p>
          <button onClick={openModal} className="btn-primary text-sm">Add Customer</button>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Name</th>
                  <th className="px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Email</th>
                  <th className="px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Phone</th>
                  <th className="px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Address</th>
                  <th className="px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id} className="table-row">
                    <td className="px-5 py-3.5 font-medium text-gray-900">{customer.name}</td>
                    <td className="px-5 py-3.5 text-gray-600">{customer.email}</td>
                    <td className="px-5 py-3.5 text-gray-600">{customer.phone || '-'}</td>
                    <td className="px-5 py-3.5 text-gray-600 truncate max-w-xs">{customer.address || '-'}</td>
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => handleDelete(customer.id, customer.name)}
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

      {/* Add Customer Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Customer">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className={`input-field ${errors.name ? 'border-red-400 focus:ring-red-400' : ''}`}
              placeholder="e.g. John Doe"
            />
            {errors.name && <p className="text-red-600 text-xs mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className={`input-field ${errors.email ? 'border-red-400 focus:ring-red-400' : ''}`}
              placeholder="e.g. john@example.com"
            />
            {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="text"
              value={form.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              className="input-field"
              placeholder="e.g. +91-9876543210"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <textarea
              value={form.address}
              onChange={(e) => handleChange('address', e.target.value)}
              className="input-field resize-none"
              rows={3}
              placeholder="e.g. Mumbai, India"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary text-sm">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn-primary text-sm">
              {submitting ? 'Creating...' : 'Create Customer'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default Customers;
