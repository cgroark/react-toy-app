import { useState, useEffect, useMemo } from 'react';
import type { Quote, QuoteJSONResponse } from './interfaces/quotes';
import { ProductItem } from './components/ProductItem';
import './App.css'

// Interface and Type - both describe the shape of data -
// Interface: defininf object shapes - react props, apis, classes
// type: moreflexible - can represent anythng = unions, primitives, tuples
// Interface extends more natrually for object hierarchy
interface ProductSummary {
  id: number;
}

export interface Product extends ProductSummary {
  title: string;
  description: string;
  price: number;
  thumbnail: string;
  category: string;
};

interface JSONResponse {
  products: Product[];
  total: number;
  limit: number;
  skip: number;
}

interface SortOption {
  value: string,
  label: string,
}

const productCategories: Record<string, string>  = {
  groceries: "Groceries",
  furniture: "Furniture"
}


export default function App() {

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [query, setQuery] = useState<string>('');
  const [deboucneQuery, setDebouncequery] = useState<string>('');
  const [limit, setLimit] = useState<number>(10);
  const [skip, setSkip] = useState<number>(0);
  const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'title'>('price-desc');
  const [likes, setLikes] = useState<Set<number>>(new Set());

  //useRef


  const sortOptions: SortOption[] = [
    {
      label: 'Price high-low',
      value: 'price-desc',
    },
    {
      label: 'Price low-high',
      value: 'price-asc',
    },
    {
      label: 'Title a-z',
      value: 'title',
    }
  ];

  // resets a 300ms timer on every key stroke - when query changes - clearTimeout runs before debounce value is set if type again
  // before 300ms, which cancels the previous time - timeoutonly completes with a 300ms pause and then the value is set
  useEffect(() => {
    const debounceHandler = setTimeout(() => setDebouncequery(query), 300);
    return () => clearTimeout(debounceHandler);
  }, [query]);

  // using aysnc/await if syntactic sugar over Promises (.then, .catch)- asynchronous code that looks synchronous but is still promise
  // based
  // same as
  // fetch(url)
  //   .then((res) => res.json())
  //   .then ((data) => {
  //     setData(data)
  //   })
  //   .catch((err) => {
  //     handleError
  //   })
  //   .finally (() => {
  //     handle
  //   })
  // fetch() returns a promise - resolves to a Response object
  // only rejects on network errors - not HTTP errors
  // but await fetch() pauses execution until Promise resolve - jumps to catch if rejects
  // res.json() also returns a promist - so you need await while JSON is parsed - async

  // IMPORTANT - const res = await fetch(url) - WILL not go to Catch block if server returns a 404/500 - server errors - need to handle manually
  // throw new Error that is then caught in the catch block
  // Fetch will catch a Network error - server unreachable, no interver, CORS issues - Fetch rejects
  // Fetch will not catch HTTP error - server response, but with an error status - get a response, but res.ok === false
  // res.ok is computed and its truer if status is 200-299 and false is 400 or 500
  useEffect(()=> {
    const fetchProducts = async () => {
      if(!deboucneQuery) {
        setProducts([]);
        setSkip(0);
        return;
      }
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`https://dummyjson.com/products/search?q=${deboucneQuery}&limit=${limit}&skip=${skip}`
        );
        if(!res.ok) throw new Error('failed to fetch');
        const data: JSONResponse = await res.json();
        setProducts(data.products);
        setTotal(data.total);
      }
      catch(err) {
        setError(err instanceof Error ? err.message : String(err));
      }
      finally {
        setLoading(false);
      }
    }

    fetchProducts();
  },[deboucneQuery, limit, skip]);

  // useMemo - used for cachign computed values - only rerenders if the dependencies change
  // avoid expensive recalcuations
  // returns a valye

  //useEffect - side effects after render - runs after UI paint

  //useRef gives you
  // a stable container that persists across renders and does NOT trigger re-renders when it changes.
  // used to traget DOM elements
  // used to store mutable values without a re-render

  const sortedProducts = useMemo(() => {
    const copy: Product[] = [...products];

    switch(sortBy) {
      case 'price-asc':
        return copy.sort((a,b) => (a.price - b.price));
      case 'price-desc':
        return copy.sort((a,b) => (b.price - a.price));
      case 'title':
        return copy.sort((a,b) => (a.title.localeCompare(b.title)));
      default:
        return copy;
    }

  },[products,sortBy]);

  const groupedProducts = products.reduce<Record<string, Product[]>>((acc, product) => {
    const category = productCategories[product.category];

    if(!category) return acc;
    if(!acc[category]) {
      acc[category] = []
    }

    acc[category].push(product);
    console.log('acc', acc)
    return acc;
  }, {})


  const page = Math.floor(skip / limit) + 1;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const hasPrev = skip > 0;
  const hasNext = skip + limit < total;

  const handlePrev = () => {
    if (!hasPrev) return;
    setSkip((prev) => Math.max(prev - limit, 0));
  };

  const handleNext = () => {
    if (!hasNext) return;
    setSkip((prev) => prev + limit);
  };

  const handleLike = (id: number) => {
    //React state should be treated as immutable.
    //If you mutated the existing Set directly:
    //React may not re-render because the reference didn't change.
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
      <h1>Products Check</h1>
      <div className="form-field">
        <label htmlFor="search">Search</label>
        <input type="text" name="search" id="search" value={query} onChange={(e) => {
          setQuery(e.target.value);
          setSkip(0);
          }} />
      </div>
      <div className="form-field">
        <label htmlFor="sort">Sort</label>
        <select name="sort" id="sort" value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)}>
          {sortOptions.map((each) =>
            <option value={each.value} key={each.value}>{each.label}</option>
          )}
        </select>
      </div>
      {products.length > 0 && <h2>{total} Found!</h2>}
      {loading && !error && <p>Loading...</p>}
      {!loading && error && <p style={{color: 'red'}}>Error: {error}</p>}
      {!loading && !error && query && products.length > 0
        && (
           <div>
            <ul className="quote-section">
              {sortedProducts.map((each) =>
              <>
                <ProductItem product={each} handleClick={handleLike} likes={likes} />
              </>
              )}
            </ul>
          </div>
        )
      }
      {products.length > 0 && (
        <>
          <h2>OK HERE</h2>
          <ul>
            {Object.entries(groupedProducts).map(([categoryName, products]) =>
              <div key={categoryName}>
                <h2>{categoryName}</h2>
                {products.map((each) =>
                   <ProductItem product={each} handleClick={handleLike} likes={likes} />
                )}
              </div>
            )}
          </ul>
        </>
      )}
      {!loading && !error && query && products.length === 0 && (
        <p>No Quotes found!</p>
      )}
      <div className="form-field">
        <label htmlFor="page-size">Items per page</label>
        <select name="page-size" id="page-size" value={limit} onChange={(e) => setLimit(Number(e.target.value))}>
          {[5,10,25].map((each) =>
            <option value={each} key={each}>{each}</option>
          )}
        </select>
      </div>
      <div className='button-set'>
          <button onClick={handlePrev} disabled={!hasPrev}>Prev</button>
          <button onClick={handleNext} disabled={!hasNext}>Next</button>
      </div>

      <p>Page {page} of {totalPages}</p>
    </>
  )

}

// useEffect(() => {
//   const fetchData = async () => {
//     setLoading(true);

//     try {
//       const [productsRes, usersRes] = await Promise.all([
//         fetch('/api/products'),
//         fetch('/api/users')
//       ]);

//       if (!productsRes.ok || !usersRes.ok) {
//         throw new Error('Failed to fetch data');
//       }

//       const [products, users] = await Promise.all([
//         productsRes.json(),
//         usersRes.json()
//       ]);

//       setProducts(products);
//       setUsers(users);

//     } catch (err) {
//       setError(err instanceof Error ? err.message : String(err));
//     } finally {
//       setLoading(false);
//     }
//   };

//   fetchData();
// }, []);

// useEffect(() => {
//   const fetchData = async () => {
//     try {
//       const res1 = await fetch('/api/user');
//       const user = await res1.json();

//       const res2 = await fetch(`/api/orders?userId=${user.id}`);
//       const orders = await res2.json();

//       setUser(user);
//       setOrders(orders);

//     } catch (err) {
//       setError(String(err));
//     }
//   };

//   fetchData();
// }, []);

// const data = await res.json();
//         const weatherData: WeatherObject[] = [];

//         for (var i = 0; i< 12; i++) {
//           let item: WeatherObject = {
//             rain: (data.hourly.rain[i]),
//             temp: (data.hourly.temperature_2m[i]),
//             time: (data.hourly.time[i]),
//             wind: (data.hourly.wind_speed_10m[i]),
//           };
//           weatherData.push(item);

//         }
//         setWeather(weatherData);