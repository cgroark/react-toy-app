import { useState, useEffect, use } from 'react';
import type { Product, JSONResponse } from './interfaces/quotes';
import './App.css'


function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [total, setTotal] = useState<number>(0);
  const [search, setSearch] = useState<string>('');
  const [debounceSearch, setDebounceSearch] = useState<string>(search);
  const [limit, setLimit] = useState<number>(10);
  const [skip, setSkip] = useState<number>(0);

  useEffect(() => {
    const debounceHandler = setTimeout(() => setDebounceSearch(search), 300);
    return () => clearTimeout(debounceHandler);
  }, [search])

  useEffect(() => {
    if(!debounceSearch) return;
    const fetchProducts = async () => {
      setLoading(true);
      setError('');

      try {
        const res = await fetch(`https://dummyjson.com/products/search?q=${debounceSearch}&limit=${limit}&skip=${skip}`);
        if(!res.ok) throw new Error('failed to fetch');
        const data: JSONResponse = await res.json();
        setProducts(data.products);
        setTotal(data.total);
      }
      catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      }
      finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [debounceSearch, limit, skip])

  return (
    <>
      <h1>Product Check</h1>
      <label style={{paddingRight: '10px'}} htmlFor="search">Find Products</label>
      <input type="text" id="search" name="search" placeholder="search..." value={search} onChange={(e) => setSearch(e.target.value)} />
      {products.length > 0 && <h2>{total} Found!</h2>}
      {loading && !error && <p>Loading...</p>}
      {!loading && error && <p>Error: {error}</p>}
      {!loading && !error && products.length > 0
        ? (
           <div>
            <ul className="quote-section">
              {products.map((each) =>
                <li key={each.id}>
                  <h3>{each.title}</h3>
                  <p>{each.description}</p>
                </li>
              )}
            </ul>
          </div>
        )
        : (
          <p>No Quotes found!</p>
        )
      }
      <label htmlFor="items" style={{paddingRight: '10px'}}>Items Per page</label>
      <select name="items" id="items" value={limit} onChange={(e) => setLimit(Number(e.target.value))}>
        <option value="limit">Set Limit</option>
        {[5,10,25].map((each) =>
          <option key={each} value={each}>{each}</option>
        )}
      </select>

    </>
  )

}

export default App;

