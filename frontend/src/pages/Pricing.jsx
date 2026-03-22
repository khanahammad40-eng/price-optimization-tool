import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';
import Navbar from '../components/Navbar';
import { useToast } from '../components/Toast';
import API from '../api';
import './Pricing.css';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="chart-tooltip">
        <p className="tooltip-label">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color, fontSize: 12 }}>
            {p.name}: {p.name.includes('Price') ? `$${Number(p.value).toFixed(2)}` : Number(p.value).toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

function PriceDiff({ selling, optimized }) {
  if (optimized == null || selling == null) return <span style={{color:'var(--text-muted)'}}>—</span>;
  const diff = Number(optimized) - Number(selling);
  const pct = ((diff / Number(selling)) * 100).toFixed(1);
  const up = diff >= 0;
  return (
    <span className={`price-diff ${up ? 'up' : 'down'}`}>
      {up ? '▲' : '▼'} {Math.abs(pct)}%
    </span>
  );
}

export default function Pricing() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [activeTab, setActiveTab] = useState('optimization');
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const params = category ? { category } : {};
        const res = await API.get('/products', { params });
        setProducts(res.data.products || res.data);
      } catch {
        toast('Failed to load products', 'error');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [category]);

  useEffect(() => {
    API.get('/products/meta/categories').then(r => setCategories(r.data)).catch(() => {});
  }, []);

  const fmt  = n => (n != null && n !== '') ? `$${Number(n).toFixed(2)}` : '—';
  const fmtN = n => (n != null && n !== '') ? Number(n).toLocaleString() : '—';

  // Summary stats
  const total = products.length;
  const avgSell = total ? (products.reduce((s,p) => s + (Number(p.selling_price)||0), 0) / total).toFixed(2) : '0.00';
  const avgOpt  = total ? (products.reduce((s,p) => s + (Number(p.optimized_price)||0), 0) / total).toFixed(2) : '0.00';
  const savings = products.filter(p => Number(p.optimized_price) < Number(p.selling_price)).length;

  const chartData = products.slice(0, 10).map(p => ({
    name: p.name.length > 12 ? p.name.slice(0,12)+'…' : p.name,
    'Selling Price':    Number(p.selling_price)    || 0,
    'Demand Forecast':  Number(p.demand_forecast)  || 0,
    'Optimized Price':  Number(p.optimized_price)  || 0,
  }));

  return (
    <div className="pricing-page">
      <Navbar />
      <div className="pricing-container">

        {/* ── Top bar ── */}
        <div className="pricing-topbar">
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/')}>← Back</button>

          <div className="products-tabs">
            <button className={`tab-btn ${activeTab==='optimization'?'active':''}`}
              onClick={() => setActiveTab('optimization')}>Pricing Optimization</button>
            <button className={`tab-btn ${activeTab==='forecast'?'active':''}`}
              onClick={() => setActiveTab('forecast')}>With Demand Forecast</button>
          </div>

          <div className="topbar-right">
            <select className="input filter-select" value={category} onChange={e => setCategory(e.target.value)}>
              <option value="">All Categories</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/products')}>
              Manage Products
            </button>
          </div>
        </div>

        {/* ── Summary cards — Optimization tab only ── */}
        {activeTab === 'optimization' && (
          <div className="summary-cards">
            <div className="summary-card">
              <div className="summary-icon blue">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/>
                </svg>
              </div>
              <div>
                <div className="summary-label">Total Products</div>
                <div className="summary-value">{total}</div>
              </div>
            </div>
            <div className="summary-card">
              <div className="summary-icon orange">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
                </svg>
              </div>
              <div>
                <div className="summary-label">Avg Selling Price</div>
                <div className="summary-value">${avgSell}</div>
              </div>
            </div>
            <div className="summary-card accent">
              <div className="summary-icon green">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
                </svg>
              </div>
              <div>
                <div className="summary-label">Avg Optimized Price</div>
                <div className="summary-value">${avgOpt}</div>
              </div>
            </div>
            <div className="summary-card">
              <div className="summary-icon red">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
              </div>
              <div>
                <div className="summary-label">Price Reduction Opportunities</div>
                <div className="summary-value">{savings} <span style={{fontSize:12,fontWeight:400,color:'var(--text-muted)'}}>products</span></div>
              </div>
            </div>
          </div>
        )}

        {/* ── Demand Forecast Chart — Forecast tab only ── */}
        {activeTab === 'forecast' && (
          <div className="chart-panel">
            <div className="chart-header">
              <h2 className="chart-title">Demand Forecast vs Selling Price</h2>
              <div className="chart-legend-custom">
                <span className="legend-dot" style={{background:'#00c896'}}/>Demand Forecast
                <span className="legend-dot" style={{background:'#4d9fff',marginLeft:16}}/>Selling Price
                <span className="legend-dot" style={{background:'#ffb347',marginLeft:16}}/>Optimized Price
              </div>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={chartData} margin={{top:8,right:20,left:0,bottom:0}}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2f3a"/>
                <XAxis dataKey="name" tick={{fill:'#8b92a0',fontSize:11}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fill:'#8b92a0',fontSize:11}} axisLine={false} tickLine={false}/>
                <Tooltip content={<CustomTooltip/>}/>
                <Line type="monotone" dataKey="Demand Forecast" stroke="#00c896" strokeWidth={2} dot={{fill:'#00c896',r:3}} activeDot={{r:5}}/>
                <Line type="monotone" dataKey="Selling Price"   stroke="#4d9fff" strokeWidth={2} dot={{fill:'#4d9fff',r:3}} activeDot={{r:5}}/>
                <Line type="monotone" dataKey="Optimized Price" stroke="#ffb347" strokeWidth={2} strokeDasharray="5 4" dot={{fill:'#ffb347',r:3}} activeDot={{r:5}}/>
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* ── Tables ── */}
        {loading ? (
          <div className="loading-state"><span className="spinner"/> Loading products…</div>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <h3>No products found</h3>
            <p>Try a different category or add products first.</p>
          </div>
        ) : activeTab === 'optimization' ? (

          /* ══ PRICING OPTIMIZATION TABLE ══ */
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Product Name</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Cost Price</th>
                  <th>Selling Price</th>
                  <th>Stock</th>
                  <th>Units Sold</th>
                  <th>Rating</th>
                  <th>Optimized Price</th>
                  <th>vs Selling</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p, i) => (
                  <tr key={p.id}>
                    <td className="muted-cell">{i+1}</td>
                    <td className="name-cell">{p.name}</td>
                    <td><span className="chip">{p.category||'—'}</span></td>
                    <td className="desc-cell" title={p.description}>{p.description||'—'}</td>
                    <td className="price-cell">{fmt(p.cost_price)}</td>
                    <td className="price-cell">{fmt(p.selling_price)}</td>
                    <td className="num-cell">{fmtN(p.stock_available)}</td>
                    <td className="num-cell">{fmtN(p.units_sold)}</td>
                    <td>
                      {p.customer_rating != null
                        ? <span className="rating-cell">★ {Number(p.customer_rating).toFixed(1)}</span>
                        : '—'}
                    </td>
                    <td>
                      <span className="optimized-pill">{fmt(p.optimized_price)}</span>
                    </td>
                    <td>
                      <PriceDiff selling={p.selling_price} optimized={p.optimized_price}/>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        ) : (

          /* ══ DEMAND FORECAST TABLE ══ */
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Product Name</th>
                  <th>Category</th>
                  <th>Cost Price</th>
                  <th>Selling Price</th>
                  <th>Stock Available</th>
                  <th>Units Sold</th>
                  <th>Calculated Demand Forecast</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p, i) => (
                  <tr key={p.id}>
                    <td className="muted-cell">{i+1}</td>
                    <td className="name-cell">{p.name}</td>
                    <td><span className="chip">{p.category||'—'}</span></td>
                    <td className="price-cell">{fmt(p.cost_price)}</td>
                    <td className="price-cell">{fmt(p.selling_price)}</td>
                    <td className="num-cell">{fmtN(p.stock_available)}</td>
                    <td className="num-cell">{fmtN(p.units_sold)}</td>
                    <td><span className="forecast-badge">{fmtN(p.demand_forecast)}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Footer ── */}
        <div className="pricing-footer">
          <span className="footer-count">{products.length} product{products.length!==1?'s':''}</span>
          <div style={{display:'flex',gap:8}}>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/')}>Cancel</button>
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/products')}>Manage Products</button>
          </div>
        </div>

      </div>
    </div>
  );
}
