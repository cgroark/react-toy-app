import { useState, useEffect } from 'react';
import type { Quote, QuoteJSONResponse } from './interfaces/quotes';
import './App.css'


function App() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [total, setTotal] = useState<number>(0);
  const [error, setError] = useState<string>('');

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
        console.log('quotes', quotes)
      }
      catch(err) {
        setError(err instanceof Error ? err.message : String(err))
      }
      finally {
        setLoading(false);
      }
    }
    fetchQuotes();

  }, [])

  return (
    <>
    <div>Content</div>
    {loading && <div>Loading!</div>}
      {quotes.length > 0 && !loading && !error &&
        <ul>
          {quotes.map((each) =>
            <li key={each.id}>
              {each.quote}
            </li>
          )}
        </ul>
      }
    </>

  )
}

export default App;

