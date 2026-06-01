import { useState, useEffect, useMemo } from 'react';
import api from '../api';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const statusConfig = {
  pending: { label: 'Pending', bg: 'bg-yellow-100', text: 'text-yellow-700' },
  processing: { label: 'Processing', bg: 'bg-blue-100', text: 'text-blue-700' },
  shipped: { label: 'Shipped', bg: 'bg-purple-100', text: 'text-purple-700' },
  delivered: { label: 'Delivered', bg: 'bg-green-100', text: 'text-green-700' },
};

function Orders() {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(null);

  // Order form state
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [orderItems, setOrderItems] = useState([{ product_id: '', quantity: 1 }]);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/orders');
      setOrders(res.data);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchFormData = async () => {
    try {
      const [custRes, prodRes] = await Promise.all([
        api.get('/customers'),
        api.get('/products'),
      ]);
      setCustomers(custRes.data);
      setProducts(prodRes.data);
    } catch (err) {
      toast.error('Failed to load form data');
    }
  };

  const openModal = async () => {
    setSelectedCustomer('');
    setOrderItems([{ product_id: '', quantity: 1 }]);
    setFormErrors({});
    await fetchFormData();
    setShowModal(true);
  };

  const addItem = () => {
    setOrderItems((prev) => [...prev, { product_id: '', quantity: 1 }]);
  };

  const removeItem = (index) => {
    if (orderItems.length <= 1) return;
    setOrderItems((prev) => prev.filter((_, i) => i !== index));
  };

  const updateItem = (index, field, value) => {
    setOrderItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
    if (formErrors.items) setFormErrors((prev) => ({ ...prev, items: '' }));
  };

  // Calculate running total
  const runningTotal = useMemo(() => {
    return orderItems.reduce((total, item) => {
      if (!item.product_id || !item.quantity) return total;
      const product = products.find((p) => p.id === Number(item.product_id));
      if (!product) return total;
      return total + product.price * Number(item.quantity);
    }, 0);
  }, [orderItems, products]);

  const validateOrderForm = () => {
    const errors = {};
    if (!selectedCustomer) errors.customer = 'Please select a customer';

    const validItems = orderItems.filter((item) => item.product_id && item.quantity > 0);
    if (validItems.length === 0) errors.items = 'Add at least one product to the order';

    for (let i = 0; i < orderItems.length; i++) {
      if (orderItems[i].product_id && Number(orderItems[i].quantity) <= 0) {
        errors.items = 'Quantity must be at least 1';
        break;
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    if (!validateOrderForm()) return;

    const items = orderItems
      .filter((item) => item.product_id && item.quantity > 0)
      .map((item) => ({
        product_id: Number(item.product_id),
        quantity: Number(item.quantity),
      }));

    try {
      setSubmitting(true);
      await api.post('/orders', {
        customer_id: Number(selectedCustomer),
        items,
      });
      toast.success('Order created successfully!');
      setShowModal(false);
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create order');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setUpdatingStatus(orderId);
      await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      toast.success(`Order #${orderId} status updated to ${newStatus}`);
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to update status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) return <LoadingSpinner text="Loading orders" />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-sm text-gray-500 mt-1">Track and manage customer orders</p>
        </div>
        <button onClick={openModal} className="btn-primary self-start text-sm">
          New Order
        </button>
      </div>

      {/* Table or Empty State */}
      {orders.length === 0 ? (
        <div className="card p-14 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">No orders yet</h3>
          <p className="text-gray-500 text-sm mb-5">Create your first order!</p>
          <button onClick={openModal} className="btn-primary text-sm">New Order</button>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Order ID</th>
                  <th className="px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Customer</th>
                  <th className="px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Total</th>
                  <th className="px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Date</th>
                  <th className="px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Items</th>
                  <th className="px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const config = statusConfig[order.status] || statusConfig.pending;
                  return (
                    <tr key={order.id} className="table-row">
                      <td className="px-5 py-3.5">
                        <span className="font-mono font-semibold text-gray-900">#{order.id}</span>
                      </td>
                      <td className="px-5 py-3.5 text-gray-700 font-medium">
                        {order.customer_name || 'Unknown'}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${config.bg} ${config.text}`}>
                          {config.label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-gray-900 font-medium">
                        ${Number(order.total_price).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-5 py-3.5 text-gray-500 text-xs">
                        {formatDate(order.created_at)}
                      </td>
                      <td className="px-5 py-3.5">
                        {order.items && order.items.length > 0 ? (
                          <div className="text-xs text-gray-500 space-y-0.5">
                            {order.items.map((item, idx) => (
                              <div key={idx}>
                                {item.product?.name || `Product #${item.product_id}`} x {item.quantity}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">-</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          disabled={updatingStatus === order.id}
                          className="bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer disabled:opacity-50"
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* New Order Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create New Order">
        <form onSubmit={handleCreateOrder} className="space-y-4">
          {/* Customer Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Customer *</label>
            <select
              value={selectedCustomer}
              onChange={(e) => {
                setSelectedCustomer(e.target.value);
                if (formErrors.customer) setFormErrors((prev) => ({ ...prev, customer: '' }));
              }}
              className={`input-field ${formErrors.customer ? 'border-red-400 focus:ring-red-400' : ''}`}
            >
              <option value="">Select a customer</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.email})
                </option>
              ))}
            </select>
            {formErrors.customer && <p className="text-red-600 text-xs mt-1">{formErrors.customer}</p>}
          </div>

          {/* Order Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">Order Items *</label>
              <button type="button" onClick={addItem} className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                + Add Item
              </button>
            </div>

            <div className="space-y-2">
              {orderItems.map((item, index) => {
                const selectedProduct = products.find((p) => p.id === Number(item.product_id));
                const lineTotal = selectedProduct ? selectedProduct.price * Number(item.quantity || 0) : 0;

                return (
                  <div key={index} className="flex items-start gap-2 p-3 rounded-lg bg-gray-50 border border-gray-200">
                    <div className="flex-1 min-w-0">
                      <select
                        value={item.product_id}
                        onChange={(e) => updateItem(index, 'product_id', e.target.value)}
                        className="input-field text-sm mb-2"
                      >
                        <option value="">Select product</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} — ${p.price.toFixed(2)} (Stock: {p.stock})
                          </option>
                        ))}
                      </select>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <label className="text-xs text-gray-500">Qty:</label>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                            className="input-field text-sm w-20"
                          />
                        </div>
                        {selectedProduct && (
                          <span className="text-xs text-gray-500">
                            = <span className="text-gray-900 font-semibold">${lineTotal.toFixed(2)}</span>
                          </span>
                        )}
                      </div>
                    </div>
                    {orderItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="text-xs text-red-500 hover:text-red-700 font-medium mt-2 shrink-0"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
            {formErrors.items && <p className="text-red-600 text-xs mt-1">{formErrors.items}</p>}
          </div>

          {/* Running Total */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-blue-50 border border-blue-200">
            <span className="text-sm font-medium text-gray-700">Order Total</span>
            <span className="text-xl font-bold text-gray-900">
              ${runningTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary text-sm">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn-primary text-sm">
              {submitting ? 'Creating...' : 'Create Order'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default Orders;
