import { useState, useEffect } from 'react';
import type { Quote, QuoteJSONResponse } from './interfaces/quotes';
import './App.css'


function App() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [total, setTotal] = useState<number>(0);
  const [query, setQuery] = useState<string>('');
  const [debounceQuery, setDebounceQuery] = useState<string>('');
  const [liked, SetLiked] = useState<Set<number>>(new Set());

  useEffect(() => {
    const debounce = setTimeout(() => setDebounceQuery(query), 300);
    return () => clearTimeout(debounce);
  }, [query])

  useEffect(() => {
    if(!debounceQuery) return;
    setLoading(true);
    setError('');

    const fetchQuotes = async () => {
      try {
        const res = await fetch('https://dummyjson.com/quotes');
        if(!res.ok) throw new Error('error on fetch');
        const data: QuoteJSONResponse = await res.json();
        setQuotes(data.quotes);
        setTotal(data.total);
      }
      catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      }
      finally {
        setLoading(false);
      }
    }
    fetchQuotes();
  }, [debounceQuery]);

  const filteredQuotes = quotes.filter((each) => each.quote.toLowerCase().includes(debounceQuery.toLocaleLowerCase().trim()))

  const checkLiked = (id: number) => {
    const tempSet = new Set(liked);
    if(tempSet.has(id)) {
      tempSet.delete(id);
    } else {
      tempSet.add(id)
    }
    SetLiked(tempSet)
  }

  return (
    <>
      <h1>Quote Check</h1>
      {quotes.length > 0 && <h2>{total} Found!</h2>}
      {liked.size > 0 && (
        <div>
        ❤️ {liked.size}
      </div>
      )
      }
      <label htmlFor="search" style={{paddingRight: '10px'}}>Find Quotes</label>
      <input type="text" id="search" name="search" placeholder="Search..." value={query} onChange={(e) => setQuery(e.target.value)} />
      {loading && !error && <p>Loading...</p>}
      {!loading && error && <p>Error: {error}</p>}
      {!loading && !error && quotes.length > 0
        ? (
           <div>
            <ul className="quote-section">
              {filteredQuotes.map((each) =>
                <li key={each.id} onClick={() => checkLiked(each.id)} className={liked.has(each.id) ? 'liked' : ''}>
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

