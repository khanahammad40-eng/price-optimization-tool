import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ProductModal from '../components/ProductModal';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import API from '../api';
import './Products.css';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [viewMode, setViewMode] = useState('products'); // 'products' | 'demand'
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const canCreate = ['admin', 'supplier'].includes(user?.role);
  const canEdit = ['admin', 'supplier'].includes(user?.role);
  const canDelete = user?.role === 'admin';

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (category) params.category = category;
      const res = await API.get('/products', { params });
      setProducts(res.data.products || res.data);
    } catch (err) {
      toast('Failed to load products', 'error');
    } finally {
      setLoading(false);
    }
  }, [search, category]);

  const fetchCategories = async () => {
    try {
      const res = await API.get('/products/meta/categories');
      setCategories(res.data);
    } catch { /* silent */ }
  };

  useEffect(() => { fetchProducts(); }, [fetchProducts]);
  useEffect(() => { fetchCategories(); }, []);

  const handleSave = async (form) => {
    try {
      if (editProduct) {
        await API.put(`/products/${editProduct.id}`, form);
        toast('Product updated successfully', 'success');
      } else {
        await API.post('/products', form);
        toast('Product added successfully', 'success');
      }
      setShowModal(false);
      setEditProduct(null);
      fetchProducts();
    } catch (err) {
      toast(err.response?.data?.error || 'Failed to save product', 'error');
      throw err;
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/products/${id}`);
      toast('Product deleted', 'success');
      setDeleteId(null);
      fetchProducts();
    } catch (err) {
      toast(err.response?.data?.error || 'Failed to delete', 'error');
    }
  };

  const fmt = (n) => n != null ? `$${Number(n).toFixed(2)}` : '—';
  const fmtNum = (n) => n != null ? Number(n).toLocaleString() : '—';

  return (
    <div className="products-page">
      <Navbar />

      <div className="products-container">
        {/* Top bar */}
        <div className="products-topbar">
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/')}>
            ← Back
          </button>

          <div className="products-tabs">
            <button
              className={`tab-btn ${viewMode === 'products' ? 'active' : ''}`}
              onClick={() => setViewMode('products')}
            >
              Create and Manage Product
            </button>
            <button
              className={`tab-btn ${viewMode === 'demand' ? 'active' : ''}`}
              onClick={() => setViewMode('demand')}
            >
              With Demand Forecast
            </button>
          </div>

          <div className="products-actions">
            <div className="search-wrap">
              <svg className="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                className="input search-input"
                placeholder="Search products..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            <select className="input filter-select" value={category} onChange={e => setCategory(e.target.value)}>
              <option value="">All Categories</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            {canCreate && (
              <button className="btn btn-primary" onClick={() => { setEditProduct(null); setShowModal(true); }}>
                + Add New Product
              </button>
            )}

            <button className="btn btn-secondary" onClick={() => navigate('/pricing')}>
              Demand Forecast
            </button>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="products-loading"><span className="spinner" /> Loading products...</div>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <h3>No products found</h3>
            <p>{search || category ? 'Try adjusting your filters.' : 'Add your first product to get started.'}</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Product Name</th>
                  <th>Category</th>
                  <th>Cost Price</th>
                  <th>Selling Price</th>
                  <th>Description</th>
                  <th>Stock</th>
                  <th>Units Sold</th>
                  {viewMode === 'demand' && <th>Demand Forecast</th>}
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p, i) => (
                  <tr key={p.id}>
                    <td style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{i + 1}</td>
                    <td className="name-cell">{p.name}</td>
                    <td><span className="chip">{p.category || '—'}</span></td>
                    <td className="price-cell">{fmt(p.cost_price)}</td>
                    <td className="price-cell">{fmt(p.selling_price)}</td>
                    <td className="desc-cell">{p.description || '—'}</td>
                    <td>{fmtNum(p.stock_available)}</td>
                    <td>{fmtNum(p.units_sold)}</td>
                    {viewMode === 'demand' && (
                      <td style={{ color: 'var(--accent)', fontFamily: 'DM Mono', fontSize: '12px' }}>
                        {fmtNum(p.demand_forecast)}
                      </td>
                    )}
                    <td>
                      <div className="action-btns">
                        {canEdit && (
                          <button className="action-btn edit" title="Edit"
                            onClick={() => { setEditProduct(p); setShowModal(true); }}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                          </button>
                        )}
                        {canDelete && (
                          <button className="action-btn delete" title="Delete"
                            onClick={() => setDeleteId(p.id)}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="3 6 5 6 21 6"/>
                              <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                              <path d="M10 11v6M14 11v6"/>
                              <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
                            </svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="products-footer">
          <span>{products.length} product{products.length !== 1 ? 's' : ''}</span>
          {(canCreate) && (
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary btn-sm" onClick={() => { setEditProduct(null); setShowModal(true); }}>Save</button>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <ProductModal
          product={editProduct}
          onClose={() => { setShowModal(false); setEditProduct(null); }}
          onSave={handleSave}
        />
      )}

      {/* Delete Confirm Modal */}
      {deleteId && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setDeleteId(null)}>
          <div className="modal" style={{ maxWidth: 400 }}>
            <div className="modal-header">
              <h2 className="modal-title">Delete Product</h2>
              <button className="modal-close" onClick={() => setDeleteId(null)}>×</button>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
              Are you sure you want to delete this product? This action cannot be undone.
            </p>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setDeleteId(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => handleDelete(deleteId)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
