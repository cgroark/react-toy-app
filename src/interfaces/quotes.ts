export interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  thumbnail: string;
}
export interface JSONResponse {
  skip: number;
  total: number;
  limit: number;
  products: Product[]
}