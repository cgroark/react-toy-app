export interface Quote {
  id: number,
  author: string,
  quote: string,
}

export interface QuoteJSONResponse {
  total: number,
  limit: number,
  skip: number,
  quotes: Quote[]
}