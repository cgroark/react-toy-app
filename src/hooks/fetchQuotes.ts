import {useState, useEffect} from 'react';
import type { Quote, QuoteJSONResponse } from "../interfaces/quotes"



export function useFetchQuotes(url: string) {
  const [data, setData] = useState<Quote[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [isLoading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');


  useEffect(() => {
    const fetchQuotes = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(url);
        if(!res.ok) throw new Error('err found');
        const data: QuoteJSONResponse = await res.json();
        setData(data.quotes);
        setTotal(data.total);
      }
      catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      }
      finally {
        setLoading(false)
      }

    }
    fetchQuotes()
  },[url])

  return { data, total, isLoading, error}
}

