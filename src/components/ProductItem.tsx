import type { Product } from "../App";

interface ProductItemProps {
  product: Product;
  likes?: Set<number>;
  handleClick: (id: number) => void;
}

export function ProductItem({product, likes,  handleClick}: ProductItemProps) {
  return (
    <>
      <li className={likes?.has(product.id) ? 'liked' : ''} onClick={() => handleClick(product.id)}>
        <h3>{product.title}</h3>
        <p>{product.description}</p>
        <p><strong>$ {product.price}</strong></p>
        <img src={product.thumbnail} alt={`photo of ${product.description}`} />
      </li>
    </>
  )
}