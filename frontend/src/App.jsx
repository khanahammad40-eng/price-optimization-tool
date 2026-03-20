 import { useEffect, useState } from 'react';
import API from './api';

function App() {
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState('Checking...');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check backend health
    API.get('/health')
      .then(res => setStatus(res.data.message))
      .catch(() => setStatus('Backend not reachable ❌'));

    // Fetch real products from DB
    API.get('/products')
      .then(res => {
        setProducts(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '1100px', margin: '0 auto' }}>
      <h1>💰 Price Optimization Tool</h1>
      <p>Backend Status: <strong style={{ color: 'green' }}>{status}</strong></p>

      <h2>Products ({products.length})</h2>

      {loading ? (
        <p>Loading products...</p>
      ) : (
        <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
          <thead style={{ background: '#f0f0f0' }}>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Category</th>
              <th>Cost Price</th>
              <th>Selling Price</th>
              <th>Stock</th>
              <th>Units Sold</th>
              <th>Rating</th>
              <th>Demand Forecast</th>
              <th>Optimized Price</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.name}</td>
                <td>{p.category}</td>
                <td>${p.cost_price}</td>
                <td>${p.selling_price}</td>
                <td>{p.stock_available}</td>
                <td>{p.units_sold}</td>
                <td>{p.customer_rating}</td>
                <td>{p.demand_forecast}</td>
                <td style={{ color: 'green', fontWeight: 'bold' }}>${p.optimized_price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default App;