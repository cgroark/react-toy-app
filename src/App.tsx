import { useState, useEffect, useMemo } from 'react';
import type { Quote, QuoteJSONResponse } from './interfaces/quotes';
import './App.css'

interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  thumbnail: string;
}

interface JSONResponse {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
}

function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [total, setTotal] = useState<number>(0);
  const [query, setQuery] = useState<string>('');
  const [debounceQuery, setDebounceQuery] = useState<string>('');
  const [likes, setLikes] = useState<Set<number>>(new Set());
  const [limit, setLimit] = useState<number>(10);
  const [skip, setSkip] = useState<number>(0);
  const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'title'>('price-asc');

  interface sortOption {
    label: string,
    value: 'price-asc' | 'price-desc' | 'title',
  }

  const sortOptions: sortOption[] = [
    {
      label: 'price up',
      value: 'price-asc',
    },
     {
      label: 'price down',
      value: 'price-desc',
    },
     {
      label: 'title a-z',
      value: 'title',
    }
  ]

  const params = useMemo(() => {
    const p = new URLSearchParams({
      ...(debounceQuery && {q: debounceQuery}),
      limit: String(limit),
      skip: String(skip),
    })
    return p;
  },[debounceQuery, limit, skip]);

  const sortedProducts = useMemo(() => {
    const copy: Product[] = [...products];

    switch(sortBy) {
      case 'price-asc':
        return copy.sort((a,b) => a.price - b.price);
      case 'price-desc':
        return copy.sort((a,b) => b.price - a.price);
      case 'title':
        return copy.sort((a,b) => a.title.localeCompare(b.title));
      default:
        return copy;
    }

  }, [products, sortBy])

  useEffect(() => {
    const debounceHandler = setTimeout(() => setDebounceQuery(query), 300);
    return () => clearTimeout(debounceHandler);
  }, [query])

  useEffect(() => {
    // Comment
    const controller = new AbortController();

    if(!debounceQuery) return;
    const fetchProducts = async () => {
      setLoading(true);
      setError('');

      try {
        const res = await fetch(`https://dummyjson.com/products/search?q=${debounceQuery}&limit=${limit}&skip=${skip}`);
        if(!res.ok) throw new Error('failure on fetch');
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
    // Commenty
    return () => controller.abort();
  },[params]);

  const checkLikes = (id: number) => {
    const newSet = new Set(likes);

    if(newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id)
    }

    setLikes(newSet);
  }


  return (
    <>
      <h1>Products</h1>
      {products.length > 0 && <h2>{total} Found!</h2>}
      {likes.size > 0 && (
        <div>
        ❤️ {likes.size}
      </div>
      )}
      <div className="form-field">
        <label htmlFor="search">Search!</label>
        <input type="text" name="search" id="search" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>
      <div className="form-field">
        <select name="sort" id="sort" value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)}>
          {sortOptions.map((each) =>
            <option key={each.value} value={each.value}>{each.label}</option>
          )}
        </select>
      </div>
      <div className="form-field">
        <label htmlFor="page">Results per page</label>
        <select name="page" id="page" value={limit} onChange={(e) => setLimit(Number(e.target.value))}>
          {[5,10,25].map((each) =>
            <option value={each} key={each}>{each}</option>
          )}
        </select>
      </div>
      {loading && !error && <p>Loading...</p>}
      {!loading && error && <p>Error: {error}</p>}
      {!loading && !error && query && products.length > 0
        && (
           <div>
            <ul className="quote-section">
              {sortedProducts.map((each) =>
                <li key={each.id} onClick={() => checkLikes(each.id)} className={likes.has(each.id) ? 'liked' : ''}>
                  <h3>{each.title}</h3>
                  <p>{each.description}</p>
                  <p>${each.price}</p>
                  <img src={each.thumbnail} alt={`photo of ${each.description} `} />
                </li>
              )}
            </ul>
          </div>
        )
      }
      {!loading && !error && query && products.length === 0 && (
          <p>No Quotes found!</p>
      )}
      <div className="button-section">
        <button onClick={() => setSkip((prev) => prev - limit)} disabled={skip === 0}>Prev</button>
        <button onClick={() => setSkip((prev) => prev + limit)} disabled={skip + limit >= total }>Next</button>
      </div>
      <p>Page {Math.floor(skip / limit) +1} of {Math.ceil(total / limit)}</p>

    </>
  )

}

export default App;

