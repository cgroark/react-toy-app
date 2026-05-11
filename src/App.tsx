import { useState, useEffect } from 'react';
import type { Quote, QuoteJSONResponse } from './interfaces/quotes';
import './App.css'
import ProductItem from './components/ProductItem';

export interface Product {
  id: number;
  title: string;
  description: string;
  thumbnail: string;
}

interface JSONResponse {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
}

function App() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [total, setTotal] = useState<number>(0);
  const [query, setQuery] = useState<string>('');
  const [debounceQuery, setDebounceQuery] = useState<string>(query);
  const [limit, setLimit] = useState<number>(10);
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const [likes, setLikes] = useState<Set<number>>(new Set())


  useEffect(() => {
    const deboucneHandler = setTimeout(() => setDebounceQuery(query), 300);
    return () => clearTimeout(deboucneHandler);
  },[query])

  useEffect(() => {
    const fetchProducts = async () => {
      if(!debounceQuery) {
        setProducts([]);
        return;
      }
      setLoading(true)
      setError('');
      try {
        const res = await fetch(`https://dummyjson.com/products/search?q=${debounceQuery}&limit=${limit}`);
        if(!res.ok) throw new Error(`Error on Fetch ${res.status}`)
        const data: JSONResponse = await res.json();
        setProducts(data.products);
        setTotal(data.total)
      }
      catch (err) {
        setError(err instanceof Error ? err.message : String(err))
      }
      finally {
        setLoading(false);
      }
    }
    fetchProducts()
  },[debounceQuery, limit]);

  const handleChecked = (id: number) => {
    const newSet = new Set(checked);
    if(newSet.has(id)) {
      newSet.delete(id)
    } else {
      newSet.add(id)
    }

    setChecked(newSet)
  }

  const handleLikes = (id: number) => {
    const newSet = new Set(likes);
    if(newSet.has(id)) {
      newSet.delete(id)
    } else {
      newSet.add(id)
    }

    setLikes(newSet)
  }

  return (
    <>
      <h1>Products</h1>
      <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} />
      <label htmlFor="limit">Limit</label>
      <select name="limit" id="limit" value={limit} onChange={(e) => setLimit(Number(e.target.value))}>
        {[5,10,25].map((each, index) =>
          <option value={each} key={index}>{each}</option>
        )}
      </select>
      {products.length > 0 && <h2>{total} Found!</h2>}
      {checked.size > 0 && <h3>{checked.size} Checked</h3>}
      {loading && !error && <p>Loading...</p>}
      {!loading && error && <p>Error: {error}</p>}
      {!loading && !error && products.length > 0
        ? (
           <div>
            <ul className="quote-section">
              {products.filter((e) => e.thumbnail).map((e) =>
                <li key={e.id}>
                  <ProductItem product={e} handleLike={handleLikes} handleCheck={handleChecked} likes={likes} checked={checked} />
                  {/* <input type="checkbox" onChange={() => handleChecked(e.id)} checked={checked.has(e.id)} />
                  <h3>{e.title}</h3>
                  <p>{e.description}</p>
                  <img src={e.thumbnail} /> */}
                </li>
              )}
            </ul>
          </div>
        )
        : (
          <p>No Quotes found!</p>
        )
      }

    </>
  )

}

export default App;

