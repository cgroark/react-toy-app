import { useState, useEffect } from 'react';
import type { Quote, QuoteJSONResponse } from './interfaces/quotes';
import './App.css'


function App() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [query, setQuery] = useState<string>('');
  const [debSearch, setDebsearch] = useState<string>('');

  useEffect(() => {
    const handler = setTimeout(() => setDebsearch(query), 300)
    return () => clearTimeout(handler)
  },[query])

  useEffect(() => {
    setLoading(true);
    setError('');

    const fetchQuotes = async () => {
      try {
        const res = await fetch(`https://dummyjson.com/quotes?q=${debSearch}`);
        if(!res.ok) throw new Error('error on fetch');
        const data: QuoteJSONResponse = await res.json();
        setQuotes(data.quotes)
        setTotal(data.total);
        console.log('data returned', data);
      }
      catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      }
      finally {
        setLoading(false);
      }
    }

    fetchQuotes();
  },[debSearch]);

  return (
    <>
      <h1>All These Quotes</h1>
      {total && <p>{total} Quotes found</p>}

      <div>
        <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>

      {loading && !error && <p>Loading...</p>}
      {!loading && error && <p>Error: {error}</p>}
      {!loading && !error && quotes.length > 0 ? (
        <>
          <h2>Quotes</h2>
          <ul className="quote-section">
            {quotes.map((each) =>
              <li key={each.id}>
                <div className="quote-block">
                  {each.quote}
                </div>
              </li>
            )}
          </ul>
        </>
      )
      :
      (
        <p>No Quotes returned</p>
      )
    }
    </>
  )
}

export default App;

