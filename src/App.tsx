import { useState, useEffect } from 'react';
import type { Quote, QuoteJSONResponse } from './interfaces/quotes';
import './App.css'


function App() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [total, setTotal] = useState<number>(0);

  useEffect(() => {
    setLoading(true);
    setError('');
    const fetchQuotes = async () => {
      try {
        const res = await fetch(`https://dummyjson.com/quotes`);
        if(!res.ok) throw new Error('err in fetch');
        const data: QuoteJSONResponse = await res.json();
        setQuotes(data.quotes);
        setTotal(data.total);
      }
      catch(err) {
        setError(err instanceof Error ? err.message : String(err));
      }
      finally {
        setLoading(false);
      }
    }
    fetchQuotes();
  }, [])

  return (
    <>
      <h1>Quote Check</h1>
      {quotes.length > 0 && <h2>{total} Found!</h2>}
      {loading && !error && <p>Loading...</p>}
      {!loading && error && <p>Error: {error}</p>}
      {!loading && !error && quotes.length > 0
        ? (
           <div>
            <ul className="quote-section">
              {quotes.map((each) =>
                <li key={each.id}>
                  <div className="quote-block">
                    <h3>{each.author}</h3>
                    <p>{each.quote}</p>
                  </div>
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

