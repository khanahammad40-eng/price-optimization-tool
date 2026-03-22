import { useState, useEffect } from 'react';

const EMPTY = {
  name: '', description: '', category: '', cost_price: '',
  selling_price: '', stock_available: '', units_sold: '',
  customer_rating: '', demand_forecast: '', optimized_price: ''
};

export default function ProductModal({ product, onClose, onSave }) {
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name || '',
        description: product.description || '',
        category: product.category || '',
        cost_price: product.cost_price || '',
        selling_price: product.selling_price || '',
        stock_available: product.stock_available || '',
        units_sold: product.units_sold || '',
        customer_rating: product.customer_rating || '',
        demand_forecast: product.demand_forecast || '',
        optimized_price: product.optimized_price || ''
      });
    }
  }, [product]);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(form);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['Electronics', 'Apparel', 'Wearables', 'Outdoor & Sports', 'Home Automation', 'Transportation', 'Stationary', 'Other'];

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">{product ? 'Edit Product' : 'Add New Product'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-grid">
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Product Name *</label>
              <input className="input" name="name" value={form.name}
                onChange={handleChange} placeholder="e.g. Wireless Earbuds" required />
            </div>

            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="input" name="category" value={form.category} onChange={handleChange}>
                <option value="">Select category</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Customer Rating</label>
              <input className="input" type="number" name="customer_rating"
                value={form.customer_rating} onChange={handleChange}
                placeholder="1–5" min="1" max="5" step="0.1" />
            </div>

            <div className="form-group">
              <label className="form-label">Cost Price ($) *</label>
              <input className="input" type="number" name="cost_price"
                value={form.cost_price} onChange={handleChange}
                placeholder="0.00" step="0.01" required />
            </div>

            <div className="form-group">
              <label className="form-label">Selling Price ($) *</label>
              <input className="input" type="number" name="selling_price"
                value={form.selling_price} onChange={handleChange}
                placeholder="0.00" step="0.01" required />
            </div>

            <div className="form-group">
              <label className="form-label">Stock Available</label>
              <input className="input" type="number" name="stock_available"
                value={form.stock_available} onChange={handleChange} placeholder="0" />
            </div>

            <div className="form-group">
              <label className="form-label">Units Sold</label>
              <input className="input" type="number" name="units_sold"
                value={form.units_sold} onChange={handleChange} placeholder="0" />
            </div>

            <div className="form-group">
              <label className="form-label">Demand Forecast</label>
              <input className="input" type="number" name="demand_forecast"
                value={form.demand_forecast} onChange={handleChange} placeholder="0" />
            </div>

            <div className="form-group">
              <label className="form-label">Optimized Price ($)</label>
              <input className="input" type="number" name="optimized_price"
                value={form.optimized_price} onChange={handleChange}
                placeholder="0.00" step="0.01" />
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Description</label>
              <textarea className="input" name="description" value={form.description}
                onChange={handleChange} placeholder="Product description..."
                rows={3} style={{ resize: 'vertical' }} />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="spinner" /> : (product ? 'Save Changes' : 'Add Product')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
