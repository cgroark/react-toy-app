import { useState, useEffect, use } from 'react';
import type { Quote, QuoteJSONResponse } from './interfaces/quotes';
import './App.css'


function App() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [total, setTotal] = useState<number>(0);
  const [query, setQuery] = useState<string>('');
  const [debounceQuery, setDebounceQuery] = useState<string>('');

  useEffect(() => {
    const debounceHandler = setTimeout(() => setDebounceQuery(query), 300);
    return () => clearTimeout(debounceHandler);
  }, [query])

  useEffect(() => {
    setLoading(true);
    setError('');

    const fetchQuotes = async () => {
      try {
        const res = await fetch(`https://dummyjson.com/quotes`);
        if(!res.ok) throw new Error('failed to fetch');
        const data: QuoteJSONResponse = await res.json();
        setQuotes(data.quotes);
        setTotal(data.total)
      }
      catch(err) {
        setError(err instanceof Error ? err.message : String(err));
      }
      finally {
        setLoading(false);
      }
    }

    fetchQuotes();
  }, []);

  const filteredQuotes = quotes.filter((each) => each.quote.toLowerCase().includes(debounceQuery.toLowerCase().trim()));

  return (
    <>
      <h1>Quote Check</h1>
      {filteredQuotes.length > 0 && <h2>{total} Found!</h2>}
      <label htmlFor="search"></label>
      <input type="text" name="search" id="search" value={query} onChange={(e) => setQuery(e.target.value)} />
      {loading && !error && <p>Loading...</p>}
      {!loading && error && <p>Error: {error}</p>}
      {!loading && !error && quotes.length > 0
        ? (
           <div>
            <ul className="quote-section">
              {filteredQuotes.map((each) =>
                <li key={each.id}>
                  {each.quote}
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

